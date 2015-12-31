newEntry = {
	userSpeed : [],
	client : {}
};

newIssue = {
	properties : {}
};

mapHelpers = {
	initMap : function() {
		var southWest = L.latLng(-90, -180),
					northEast = L.latLng(90, 180),
					bounds = L.latLngBounds(southWest, northEast);

			map = L.mapbox.map( 'map', 'altaplanning.f3d04a5c', {
				minZoom: 9,
				maxZoom: 20,
				maxBounds: bounds
			}).setView([37.796131, -122.274919], 18);
			Geolocation.currentLocation();
			if ( navigator.userAgent ) {
				newEntry.client.userAgent = navigator.userAgent;
				iphoneTest = newEntry.client.userAgent.slice(13,19);
		}
	},

	addLoader : function() {
		var body = document.querySelector('body');
		body.classList.add('loading');
	},

	removeLoader : function() {
		var body = document.querySelector('body');
		body.classList.remove('loading');
	},

	geoFindMe : function() {
		if (!navigator.geolocation) {
			var errors = document.getElementById("errors");errors.innerHTML = "<p>Geolocation is not supported by your browser</p>";
			return;
		}
		// if location found start initial found
		if (Geolocation.latLng()) {
			mapHelpers.showStartingModal();
			mapHelpers.removeLoader();
			var latlng = Geolocation.latLng(),
					lat = latlng.lat,
					lng = latlng.lng;
			map.panTo([lat,lng]);
			mapHelpers.initialFound();
			// watch = navigator.geolocation.watchPosition(mapHelpers.geoSuccess, mapHelpers.geoError, geoOptions);
		} else {
			window.setTimeout(mapHelpers.geoFindMe, 4000);
			if (Geolocation.error()) {
				mapHelpers.geoError(Geolocation.error());
			}
		}
	},

	geoSuccess : function(p) {
		// if no coordinates return
		if ( !p.coords.latitude || !p.coords.longitude ) { return; }
		// pan to user marker
		map.panTo([p.coords.latitude, p.coords.longitude]);
		if (initalLocation) {
			mapHelpers.initialFound(p);
		} else {
			mapHelpers.positionUpdate(p);
		}
	},

	initialFound : function() {
		var p = Geolocation.currentLocation();
		initalLocation = false;
		// initial postion
		// Hide for ERSI multi types issue
		/* newEntry.initialL = turf.point([p.coords.longitude,p.coords.latitude], {
			time: p.timestamp,
			accuracy : p.coords.accuracy
		}); */
		// mapHelpers.getCurrentLocation(p);
		// buffer for privacy
		var privyBufferStyle = {
			className : 'privacy-fill'
		};
		var point = turf.point([p.coords.longitude,p.coords.latitude]);
		privyBuffer = turf.buffer(point, 0.025, 'miles');
		// add buffer to map
		privyBufferLayer = L.mapbox.featureLayer()
			.setGeoJSON(privyBuffer)
			.setStyle(privyBufferStyle)
			.addTo(map);
		// update user marker
		userMarker = L.circleMarker( [p.coords.latitude,p.coords.longitude], {
			className : 'current-location-marker',
			clickable : false,
			radius : 8
		}).addTo(map);
		userPathLayer.addTo(map);
		mapHelpers.leaveBuffer();
	},

	leaveBuffer : function() {
		var p = Geolocation.currentLocation();
		map.panTo([p.coords.latitude,p.coords.longitude]);
		userMarker.setLatLng([p.coords.latitude,p.coords.longitude]);
		// mapHelpers.getCurrentLocation(p);
		var privybuff = privyBuffer.features[0];
		var point = turf.point([p.coords.longitude,p.coords.latitude]);
		if ( mapHelpers.insidePrivyBuffer(point, privybuff) ) {
			console.log('still inside privacy buffer');
			privyTimeout = Meteor.setTimeout(mapHelpers.leaveBuffer, 5000);
		} else {
			Meteor.clearTimeout(privyTimeout);
			mapHelpers.positionUpdate();
		}
	},

	getCurrentLocation : function(p) {
		// hide for ERSI multi type issues
		/* newEntry.currentL = turf.point([p.coords.longitude,p.coords.latitude], {
			time: p.timestamp,
			accuracy : p.coords.accuracy
		}); */
	},

	positionUpdate : function() {
		var p = Geolocation.currentLocation();
		map.panTo([p.coords.latitude,p.coords.longitude]);
		// update marker
		userMarker.setLatLng([p.coords.latitude,p.coords.longitude]);
		// mapHelpers.getCurrentLocation(p);
		mapHelpers.pathUpdate(p);

		interval = Meteor.setInterval(mapHelpers.positionUpdate, 8000);

		// Test if inside school buffer, if so route will end
		if (schoolBuffer) { // false until set true in school query
			var schbuff = schoolBuffer.features[0];
			schoolHelpers.insideSchoolBuffer(p, schbuff);
		}
	},

	insidePrivyBuffer : function(point, privybuff) {
		if (point !== undefined && privybuff !== undefined) {
			var withinPrivy = turf.inside(point, privybuff);
			return withinPrivy;
		}
	},

	pathUpdate : function(p) {
		userPathLayer.addLatLng([p.coords.latitude,p.coords.longitude]);
		// if on phone app get accuracy and speed
		if (Meteor.isCordova) {
			newEntry.userSpeed.push(p.coords.speed);
		}
	},

	geoError : function(p) {
		if (p.code === 1) {
			window.setTimeout(mapHelpers.tryAgain, 3000);
			console.warn("Position Denied");
		} else {
			console.log('position error', p);
		}
	},

	tryAgain : function() {
		swal({
			title: "Sorry, We Could Not Get Your Location",
			text: "Please allow Safe Routes to School to access your location, then try again",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Try Again!",
			closeOnConfirm: false,
			closeOnCancel: false
		}, function(isConfirm) {
			if (isConfirm) {
				mapHelpers.geoFindMe();
				window.setTimeout( function() {
					swal("Trying Again...", "", "success");
				}, 1000);
			} else {
				mapHelpers.clearWatch();
				swal("No Worries", "When you are ready to try again, please reload the app. When prompted, please allow us to use your location.", "error");
			}
		});
	},

	clearWatch : function() {
		// if (watch != undefined) {
			// navigator.geolocation.clearWatch(watch);
		// }
		if (privyTimeout != null) {
			Meteor.clearTimeout(privyTimeout);
		}
		Meteor.clearInterval(interval);
		// reset inital location
		initalLocation = true;
		mapHelpers.yesSleeping();
	},

	restartWatch : function() {
		// if (watch) {
			// navigator.geolocation.clearWatch(watch);
		// }
		mapHelpers.geoFindMe();
	},

	addDef : function() {
		defMarker.setLatLng(map.getCenter())
				.addTo(map)
				.openPopup()
		mapHelpers.startForm();
	},

	startForm : function() {
		var startBtn = document.getElementById('start-form');
		defForm = document.getElementById('def-form');
		startBtn.addEventListener( 'click', function(e) {
			e.preventDefault();
			defForm.classList.add('show');
			mapHelpers.addButton();
			defMarker.addEventListener('click', mapHelpers.addButton);
			defMarker.closePopup();
		});
	},

	addButton : function(e) {
		var addBtn = document.getElementById('add-button'),
				cancelBtn = document.getElementById('cancel-button'),
				cameraBtn = document.getElementById('add-image'),
				camDelBtn = document.getElementById('remove-image'),
				camAddBtn = document.getElementById('add-image');
		// Cancel Button click
		cancelBtn.addEventListener( 'click', function(e) {
			e.preventDefault();
			defForm.classList.remove('show');
		});
		// Add button
		addBtn.addEventListener( 'click', function(e) {
			e.preventDefault();
			var dt = [];
			$('.deficiency:checked').each( function() {
				dt.push(this.value);
			});
			var otherValue = $('#otherdescription').val();
			if (otherValue.length > 1) {
				dt.push(otherValue);
			}
			// convert to geojson
			var defGeoJson = defMarker.toGeoJSON();
			// add to new issue object
			newIssue.type = defGeoJson.type;
			newIssue.geometry = defGeoJson.geometry;
			newIssue.properties.title = dt.join();
			newIssue.properties.time = Firebase.ServerValue.TIMESTAMP;
			// push new issue
			var newMarker = baseDeficiency.push(newIssue);
			var newMarkerId = newMarker.key();
			// close form modal
			defForm.classList.remove('show');
			// show new marker on map
			firebaseHelpers.showOnMap(newMarkerId);
			// remove marker
			map.removeLayer(defMarker);
			newIssue = {
				properties : {}
			};
		});
		// Camera button
		cameraBtn.addEventListener( 'click', function(e) {
			e.preventDefault();
			var cameraOptions = {
				width: 400,
				height: 400,
				quality: 80
			};
			if (Meteor.isCordova) {
				var locationDiv = document.getElementById('img-location'),
						imgLibraryBtn = document.getElementById('use-librarybtn'),
						useCamera = document.getElementById('use-camerabtn');
				locationDiv.classList.add('show');
				imgLibraryBtn.addEventListener('click', function() {
					// update ooptions to use photo library
					var cameraOptions = {
						width: 400,
						height: 400,
						quality: 80,
						sourceType: Camera.PictureSourceType.PHOTOLIBRARY
					};
					mapHelpers.getThePhoto(cameraOptions, camDelBtn, camAddBtn);
					locationDiv.classList.remove('show');
				});
				useCamera.addEventListener('click', function() {
					mapHelpers.getThePhoto(cameraOptions, camDelBtn, camAddBtn);
					locationDiv.classList.remove('show');
				});
			} else {
				// no photo library option
				mapHelpers.getThePhoto(cameraOptions, camDelBtn, camAddBtn);
			}
		});
		camDelBtn.addEventListener( 'click', function(e) {
			e.preventDefault();
			$('#image-wrapper').empty();
			newIssue.properties.image = null;
			camDelBtn.classList.remove('show');
			camAddBtn.classList.add('show');
		});
	},

	getThePhoto : function(o, del, add) {
		MeteorCamera.getPicture(o, function(error, data) {
			if (error) {
				return;
			} else {
				$('<img src="' + data + '" class="camera-image" />').appendTo('#image-wrapper');
				newIssue.properties.image = data;
				del.classList.add('show');
				add.classList.remove('show');
				var url = 'https://zapier.com/hooks/catch/bmv2il/';
				var newImage = {
						"ip" : Date.now(),
						"img" : data
				};
				$.ajax({
					type: "POST",
					url: url,
					data: newImage
				})
			}
		});
	},

	deleteMarker : function() {
		var del = document.querySelector('.delete-marker'),
				openMarker = this;
		del.addEventListener( 'click', function() {
			mapHelpers.deleteConfirm(openMarker);
		});
	},

	deleteConfirm : function(m) {
		swal({
			title: "Are you sure you want to delete this deficiency?",
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: "Yes, delete it!",
			closeOnConfirm: false,
			closeOnCancel: false
		}, function(isConfirm) {
			if (isConfirm) {
				baseDeficiency.child(m['data-id']).remove();
				swal("Deleted!", "", "success");
			} else {
				swal("Cancelled", "The deficiency was not deleted", "error");
			}
		});
	},

	newUserPath : function() {
		userPathLayer.setLatLngs([]);
		var cp = Geolocation.latLng();
		if (cp !== null) {
			var p = turf.point([cp.lng,cp.lat]);
			// buffer for privacy
			var privyBufferStyle = {
				className : 'privacy-fill'
			};
			privyBuffer = turf.buffer(p, 0.025, 'miles');
			// add buffer to map
			privyBufferLayer = L.mapbox.featureLayer()
				.setGeoJSON(privyBuffer)
				.setStyle(privyBufferStyle)
				.addTo(map);
		}
	},

	isPath : function() {
		if (userPathLayer.getLatLngs().length > 1) {
			return true;
		} else {
			return false;
		}
	},

	getIP : function() {
		$.get("http://ipinfo.io", function(response) {
			newEntry.client.ip = response.ip,
			newEntry.client.loc = response.loc
		}, "jsonp");
	},

	showStartingModal : function() {
		var helpModal = document.getElementById('starting-modal');
		helpModal.classList.add('show');
	},

	noSleeping : function() {
		newNoSleep.enable();
	},

	yesSleeping : function() {
		newNoSleep.disable();
	}

};

