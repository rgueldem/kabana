var request = function(options) {
  var req = _.defaults(options, {
    contentType: 'application/json',
    dataType: 'json',
    type: 'GET'
  });

  if (options.data) {
    req.data = JSON.stringify(options.data);
  }

  return req;
};

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
              field: 'group_id',
              operator: 'is',
              value: this.groupId()
            }
          ],
          output: {
            columns: [ 'assignee', 'subject', this.positionField ]
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
