function request(options) {
  var request = _.defaults(options, {
    contentType: 'application/json',
    dataType: 'json',
    type: 'GET'
  });

  if (options.data) {
    request.data = JSON.stringify(options.data);
  }

  return request;
}

var requests = {
  getAssignableGroups: function() {
    return request({
      url: '/api/v2/groups/assignable'
    });
  },

  previewTicketView: function() {
    return request({
      url: '/api/v2/views/preview',
      type: 'POST',
      data: {
        view: {
          all: [
            {
              operator: 'is_not',
              value: 'closed',
              field: 'status'
            }
          ],
          output: {
            columns: [ 'assignee', this.positionField ]
          }
        }
      }
    });
  },

  updateTicket: function(id, change) {
    return request({
      url: '/api/v2/tickets/%@'.fmt(id),
      type: 'PUT',
      data: {
        ticket: change
      }
    });
  }
};

module.exports = requests;
