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

  getUserById: function(id) {
    return request({
      url: '/api/v2/users/%@'.fmt(id)
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
              value: this.store('group_id')
            }
          ],
          output: {
            columns: [ 'assignee', 'subject', this.data.positionField ],
            // highest to lowest, null last
            sort_order: 'desc',
            sort_by: this.data.positionField.toString()
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
