var previewTicketViewData = {
  view: {
    all: [
      { operator: 'is', value: 'open', field: 'status' }
    ]
  }
};

var requests = {
  previewTicketView: function() {
    return {
      url: '/api/v2/views/preview.json',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(previewTicketViewData)
    };
  },

  getAssignableGroups: function() {
    return {
      url: '/api/v2/groups/assignable.json',
      dataType: 'json'
    };
  }
};

module.exports = requests;
