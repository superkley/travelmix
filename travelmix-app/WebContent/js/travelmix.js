CM.PT = 'public-transport';

var directions = null;
var queryConnections = function(origLocation, destLocation) {
    if (directions == null) {
        directions = new CM.Directions(MapState.map, 'routingPanel', '8ee2a50541944fb9bcedded5165f09d9');
        CM.Event.addListener(directions, 'load', function() {
            $('#routingPanel').dialog('open');
        });
    }
    var waypoints = [ origLocation, destLocation ];
    MapState.routingRequest.hideMarkers();
    directions.loadFromWaypoints(waypoints, {
        host: 'http://localhost:9080',
        travelMode: CM.PT,
        preserveViewport: true,
        draggableWaypoints: true,
        units: 'km',
        lang: 'zh'
    });
};

createRoutingRequest = function(map) {
    var _map = map;
    // 0: undefined, 1: start_loc, 2: end_loc
    var _state = 1;
    var _origLocation = new CM.LatLng(0, 0);
    var _destLocation = new CM.LatLng(0, 0);
    var _origMarker = new CM.Marker(_origLocation, {
        title : "出发地",
        draggable : true,
        icon : {
            image : "http://tile.cloudmade.com/wml/latest/images/routing/route_icon_1.png",
            iconSize : new CM.Size(23, 26),
            iconAnchor : new CM.Point(12, 26)
        }
    });
    var _destMarker = new CM.Marker(_destLocation, {
        title : "目的地",
        draggable : true,
        icon : {
            image : "http://tile.cloudmade.com/wml/latest/images/routing/route_icon_2.png",
            iconSize : new CM.Size(23, 26),
            iconAnchor : new CM.Point(12, 26)
        }
    });
    _map.addOverlay(_origMarker);
    _map.addOverlay(_destMarker);
    var _hideMarkers = function() {
        _origMarker.hide();
        _destMarker.hide();    
    }
    _hideMarkers();
    
    return {
        clearMarkers: function() {
            _hideMarkers();
            _state = 1;
            if (directions != null) {
                directions.clearDirections();
            }
        },
        hideMarkers: function() {
            _hideMarkers();  
        },
        query : function() {
            var origLocation = _origMarker.getLatLng();
            var destLocation = _destMarker.getLatLng();
            if (origLocation._lat == 0 && origLocation._lng == 0) {
                return;
            }
            if (destLocation._lat == 0 && destLocation._lng == 0) {
                return;
            }
            queryConnections(origLocation, destLocation);
        },
        setLatLng : function(latlng) {
            // alert(latlng + ", " + _origLocation);
            if (_state == 0 || _state == 1) {
                _origMarker.setLatLng(latlng);
                if (_origMarker.isHidden()) {
                    _origMarker.show();
                }
                _state = 2;
                return true;
            } else {
                _destMarker.setLatLng(latlng);
                if (_origMarker.isHidden()) {
                    _origMarker.show();
                }
                MapState.routingRequest.query();
                _state = 1;
                return true;
            }
            return false;
        },
        getWayPoints : function() {
            return {
                origLocation : _origMarker.getLatLng(),
                destLocation : _destMarker.getLatLng()
            };
        },
        getOriginMarker: function() {
            return _origMarker;
        },
        getDestinationMarker: function() {
            return _destMarker;
        }
    };
};

CM.Directions.prototype.clearDirections = function() {
    if (this.panel) {
        this.panel.innerHTML = '';
    }
    this.total_distance = 0;
    this.total_duration = 0;
    this.routes = [];
    this.latlngs = [];
    this.steps = [];    
    this.errorMessages = [];    
    this._requests = [];
    if (this._markers) {
        for (c = 0; c < this._markers.length; c++) {
            this.map.removeOverlay(this._markers[c]);
        }
    }
    this._markers = [];
    if (this.polyline) {
        this.map.removeOverlay(this.polyline);
        this.polyline = null;
    }
    if (this.polylines) {
        for (c = 0; c < this.polylines.length; c++) {
            this.map.removeOverlay(this.polylines[c]);
        }
    }
    this.polylines = [];    
};

