(function() {

  return {
    events: require('events.js'),
    requests: require('requests.js'),

    tickets: [],
    groups: [],

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
    }
  };

}());
