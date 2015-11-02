var Big = require('vendor/big.js');
var md5 = require('vendor/md5.js');

var changePosition = function(ticket, change, position, field) {
  if (ticket.position !== position) {
    ticket.position = position;

    change.custom_fields = [{
      id: field,
      value: ticket.position.toString()
    }];
  }
};

var moveLast = function(ticket, change, tickets, field) {
  var last = _.last(tickets);

  if (last !== undefined) {
    if (last.id !== ticket.id) {
      changePosition(ticket, change, last.position.minus(1), field);

    }
  } else { // empty list
    changePosition(ticket, change, new Big(0), field);
  }
};

var moveBefore = function(ticket, change, tickets, nextId, field) {
  var next, prevIndex, prev;

  next = _.findWhere(tickets, { id: nextId });
  prevIndex = _.indexOf(tickets, next) - 1;

  if (prevIndex >= 0) {
    prev = tickets[prevIndex];

    if (prev.id === ticket.id) return;
  }

  if (prev === undefined) {
    changePosition(ticket, change, next.position.plus(1), field);
  } else {
    changePosition(ticket, change, positionBetween(prev, next), field);
  }
};

var positionBetween = function(a, b) {
  if (b.position.gte(a.position)) {
    // invalid call, soft fail
    return a.position;
  }

  // use exponent of difference to determine step size
  var diff = a.position.minus(b.position), // e.g. 1 - 0.9 = 0.1
      exp  = diff.e,                       // -1
      step = new Big(10).pow(exp);         // 0.1

  if (step >= diff) {                      // 0.1 >= 0.1
    step = step.div(10);                   // 0.01
  }

  return b.position.plus(step);            // 0.91
};

var board = {
  tickets: require('tickets.js'),
  statuses: require('statuses.js'),
  dragdrop: require('dragdrop.js'),
  groups: require('groups.js'),
  users: {},

  initialize: function(app) {
    this.app = app;

    this.dragdrop.initialize(this.app);
    this.tickets.initialize(this.app);
    this.groups.initialize(this.app);
    this.statuses.initialize(this.app);
  },

  load: function() {
    this.statuses.load()
      .then(this.fetchGroups.bind(this))
      .then(this.reload.bind(this));
  },

  fetchGroups: function() {
    return this.app.ajax('getAssignableGroups')
      .then(this.groups.setGroups.bind(this.groups));
  },

  switchGroup: function(groupId) {
    this.fetchGroups().then(function() {
      this.groups.switchGroup(groupId);
      this.reload();
    }.bind(this));
  },

  reload: function() {
    this.tickets.fetch()
      .then(this.render.bind(this));
  },

  render: function() {
    this.ticketsByStatus = this.statuses.statuses.map(function(status, index) {
      return _.extend(status, {
        tickets: this.tickets.byStatus[index]
      });
    }.bind(this));

    this.app.switchTo('board', this);
    this.renderColumnCounts();
    this.renderColumnEmpty();
    this.fetchAvatarsForTickets();
  },

  renderColumnCounts: function() {
    var $count;

    this.statuses.statuses.forEach(function(status, index) {
      $count = this.app.$('.ticket-status.col[data-index=' + index + ']').find('.count');
      $count.html(this.tickets.countByStatus[index]);
    }.bind(this));
  },

  renderColumnEmpty: function() {
    var $empty;

    this.statuses.statuses.forEach(function(status, index) {
      $empty = this.app.$('.ticket-status.col[data-index=' + index + ']').find('.empty');

      $empty.toggleClass('hidden', this.tickets.countByStatus[index] > 0);
    }.bind(this));
  },

  renderAvatarForTicket: function(user) {
    var $img = this.app.$('[data-assignee-id=' + user.id + ']').find('img');
    $img.attr('src', user.avatar);
  },

  fetchAvatarForTicket: function(userId) {
    var user = this.users[userId];

    if (user === undefined) {
      return this.app.promise(function(done, fail) {
        // Exit early if there is no assigned user
        if (userId === null) { fail(); return; }

        this.app.ajax('getUserById', userId)
          .done(function(response) {
            var user = response.user;
            if (user.photo) {
              user.avatar = user.photo.thumbnails[0].content_url;
            } else {
              user.avatar = "//www.gravatar.com/avatar/%@".fmt(md5(user.email));
            }

            this.users[userId] = user;
            done(user);
          }.bind(this));
      }.bind(this));
    } else {
      return this.app.promise(function(done) {
        done(user);
      });
    }
  },

  fetchAvatarsForTickets: function() {
    // Get a unique list of assignee ids
    var assigneeIds = [];
    this.statuses.statuses.forEach(function(status, index) {
      assigneeIds.push(_.chain(this.tickets.byStatus[index]).pluck('assignee').pluck('id').value());
    }.bind(this));

    assigneeIds = _.chain(assigneeIds).flatten().compact().uniq().value();

    // Load and cache avatars
    _.each(assigneeIds, function(id) {
      this.fetchAvatarForTicket(id)
        .then(this.renderAvatarForTicket.bind(this));
    }.bind(this));
  },

  transition: function(e) {
    var ticket, change = {}, tickets, newStatus;

    ticket = _.findWhere(this.tickets.byStatus[e.status], { id: e.id });

    if (ticket === undefined) return;

    tickets = this.tickets.byStatus[e.newStatus];
    newStatus = this.statuses.statuses[e.newStatus].value;

    this.changeStatus(ticket, change, newStatus, ticket.statusIndex, e.newStatus);
    this.changeAssignee(ticket, change, this.app.currentUser().id());

    if (e.nextId === null) {
      moveLast(ticket, change, tickets, this.app.data.positionField);
    } else {
      moveBefore(ticket, change, tickets, e.nextId, this.app.data.positionField);
    }

    if (!_.isEmpty(change)) {
      this.app.ajax('updateTicket', ticket.id, change);
      this.tickets.sort(tickets);
    }
  },

  changeStatus: function(ticket, change, newStatus, from, to) {
    if (ticket.status !== newStatus) {
      ticket.status = change.status = newStatus;
      ticket.statusIndex = to;

      this.tickets.byStatus[from] = _.without(this.tickets.byStatus[from], ticket);
      this.tickets.byStatus[to].push(ticket);

      this.tickets.countByStatus[from]--;
      this.tickets.countByStatus[to]++;

      this.renderColumnCounts();
      this.renderColumnEmpty();
    }
  },

  changeAssignee: function(ticket, change, id) {
    if (!ticket.assignee && ticket.status !== 'new') {
      ticket.assignee_id = change.assignee_id = id;
    }
  }
};

module.exports = board;