CM.Directions.prototype.loadFromWaypoints = function (a, b) {
    var c;
    this._setOptions(b);
    
    this.clearDirections();
    
    this.waypoints = a;
    this._routesToLoad = a.length - 1;
    for (c = 0; c < a.length; c++) {
        this.map.addOverlay(this._createMarker(a[c]));
    }
    var datetimeSplit = datetime.val().replace(/[-:]/gi, "").split(" ");    
    for (c = 0; c < this._routesToLoad; c++) {
        this._requests.push(a[c] + a[c + 1] + datetimeSplit[0] + datetimeSplit[1] +this._options.travelMode);
    }
    for (c = 0; c < this._routesToLoad; c++) {
        this._getRoute(a[c], a[c + 1], datetimeSplit[0], datetimeSplit[1]);
    }
};
CM.Directions.prototype._renderRoutes = function () {
    var line;
    var stepsLength = this.steps.length;
    for (c = 0; c < stepsLength; c++) {
        var step = this.steps[c];
        var latlngs = step.latlngs;
        var color = step.color;
        if (c < stepsLength - 1) {
            var nextStep = this.steps[c + 1];
            if (nextStep.latlngs.length > 0) {
                latlngs.push(this.steps[c + 1].latlngs[0]);
            }
        }
        line = new CM.Polyline(latlngs, color);
        this.polylines.push(line);
        this.map.addOverlay(line);    
    }
    if (!this._options.preserveViewport) {
        this.map.zoomToBounds(this.getBounds())
    }
    if (this.polylines) {
        for (c = 0; c < this.polylines.length; c++) {
            this.polylines[c].show();
        }
    }    
    CM.Event.fire(this, 'load');
};

CM.Directions.prototype._responseHandler = function (a, b) {
    if (a.status) {
        this.errorMessages.push(a.status_message);
        if (this.panel) {
            this._displayError(a);
        }
    } else {
        var c = new CM.Route(a);
        c.itDistance = a.route_summary.total_it_distance;
        c.itDuration = a.route_summary.total_it_time;
        var b = a.route_instructions;
        this.steps = c.steps;
        if (this.steps.length == b.length) {
            for (d = 0; d < b.length; d++) {
                this.steps[d].color = b[d][9];
            }
        };        
        if (this.panel) {
            this._addPanel(c, b);
        }
        this._addRoute(c);
    }
};

CM.Directions.prototype._addRoute = function (a) {
    this.routes.push(a);    
    for (var b = 0; b < a.steps.length; b++) {
        this.latlngs = this.latlngs.concat(a.steps[b].latlngs);
    }
};


CM.Directions.prototype._translations = {
    total_length: '步行路程',
    total_duration: '步行时间',
    total_route_distance: '旅程路程',
    total_route_duration: '旅程时间',
    m: '米',
    km: '公里',
    ft: 'ft',
    mile: 'mile',
    sec: '秒',
    secs: '秒',
    hr: '小时',
    hrs: '小时',
    min: '分钟',
    mins: '分钟'
};

CM.Directions.prototype._getRoute = function (b, c, d, t) {
    var id = this._generateId();
    var f;
    if (this._options.travelMode === CM.PT) {
        f = this._options.host + "/ptRouter?date="+d+"&time="+t+"&origin=" + b.lat() + ':' + b.lng() + "&destination=" + c.lat() + ':' + c.lng() + "&callback=getRoute" + id;
    } else {
        f = this._options.host + '/' + this.key + '/api/0.3/' + b.lat() + ',' + b.lng() + ',' + c.lat() + ',' + c.lng() + '/';
        f += this._options.travelMode + '.js?units=' + this._options.units + '&lang=' + this._options.lang + '&callback=getRoute' + id;
        f += '&translation=common';
    }
    var g =  b + c + d + t + this._options.travelMode;
    if (!CM.Directions.cache[g]) {
        CM.Directions.cache[g] = 'requesting';
        CM.Util.getJson(f, function (a) {
            CM.Directions.cache[g] = a;
            CM.Util.extend(this._translations, a.translations || {});
            this._checkIfReadyToRender();
        }, 'getRoute' + id, this);
    } else if (CM.Directions.cache[g] != 'requesting') {
        this._checkIfReadyToRender();
    }        
};


