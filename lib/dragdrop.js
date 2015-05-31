var draggedEl = null,
    draggedWidth = 0,
    draggedHeight = 0;

var dragdrop = {
  dragTicket: function(e) {
    draggedEl = this.$(e.target).closest('.ticket');
    draggedWidth = draggedEl.outerWidth();
    draggedHeight = draggedEl.outerHeight();
  },

  droponStatus: function(e) {
    e.preventDefault();

    var ticketStatus = this.$(e.target).closest('.ticket-status'),
        ticketPlaceholder = this.$('.ticket-placeholder'),
        id = draggedEl.data('id'),
        newStatus = ticketStatus.data('status');

    ticketPlaceholder.hide();

    this.trigger('transitionTicket', { id: id, newStatus: newStatus });

    draggedEl.detach();
    draggedEl.appendTo(ticketStatus);
  },

  droponTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var ticket = this.$(e.target).closest('.ticket'),
        ticketDrop = this.$('.ticket-drop'),
        ticketPlaceholder = this.$('.ticket-placeholder'),
        ticketStatus = this.$(e.target).closest('.ticket-status'),
        id = draggedEl.data('id'),
        dropId = ticket.data('id'),
        newStatus = ticketStatus.data('status');

    ticketDrop.hide();
    ticketPlaceholder.hide();

    if (id === dropId) {
      return;
    }

    this.trigger('transitionTicket', { id: id, newStatus: newStatus, nextId: dropId });

    draggedEl.detach();
    draggedEl.insertBefore(ticket);
  },

  dragenterTicketStatus: function(e) {
    e.preventDefault();

    var ticketStatus = this.$(e.target).closest('.ticket-status'),
        ticketPlaceholder = this.$('.ticket-placeholder');

    ticketPlaceholder.show();
    ticketPlaceholder.width(draggedWidth);
    ticketPlaceholder.height(draggedHeight);
    ticketPlaceholder.appendTo(ticketStatus);
  },

  dragenterTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var ticket = this.$(e.target).closest('.ticket'),
        ticketDrop = this.$('.ticket-drop'),
        ticketPlaceholder = this.$('.ticket-placeholder'),
        id = draggedEl.data('id'),
        dropId = ticket.data('id');

    if (id === dropId) {
      return;
    }

    ticketPlaceholder.show();
    ticketPlaceholder.width(draggedWidth);
    ticketPlaceholder.height(draggedHeight);
    ticketPlaceholder.insertBefore(ticket);

    ticketDrop.show();
    ticketDrop.offset(ticketPlaceholder.offset());
    ticketDrop.width(ticket.outerWidth());
    ticketDrop.height(ticket.outerHeight() + (draggedEl.outerHeight() / 2) + 10);
    ticketDrop.detach();
    ticketDrop.appendTo(ticket);
  },

  dragleaveTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var ticketDrop = this.$('.ticket-drop'),
        ticketPlaceholder = this.$('.ticket-placeholder');

    ticketDrop.hide();
    ticketPlaceholder.hide();
  },

  dragover: function(e) {
    e.preventDefault();

    draggedEl.detach();
  }
};

module.exports = dragdrop;
