(function() {

  // Vendor libraries
  var md5 = require('vendor/md5.js');
  var Big = require('vendor/big.js');

  return {
    data: {
      groups: [],
      tickets: [],
      statuses: [ 'new', 'open', 'pending', 'hold', 'solved', 'closed' ]
    },
    dragdrop: require('dragdrop.js'),
    events: require('events.js'),
    positionField: null,
    requests: require('requests.js'),
    ticket: require('ticket.js'),

    getTicketStatusTranslation: function(value) {
      return {
        'title': this.I18n.t('ticket_statuses.' + value),
        'value': value
      };
    },

    sortTickets: function(tickets) {
      tickets.sort(function(a, b) {
        return a.position.cmp(b.position);
      });
    },

    setTickets: function(data) {
      var ticketsGroupedByStatus = [];
      this.data.tickets = data.rows.map(function(row) {
        return _.extend(row.ticket, {
          assignee: _.findWhere(data.users, { id: row.assignee_id }),
          position: new Big(row[this.positionField] || 0)
        });
      }.bind(this));

      // Associate tickets with statuses
      ticketsGroupedByStatus = _.groupBy(this.data.tickets, 'status');
      this.data.statuses     = this.data.statuses.map(function(status) {
        var tickets = ticketsGroupedByStatus[status.value] || [];
        this.sortTickets(tickets);

        return _.extend(status, {
          tickets: tickets
        });
      }.bind(this));

      this.trigger('reloadBoard');
    },

    setGroups: function(data) {
      this.data.groups = data.groups;
      this.trigger('reloadBoard');
    },

    reloadBoard: function() {
      this.switchTo('board', this.data);
    },

    appActivated: function() {
      // Load translations for ticket statuses
      this.data.statuses = this.data.statuses.map(this.getTicketStatusTranslation.bind(this));

      // fallback value for development environment
      this.positionField = this.requirement('position')|| 26034977;

      this.ajax('previewTicketView');
      this.ajax('getAssignableGroups');
    },
  };

}());
