(function() {

  var findById = function(list, id) {
    return _.find(list, function(item) {
      return item.id === id;
    });
  };

  return {
    events: require('events.js'),
    requests: require('requests.js'),

    tickets: [],
    groups: [],
    draggedEl: null,

    setTickets: function(data) {
      this.tickets = data.rows.map(function(row) {
        return _.extend(row.ticket, {
          assignee: findById(data.users, row.assignee_id)
        });
      });
      this.trigger('reloadBoard');
    },

    setGroups: function(data) {
      this.groups = data.groups;
      this.trigger('reloadBoard');
    },

    reloadBoard: function() {
      var context = {
        tickets: this.tickets,
        groups: this.groups
      };

      this.switchTo('board', context);
    },

    appActivated: function() {
      this.ajax('previewTicketView');
      this.ajax('getAssignableGroups');
    },

    dragTicket: function(e) {
      this.draggedEl = this.$(e.target);
    },

    dropTicket: function(e) {
      e.preventDefault();

      var dropzone = this.$(e.target).closest('.dropzone'),
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

      ticket = findById(this.tickets, e.id);

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
