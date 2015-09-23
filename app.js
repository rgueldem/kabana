(function() {

  // Vendor libraries
  var md5 = require('vendor/md5.js');
  var Big = require('vendor/big.js');

  return {
    data: {
      initialized: false,
      positionField: null,
      groups: [],
      minimap: {},
      tickets: [],
      statuses: [ 'new', 'open', 'pending', 'solved', 'closed' ]
    },
    dragdrop: require('dragdrop.js'),
    events: require('events.js'),
    requests: require('requests.js'),
    board: require('board.js'),
    groups: require('groups.js'),

    getTicketStatusTranslation: function(value) {
      return {
        'title': this.I18n.t('ticket_statuses.' + value),
        'value': value
      };
    },

    makeDroppable: function(status) {
      status.droppable = status.value === 'new' ? false : true;
    },

    groupTickets: function() {
      // Associate tickets with statuses
      var ticketsGroupedByStatus = _.groupBy(this.data.tickets, 'status');

      this.data.statuses = this.data.statuses.map(function(status) {
        var tickets = ticketsGroupedByStatus[status.value] || [];

        tickets.forEach(function(ticket) {
          ticket.draggable = status.value === 'closed' ? false : true;
        });

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
          position: new Big(row[this.data.positionField] || row.ticket.id),
          subject: row.subject
        });
      }.bind(this));
    },

    prepareMinimap: function() {
      if (this.data.tickets.length === 0) return;

      var max = _.max(this.data.statuses, function(status) {
        return status.tickets.length;
      }).tickets.length;

      this.data.ticketHeight = Math.floor(100/max);

      this.data.tickets.forEach(function(ticket) {
        ticket.active = ticket.id === this.ticket().id();
      }.bind(this));
    },

    fetchTickets: function() {
      return this.ajax('previewTicketView')
        .then(this.setTickets)
        .then(this.groupTickets);
    },

    fetchGroups: function() {
      return this.ajax('getAssignableGroups')
        .then(this.groups.setGroups.bind(this));
    },

    reloadBoard: function() {
      this.switchTo('board', this.data);
    },

    reloadSidebar: function() {
      this.switchTo('sidebar', this.data);
    },

    initialize: function() {
      // fallback value for development environment
      if (this.requirement('position') !== undefined) {
        this.data.positionField = this.requirement('position').requirement_id;
      } else {
        this.data.positionField = 26034977;
      }

      // Load translations for ticket statuses
      this.data.statuses = this.data.statuses.map(this.getTicketStatusTranslation.bind(this));
      this.data.statuses.forEach(this.makeDroppable);

      this.data.initialized = true;
    },

    navbarCreated: function() {
      this.fetchGroups()
        .then(this.fetchTickets)
        .then(this.reloadBoard);
    },

    sidebarCreated: function() {
      this.ticketFields('custom_field_' + this.data.positionField).hide();

      if (this.ticket().assignee().group()) {
        this.data.group_id   = this.ticket().assignee().group().id();
        this.data.group_name = this.ticket().assignee().group().name();
        this.store('group_id', this.data.group_id);
      }

      this.fetchTickets()
        .then(this.prepareMinimap)
        .then(this.reloadSidebar);
    },

    appCreated: function(e) {
      if (!this.data.initialized) this.initialize();

      switch(this.currentLocation()) {
        case 'nav_bar':
          this.navbarCreated();
          break;
        case 'ticket_sidebar':
        case 'new_ticket_sidebar':
          this.sidebarCreated();
          break;
      }
    },

    appRouteChanged: function(e, data) {
      var route = data.appRoute.split(/\//);

      // FIXME: set active group
      if (route[0] === 'groups' && route.length > 1) {
        this.store('group_id', route[1]);
        this.fetchTickets().then(this.reloadBoard);
      }
    }
  };

}());