CM.Directions.prototype._addPanel = function (j, l) {
    var k = this;
    var m = this._translations;
    var n = document.createElement('div');
    n.className = 'wml-routes-output';
    var o = function (a) {
            var b, c;
            switch (k._options.units) {
            case 'km':
                c = 1000;
                b = [m.m, m.km];
                break;
            case 'miles':
                c = 5280;
                b = [m.ft, m.mile];
                a = a * 3.24;
                break
            };
            if (a >= c / 10 && a < c * 100) {
                var d = /^.+\..{0,1}/.exec((parseInt(a) / c).toString());
                var f = ' ' + b[1]
            } else if (a < c / 10) {
                var d = Math.round(a);
                var f = ' ' + b[0]
            } else {
                var d = Math.round(parseInt(a) / c);
                var f = ' ' + b[1]
            };
            return {
                'distance': d,
                'points': f
            }
        };
    var r = function (a) {
            if (a < 60) {
                var b = parseInt(a);
                var c = (b == 1 ? 'sec' : 'secs')
            } else if (a >= 60 && a < 3600) {
                var b = Math.round(parseInt(a) / 60);
                var c = (b == 1 ? 'min' : 'mins')
            } else {
                var b = Math.round(parseInt(a) / 3600);
                var c = (b == 1 ? 'hr' : 'hrs')
            };
            return {
                'duration': b,
                'points': ' ' + m[c]
            }
        };
    if (document.getElementById('totalRoutesLength')) {
        var p = document.getElementById('totalRoutesLength');
        var s = p.getElementsByTagName('span')[0]
    } else {
        var p = document.createElement('div');
        p.id = 'totalRoutesLength';
        p.className = 'wml-total-length';
        var total_length_text = document.createTextNode(m.total_length + ': ');
        var s = document.createElement('span');
        s.innerHTML = '0';
        p.appendChild(total_length_text);
        p.appendChild(s);
        n.appendChild(p)
    };
    if (document.getElementById('totalRoutesDuration')) {
        var t = document.getElementById('totalRoutesDuration');
        var u = t.getElementsByTagName('span')[0]
    } else {
        var t = document.createElement('div');
        t.id = 'totalRoutesDuration';
        t.className = 'wml-total-duration';
        var q = document.createTextNode(m.total_duration + ': ');
        var u = document.createElement('span');
        u.innerHTML = '0';
        t.appendChild(q);
        t.appendChild(u);
        n.appendChild(t)
    };
    
    
    var v = this.panel.getElementsByTagName('dl').length;
    v = (v ? v + 1 : 1);
    var w = document.createElement('dl');
    w.className = 'wml-waypoints-list';
    var B = document.createElement('dt');
    var x = document.createElement('img');
    x.src = CM.Util.getRootUrl() + 'images/routing/route_icon_big_' + v + '.png';
    x.alt = j.start_point;
    x.width = '33';
    x.height = '36';
    var K = document.createTextNode(j.start_point);
    B.appendChild(x);
    B.appendChild(K);
    w.appendChild(B);
    for (var C = 0; C < j.getNumSteps(); C++) {
        (function () {
            var d = C;
            var step = j.getStep(d);
            var f = document.createElement('dd');            
            var g = document.createElement('a');
            g.href = '#';
            g.setAttribute("style", "color:" + step.color+" !important;");
            var h = o(step.getDistance());
            if (h.distance > 0) { 
                g.innerHTML = '<img border="0" width="23" height="23" src="' + CM.Util.getRootUrl() + 'images/routing/arrows/' + step.direction_instruction + '.png" alt="' + step.description + '" /><span class="waypoint_text">' + step.description + ' <b>' + h.distance + '</b> ' + h.points + '</span>';
            } else {
                g.innerHTML = '<img border="0" width="23" height="23" src="' + CM.Util.getRootUrl() + 'images/routing/arrows/' + step.direction_instruction + '.png" alt="' + step.description + '" /><span class="waypoint_text">' + step.description + '</span>';
            }
            f.appendChild(g);
            w.appendChild(f);
            CM.DomEvent.addListener(g, 'click', function (a) {
                if (g.className == 'wml-selected-step') {
                    k.map.closeInfoWindow();
                    g.className = '';
                } else {
                    if (h.distance > 0) {
                        k.map.openInfoWindow(step.getLatLng(step.latlngs.length - 1), step.description + ' <b>' + h.distance + '</b> ' + h.points);
                    } else {
                        k.map.openInfoWindow(step.getLatLng(step.latlngs.length - 1), step.description);
                    }
                    var b = k.panel.getElementsByTagName('a');
                    for (var c = 0; c < b.length; c++) {
                        b[c].className = '';
                    };
                    g.className = 'wml-selected-step'
                }
                CM.DomEvent.preventDefault(a);
            })
        })()
    };
    var z = document.createElement('div');
    z.className = 'wml-route-length';
    var A = document.createElement('div');
    A.className = 'wml-route-duration';
    var L = document.createTextNode(m.total_route_distance + ': ');
    var E = document.createElement('span');
    var M = document.createTextNode(m.total_route_duration + ': ');
    var F = document.createElement('span');
    var H = r(j.getDuration());
    var O = document.createTextNode(H.duration + ' ' + H.points);
    z.appendChild(L);
    F.appendChild(O);
    A.appendChild(M);
    var G = o(j.getDistance());
    if (G.distance > 0) {
        var N = document.createTextNode(G.distance + ' ' + G.points);
        E.appendChild(N);
        z.appendChild(E);
    }
    A.appendChild(F);
    var I = o(j.itDistance);
    var J = r(j.itDuration);
    s.innerHTML = I.distance + ' ' + I.points;
    u.innerHTML = J.duration + ' ' + J.points;
    if (l) {
        var D = document.createElement('dt');
        var y = document.createElement('img');
        y.src = CM.Util.getRootUrl() + 'images/routing/route_icon_big_' + (v + 1).toString() + '.png';
        y.alt = j.end_point;
        y.width = '33';
        y.height = '36';
        var P = document.createTextNode(j.end_point);
        D.appendChild(y);
        D.appendChild(P);
        w.appendChild(D)
    };
    n.appendChild(w);
    this.panel.appendChild(z);
    this.panel.appendChild(A);
    this.panel.appendChild(n);    
};