schoolHelpers = {
	findSchool : function(school) {
		var finishIcon = L.icon({
			iconUrl: 'img/isometric_finish.svg',
			iconSize: [44,44],
			iconAnchor: [30,34]
		});
		var schBuffStyle = {
			stroke: false,
			fillColor: '#28D3B3',
			fillOpacity: 0.5
		};
		// find school
		$.ajax({
			url: "http://www.openstreetmap.org/api/0.6/" + school,
			dataType: "xml",
			success: function (res) {
				var schoolLayer = new L.OSM.DataLayer(res).addTo(map);
				var slLatLng = schoolLayer.getLayers()[0]._latlngs;
				sll = [];
				for (var i = 0; i < slLatLng.length; i++) {
					var f = [slLatLng[i].lng,slLatLng[i].lat];
					sll.push(f)
				}
				var firstsll = sll.slice(0,1);
				var lastsll = sll.slice(-1);
				if (firstsll[0][0] == lastsll[0][0] && firstsll[0][1] == lastsll[0][1]) {
					var slshape = turf.polygon([sll]);
				} else {
					sll.push(firstsll[0]);
					var slshape = turf.polygon([sll]);
				}
				var schoolBounds = schoolLayer.getBounds();
				var schoolCenter = schoolBounds.getCenter();
				schoolPoint = turf.point([schoolCenter.lng,schoolCenter.lat]);
				schoolBuffer = true;
				schoolBuffer = turf.buffer(slshape, 0.02, 'miles');
				schoolBufferLayer
					.setGeoJSON(schoolBuffer)
					.setStyle(schBuffStyle)
					.addTo(map);
				var finishMarker = L.marker([schoolCenter.lat,schoolCenter.lng], {
					icon: finishIcon
				})
				.addTo(map);
			}
		});
	},

	removeSchool : function() {
		schoolBuffer = false;
		schoolBufferLayer.eachLayer( function(l) {
			map.removeLayer(l)
		});
	},

	insideSchoolBuffer : function(point, schbuff) {
		if (newEntry.school) {
			var atSchool = turf.inside(point, schbuff);
			if (atSchool) {
				firebaseHelpers.schoolReached();
			} else {
				return;
			}
		}
		if (Meteor.isClient) {
			newNoSleep.disable();
		}
	},

	distanceToSchool : function() {
		var point = turf.point([p.coords.longitude,p.coords.latitude]);
		if (schoolPoint) {
			var distance = turf.distance(point, schoolPoint, 'miles');
			return distance;
		}
	}

};

