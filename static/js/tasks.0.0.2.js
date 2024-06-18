$(document).ready(function() {
  $('#tasks_table').dataTable({
    order: [[1, 'desc'], [2, 'desc']],
    "bPaginate": false,
    "bLengthChange": false,
    "bFilter": false,
    "bInfo": false,
    "bAutoWidth": false
  });
  show_current_tasks();
});


function update_task(tuid, tsummary, tdue, tpriority) {
  let tasks_table = $('#tasks_table').DataTable();
  let todo_row = tasks_table.rows('#' + tuid)
  console.log("Update task");
  console.log(todo_row);
  todo_row.data(tsummary, tdue, tpriority).draw();
};

function add_task(tuid, tsummary, tdue, tpriority) {
  let tasks_table = $('#tasks_table').DataTable();
  let row = tasks_table.row.add([tsummary, tdue, tpriority]).draw();
  $(row.node()).attr('id', tuid);
};

function show_current_tasks() {
  var socket = io.connect();

  socket.on('connect', function() {
      socket.emit('get_tasks');
  });

  socket.on('task_changed', function(msg) {
      let tasks_table = $('#tasks_table').DataTable();
      vcard = msg['data']
      console.log("Action: " + vcard['STATUS'] + ':' + vcard['UID']);
      //console.log(document.getElementById(vcard['UID']));
      if (document.getElementById(vcard['UID'])) {
        if (vcard['STATUS'] == 'COMPLETED') {
          console.log("Remove: " + vcard['UID']);
          tasks_table.rows('#' + vcard['UID']).remove().draw()
          //$('#' + vcard['UID']).toggleClass('done');
        }
        else if (vcard['STATUS'] == 'NEEDS-ACTION') {
            console.log("Else if: " + vcard['UID']);
            $('#' + vcard['UID']).remove()
            update_task(vcard['UID'], vcard['SUMMARY'], vcard['DUE'], vcard['PRIORITY'])
          }
      } else {
          console.log("Add: " + vcard['SUMMARY'] + "; Priority: " + vcard['PRIORITY'] );
          add_task(vcard['UID'], vcard['SUMMARY'], vcard['DUE'], vcard['PRIORITY'])
          //tasks_table.row.add(vcard['UID'], vcard['SUMMARY'], vcard['DUE'], vcard['PRIORITY'])

      };
  });


}
