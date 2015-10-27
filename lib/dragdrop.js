var dragdrop = {
  draggedTicket: null,
  draggedStatus: null,
  placeholder: null,
  ticketDrop: null,

  initialize: function(app) {
    this.app = app;
    this.$ = app.$;
  },

  invalidDrop: function(e) {
    var dropStatus = this.$(e.target).closest('.ticket-status'),
      dropTicket = this.$(e.target).closest('.ticket');

    return (dropStatus.data('unassignable') === true &&
      dropStatus.data('index') !== this.draggedStatus.data('index')) ||
      dropTicket.data('id') === this.draggedTicket.data('id');
  },

  transition: function(dropStatus, dropTicket) {
    var id = this.draggedTicket.data('id'),
        status = this.draggedStatus.data('index'),
        newStatus = dropStatus.data('index'),
        dropId = null;

    if (dropTicket) dropId = dropTicket.data('id');

    this.app.trigger('transitionTicket', { id: id, newStatus: newStatus, nextId: dropId, status: status });
  },

  dragTicket: function(e) {
    // disable link dragging
    if (this.$(e.target).is('a')) return false;

    this.draggedTicket = this.$(e.target).closest('.ticket');
    this.draggedStatus = this.$(e.target).closest('.ticket-status');

    this.placeholder = this.$('.ticket-placeholder');
    this.placeholder.width(this.draggedTicket.outerWidth());
    this.placeholder.height(this.draggedTicket.outerHeight());

    this.ticketDrop = this.$('.ticket-drop');
  },

  dropTicket: function(e) {
    // always clean up if drag was cancelled
    this.ticketDrop.hide();
    this.placeholder.hide();
    this.draggedTicket.show();
    this.draggedTicket = null;
  },

  droponStatus: function(e) {
    e.preventDefault();

    if (!this.draggedTicket) return;
    if (this.invalidDrop(e)) return;

    var dropStatus = this.$(e.target).closest('.ticket-status');

    this.draggedTicket.detach();
    this.draggedTicket.appendTo(dropStatus);

    this.transition(dropStatus);
  },

  droponTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.draggedTicket) return;
    if (this.invalidDrop(e)) return;

    var dropTicket = this.$(e.target).closest('.ticket'),
        dropStatus = this.$(e.target).closest('.ticket-status');

    this.draggedTicket.detach();
    this.draggedTicket.insertBefore(dropTicket);

    this.transition(dropStatus, dropTicket);
  },

  dragenterTicketStatus: function(e) {
    e.preventDefault();

    if (!this.draggedTicket) return;
    if (this.invalidDrop(e)) return;

    var dropStatus = this.$(e.target).closest('.ticket-status');

    this.placeholder.show();
    this.placeholder.detach();
    this.placeholder.appendTo(dropStatus);
  },

  dragenterTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.draggedTicket) return;
    if (this.invalidDrop(e)) return;

    var dropTicket = this.$(e.target).closest('.ticket');

    this.placeholder.show();
    this.placeholder.detach();
    this.placeholder.insertBefore(dropTicket);

    this.ticketDrop.show();
    this.ticketDrop.offset(this.placeholder.offset());
    this.ticketDrop.width(dropTicket.outerWidth());
    this.ticketDrop.height(dropTicket.outerHeight() + (this.draggedTicket.outerHeight() / 2) + 10);
    this.ticketDrop.detach();
    this.ticketDrop.appendTo(dropTicket);
  },

  dragleaveTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.draggedTicket) return;

    this.ticketDrop.hide();
    this.placeholder.hide();
  },

  dragover: function(e) {
    e.preventDefault();

    if (!this.draggedTicket) return;

    this.draggedTicket.hide();
  }
};

module.exports = dragdrop;
