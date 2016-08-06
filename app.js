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
          this.data.positionField = 35373228; //26034977;
        }

        if (this.setting('statusFieldId') && this.setting('statusFieldId') > 0) {
          this.data.customStatus = true;
          this.data.statusField = parseInt(this.setting('statusFieldId'));
          this.data.statusFieldName = 'ticket_fields_%@'.fmt(this.data.statusField);
        } else {
          this.data.customStatus = false;
          this.data.statusField = 'status';
          this.data.statusFieldName = 'status';
        }

        if (this.setting('boardFieldId') && this.setting('boardFieldId') > 0) {
          this.data.customBoard = true;
          this.data.boardField = parseInt(this.setting('boardFieldId'));
          this.data.boardFieldName = 'ticket_fields_%@'.fmt(this.data.boardField);
        } else {
          this.data.customBoard = false;
          this.data.boardField = 'group_id';
          this.data.boardFieldName = 'group_id';
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
    },

    appTitle: function() {
      return this.dasherize(this.setting('title'));
    },

    dasherize: function(value) {
      return value.replace(/([a-z\d])([A-Z])/g, '$1_$2').toLowerCase().replace(/[ _]/g, '-');
    }
  };

}());
