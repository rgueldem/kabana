var LIMIT_PER_STATUS = 25,
    MAX_HEIGHT = 100;

var sidebar = {
  tickets: require('tickets.js'),
  statuses: require('statuses.js'),

  initialize: function(app) {
    this.app = app;

    this.tickets.initialize(app);
    this.statuses.initialize(this.app);
  },

  load: function() {
    this.ticket = this.app.ticket();

    this.app.ticketFields('custom_field_' + this.app.data.positionField).hide();

    if (this.ticket.assignee().group()) {
      this.groupId = this.ticket.assignee().group().id();
      this.groupName = this.ticket.assignee().group().name();

      this.statuses.load()
      .then(this.tickets.fetch.bind(this.tickets, this.groupId))
      .then(this.render.bind(this, this.groupId));
    }
  },

  render: function(groupId) {
    var ticketsByStatus = this.tickets.byGroupAndStatus[groupId];

    var max = _.max(ticketsByStatus, function(tickets) {
      return tickets.length;
    }).length;

    if (max === 0) return;

    var limit = _.min([max, LIMIT_PER_STATUS]);

    var ticketHeight = Math.floor(MAX_HEIGHT/limit),
        ticket_id    = this.app.ticket().id();

    this.columns = [];
    this.statuses.statuses.forEach(function(status, index) {
      var tickets = ticketsByStatus[index];

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

    this.app.switchTo('sidebar', this);
  }
};

module.exports = sidebar;
