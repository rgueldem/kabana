module.exports = {
  'app.created': 'appCreated',
  'previewTicketView.done': 'setTickets',
  'getAssignableGroups.done': 'groups.setGroups',
  'reloadBoard': 'reloadBoard',
  'dragstart .ticket': 'dragdrop.dragTicket',
  'dragend .ticket': 'dragdrop.dropTicket',
  'drop .ticket-status-drop': 'dragdrop.droponStatus',
  'drop .ticket-drop': 'dragdrop.droponTicket',
  'dragenter .ticket-status-drop': 'dragdrop.dragenterTicketStatus',
  'dragenter .ticket': 'dragdrop.dragenterTicket',
  'dragleave .ticket-drop': 'dragdrop.dragleaveTicket',
  'dragover .ticket': 'dragdrop.dragover',
  'dragover .ticket-status-drop': 'dragdrop.dragover',
  'dragover .ticket-drop': 'dragdrop.dragover',
  'click .group-nav': 'groups.switchGroup',
  'transitionTicket': 'board.transition'
};
