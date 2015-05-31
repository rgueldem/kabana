module.exports = {
  'app.created': 'appCreated',
  'previewTicketView.done': 'setTickets',
  'getAssignableGroups.done': 'groups.setGroups',
  'reloadBoard': 'reloadBoard',
  'dragstart .ticket': 'dragdrop.dragTicket',
  'drop .ticket-status': 'dragdrop.droponStatus',
  'drop .ticket-drop': 'dragdrop.droponTicket',
  'dragenter .ticket-status': 'dragdrop.dragenterTicketStatus',
  'dragenter .ticket': 'dragdrop.dragenterTicket',
  'dragleave .ticket-drop': 'dragdrop.dragleaveTicket',
  'dragover .ticket': 'dragdrop.dragover',
  'dragover .ticket-status': 'dragdrop.dragover',
  'dragover .ticket-drop': 'dragdrop.dragover',
  'click .group-nav': 'groups.switchGroup',
  'transitionTicket': 'board.transition'
};
