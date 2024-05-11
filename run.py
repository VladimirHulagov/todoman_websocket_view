#!/usr/bin/env python

from time import sleep
import os
import json

import uvicorn
import socketio
#import icalendar
from icalendar import Calendar
from datetime import datetime

from asyncinotify import Inotify, Mask

sio = socketio.AsyncServer(async_mode='asgi')

app = socketio.ASGIApp(sio, static_files={
    '/': 'index.html',
    '/static': 'static',
})

background_task_started = False
icalendar_dir = os.environ['HOME'] + '/.calendars/calendar'

def parse_icalendar(ics_file):
    calendar = {}
    with open(ics_file) as e:
        ecal = Calendar.from_ical(e.read())
        for component in ecal.walk():
            if component.name == 'VTODO':
                calendar['UID'] = str(component.get('UID').split('@')[0])
                com_datetimes = ['CREATED','DTSTAMP','LAST-MODIFIED', 'DUE','LAST-MODIFIED']
                for timing in com_datetimes:
                    try:
                        calendar[timing] = component.get(timing).dt.strftime("%H:%M:%S %d.%m.%Y")
                    except AttributeError:
                        print(f"{timing} -> does not exist!")
                com_attrs = ['SUMMARY','DESCRIPTION', 'PERCENT-COMPLETE', 'SEQUENCE', 'PRIORITY', 'STATUS', 'PRODID']
                for attrs in com_attrs:
                    try:
                        calendar[attrs] = str(component.get(attrs))
                    except AttributeError:
                        print(f"{attrs} -> does not exist!")
        return calendar

#@socket_.on('get_tasks', namespace='/test')
@sio.on('connect')
async def get_all_tasks(sid, environ):
    global icalendar_dir 
    global background_task_started
    if not background_task_started:
        sio.start_background_task(tasks_changing_monitor)
        background_task_started = True
    task_status = 'pending'
    try:
        print("Sent task list")
        ical_files = []
        for (dirpath, dirnames, filenames) in os.walk(icalendar_dir):
            ical_files.extend(filenames)
            break

        for icalf in ical_files:
            ical_file = icalendar_dir + '/' + icalf
            print(ical_file)
            vtodo = parse_icalendar(ical_file)
            print(vtodo['STATUS'])
            if vtodo['STATUS'] != 'COMPLETED':
                await sio.emit('task_changed', {'data': vtodo})
                #await sio.emit('tasks', {'data': 'Connected', 'count': 0}, room=sid)
    except Exception as ex:
        print(ex)

async def tasks_changing_monitor():
    global icalendar_dir 
    #evgen = InotifyTree(icalendar_dir).event_gen()
    with Inotify() as n:
        n.add_watch(icalendar_dir, Mask.MOVED_TO | Mask.CREATE )
        async for event in n:
            if event and str(event.path).endswith("ics"):
                print(event.path)
                vtodo = parse_icalendar(event.path)
                print(json.dumps(vtodo, indent=2))
                await sio.emit('task_changed', {'data': vtodo})

if __name__ == '__main__':
    server = uvicorn.run(app, host='127.0.0.1', port=5000)
