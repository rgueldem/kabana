var LIMIT_PER_STATUS = 25,
    MAX_HEIGHT = 100;

var sidebar = {
  tickets: require('tickets.js'),

  initialize: function(app) {
    this.app = app;
    this.ticket = app.ticket();
    this.group_id = this.ticket.assignee().group().id();
    this.group_name = this.ticket.assignee().group().name();

    this.app.ticketFields('custom_field_' + this.app.data.positionField).hide();

    if (this.group_id) {
      this.app.store('group_id', this.group_id);
    }

    this.tickets.initialize(app);
    this.tickets.fetch()
      .then(this.prepare.bind(this))
      .then(this.app.reloadSidebar.bind(this.app));
  },

  prepare: function() {
    var max = _.max(this.tickets.byStatus, function(tickets) {
      return tickets.length;
    }).length;

    if (max === 0) return;

    var limit = _.min([max, LIMIT_PER_STATUS]);

    var ticketHeight = Math.floor(MAX_HEIGHT/limit),
        ticket_id    = this.app.ticket().id();

    this.columns = [];
    this.app.data.statuses.forEach(function(status, index) {
      var tickets = this.tickets.byStatus[index];

      tickets.forEach(function(ticket, i) {
        ticket.active = ticket.id === ticket_id;
        ticket.height = ticketHeight;
        ticket.hidden = i > LIMIT_PER_STATUS - 2  && !ticket.active &&
          ticket !== _.last(tickets);
      }.bind(this));

      this.columns.push({
        title: status.title,
        tickets: _.reject(tickets, function(t) { return t.hidden; })
      });
    }.bind(this));
  }
};

module.exports = sidebar;
