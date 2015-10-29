var LIMIT_PER_STATUS = 25,
    MAX_HEIGHT = 100;

var minimap = {
  statuses: [],

  initialize: function(app) {
    this.app = app;
  },

  prepare: function() {
    this.group_name = this.app.ticket().assignee().group().name();
    this.group_id   = this.app.ticket().assignee().group().id();

    var max = _.max(this.app.data.statuses, function(status) {
      return status.tickets.length;
    }).tickets.length;

    if (max === 0) return;

    var limit = _.min([max, LIMIT_PER_STATUS]);

    var ticketHeight = Math.floor(MAX_HEIGHT/limit),
        ticket_id    = this.app.ticket().id();

    this.app.data.statuses.forEach(function(status) {
      status.tickets.forEach(function(ticket, i) {
        ticket.active = ticket.id === ticket_id;
        ticket.height = ticketHeight;
        ticket.hidden = i > LIMIT_PER_STATUS - 2  && !ticket.active &&
          ticket !== _.last(status.tickets);
      });

      this.statuses.push({
        title: status.title,
        tickets: _.reject(status.tickets, function(t) { return t.hidden; })
      });
    }.bind(this));
  }
};

module.exports = minimap;
