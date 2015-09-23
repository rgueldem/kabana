var draggedEl = null,
    placeholder = null,
    ticketDrop = null;

var dragdrop = {
  dragTicket: function(e) {
    // disable link dragging
    if (this.$(e.target).is('a')) return false;

    draggedEl = this.$(e.target).closest('.ticket');

    placeholder = this.$('.ticket-placeholder');
    placeholder.width(draggedEl.outerWidth());
    placeholder.height(draggedEl.outerHeight());

    ticketDrop = this.$('.ticket-drop');
  },

  dropTicket: function(e) {
    // always clean up if drag was cancelled
    ticketDrop.hide();
    placeholder.hide();
    draggedEl.show();
    draggedEl = null;
  },

  droponStatus: function(e) {
    if (!draggedEl) return;

    e.preventDefault();

    var ticketStatus = this.$(e.target).closest('.ticket-status'),
        id = draggedEl.data('id'),
        newStatus = ticketStatus.data('index');

    if (ticketStatus.data('status') === 'new' && draggedEl.data('status') !== 'new') {
      return;
    }

    draggedEl.detach();
    draggedEl.appendTo(ticketStatus);

    this.trigger('transitionTicket', { id: id, newStatus: newStatus });
  },

  droponTicket: function(e) {
    if (!draggedEl) return;

    e.preventDefault();
    e.stopPropagation();

    var ticket = this.$(e.target).closest('.ticket'),
        ticketStatus = this.$(e.target).closest('.ticket-status'),
        id = draggedEl.data('id'),
        dropId = ticket.data('id'),
        newStatus = ticketStatus.data('index');

    if (ticket.data('status') === 'new' && draggedEl.data('status') !== 'new') {
      return;
    }

    ticketDrop.hide();
    draggedEl.detach();
    draggedEl.insertBefore(ticket);

    this.trigger('transitionTicket', { id: id, newStatus: newStatus, nextId: dropId });
  },

  dragenterTicketStatus: function(e) {
    if (!draggedEl) return;

    e.preventDefault();

    var ticketStatus = this.$(e.target).closest('.ticket-status');

    if (ticketStatus.data('status') === 'new' && draggedEl.data('status') !== 'new') {
      return;
    }

    placeholder.show();
    placeholder.detach();
    placeholder.appendTo(ticketStatus);
  },

  dragenterTicket: function(e) {
    if (!draggedEl) return;

    e.preventDefault();
    e.stopPropagation();

    var ticket = this.$(e.target).closest('.ticket'),
        id = draggedEl.data('id'),
        dropId = ticket.data('id');

    if (id === dropId) {
      return;
    }

    if (ticket.data('status') === 'new' && draggedEl.data('status') !== 'new') {
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
    if (!draggedEl) return;

    e.preventDefault();
    e.stopPropagation();

    ticketDrop.hide();
    placeholder.hide();
  },

  dragover: function(e) {
    if (!draggedEl) return;

    draggedEl.hide();
    e.preventDefault();
  }
};

module.exports = dragdrop;
