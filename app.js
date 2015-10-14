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
      this.data.statuses.forEach(function(status) {
        assigneeIds.push(_.chain(status.tickets).pluck('assignee').pluck('id').value());
      });

      assigneeIds = _.chain(assigneeIds).flatten().compact().uniq().value();

      // Load and cache avatars
      _.each(assigneeIds, function(id) {
        this.fetchAvatarForTicket(id)
            .then(this.renderAvatarForTicket.bind(this));
      }.bind(this));
    },

    setTickets: function(index, data) {
      var tickets,
          status = this.data.statuses[index],
          draggable = status.value === 'closed' ? false : true;

      tickets = data.rows.map(function(row) {
        return _.extend(row.ticket, {
          assignee: _.findWhere(data.users, { id: row.assignee_id }),
          position: new Big(row[this.data.positionField] || -row.ticket.id),
          subject: row.subject,
          draggable: draggable
        });
      }.bind(this));

      tickets.sort(function(a, b) {
        return b.position.cmp(a.position);
      });

      status.tickets = tickets;
    },

    prepareMinimap: function() {
      var max = _.max(this.data.statuses, function(status) {
        return status.tickets.length;
      }).tickets.length;

      if (max === 0) return;

      this.data.ticketHeight = Math.floor(100/max);

      this.data.statuses.forEach(function(status) {
        status.tickets.forEach(function(ticket) {
          ticket.active = ticket.id === this.ticket().id();
        }.bind(this));
      }.bind(this));
    },

    fetchTickets: function() {
      var promises = this.data.statuses.map(function(status, i) {
        return this.ajax('previewTicketView', status.value)
          .then(this.setTickets.bind(this, i));
      }.bind(this));

      return this.when.apply(this, promises);
    },

    fetchGroups: function() {
      return this.ajax('getAssignableGroups')
        .then(this.groups.setGroups);
    },

    reloadBoard: function() {
      // break up to support reloading individual colummns via rendering 'partials'
      this.switchTo('board', this.data);
      this.fetchAvatarsForTickets();
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
        .then(this.reloadBoard.bind(this));
    },

    sidebarCreated: function() {
      this.ticketFields('custom_field_' + this.data.positionField).hide();

      if (this.ticket().assignee().group()) {
        this.data.group_id   = this.ticket().assignee().group().id();
        this.data.group_name = this.ticket().assignee().group().name();
        this.store('group_id', this.data.group_id);
      }

      this.fetchTickets()
        .then(this.prepareMinimap.bind(this))
        .then(this.reloadSidebar.bind(this));
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
