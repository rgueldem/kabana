var draggedEl = null;

var dragdrop = {
  dragTicket: function(e) {
    draggedEl = this.$(e.target).closest('.ticket');
  },

  droponStatus: function(e) {
    e.preventDefault();

    var statusDrop = this.$(e.target).closest('.ticket-status'),
        id = draggedEl.data('id'),
        newStatus = statusDrop.data('status');

    this.trigger('transitionTicket', { id: id, newStatus: newStatus });

    draggedEl.detach();
    draggedEl.appendTo(statusDrop);
  },

  droponTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var ticketDrop = this.$(e.target).closest('.ticket'),
        statusDrop = this.$(e.target).closest('.ticket-status'),
        id = draggedEl.data('id'),
        dropId = ticketDrop.data('id'),
        newStatus = statusDrop.data('status');

    if (id === dropId) {
      return;
    }

    this.trigger('transitionTicket', { id: id, newStatus: newStatus });

    draggedEl.detach();
    draggedEl.insertBefore(ticketDrop);
  },

  dragoverStatus: function(e) {
    e.preventDefault();
  },

  dragoverTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();
  },
};

module.exports = dragdrop;
