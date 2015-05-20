map = undefined;
watch = undefined;
interval = null;

var userMarker, privyBuffer;

if (Meteor.isClient || Meteor.isCordova) {
  Meteor.startup(function () {
    initalLocation = true;
    firebaseHelpers.initBase();
    // Deficiency Style
    defIcon = {
      iconUrl : '/img/icon-caution.svg',
      iconSize : [30,50],
      iconAnchor: [0,50],
      popupAnchor: [15, -50],
      className : 'deficiency-marker'
    };
    defStyle = L.icon(defIcon);
    defMarker = L.marker( [0,0], {
      draggable: true,
      icon: defStyle,
      zIndexOffset : 100
    });
    defPopup = '<div class="def-option">Drag marker to position of problem you would like to report and select start!</div><div class="submit-wrap"><input type="button" value="start" id="start-form" /></div>';
    defMarker.bindPopup(defPopup);
    defMarker.on('click', mapHelpers.startForm);
    schoolBufferLayer = L.mapbox.featureLayer();
    schoolBuffer = false;
    newNoSleep = new NoSleep();
    userPathLayer = L.polyline( [], {
        color : '#0DC083',
        weight : 5,
        opacity : .8,
        smoothFactor : 1.25
      });
  });
}

if (Meteor.isCordova) {
  Meteor.startup(function () {
    Template.header.onRendered( function() {
      // Remove draw on mobile
      $('#draw').remove();
    });
  });
}

Template.main.onRendered( function() {
  mapHelpers.initMap();
  drawHelpers.drawInit();
  deficiencyBtn = document.getElementById('add-def');
  endTrackingBtn = document.getElementById('endtracking');
  defForm = document.getElementById('def-form');
});

Template.main.events({
  'click [data-action=add-deficiency]' : function() {
    mapHelpers.addDef();
  },
  'click [data-action=end-tracking]' : function() {
    firebaseHelpers.pathToDB();
    if (Meteor.isClient) {
      newNoSleep.disable();
    }
  },
  'click [data-action=exit-modal]' : function(e) {
    e.preventDefault();
    var helpModal = document.getElementById('starting-modal');
    helpModal.classList.remove('show');
  }
})

Template.home.onRendered( function() {
  formHelpers.renderForm();
});

Template.draw.onRendered( function() {
  deficiencyBtn = document.getElementById('add-def');
  endTrackingBtn = document.getElementById('endtracking');
  defForm = document.getElementById('def-form');
  endTrackingBtn.classList.add('hide');
  drawBtns.classList.remove('hide');
});

Template.map.onRendered( function() {
  deficiencyBtn = document.getElementById('add-def');
  endTrackingBtn = document.getElementById('endtracking');
  defForm = document.getElementById('def-form');
  endTrackingBtn.classList.remove('hide');
  drawBtns.classList.add('hide');
});
