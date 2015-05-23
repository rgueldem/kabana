var previewTicketViewData = {
  view: {
    all: [
      { operator: 'is', value: 'pending', field: 'status' }
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
  }
}

module.exports = requests;
