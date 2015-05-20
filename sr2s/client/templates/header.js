Template.header.events({
  'click nav' : function() {
      $('#menu-check').attr('checked', false);
  },
  'click [data-page=start]' : function() {
  	Blaze.render(Template.form, document.querySelector('.form-wrap'));
  	mapHelpers.clearWatch();
  	mapHelpers.newUserPath();
  }
});