firebaseHelpers = {

	initBase : function() {
		var base = new Firebase("https://luminous-inferno-6303.firebaseio.com/");
		baseRoute = base.child("routes");
		baseDeficiency = base.child("deficiency");

		base.authAnonymously( function(error, authData) {
			if (error) {
				console.log("Login Failed!", error);
			}
		});

		baseDeficiency.on( 'child_removed', function(oldChildSnapshot) {
			var k = oldChildSnapshot.key();
			map.eachLayer( function(layer) {
				var ldi = layer['data-id'];
				if (ldi === k) {
					drawGroup.eachLayer( function(l) {
						if ( l['data-id'] === k ) {
							drawGroup.removeLayer(l);
						}
					});
					map.removeLayer(layer);
				}
			});
		});
	},

	showOnMap : function(id) {
		var keyToShow = baseDeficiency.child(id);
		keyToShow.on('value', function(ss) {
			L.mapbox.featureLayer(ss.val())
				.eachLayer( function(l) {
					l.setZIndexOffset(1000);
					var geojson = l.toGeoJSON();
					if (geojson) {
						l.setIcon( defStyle );
						$(l).attr('data-id', id);
						l.bindPopup( L.mapbox.sanitize(
							'<h3 class="image-title">' + geojson.properties.title + '</h3>' +
							'<div class="popup-img-wrapper"><img src="' + geojson.properties.image + '" class="popup-image" /></div>' +
							'<button class="delete-marker">Delete</button>'
						));
						l.addEventListener('popupopen', mapHelpers.deleteMarker);
					}
				})
				.addTo(map);
		});
	},

	schoolReached : function() {
		// stop tracking
		mapHelpers.clearWatch();
		schoolHelpers.removeSchool();
		var ls = turf.linestring(userPathLayer.toGeoJSON().geometry.coordinates, newEntry);
		if ( userPathLayer.getLatLngs().length > 1 ) {
			// push to base
			baseRoute.push(ls);
		}
		// alert user
		window.setTimeout( function() {
			swal({
				title: "You Made It To School!",
				text: "You can look at your route, add an issue, or use the menu for more options.",
				imageUrl: "img/isometric_finish.svg",
				showConfirmButton: true,
				confirmButtonColor: "#0DC083",
				allowOutsideClick: true,
				confirmButtonText: "OK"
			});
		}, 1000);
	},

	pathToDB : function() {
		if ( userPathLayer.getLatLngs().length > 1 ) {
			swal({
				title: "End Route?",
				text: "Selecting end route will finish this route tracking session.",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#0DC083",
				confirmButtonText: "End Route",
				closeOnConfirm: false,
				closeOnCancel: true
			}, function(isConfirm) {
				if (isConfirm) {
					// clear watch
					mapHelpers.clearWatch();
					schoolHelpers.removeSchool();
					var ls = turf.linestring(userPathLayer.toGeoJSON().geometry.coordinates, newEntry);
					// Push linestring to firebase
					baseRoute.push(ls);
					window.setTimeout( function() {
						swal("Finished", "Thank you for tracking your route! Add an issue or use the menu for more options.", "success");
					}, 1000);
				}
			});
		} else {
			swal({
				title: "Oops...",
				text: "Our data is showing you're still inside your privacy buffer. You can keeping route tracking or end your route tracking.",
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#0DC083",
				cancelButtonColor: "#EF483A",
				confirmButtonText: "Keep Tracking",
				cancelButtonText: "End Route",
				closeOnConfirm: false,
				closeOnCancel: false,
			}, function(isConfirm) {
				if (isConfirm) {
					swal("You're Still Tracking!", "", "success");
				} else {
					// clear watch
					mapHelpers.clearWatch();
					schoolHelpers.removeSchool();
					window.setTimeout( function() {
						swal("Route Ended", "you can add issues or use the menu to navigate.", "error");
					}, 1000);
				}
			});
		}
	}
};

