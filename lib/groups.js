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
  setGroups: function(data) {
    this.data.groups = data.groups;

    var id = this.store('group_id'),
        activeGroup = initActiveGroup(this.data.groups, id);

    if (activeGroup.id !== id) {
      this.store('group_id', activeGroup.id);
    }

    this.ajax('previewTicketView');
  },

  switchGroup: function(e) {
    e.preventDefault();

    var id = this.$(e.target).data('group');
    this.store('group_id', id);
    setActiveGroup(this.data.groups, id);

    this.ajax('previewTicketView');
  },
};

module.exports = groups;
