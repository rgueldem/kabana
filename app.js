(function() {

  // Vendor libraries
  var md5 = require('vendor/md5.js');
  var Big = require('vendor/big.js');

  return {
    data: {
      groups: [],
      tickets: [],
      statuses: [ 'new', 'open', 'pending', 'hold', 'solved', 'closed' ],
      activeGroup: 0
    },
    dragdrop: require('dragdrop.js'),
    events: require('events.js'),
    positionField: null,
    requests: require('requests.js'),
    board: require('board.js'),

    getTicketStatusTranslation: function(value) {
      return {
        'title': this.I18n.t('ticket_statuses.' + value),
        'value': value
      };
    },

    groupTickets: function() {
      // Associate tickets with statuses
      var ticketsGroupedByStatus = _.groupBy(this.data.tickets, 'status');

      this.data.statuses = this.data.statuses.map(function(status) {
        var tickets = ticketsGroupedByStatus[status.value] || [];

        tickets.sort(function(a, b) {
          return a.position.cmp(b.position);
        });

        return _.extend(status, {
          tickets: tickets
        });
      }.bind(this));
    },

    setTickets: function(data) {
      this.data.tickets = data.rows.map(function(row) {
        return _.extend(row.ticket, {
          assignee: _.findWhere(data.users, { id: row.assignee_id }),
          position: new Big(row[this.positionField] || row.ticket.id),
          subject: row.subject
        });
      }.bind(this));

      this.groupTickets();

      this.trigger('reloadBoard');
    },

    setGroups: function(data) {
      this.data.groups = data.groups;
      this.data.groups[this.data.activeGroup].active = true;

      this.ajax('previewTicketView');
    },

    switchGroup: function(e) {
      e.preventDefault();

      this.data.groups[this.data.activeGroup].active = false;
      this.data.activeGroup = this.$(e.target).data('group');
      this.data.groups[this.data.activeGroup].active = true;

      this.ajax('previewTicketView');
    },

    groupId: function() {
      return this.data.groups[this.data.activeGroup].id;
    },

    reloadBoard: function() {
      this.switchTo('board', this.data);
    },

    navbarCreated: function() {
      // Load translations for ticket statuses
      this.data.statuses = this.data.statuses.map(this.getTicketStatusTranslation.bind(this));

      this.ajax('getAssignableGroups');
    },

    sidebarCreated: function() {
      this.ticketFields('custom_field_' + this.positionField).hide();
    },

    appCreated: function() {
      // fallback value for development environment
      if (this.requirement('position') !== undefined) {
        this.positionField = this.requirement('position').requirement_id;
      } else {
        this.positionField = 26034977;
      }

      switch(this.currentLocation()) {
        case 'nav_bar':
          this.navbarCreated();
          break;
        case 'ticket_sidebar':
        case 'new_ticket_sidebar':
          this.sidebarCreated();
          break;
      }
    }
  };

}());
