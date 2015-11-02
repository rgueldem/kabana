var statuses = {
  statuses: [],

  initialize: function(app) {
    this.app = app;

    return this.fetch().then(this.set.bind(this));
  },

  fetch: function() {
    return this.app.ajax('getTicketFields');
  },

  getTicketStatusTranslation: function(status) {
    status.title = this.app.I18n.t('ticket_statuses.' + status.value);
  },

  set: function(data) {
    this.statuses = _.find(data.ticket_fields, function(field) {
      return field.type === 'status';
    }).system_field_options;

    this.statuses.unshift({
      value: 'new',
      unassignable: true
    });

    this.statuses.push({
      value: 'closed',
      readonly: true
    });

    // Load translations for ticket statuses
    this.statuses.forEach(this.getTicketStatusTranslation.bind(this));
  }
};

module.exports = statuses;
