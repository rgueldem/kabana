var initActiveGroup = function(groups, id) {
  var group;

  if (id === undefined) {
    group = groups[0];
  } else {
    group = _.findWhere(groups, { id: id });
  }

  if (group === undefined) {
    group = groups[0];
  }

  group.active = true;

  return group;
};

var setActiveGroup = function(groups, id) {
  _.findWhere(groups, { active: true }).active = false;
  _.findWhere(groups, { id: id }).active = true;
};

var groups = {
  groups: [],

  initialize: function(app) {
    this.app = app;
  },

  load: function() {
    if (this.app.data.customBoard) {
      return this.app.ajax('getTicketFields')
        .then(this.setGroups.bind(this));
    } else {
      return this.app.ajax('getAssignableGroups')
        .then(this.setGroups.bind(this));
    }
  },

  setGroups: function(data) {
    if (this.app.data.customBoard) {
      var boardField = this.app.data.boardField;

      this.groups = _.find(data.ticket_fields, function(field) {
        return field.id === boardField;
      }).custom_field_options;
    } else {
      this.groups = data.groups;
    }

    var id = this.app.store('group_id'),
        activeGroup = initActiveGroup(this.groups, id);

    if (activeGroup.id !== id) {
      this.app.store('group_id', activeGroup.id);
    }
  },

  switchGroup: function(id) {
    this.app.store('group_id', id);
    setActiveGroup(this.groups, id);
  }
};

module.exports = groups;
