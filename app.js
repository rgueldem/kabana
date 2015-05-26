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

    groupTickets: function() {
      // Associate tickets with statuses
      var ticketsGroupedByStatus = _.groupBy(this.data.tickets, 'status');

      this.data.statuses = this.data.statuses.map(function(status) {
        var tickets = ticketsGroupedByStatus[status.value] || [];

        tickets.sort(function(a, b) {
          return a.position.cmp(b.position);
        });

        return _.extend(status, {
          tickets: tickets
        });
      }.bind(this));
    },

    setTickets: function(data) {
      this.data.tickets = data.rows.map(function(row) {
        return _.extend(row.ticket, {
          assignee: _.findWhere(data.users, { id: row.assignee_id }),
          position: new Big(row[this.positionField] || row.ticket.id)
        });
      }.bind(this));

      this.groupTickets();

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
      if (this.requirement('position') !== undefined) {
        this.positionField = this.requirement('position').requirement_id;
      } else {
        this.positionField = 26034977;
      }

      this.ajax('previewTicketView');
      this.ajax('getAssignableGroups');
    },
  };

}());
