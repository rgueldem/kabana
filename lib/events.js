module.exports = {
  'app.activated': 'appActivated',
  'previewTicketView.done': 'setTickets',
  'getAssignableGroups.done': 'setGroups',
  'reloadBoard': 'reloadBoard',
  'dragstart .ticket': 'dragdrop.dragTicket',
  'drop .ticket-status': 'dragdrop.droponStatus',
  'drop .ticket': 'dragdrop.droponTicket',
  'dragover .ticket-status': 'dragdrop.dragoverStatus',
  'dragover .ticket': 'dragdrop.dragoverTicket',
  'click .group-nav': 'switchGroup',
  'transitionTicket': 'board.transition'
};
