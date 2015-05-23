(function() {

  return {
    events: require('events.js'),
    requests: require('requests.js'),

    tickets: [],

    setTickets: function(data) {
      this.tickets = data.rows.map(function(row) {
        return row.ticket;
      });
    },

    appActivated: function() {
      this.ajax('previewTicketView').done(this.setTickets);
    }
  };

}());
