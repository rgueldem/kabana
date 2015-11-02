(function() {

  return {
    data: {
      initialized: false,
      positionField: null
    },
    events: require('events.js'),
    requests: require('requests.js'),
    board: require('board.js'),
    sidebar: require('sidebar.js'),

    initialize: function() {
      if (!this.data.initialized) {
        // fallback value for development environment
        if (this.requirement('position') !== undefined) {
          this.data.positionField = this.requirement('position').requirement_id;
        } else {
          this.data.positionField = 26034977;
        }

        this.data.initialized = true;
      }
    },

    appCreated: function(e) {
      this.initialize();

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
