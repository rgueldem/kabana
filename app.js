(function() {

  return {
    events: require('events.js'),
    requests: require('requests.js'),

    tickets: [],
    groups: [],
    draggedEl: null,

    setTickets: function(data) {
      this.tickets = data.rows.map(function(row) {
        return row.ticket;
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
          status = dropzone.data('status');

      console.log('Dropped ticket ' + id + ' to ' + status);

      this.draggedEl.detach();
      this.draggedEl.appendTo(dropzone);
    },

    dragoverDropzone: function(e) {
      e.preventDefault();
    }
  };

}());
