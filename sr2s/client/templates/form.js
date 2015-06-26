Template.form.helpers({
	schoolOptions : function() {
		var options = [];
		for (var o in schools) {
			options.push({
				value : o,
				name : schools[o].name
			});
		};
    options.sort(function (a, b) {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });
		return options;
  }
});

Template.form.events({
  'change select' : function(e) {
    $(e.target).addClass('active');
  },
  'click [data-page=about]' : function(e) {
    e.preventDefault();
    var terms = document.getElementById('terms');
    terms.classList.add('show');
  },
  'click [data-page=faqs]' : function(e) {
    e.preventDefault();
    var helpModal = document.getElementById('help-modal');
    helpModal.classList.add('show');
  },
  'click [data-page=form]' : function(e) {
    e.preventDefault();
    var terms = document.getElementById('terms'),
        helpModal = document.getElementById('help-modal');
    terms.classList.remove('show');
    helpModal.classList.remove('show');
  },
  'click [data-name=init-map]' : function(e) {
    mapHelpers.addLoader();
    formHelpers.pushMethods();
    formHelpers.pushSchool();
    formHelpers.pushGrade();
    formHelpers.removeForm(e);
    // set up new path array
    if ( mapHelpers.isPath() ) {
      mapHelpers.newUserPath();
    }
    mapHelpers.geoFindMe();
    mapHelpers.getIP();
    mapHelpers.noSleeping();
  }
});
