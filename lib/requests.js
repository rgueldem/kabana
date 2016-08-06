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

  getTicketFields: function() {
    return request({
      url: '/api/v2/ticket_fields'
    });
  },

  getUserById: function(id) {
    return request({
      url: '/api/v2/users/%@'.fmt(id)
    });
  },

  previewTicketView: function(groupId, status) {
    var req = {
      url: '/api/v2/views/preview',
      type: 'POST',
      data: {
        view: {
          all: [
            {
              field: this.data.boardFieldName,
              operator: 'is',
              value: groupId
            },
            {
              field: this.data.statusFieldName,
              operator: 'is',
              value: status
            }
          ],
          output: {
            columns: [ 'assignee', 'subject', this.data.positionField, this.data.statusField, this.data.boardField],
            // highest to lowest, null last
            sort_order: 'desc',
            sort_by: this.data.positionField.toString()
          }
        }
      }
    };

    if (this.data.customStatus) {
      req.data.view.all.push({
        field: 'status',
        operator: 'is_not',
        value: 'closed'
      });
    }

    return request(req);
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
