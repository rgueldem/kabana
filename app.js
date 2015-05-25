(function() {

  // Vendor libraries
  var md5 = require('vendor/md5.js');

  var findById = function(list, id) {
    return _.find(list, function(item) {
      return item.id === id;
    });
  };

  return {
    data: {
      groups: [],
      tickets: [],
      statuses: [ 'new', 'open', 'pending', 'hold', 'solved', 'closed' ]
    },
    dragdrop: require('dragdrop.js'),
    events: require('events.js'),
    requests: require('requests.js'),
    sequenceField: null,

    getTicketStatusTranslation: function(value) {
      return {
        'title': this.I18n.t('ticket_statuses.' + value),
        'value': value
      };
    },

    setTickets: function(data) {
      var ticketsGroupedByStatus = [];
      this.data.tickets = data.rows.map(function(row) {
        return _.extend(row.ticket, {
          assignee: findById(data.users, row.assignee_id),
          sequence: row[this.sequenceField]
        });
      }.bind(this));

      // Associate tickets with statuses
      ticketsGroupedByStatus = _.groupBy(this.data.tickets, 'status');
      this.data.statuses     = this.data.statuses.map(function(status) {
        var tickets = ticketsGroupedByStatus[status.value] || [];
        return _.extend(status, {
          hasTickets: tickets.length > 0,
          tickets: tickets
        });
      });

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
      this.sequenceField = this.requirement('sequence')|| 26013118;

      this.ajax('previewTicketView');
      this.ajax('getAssignableGroups');
    },

    transitionTicket: function(e) {
      var ticket, change = {};

      ticket = findById(this.data.tickets, e.id);

      if (ticket === undefined || ticket.status === e.newStatus) {
        return;
      }

      ticket.status = change.status = e.newStatus;

      if (ticket.assignee_id === null) {
        ticket.assignee_id = change.assignee_id = this.currentUser().id();
      }

      this.ajax('updateTicket', ticket.id, change);
    }
  };

}());
