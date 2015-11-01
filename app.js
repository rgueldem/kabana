(function() {

  return {
    data: {
      initialized: false,
      positionField: null,
      statuses: [
        {
          value: 'new',
          unassignable: true
        },
        {
          value: 'open'
        },
        {
          value: 'pending'
        },
        {
          value: 'solved'
        },
        {
          value: 'closed',
          readonly: true
        }
      ],
    },
    events: require('events.js'),
    requests: require('requests.js'),
    board: require('board.js'),
    sidebar: require('sidebar.js'),

    getTicketStatusTranslation: function(status) {
      status.title = this.I18n.t('ticket_statuses.' + status.value);
    },

    initialize: function() {
      // fallback value for development environment
      if (this.requirement('position') !== undefined) {
        this.data.positionField = this.requirement('position').requirement_id;
      } else {
        this.data.positionField = 26034977;
      }

      // Load translations for ticket statuses
      this.data.statuses.forEach(this.getTicketStatusTranslation.bind(this));

      this.data.initialized = true;
    },

    appCreated: function(e) {
      if (!this.data.initialized) this.initialize();

      switch(this.currentLocation()) {
        case 'nav_bar':
          this.board.initialize(this);
          break;
        case 'ticket_sidebar':
        case 'new_ticket_sidebar':
          this.sidebar.initialize(this);
          break;
      }
    },

    appRouteChanged: function(e, data) {
      var route = data.appRoute.split(/\//),
          groupId;

      if (route[0] === 'groups' && route.length > 1) {
        groupId = parseInt(route[1], 10);

        this.board.switchGroup(groupId);
      }
    }
  };

}());
