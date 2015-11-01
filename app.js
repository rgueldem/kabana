(function() {

  // Vendor libraries
  var md5 = require('vendor/md5.js');

  return {
    data: {
      initialized: false,
      positionField: null,
      groups: [],
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
      users: {}
    },
    dragdrop: require('dragdrop.js'),
    events: require('events.js'),
    requests: require('requests.js'),
    tickets: require('tickets.js'),
    board: require('board.js'),
    groups: require('groups.js'),
    sidebar: require('sidebar.js'),

    getTicketStatusTranslation: function(status) {
      status.title = this.I18n.t('ticket_statuses.' + status.value);
    },

    renderAvatarForTicket: function(user) {
      var $img = this.$('[data-assignee-id=' + user.id + ']').find('img');
      $img.attr('src', user.avatar);
    },

    fetchAvatarForTicket: function(userId) {
      var user = this.data.users[userId];

      if (user === undefined) {
        return this.promise(function(done, fail) {
          // Exit early if there is no assigned user
          if (userId === null) { fail(); return; }

          this.ajax('getUserById', userId)
            .done(function(response) {
              var user = response.user;
              if (user.photo) {
                user.avatar = user.photo.thumbnails[0].content_url;
              } else {
                user.avatar = "//www.gravatar.com/avatar/%@".fmt(md5(user.email));
              }

              this.data.users[userId] = user;
              done(user);
            }.bind(this));
          });
      } else {
        return this.promise(function(done) {
          done(user);
        });
      }
    },

    fetchAvatarsForTickets: function() {
      // Get a unique list of assignee ids
      var assigneeIds = [];
      this.data.statuses.forEach(function(status, index) {
        assigneeIds.push(_.chain(this.tickets.byStatus[index]).pluck('assignee').pluck('id').value());
      }.bind(this));

      assigneeIds = _.chain(assigneeIds).flatten().compact().uniq().value();

      // Load and cache avatars
      _.each(assigneeIds, function(id) {
        this.fetchAvatarForTicket(id)
            .then(this.renderAvatarForTicket.bind(this));
      }.bind(this));
    },

    fetchGroups: function() {
      return this.ajax('getAssignableGroups')
        .then(this.groups.setGroups);
    },

    reloadBoard: function() {
      // break up to support reloading individual colummns via rendering 'partials'
      this.prepareBoard()
      this.switchTo('board', this.data);
      this.fetchAvatarsForTickets();
    },

    reloadSidebar: function() {
      this.switchTo('sidebar', this.sidebar);
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

    navbarCreated: function() {
      this.dragdrop.initialize(this);

      this.fetchGroups()
        .then(this.tickets.fetch.bind(this.tickets))
        .then(this.reloadBoard.bind(this));
    },

    prepareBoard: function() {
      // temp until board has state
      this.data.ticketsByStatus = this.data.statuses.map(function(status, index) {
        return _.extend(status, {
          tickets: this.tickets.byStatus[index]
        });
      }.bind(this));
    },

    appCreated: function(e) {
      if (!this.data.initialized) this.initialize();

      this.tickets.initialize(this);

      switch(this.currentLocation()) {
        case 'nav_bar':
          this.navbarCreated();
          break;
        case 'ticket_sidebar':
        case 'new_ticket_sidebar':
          this.sidebar.initialize(this, this);
          break;
      }
    },

    appRouteChanged: function(e, data) {
      var route = data.appRoute.split(/\//),
          groupId;

      if (route[0] === 'groups' && route.length > 1) {
        groupId = parseInt(route[1], 10);

        this.fetchGroups().then(function() {
          this.trigger('switchGroup', groupId);
        });
      }
    }
  };

}());
