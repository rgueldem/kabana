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

  setGroups: function(data) {
    this.groups = data.groups;

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
