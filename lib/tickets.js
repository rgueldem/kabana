var Big = require('vendor/big.js');

var tickets = {
  statuses: require('statuses.js'),

  byGroupAndStatus: {
  },

  countByGroupAndStatus: {
  },

  initialize: function(app) {
    this.app = app;
  },

  fetch: function(groupId) {
    this.byGroupAndStatus[groupId] = {};
    this.countByGroupAndStatus[groupId] = {};

    var promises = this.statuses.statuses.map(function(status, i) {
      return this.app.ajax('previewTicketView', groupId, status.value)
        .then(this.set.bind(this, groupId, i));
    }.bind(this));

    return this.app.when.apply(this, promises);
  },

  sort: function(tickets) {
    tickets.sort(function(a, b) {
      return b.position.cmp(a.position);
    });
  },

  set: function(groupId, index, data) {
    var tickets,
        readonly = this.statuses.statuses[index].readonly === true,
        status;

    tickets = data.rows.map(function(row) {
      if (this.app.data.customStatus) {
        status = _.find(row.custom_fields, function(o) {
          return o.id === this.app.data.statusField;
        }.bind(this)).value
      } else {
        status = row.ticket.status;
      }

      return _.extend(row.ticket, {
        assignee: _.findWhere(data.users, { id: row.assignee_id }),
        position: new Big(row[this.app.data.positionField] || -row.ticket.id),
        subject: row.subject,
        draggable: !readonly,
        statusIndex: index,
        status: status
      });
    }.bind(this));

    this.sort(tickets);

    this.byGroupAndStatus[groupId][index] = tickets;
    this.countByGroupAndStatus[groupId][index] = data.count;
  },
};

module.exports = tickets;
