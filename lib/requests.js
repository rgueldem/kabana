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
            { operator: 'is_not', value: 'closed', field: 'status' }
          ],
          output: {
            columns: [ 'assignee', this.sequenceField ]
          }
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

  updateTicket: function(id, change) {
    return {
      url: '/api/v2/tickets/' + id + '.json',
      type: 'PUT',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        ticket: change
      })
    };
  }
};

module.exports = requests;
