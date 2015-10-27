var dragdrop = {
  draggedEl: null,
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
      dropTicket.data('id') === this.draggedEl.data('id');
  },

  transition: function(dropStatus, dropTicket) {
    var id = this.draggedEl.data('id'),
        status = this.draggedStatus.data('index'),
        newStatus = dropStatus.data('index'),
        dropId = null;

    if (dropTicket) dropId = dropTicket.data('id');

    this.app.trigger('transitionTicket', { id: id, newStatus: newStatus, nextId: dropId, status: status });
  },

  insertBefore: function(el, target) {
    el.detach();
    el.insertBefore(target);
  },

  appendTo: function(el, target) {
    el.detach();
    el.appendTo(target);
  },

  dragTicket: function(e) {
    // disable link dragging
    if (this.$(e.target).is('a')) return false;

    this.draggedEl = this.$(e.target).closest('.ticket');
    this.draggedStatus = this.$(e.target).closest('.ticket-status');

    this.placeholder = this.$('.ticket-placeholder');
    this.placeholder.width(this.draggedEl.outerWidth());
    this.placeholder.height(this.draggedEl.outerHeight());

    this.ticketDrop = this.$('.ticket-drop');
  },

  dropTicket: function(e) {
    // always clean up if drag was cancelled
    this.ticketDrop.hide();
    this.placeholder.hide();
    this.draggedEl.show();
    this.draggedEl = null;
  },

  droponStatus: function(e) {
    e.preventDefault();

    if (!this.draggedEl) return;
    if (this.invalidDrop(e)) return;

    var dropStatus = this.$(e.target).closest('.ticket-status');

    this.appendTo(this.draggedEl, dropStatus);

    this.transition(dropStatus);
  },

  droponTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.draggedEl) return;
    if (this.invalidDrop(e)) return;

    var dropTicket = this.$(e.target).closest('.ticket'),
        dropStatus = this.$(e.target).closest('.ticket-status');

    this.insertBefore(this.draggedEl, dropTicket);

    this.transition(dropStatus, dropTicket);
  },

  dragenterTicketStatus: function(e) {
    e.preventDefault();

    if (!this.draggedEl) return;
    if (this.invalidDrop(e)) return;

    var dropStatus = this.$(e.target).closest('.ticket-status');

    this.placeholder.show();
    this.appendTo(this.placeholder, dropStatus);
  },

  dragenterTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.draggedEl) return;
    if (this.invalidDrop(e)) return;

    var dropTicket = this.$(e.target).closest('.ticket');

    this.placeholder.show();
    this.insertBefore(this.placeholder, dropTicket);

    this.ticketDrop.show();
    this.ticketDrop.offset(this.placeholder.offset());
    this.ticketDrop.width(dropTicket.outerWidth());
    this.ticketDrop.height(dropTicket.outerHeight() + (this.draggedEl.outerHeight() / 2) + 10);
    this.appendTo(this.ticketDrop, dropTicket);
  },

  dragleaveTicket: function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.draggedEl) return;

    this.ticketDrop.hide();
    this.placeholder.hide();
  },

  dragover: function(e) {
    e.preventDefault();

    if (!this.draggedEl) return;

    this.draggedEl.hide();
  }
};

module.exports = dragdrop;
