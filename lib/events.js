var board = require('board.js'),
    dragdrop = board.dragdrop;

module.exports = {
  'app.created': 'appCreated',
  'app.route.changed': 'appRouteChanged',
  'dragstart .ticket': dragdrop.dragTicket.bind(dragdrop),
  'dragend .ticket': dragdrop.dropTicket.bind(dragdrop),
  'drop .ticket-status-drop': dragdrop.droponStatus.bind(dragdrop),
  'drop .ticket-drop': dragdrop.droponTicket.bind(dragdrop),
  'dragenter .ticket-status-drop': dragdrop.dragenterTicketStatus.bind(dragdrop),
  'dragenter .ticket': dragdrop.dragenterTicket.bind(dragdrop),
  'dragleave .ticket-drop': dragdrop.dragleaveTicket.bind(dragdrop),
  'dragover .ticket': dragdrop.dragover.bind(dragdrop),
  'dragover .ticket-status-drop': dragdrop.dragover.bind(dragdrop),
  'dragover .ticket-drop': dragdrop.dragover.bind(dragdrop),
  'transitionTicket': board.transition.bind(board)
};