formHelpers = {

	renderForm : function() {
		var loc = window.location.pathname;
		if (loc != '/') {
			window.location.pathname = '/';
		}
		Blaze.render(Template.form, document.querySelector('.form-wrap'));
		if (!Meteor.isCordova) {
			$('#school-select').select2({
				placeholder: 'Select a school',
				allowClear: true
			});
		}
	},

	removeForm : function(e) {
		e.target.form.remove();
		drawBtns.classList.add('hide');
	},

	pushMethods : function() {
		var method = document.querySelectorAll('input[name=method]:checked');
		var methodValues = [];
		for (var i = 0; i < method.length; i++) {
			methodValues.push(method[i].value);
		}
		var methodValues = methodValues.join(', ');
		newEntry.method = methodValues;
	},

	pushSchool : function() {
		var selected = $('#school-select').find(':selected').val();
		if ( selected in schools ) {
			var school = schools[selected];
			newEntry.school = school.name;
			newEntry.schoolId = school.id;
			if (school.way) {
				schoolHelpers.findSchool(school.way);
			}
		}
	},

	pushGrade : function() {
		var schoolYear = document.getElementById('grade');
		newEntry.schoolYear = schoolYear.value;
	}
};

drawHelpers = {
	drawInit : function() {
		drawGroup = L.featureGroup().addTo(map);
		drawIcon = L.Icon.extend({
			options: defIcon
		});
		// add draw controls
		drawControl = new L.Control.Draw({
			draw : {
				polyline: {
					shapeOptions: {
						color: '#8A0DDF',
						opacity : 0.9,
						className : 'drawn-path',
						weight: 4
					}
				},
				polygon : false,
				rectangle : false,
				circle : false,
				marker: false
			},
			edit : {
				featureGroup: drawGroup
			},
			PolylineOptions : {
				metric : false,
				shapeOptions : {
					smoothFactor : 5
				}
			}
		}).addTo(map);
		// draw actions
		map.on('draw:created', function(e) {
			var type = e.layerType,
					layer = e.layer,
					geojson = layer.toGeoJSON();
			if (type === 'polyline') {
				drawHelpers.createLine(layer, false);
			}
			drawGroup.addLayer(e.layer);
		});
		map.on('draw:edited', function (e) {
			if (type === 'polyline') {
				var layers = e.layers;
				layers.eachLayer(function (layer) {
					drawHelpers.createLine(layer, true);
				});
			}
		});
		// Get draw buttons
		drawBtns = document.querySelector('.leaflet-draw.leaflet-control');
	},

	createLine : function(layer, update) {
		var ls = turf.linestring(layer.getLatLngs(), {
			name : 'Drawn Path',
			time : Firebase.ServerValue.TIMESTAMP
		});

		if (update === true) {
			drawHelpers.updateBase(layer, ls);
		} else {
			drawHelpers.pushToBase(layer, ls);
		}
	},

	updateBase : function(layer, ls) {
		var el = layer['data-id'];
		baseRoute.child(el).set(ls);
	},

	pushToBase : function(layer, ls) {
		var newRoute = baseRoute.push(ls),
				newRouteId = newRoute.key();
		$(layer).attr('data-id', newRouteId);
	},

	addDefListener : function(e,nm) {
		var nmi = nm._icon,
				l = e.layer,
				btn = document.getElementById('add-button');
		l.openPopup();
		if (btn) {
			btn.addEventListener('click', function() {
				var def = document.querySelector('.deficiency:checked').value;
				var defGeoJson = l.toGeoJSON();
				defGeoJson.properties.title = def;
				var newMarker = baseDeficiency.push(defGeoJson);
				var newMarkerId = newMarker.key();
				l.closePopup();
				l.dragging.disable();
				l.bindPopup( L.mapbox.sanitize(defGeoJson.properties.title + '<button class="delete-marker">Delete</button>') );
				$(l).attr('data-id', newMarkerId);
				l.addEventListener('popupopen', mapHelpers.deleteMarker);
			});
		}
	}
};

