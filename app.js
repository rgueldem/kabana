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

    appCreated: function(e) {
      if (!this.data.initialized) {
        // fallback value for development environment
        if (this.requirement('position') !== undefined) {
          this.data.positionField = this.requirement('position').requirement_id;
        } else {
          this.data.positionField = 26034977;
        }

        this.data.initialized = true;
      }

      switch(this.currentLocation()) {
        case 'nav_bar':
          this.board.initialize(this);
          this.board.load();
          break;
        case 'ticket_sidebar':
        case 'new_ticket_sidebar':
          this.sidebar.initialize(this);
          this.sidebar.load();
          break;
      }
    },

    appWillDestroy: function(e) {
      // seems to be a framework bug, doesn't get reinitialized unless it is null
      this.processedRequests = null;
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
