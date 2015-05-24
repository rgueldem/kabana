var requests = {
  previewTicketView: function() {
    return {
      url: '/api/v2/views/preview.json',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        view: {
          all: [
            { operator: 'is', value: 'open', field: 'status' }
          ]
        }
      })
    };
  },

  getAssignableGroups: function() {
    return {
      url: '/api/v2/groups/assignable.json',
      dataType: 'json'
    };
  },

  updateTicket: function(id, status) {
    return {
      url: '/api/v2/tickets/' + id + '.json',
      type: 'PUT',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        ticket: {
          status: status
        }
      })
    }
  }
};

module.exports = requests;
