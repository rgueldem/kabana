var Big = require('vendor/big.js');

var changePosition = function(ticket, change, position) {
  ticket.position = position;

  change.custom_fields = [{
    id: this.positionField,
    value: ticket.position.toString()
  }];
};

var ticket = {
  transition: function(e) {
    var ticket, change = {}, newStatus;

    ticket = _.findWhere(this.data.tickets, { id: e.id });

    if (ticket === undefined) {
      return;
    }

    newStatus = this.data.statuses[e.newStatus].value;
    if (ticket.status !== newStatus) {
      ticket.status = change.status = newStatus;
    }

    if (ticket.assignee_id === null) {
      ticket.assignee_id = change.assignee_id = this.currentUser().id();
    }

    // position as last
    if (e.nextId === undefined) {
      var tickets = this.data.statuses[e.newStatus].tickets,
          last = _.last(tickets);

      if (last.id !== ticket.id) {
        if (last !== undefined) {
          changePosition(ticket, change, last.position.plus(1));

          this.sortTickets(tickets);
        } else { // empty list
          changePosition(ticket, change, new Big(0));
        }
      }
    }

    if (!_.isEmpty(change)) {
      this.ajax('updateTicket', ticket.id, change);
    }
  }
};

module.exports = ticket;
