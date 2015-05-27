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
  if (a.position.gte(b.position)) {
    // invalid call, soft fail
    return a.position;
  }

  // use exponent of difference to determine step size
  var diff = b.position.minus(a.position), // e.g. 1 - 0.9 = 0.1
      exp  = diff.e,                       // -1
      step = new Big(10).pow(exp);         // 0.1

  if (step >= diff) {                      // 0.1 >= 0.1
    step = step.div(10);                   // 0.01
  }

  return a.position.plus(step);            // 0.91
};

var ticket = {
  transition: function(e) {
    var ticket, change = {}, tickets, newStatus;

    ticket = _.findWhere(this.data.tickets, { id: e.id });

    if (ticket === undefined) return;

    tickets = this.data.statuses[e.newStatus].tickets;
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