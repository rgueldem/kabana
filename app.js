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
    draggedEl: null,
    events: require('events.js'),
    requests: require('requests.js'),

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
          assignee: findById(data.users, row.assignee_id)
        });
      });

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

      this.ajax('previewTicketView');
      this.ajax('getAssignableGroups');
    },

    dragTicket: function(e) {
      this.draggedEl = this.$(e.target);
    },

    dropTicket: function(e) {
      e.preventDefault();

      var dropzone = this.$(e.target).closest('.ticket-status'),
          id = this.draggedEl.data('id'),
          newStatus = dropzone.data('status');

      this.trigger('transitionTicket', { id: id, newStatus: newStatus });

      this.draggedEl.detach();
      this.draggedEl.appendTo(dropzone);
    },

    dragoverDropzone: function(e) {
      e.preventDefault();
    },

    transitionTicket: function(e) {
      var ticket, change = {};

      ticket = findById(this.data.tickets, e.id);

      if (ticket === undefined || ticket.status === e.newStatus) {
        return;
      }

      change.status = e.newStatus;

      if (ticket.assignee_id === null) {
        change.assignee_id = this.currentUser().id();
      }

      this.ajax('updateTicket', ticket.id, change);
    }
  };

}());
