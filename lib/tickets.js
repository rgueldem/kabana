var Big = require('vendor/big.js');

var tickets = {
  byStatus: {
  },

  initialize: function(app) {
    this.app = app;
  },

  fetch: function() {
    var promises = this.app.data.statuses.map(function(status, i) {
      return this.app.ajax('previewTicketView', status.value)
        .then(this.set.bind(this, i));
    }.bind(this));

    return this.app.when.apply(this, promises);
  },

  sort: function(tickets) {
    tickets.sort(function(a, b) {
      return b.position.cmp(a.position);
    });
  },

  set: function(index, data) {
    var tickets,
        readonly = this.app.data.statuses[index].readonly === true;

    tickets = data.rows.map(function(row) {
      return _.extend(row.ticket, {
        assignee: _.findWhere(data.users, { id: row.assignee_id }),
        position: new Big(row[this.app.data.positionField] || -row.ticket.id),
        subject: row.subject,
        draggable: !readonly,
        statusIndex: index
      });
    }.bind(this));

    this.sort(tickets);

    this.byStatus[index] = tickets;
  },
};

module.exports = tickets;
