var draggedEl = null,
    placeholder = null,
    ticketDrop = null;

var dragdrop = {
  dragTicket: function(e) {
    draggedEl = this.$(e.target).closest('.ticket');

    placeholder = this.$('.ticket-placeholder');
    placeholder.width(draggedEl.outerWidth());
    placeholder.height(draggedEl.outerHeight());

    ticketDrop = this.$('.ticket-drop');
  },

  droponStatus: function(e) {
    e.preventDefault();

    var ticketStatus = this.$(e.target).closest('.ticket-status'),
        id = draggedEl.data('id'),
        newStatus = ticketStatus.data('status');

    placeholder.hide();
    draggedEl.appendTo(ticketStatus);

    this.trigger('transitionTicket', { id: id, newStatus: newStatus });
  },

  droponTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var ticket = this.$(e.target).closest('.ticket'),
        ticketStatus = this.$(e.target).closest('.ticket-status'),
        id = draggedEl.data('id'),
        dropId = ticket.data('id'),
        newStatus = ticketStatus.data('status');

    ticketDrop.hide();
    placeholder.hide();
    draggedEl.insertBefore(ticket);

    this.trigger('transitionTicket', { id: id, newStatus: newStatus, nextId: dropId });
  },

  dragenterTicketStatus: function(e) {
    e.preventDefault();

    var ticketStatus = this.$(e.target).closest('.ticket-status');

    placeholder.show();
    placeholder.detach();
    placeholder.appendTo(ticketStatus);
  },

  dragenterTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var ticket = this.$(e.target).closest('.ticket'),
        id = draggedEl.data('id'),
        dropId = ticket.data('id');

    if (id === dropId) {
      return;
    }

    placeholder.show();
    placeholder.detach();
    placeholder.insertBefore(ticket);

    ticketDrop.show();
    ticketDrop.offset(placeholder.offset());
    ticketDrop.width(ticket.outerWidth());
    ticketDrop.height(ticket.outerHeight() + (draggedEl.outerHeight() / 2) + 10);
    ticketDrop.detach();
    ticketDrop.appendTo(ticket);
  },

  dragleaveTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();

    ticketDrop.hide();
    placeholder.hide();
  },

  dragover: function(e) {
    e.preventDefault();

    draggedEl.detach();
  }
};

module.exports = dragdrop;
