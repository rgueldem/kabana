var Big = require('vendor/big.js');

var changePosition = function(ticket, change, position, field) {
  if (ticket.position !== position) {
    ticket.position = position;

    change.custom_fields = [{
      id: field,
      value: ticket.position.toString()
    }];
  }
};

var changeStatus = function(ticket, change, newStatus) {
  if (ticket.status !== newStatus) {
    ticket.status = change.status = newStatus;
  }
};

var changeAssignee = function(ticket, change, id) {
  if (ticket.assignee_id !== null) {
    ticket.assignee_id = change.assignee_id = id;
  }
};

var ticket = {
  transition: function(e) {
    var ticket, change = {};

    ticket = _.findWhere(this.data.tickets, { id: e.id });

    if (ticket === undefined) return;

    changeAssignee(ticket, change, this.currentUser().id());

    // position as last
    if (e.nextId === undefined) {
      var tickets = this.data.statuses[e.newStatus].tickets,
          last = _.last(tickets);

      if (last !== undefined) {
        if (last.id !== ticket.id) {
          changePosition(ticket, change, last.position.plus(1), this.positionField);

        }
      } else { // empty list
        changePosition(ticket, change, new Big(0), this.positionField);
      }
    }

    var newStatus = this.data.statuses[e.newStatus].value;
    changeStatus(ticket, change, newStatus);

    this.groupTickets();

    if (!_.isEmpty(change)) {
      this.ajax('updateTicket', ticket.id, change);
    }
  }
};

module.exports = ticket;