adminHelpers = {
	adminInit : function() {
		mapHelpers.clearWatch();
		baseDeficiency.on( 'child_added', function(ss) {
			var k = ss.key();
			// And for each new marker, add a featureLayer.
			L.mapbox.featureLayer(ss.val())
				.eachLayer( function(l) {
					l.setZIndexOffset(-1000);
					var geojson = l.toGeoJSON();
					if (geojson) {
						l.setIcon( defStyle );
						$(l).attr('data-id', k);
						l.bindPopup( L.mapbox.sanitize(
							'<h3>' + geojson.properties.title + '</h3>' +
							'<div class="popup-img-wrapper"><img src="' + geojson.properties.image + '" class="popup-image" /></div>' +
							'<button class="delete-marker">Delete</button>'
						));
						l.addEventListener('popupopen', mapHelpers.deleteMarker);
					}
				})
				.addTo(map);
		});
		baseRoute.on( 'child_added', function(ss) {
			var k = ss.key();
			var v = ss.val();
			var l = L.polyline( v.geometry.coordinates, {
				color : '#484a4e',
				weight : 4,
				opacity : .9,
				smoothFactor : 1.5
			})
			.addTo(map);
			$(l).attr('data-id', k);
		});
	}
};

/* loadHelpers = {
	runLoader : function() {

	}
} */
