var table = new DataTable('#tasks_table');
$(document).ready(function() {
  $('#tasks_table').DataTable();
  show_current_tasks();
});


function update_task(tuid, tsummary, tdue, tpriority) {
    console.log(Object.values(table));
    console.log("Update task");
    table.row
        .add([tsummary, tdue, tpriority])
        .draw(true);
};

function show_current_tasks() {
  var socket = io.connect();

  socket.on('connect', function() {
      socket.emit('get_tasks');
  });

  socket.on('task_changed', function() {
      socket.emit('get_tasks');
  });

  socket.on('task_changed', function(msg) {
      vcard = msg['data']
      if (document.getElementById(vcard['UID'])) {
        if (vcard['STATUS' == 'COMPLETED']) {
          console.log("Remove: " + vcard['UID']);
          $('#' + vcard['UID']).remove()
          //$('#' + vcard['UID']).toggleClass('done');
        }
        else if (vcard['STATUS' == 'NEEDS-ACTION']) {
            update_task(vcard['UID'], vcard['SUMMARY'], vcard['DUE'], vcard['PRIORITY'])
          }
      } else {
          console.log("Add: " + vcard['UID'] + "; Priority: " + vcard['PRIORITY'] );
          update_task(vcard['UID'], vcard['SUMMARY'], vcard['DUE'], vcard['PRIORITY'])
      };
  });


}
