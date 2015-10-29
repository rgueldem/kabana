(function() {

  // Vendor libraries
  var md5 = require('vendor/md5.js');
  var Big = require('vendor/big.js');

  return {
    data: {
      initialized: false,
      positionField: null,
      groups: [],
      tickets: [],
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
    board: require('board.js'),
    groups: require('groups.js'),
    minimap: require('minimap.js'),

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
          readonly = status.readonly === true;

      tickets = data.rows.map(function(row) {
        return _.extend(row.ticket, {
          assignee: _.findWhere(data.users, { id: row.assignee_id }),
          position: new Big(row[this.data.positionField] || -row.ticket.id),
          subject: row.subject,
          draggable: !readonly,
          statusIndex: index
        });
      }.bind(this));

      this.sortTickets(tickets);

      status.tickets = tickets;
    },

    sortTickets: function(tickets) {
      tickets.sort(function(a, b) {
        return b.position.cmp(a.position);
      });
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
      this.switchTo('sidebar', this.minimap);
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
        .then(this.fetchTickets)
        .then(this.reloadBoard.bind(this));
    },

    sidebarCreated: function() {
      this.ticketFields('custom_field_' + this.data.positionField).hide();
      this.minimap.initialize(this);

      if (this.ticket().assignee().group()) {
        this.store('group_id', this.ticket().assignee().group().id());
      }

      this.fetchTickets()
        .then(this.minimap.prepare.bind(this.minimap))
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
