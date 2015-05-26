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
  if (ticket.assignee_id === null) {
    ticket.assignee_id = change.assignee_id = id;
  }
};

var moveLast = function(ticket, change, tickets, field) {
  var last = _.last(tickets);

  if (last !== undefined) {
    if (last.id !== ticket.id) {
      changePosition(ticket, change, last.position.plus(1), field);

    }
  } else { // empty list
    changePosition(ticket, change, new Big(0), field);
  }
};

var moveBefore = function(ticket, change, tickets, nextId, field) {
  var next, prevIndex, prev;

  next = _.findWhere(tickets, { id: nextId });
  prevIndex = _.indexOf(tickets, next) - 1;

  if (prevIndex >= 0) {
    prev = tickets[prevIndex];

    if (prev.id === ticket.id) return;
  }

  if (prev === undefined) {
    changePosition(ticket, change, next.position.minus(1), field);
  } else {
    changePosition(ticket, change, positionBetween(prev, next), field);
  }
};

var positionBetween = function(a, b) {
  if (a.position.eq(b.position)) {
    return a.position;
  }

  for (var d = new Big(1); d.gt('0.0000000001'); d = d.div(10)) {
    if (a.position.plus(d).lt(b.position)) {
      return a.position.plus(d);
    }
  }

  return a.position;
};

var ticket = {
  transition: function(e) {
    var ticket, change = {}, tickets, newStatus;

    ticket = _.findWhere(this.data.tickets, { id: e.id });

    if (ticket === undefined) return;


    tickets = this.data.statuses[e.newStatus].tickets,
    newStatus = this.data.statuses[e.newStatus].value;

    changeAssignee(ticket, change, this.currentUser().id());
    changeStatus(ticket, change, newStatus);

    if (e.nextId === undefined) {
      moveLast(ticket, change, tickets, this.positionField);
    } else {
      moveBefore(ticket, change, tickets, e.nextId, this.positionField);
    }

    this.groupTickets();

    if (!_.isEmpty(change)) {
      this.ajax('updateTicket', ticket.id, change);
    }
  }
};

module.exports = ticket;
