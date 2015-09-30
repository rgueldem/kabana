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
      statuses: [ 'new', 'open', 'pending', 'solved', 'closed' ],
      users: {}
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

    setTickets: function(data) {
      this.data.tickets = data.rows.map(function(row) {
        return _.extend(row.ticket, {
          assignee: _.findWhere(data.users, { id: row.assignee_id }),
          position: new Big(row[this.data.positionField] || row.ticket.id),
          subject: row.subject
        });
      }.bind(this));

      // Get a unique list of assignee ids
      var assigneeIds = _.chain(this.data.tickets)
                         .pluck('assignee')
                         .compact()
                         .uniq('id')
                         .pluck('id')
                         .value();

      // Load and cache avatars
      _.each(assigneeIds, function(id) {
        this.fetchAvatarForTicket(id)
            .then(this.renderAvatarForTicket.bind(this));
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
        .then(this.groups.setGroups);
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
