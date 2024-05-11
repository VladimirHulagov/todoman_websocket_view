$(document).ready(function() {
  drawCheckbox();
});

function drawCheckbox() {
namespace = '/test';
var socket = io(namespace);

var task = document.createElement("input");
task.type = "checkbox";

socket.emit('get_tasks');
socket.on('tasks', function(data, cb) {
    console.log(data);
    console.log(typeof data);
    tasks_array = Object.values(data)
    console.log(typeof tasks_array);
    console.log(tasks_array);
    Object.values(tasks_array)[0].forEach(function(entry) {
      console.log("ENTRY:");
      console.log(entry);
      //$('#messages').append('<br/>' + $('<div/>').text(entry.description).html());
      $("#tasks_table").find('tbody').append(
        $('<tr data-task-id="' + entry.uuid + '">').append(
          $('<td>').text(entry.description)
        ).append(
          $('<td>').text(entry.entry)
          ).append(
          $('<td>').text(entry.modified)
          ).append(
          $('<td>').text(entry.urgency)
          )
        );
    //<td><input type="checkbox" class="complete" data-task-id="{{ task['uuid'] }}" onclick='handleClick(this);'/></td>
    // <tr class="{{ coloraize_date(task['due']) }}" data-task-id="{{ task['uuid'] }}">
    });
//    console.log(cb);
  });
}

function handleClick() {
    console.log("checking...");
    namespace = '/test';
    var socket = io(namespace);

    socket.on('connect', function() {
        $('#messages').append('<br/>' + $('<div/>').text('Requesting task to run').html());
        socket.emit('do_task', { 'duration' : 5});
    });

    socket.on('task_done', function(msg, cb) {
        $('#messages').append('<br/>' + $('<div/>').text(msg.data).html());
    });
}
