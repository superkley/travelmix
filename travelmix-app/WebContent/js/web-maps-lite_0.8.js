/*
 * Copyright (c) 2008-2010 CloudMade. version 0.8
 */
CM = window.CM || {};
CM.Util = {};
CM.Util.extend = function (a, b) {
    for (var c in b) {
        if (b.hasOwnProperty(c)) {
            a[c] = b[c]
        }
    }
    return a
};
CM.Util.bind = function (a, b) {
    return function () {
        return a.apply(b, arguments)
    }
};
CM.Util.getStyle = function (a, b) {
    var c = a.style[b];
    if ((typeof c == 'undefined') && a.currentStyle) {
        c = a.currentStyle[b]
    }
    if (typeof c == 'undefined') {
        var d = document.defaultView.getComputedStyle(a, null);
        c = d ? d[b] : null
    }
    return (c == 'auto' ? null : c)
};
CM.Util.getCumulativeOffset = function (a) {
    var b = 0,
        c = 0;
    do {
        b += (a.offsetTop - a.scrollTop) || 0;
        c += a.offsetLeft || 0;
        a = a.offsetParent
    } while (a);
    return new CM.Point(c, b)
};
CM.Util.getRootUrl = function () {
    var a = document.getElementsByTagName('script');
    for (var b = 0; b < a.length; b++) {
        var c = a[b].src;
        if (c) {
            var d = c.match(/^(.*\/)web-maps-lite-*\w*\.js.*$/);
            if (d && d[1]) {
                return d[1]
            }
        }
    }
    return '../build/'
};
CM.Util.addStylesheet = function (a) {
    var b = document.getElementsByTagName('head')[0];
    var c = document.createElement('link');
    c.rel = "stylesheet";
    c.type = "text/css";
    c.href = CM.Util.getRootUrl() + a;
    b.appendChild(c)
};
CM.Util.limitExecByInterval = function (a, b, c, d) {
    var f, g, h;
    var j = function () {
            h = arguments;
            if (!f) {
                f = true;
                setTimeout(function () {
                    f = false;
                    if (g) {
                        h.callee.apply(c, h);
                        g = false
                    }
                }, b);
                a.apply(c, h)
            } else {
                g = true
            }
        };
    if (d) {
        j.resetLock = function () {
            f = false
        }
    }
    return j
};
CM.Util.generateId = (function () {
    var a = 1;
    return function () {
        return a++
    }
})();
CM.Util.createImage = function (a) {
    var b;
    if (a.indexOf('.png') != -1 && CM.Util.Browser.isIE6) {
        b = document.createElement('div');
        b.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + a + '", sizingMethod="scale")'
    } else {
        b = document.createElement('img');
        b.src = a
    }
    return b
};
CM.Util.setOpacity = function (a, b) {
    if (CM.Util.Browser.isIE) {
        a.style.filter = 'alpha(opacity=' + Math.round(b * 100) + ')'
    } else {
        a.style.opacity = b
    }
};
CM.Util.indexOf = function (a, b, c) {
    if (Array.prototype.indexOf) {
        return Array.prototype.indexOf.call(a, b, c)
    } else {
        var d = a.length;
        c = c || 0;
        c = c < 0 ? Math.ceil(c) : Math.floor(c);
        if (c < 0) {
            c += d
        }
        for (; c < d; c++) {
            if (c in a && a[c] === b) {
                return c
            }
        }
        return -1
    }
};
(function () {
    var a = navigator.userAgent.toLowerCase();
    CM.Util.Browser = {
        isIE: !! window.ActiveXObject,
        isIE6: !! window.ActiveXObject && !window.XMLHttpRequest,
        isIE7: !! window.ActiveXObject && !! window.XMLHttpRequest,
        isMobileWebkit: a.indexOf("AppleWebKit") != -1
    }
})();
CM.Util.loadScript = function (a, b, c) {
    var d = document.createElement('script');
    d.type = 'text/javascript';
    if (b) {
        d.onload = d.onreadystatechange = function () {
            if (d.readyState && d.readyState != "loaded" && d.readyState != "complete") {
                return
            }
            d.onload = d.onreadystatechange = null;
            b.call(c)
        }
    }
    d.src = a;
    document.getElementsByTagName('head')[0].appendChild(d)
};
CM.Util.getJson = function (b, c, d, f, g) {
    if (g) {
        CM.Util.loadScript(b, function () {
            c.call(f, window[d])
        })
    } else {
        window[d] = function (a) {
            c.call(f, a)
        };
        CM.Util.loadScript(b)
    }
};
CM = window.CM || {};
CM.Map = function (a, b) {
    if (b instanceof Array) {
        this._tileLayers = b;
        this._baseLayer = b[0]
    } else {
        this._baseLayer = (b && b.getTileUrl ? b : new CM.Tiles.OpenStreetMap.Mapnik());
        this._tileLayers = [this._baseLayer]
    }
    this._wrapper = (typeof a == 'string' ? document.getElementById(a) : a);
    this._id = this._generateId();
    this._initStyles();
    this._initializeLayout();
    if (CM.DomEvent) {
        this._initializeEvents()
    }
    this._initializeCopyright();
    if (this.enableDragging) {
        this.enableDragging()
    }
    if (this.enableMouseZoom) {
        this.enableMouseZoom()
    }
};
CM.Map.MAP_PANE = 'wml-map-layer';
CM.Map.TILE_PANE = 'wml-tile-pane';
CM.Map.OVERLAY_PANE = 'wml-overlay-pane';
CM.Map.MARKER_SHADOW_PANE = 'wml-marker-shadow-pane';
CM.Map.MARKER_PANE = 'wml-marker-pane';
CM.Map.INFO_WINDOW_PANE = 'wml-info-window-pane';
CM.Util.extend(CM.Map.prototype, {
    setCenter: function (a, b) {
        var c = this._baseLayer.getMinZoomLevel(),
            d = this._baseLayer.getMaxZoomLevel();
        b = parseInt(b);
        if (isNaN(b)) {
            b = isNaN(this._zoom) ? c : this._zoom
        }
        if (b < c || b > d) {
            return false
        }
        var f = (b != this._zoom),
            g = this._zoom,
            h = !this._initialCenter;
        if (!f && !this._forceRedraw) {
            var j = this._baseLayer.getProjection(),
                l = this.getSize();
            var k = j.fromLatLngToPixel(this.getCenter(), this._zoom);
            var m = j.fromLatLngToPixel(a, this._zoom);
            var n = m.x - k.x,
                o = m.y - k.y;
            if ((Math.abs(n) <= l.width) && (Math.abs(o) <= l.height)) {
                this.panBy(new CM.Size(n, o));
                return
            }
        }
        CM.Event.fire(this, 'movestart');
        this._forceRedraw = false;
        this._zoom = b;
        this._initializeMapLayer(a);
        this._resetView();
        if (h) {
            this._savedCenter = a;
            this._savedZoom = b;
            CM.Event.fire(this, 'load')
        }
        CM.Event.fire(this, 'zoomend', g, this._zoom);
        CM.Event.fire(this, 'move');
        CM.Event.fire(this, 'moveend')
    },
    getCenter: function (a) {
        if (!this._initialCenter) {
            return null
        }
        var b = this._baseLayer.getProjection(),
            c = b.fromLatLngToPixel(this._initialCenter, this._zoom),
            d = this.getSize(),
            f = new CM.Point(this._initialSize.width / 2 - d.width / 2, this._initialSize.height / 2 - d.height / 2),
            g = new CM.Point(c.x - f.x - parseInt(this._mapLayer.style.left), c.y - f.y - parseInt(this._mapLayer.style.top));
        return b.fromPixelToLatLng(g, this._zoom, a)
    },
    setZoom: function (a) {
        this.setCenter(this.getCenter(), a)
    },
    getZoom: function () {
        return this._zoom
    },
    zoomIn: function () {
        this.setZoom(this._zoom + 1)
    },
    zoomOut: function () {
        this.setZoom(this._zoom - 1)
    },
    panTo: function (a) {
        this.setCenter(a, this._zoom)
    },
    panBy: function (a) {
        this._mapLayer.style.left = (parseInt(this._mapLayer.style.left) - a.width) + 'px';
        this._mapLayer.style.top = (parseInt(this._mapLayer.style.top) - a.height) + 'px';
        this._resetView();
        CM.Event.fire(this, 'movestart');
        CM.Event.fire(this, 'move');
        CM.Event.fire(this, 'moveend')
    },
    panDirection: function (a, b) {
        var c = this.getSize();
        this.panBy(new CM.Size(a * c.width / 2, b * c.height / 2))
    },
    checkResize: function () {
        this._sizeChanged = true;
        this._resetView()
    },
    getSize: function () {
        if (!this._size || this._sizeChanged) {
            this._size = new CM.Size(this._container.clientWidth, this._container.clientHeight);
            this._sizeChanged = false
        }
        return this._size
    },
    getContainer: function () {
        return this._container
    },
    getBounds: function () {
        var a = this.getSize(),
            b = this._baseLayer.getProjection(),
            c = this._getNwPoint(this.getCenter()),
            d = new CM.Point(c.x, c.y + a.height),
            f = new CM.Point(c.x + a.width, c.y);
        return new CM.LatLngBounds(b.fromPixelToLatLng(d, this._zoom), b.fromPixelToLatLng(f, this._zoom))
    },
    getBoundsZoomLevel: function (d) {
        var f = this.getSize(),
            g = this._baseLayer.getProjection(),
            h = d.getSouthWest(),
            j = d.getNorthEast();

        function l(a) {
            var b = g.fromLatLngToPixel(j, a),
                c = g.fromLatLngToPixel(h, a);
            return new CM.Size(b.x - c.x, c.y - b.y)
        }
        var k = this._baseLayer.getMinZoomLevel(),
            m;
        do {
            k++;
            m = l(k)
        } while (f.contains(m) && (k <= this._baseLayer.getMaxZoomLevel()));
        return k - 1
    },
    zoomToBounds: function (a) {
        this.setCenter(a.getCenter(), this.getBoundsZoomLevel(a))
    },
    isLoaded: function () {
        return !!this._initialCenter
    },
    fromContainerPixelToLatLng: function (a) {
        var b = this.getSize();
        var c = this._baseLayer.getProjection();
        var d = c.fromLatLngToPixel(this.getCenter(), this._zoom);
        var f = new CM.Point(d.x + (a.x - b.width / 2), d.y + (a.y - b.height / 2));
        return c.fromPixelToLatLng(f, this._zoom)
    },
    fromLatLngToContainerPixel: function (a) {
        return this.fromDivPixelToContainerPixel(this.fromLatLngToDivPixel(a))
    },
    fromLatLngToDivPixel: function (a, b) {
        var c = this._baseLayer.getProjection(),
            d = c.fromLatLngToPixel(a, this._zoom, b);
        return new CM.Point(d.x - this._initialNwPoint.x, d.y - this._initialNwPoint.y, b)
    },
    fromDivPixelToLatLng: function (a) {
        var b = this._baseLayer.getProjection();
        var c = new CM.Point(this._initialNwPoint.x + a.x, this._initialNwPoint.y + a.y, true);
        return b.fromPixelToLatLng(c, this._zoom)
    },
    fromContainerPixelToDivPixel: function (a) {
        return new CM.Point(a.x - parseInt(this._mapLayer.style.left), a.y - parseInt(this._mapLayer.style.top))
    },
    fromDivPixelToContainerPixel: function (a) {
        return new CM.Point(a.x + parseInt(this._mapLayer.style.left), a.y + parseInt(this._mapLayer.style.top))
    },
    setTileLayer: function (a) {
        if (this._baseLayer == a) {
            return false
        }
        if (!this._hasTileLayer(a)) {
            this.addTileLayer(a)
        }
        var b = this.getCenter();
        this._baseLayer = a;
        this._forceRedraw = true;
        this.setCenter(b, this.getZoom());
        CM.Event.fire(this, 'tilelayerchanged')
    },
    getCurrentTileLayer: function () {
        return this._baseLayer
    },
    getTileLayers: function () {
        return this._tileLayers
    },
    addTileLayer: function (a) {
        if (this._hasTileLayer(a)) {
            return false
        }
        this._tileLayers.push(a);
        CM.Event.fire(this, 'tilelayeradded', a)
    },
    removeTileLayer: function (a) {
        for (var b = 0; b < this._tileLayers.length; b++) {
            if (a == this._tileLayers[b]) {
                this._tileLayers = this._tileLayers.slice(0, b).concat(this._tileLayers.slice(b + 1));
                CM.Event.fire(this, 'tilelayerremoved', a)
            }
        }
    },
    addControl: function (a, b) {
        var c = a.initialize(this);
        c.className += ' wml-control';
        CM.DomEvent.stopMousePropagation(c);
        b = b || a.getDefaultPosition();
        b.applyTo(c);
        this._container.appendChild(c);
        a._container = c
    },
    removeControl: function (a) {
        a._container.parentNode.removeChild(a._container);
        if (a.remove) {
            a.remove(this)
        }
    },
    addOverlay: function (a) {
        a.initialize(this);
        if (!this._overlays) {
            this._overlays = []
        }
        this._overlays.push(a)
    },
    removeOverlay: function (a) {
        a.remove(this);
        for (var b = 0; b < this._overlays.length; b++) {
            if (a == this._overlays[b]) {
                this._overlays.splice(b, 1);
                break
            }
        }
    },
    clearOverlays: function () {
        if (!this._overlays) {
            return
        }
        for (var a = 0; a < this._overlays.length; a++) {
            this._overlays[a].remove(this)
        }
        this._overlays = []
    },
    savePosition: function () {
        this._savedCenter = this.getCenter();
        this._savedZoom = this.getZoom()
    },
    returnToSavedPosition: function () {
        this.setCenter(this._savedCenter, this._savedZoom)
    },
    getPane: function (a) {
        return this._panes[a]
    },
    _generateId: function () {
        CM.Map._lastId = (CM.Map._lastId || 0) + 1;
        return CM.Map._lastId
    },
    _initStyles: function () {
        if (!CM._stylesLoaded) {
            CM.Util.addStylesheet('web-maps-lite.css')
        }
        CM._stylesLoaded = true
    },
    _initializeLayout: function () {
        this._wrapper.className += ' wml-wrapper';
        this._container = document.createElement('div');
        this._container.className = 'wml-container';
        this._container.style.height = '100%';
        this._wrapper.appendChild(this._container);
        if (CM.Util.Browser.isIE) {
            this._container.className += ' wml-ie';
            if (CM.Util.Browser.isIE6) {
                this._container.className += ' wml-ie6'
            }
            if (CM.Util.Browser.isIE7) {
                this._container.className += ' wml-ie7'
            }
        }
        var a = CM.Util.getStyle(this._wrapper, 'position');
        this._wrapper.style.position = (a == 'absolute' ? 'absolute' : 'relative');
        this._createPane('wml-loading-indicator');
        this._mapLayer = this._createPane(CM.Map.MAP_PANE);
        this._createPane(CM.Map.TILE_PANE, this._mapLayer);
        this._createPane(CM.Map.OVERLAY_PANE, this._mapLayer);
        this._createPane(CM.Map.MARKER_SHADOW_PANE, this._mapLayer);
        this._createPane(CM.Map.MARKER_PANE, this._mapLayer);
        this._createPane(CM.Map.INFO_WINDOW_PANE, this._mapLayer)
    },
    _createPane: function (a, b) {
        this._panes = this._panes || {};
        b = b || this._container;
        var c = document.createElement('div');
        c.className = a;
        b.appendChild(c);
        this._panes[a] = c;
        return c
    },
    _captureMousePos: function (a) {
        var b = CM.Util.getCumulativeOffset(this._container);
        var c = CM.DomEvent.getMousePosition(a);
        this._mousePos.x = c.x - b.x;
        this._mousePos.y = c.y - b.y
    },
    _fireMouseEvent: function (a, b) {
        this._captureMousePos(b);
        if (!CM.Event.hasListeners(this, a)) {
            return
        }
        var c = this.fromContainerPixelToLatLng(new CM.Point(this._mousePos.x, this._mousePos.y));
        CM.Event.fire(this, a, c)
    },
    _initializeEvents: function () {
        this._mousePos = new CM.Point();
        CM.DomEvent.addListener(this._container, 'mouseover', function (a) {
            if (!CM.DomEvent.mouseEntered(a, this._container)) {
                return
            }
            this._captureMousePos(a);
            this._fireMouseEvent('mouseover', a)
        }, this);
        CM.DomEvent.addListener(this._container, 'mouseout', function (a) {
            if (!CM.DomEvent.mouseLeft(a, this._container)) {
                return
            }
            this._fireMouseEvent('mouseout', a)
        }, this);
        CM.DomEvent.addListener(this._container, 'mousemove', function (a) {
            this._fireMouseEvent('mousemove', a)
        }, this);
        CM.DomEvent.addListener(this._container, 'click', function (a) {
            if (this._dragObject && this._dragObject.moved()) {
                return
            }
            this._fireMouseEvent('click', a)
        }, this);
        CM.DomEvent.addListener(this._container, 'dblclick', function (a) {
            this._fireMouseEvent('dblclick', a)
        }, this)
    },
    _initializeCopyright: function () {
        if (this._baseLayer.getCopyright() && CM.Copyright) {
            this.addControl(new CM.Copyright())
        }
    },
    _initializeMapLayer: function (a) {
        this._panes[CM.Map.TILE_PANE].innerHTML = "";
        this._initialNwPoint = this._getNwPoint(a);
        this._mapLayer.style.left = '0px';
        this._mapLayer.style.top = '0px';
        this._initialCenter = a;
        this._initialSize = this.getSize()
    },
    _getNwPoint: function (a) {
        var b = this._baseLayer.getProjection().fromLatLngToPixel(a, this._zoom);
        var c = this.getSize();
        return new CM.Point(b.x - c.width / 2, b.y - c.height / 2)
    },
    _resetView: function (a) {
        a = a || this._baseLayer;
        var b = a.getTileSize(),
            c = this._getNwPoint(this.getCenter(true));
        var d = new CM.Point(Math.floor(c.x / b), Math.floor(c.y / b));
        var f = this.getSize();
        var g = new CM.Point(c.x + f.width, c.y + f.height);
        var h = new CM.Point(Math.floor(g.x / b), Math.floor(g.y / b));
        this._renderTiles(d, h, a)
    },
    _renderTiles: function (a, b, c) {
        for (var d = a.y; d <= b.y; d++) {
            for (var f = a.x; f <= b.x; f++) {
                this._renderTile(new CM.Point(f, d), c)
            }
        }
    },
    _renderTile: function (a, b) {
        var c = 'cm-map' + this._id + '-tiles' + b.getId() + '-zoom' + this._zoom + '-tile' + a.x + 'x' + a.y;
        if (!document.getElementById(c)) {
            var d = b.getTileUrl(a, this._zoom);
            if (!d) {
                return false
            }
            var f = document.createElement('div');
            f.id = c;
            f.className = 'wml-tile';
            var g = b.getTileSize();
            f.style.width = f.style.height = g + 'px';
            f.style.left = (a.x * g - this._initialNwPoint.x) + 'px';
            f.style.top = (a.y * g - this._initialNwPoint.y) + 'px';
            var h = document.createElement('img');
            f.appendChild(h);
            var j = b.getErrorTileUrl();
            if (j) {
                h.onerror = function () {
                    this.src = j
                }
            }
            if (b.getOpacity) {
                CM.Util.setOpacity(h, b.getOpacity())
            }
            h.galleryimg = 'no';
            h.onselectstart = function () {
                return false
            };
            h.onmousemove = function () {
                return false
            };
            h.style.visibility = 'hidden';
            h.onload = function () {
                this.style.visibility = 'visible'
            };
            h.src = d;
            this._panes[CM.Map.TILE_PANE].appendChild(f)
        }
    },
    _hasTileLayer: function (a) {
        return (CM.Util.indexOf(this._tileLayers, a) != -1)
    }
});
CM.MercatorProjection = function (a) {
    this._tileSize = a
};
CM.MercatorProjection.prototype = {
    fromLatLngToPixel: function (a, b, c) {
        var d = this._tileSize * Math.pow(2, b);
        var f = d / 2 + a.lng() * d / 360;
        var g = Math.sin(a.latRadians());
        if (g == 1) {
            g -= 1.0E-9
        }
        if (g == -1) {
            g += 1.0E-9
        }
        var h = 0.5 * Math.log((1 + g) / (1 - g));
        var j = d / 2 - h * (d / (2 * Math.PI));
        return new CM.Point(f, j, c)
    },
    fromPixelToLatLng: function (a, b, c) {
        var d = this._tileSize * Math.pow(2, b);
        var f = (a.x - d / 2) / (d / 360);
        var g = (1 - 2 * a.y / d) * Math.PI;
        var h = (2 * Math.atan(Math.exp(g)) - Math.PI / 2) * (180 / Math.PI);
        return new CM.LatLng(h, f, c)
    },
    getWrapWidth: function (a) {
        return this._tileSize * Math.pow(2, a)
    },
    getResolution: function (a) {
        var b = 40075016.686;
        return b / this.getWrapWidth(a)
    }
};
CM.Point = function (a, b, c) {
    this.x = c ? a : Math.round(parseFloat(a));
    this.y = c ? b : Math.round(parseFloat(b))
};
CM.Point.prototype = {
    toSize: function () {
        return new CM.Size(this.x, this.y)
    },
    equals: function (a) {
        return (this.x == a.x) && (this.y == a.y)
    }
};
CM.Size = function (a, b) {
    this.width = parseInt(a);
    this.height = parseInt(b)
};
CM.Size.prototype = {
    contains: function (a) {
        return (this.width >= a.width) && (this.height >= a.height)
    },
    toPoint: function () {
        return new CM.Point(this.width, this.height)
    }
};
CM.LatLng = function (a, b, c) {
    a = parseFloat(a);
    b = parseFloat(b);
    if (c !== true) {
        var d = CM.LatLng.MAX_LATITUDE;
        a = (a > d ? d : (a < -d ? -d : a));
        b = (b + 180) % 360 + (b < -180 ? 180 : -180)
    }
    this._lat = a;
    this._lng = b
};
(function () {
    var a = Math.exp(2 * Math.PI);
    CM.LatLng.MAX_LATITUDE = Math.asin((a - 1) / (a + 1)) * 180 / Math.PI
})();
CM.LatLng.prototype = {
    lat: function () {
        return this._lat
    },
    lng: function () {
        return this._lng
    },
    latRadians: function () {
        return Math.PI * this._lat / 180
    },
    lngRadians: function () {
        return Math.PI * this._lng / 180
    },
    equals: function (c) {
        if (!c || !c._lat || !c._lng) {
            return false
        }
        function d(a, b) {
            return Math.abs(a - b) <= 1.0E-9
        }
        return d(this._lat, c._lat) && d(this._lng, c._lng)
    },
    toString: function (a) {
        var b = Math.pow(10, a || 5);
        var c = Math.round(this._lat * b) / b;
        var d = Math.round(this._lng * b) / b;
        return '(' + c + ', ' + d + ')'
    }
};
CM.Bounds = function (a) {
    if (a.length < 2) {
        throw 'Invalid arguments for CM.Bounds constructor.';
    }
    this.minX = this.minY = Infinity;
    this.maxX = this.maxY = -Infinity;
    for (var b = 0; b < a.length; b++) {
        if (a[b].x < this.minX) {
            this.minX = a[b].x
        }
        if (a[b].x > this.maxX) {
            this.maxX = a[b].x
        }
        if (a[b].y < this.minY) {
            this.minY = a[b].y
        }
        if (a[b].y > this.maxY) {
            this.maxY = a[b].y
        }
    }
};
CM.Bounds.prototype = {
    min: function () {
        return new CM.Point(this.minX, this.minY)
    },
    max: function () {
        return new CM.Point(this.maxX, this.maxY)
    },
    mid: function () {
        return new CM.Point(Math.round((this.minX + this.maxX) / 2), Math.round((this.minY + this.maxY) / 2))
    },
    extend: function (a) {
        if (a.x > this.maxX) {
            this.maxX = a.x
        }
        if (a.x < this.minX) {
            this.minX = a.x
        }
        if (a.y > this.maxY) {
            this.maxY = a.y
        }
        if (a.y < this.minY) {
            this.minY = a.y
        }
    },
    contains: function (a) {
        return (a.minX >= this.minX) && (a.maxX <= this.maxX) && (a.minY >= this.minY) && (a.maxY <= this.maxY)
    }
};
CM.LatLngBounds = function (a, b) {
    if (a instanceof Array) {
        var c, d, f, g;
        if (a.length < 1) {
            throw 'Pass at least 2 LatLng point in the array for the CM.LatLngBounds(array) constructor.';
        }
        for (var h = 0; h < a.length; h++) {
            if (!f || (a[h].lng() < f)) {
                f = a[h].lng()
            }
            if (!g || (a[h].lng() > g)) {
                g = a[h].lng()
            }
            if (!c || (a[h].lat() < c)) {
                c = a[h].lat()
            }
            if (!d || (a[h].lat() > d)) {
                d = a[h].lat()
            }
        }
        a = new CM.LatLng(c, f);
        b = new CM.LatLng(d, g)
    }
    this._sw = a;
    this._ne = b
};
CM.LatLngBounds.prototype = {
    getSouthWest: function () {
        return this._sw
    },
    getNorthEast: function () {
        return this._ne
    },
    getCenter: function () {
        var a = (this._sw.lng() + this._ne.lng()) / 2;
        var b = (this._sw.lat() + this._ne.lat()) / 2;
        return new CM.LatLng(b, a)
    },
    extend: function (a) {
        var b = Math.max(a.lng(), this._ne.lng()),
            c = Math.min(a.lng(), this._sw.lng()),
            d = Math.max(a.lat(), this._ne.lat()),
            f = Math.min(a.lat(), this._sw.lat());
        this._sw = new CM.LatLng(f, c);
        this._ne = new CM.LatLng(d, b)
    },
    contains: function (a) {
        var b, c;
        if (a instanceof CM.LatLngBounds) {
            b = a.getSouthWest();
            c = a.getNorthEast()
        } else if (a instanceof CM.LatLng) {
            b = c = a
        } else {
            throw new Error("Please provide either CM.LatLngBounds or CM.LatLng object as an argument.");
        }
        return (b.lat() >= this._sw.lat()) && (c.lat() <= this._ne.lat()) && (b.lng() >= this._sw.lng()) && (c.lng() <= this._ne.lng())
    }
};
CM = window.CM || {};
CM.Tiles = {};
CM.Tiles.Base = function (a) {
    this._id = this._generateId();
    this._setOptions(a);
    this._generateGetters()
};
CM.Tiles.Base.prototype = {
    getTileUrl: function (a, b) {
        var c = this._getBoundedTile(a, b);
        if (!c) {
            return this._options.outOfRangeTileUrl
        }
        var d = this._options.tileUrlTemplate;
        if (this._options.subdomains && d.match('#{subdomain}')) {
            d = d.replace('#{subdomain}', this._options.subdomains[(c.x + c.y) % this._options.subdomains.length])
        }
        return d.replace('#{zoom}', b).replace('#{x}', c.x).replace('#{y}', c.y)
    },
    getId: function () {
        return this._id
    },
    _setOptions: function (a) {
        if (typeof a.subdomains == 'string') {
            a.subdomains = a.subdomains.split('')
        }
        var b = {
            tileSize: 256,
            projection: new CM.MercatorProjection((a && a.tileSize) || 256),
            subdomains: ['a', 'b', 'c'],
            outOfRangeTileUrl: '',
            errorTileUrl: '',
            minZoomLevel: 0,
            maxZoomLevel: 18,
            copyright: '',
            title: '',
            isPng: false
        };
        this._options = CM.Util.extend(b, a || {})
    },
    _generateGetters: function () {
        for (var b in this._options) {
            if (this._options.hasOwnProperty(b)) {
                (function (a) {
                    this['get' + a.charAt(0).toUpperCase() + a.substr(1)] = function () {
                        return this._options[a]
                    }
                }).call(this, b)
            }
        }
    },
    _generateId: function () {
        if (typeof CM.Tiles._lastId == 'undefined') {
            CM.Tiles._lastId = 0
        } else {
            CM.Tiles._lastId++
        }
        return CM.Tiles._lastId
    },
    _getBoundedTile: function (a, b) {
        var c = Math.pow(2, b);
        if (a.y < 0 || a.y >= c) {
            return null
        }
        var d = ((a.x % c) + c) % c;
        return new CM.Point(d, a.y)
    }
};
(function () {
    var c = CM.Map.prototype._initializeEvents;
    CM.Map.prototype._initializeEvents = function () {
        c.apply(this, arguments);
        var b = function () {
                setTimeout(CM.Util.bind(function () {
                    var a = this.getCurrentTileLayer();
                    if ((a instanceof CM.Tiles.CloudMade.Web) && a._dmLayer) {
                        this.addOverlay(a._dmLayer);
                        this._dataMarketLayer = a._dmLayer
                    } else if (this._dataMarketLayer) {
                        this.removeOverlay(this._dataMarketLayer);
                        this._dataMarketLayer = null
                    }
                }, this), 0)
            };
        CM.Event.addListener(this, 'load', b, this);
        CM.Event.addListener(this, 'tilelayerchanged', b, this)
    };
    var d = CM.Map.prototype._renderTiles;
    CM.Map.prototype._renderTiles = function () {
        if (this._baseLayer._options.token && !this._baseLayer._ready) {
            this._deferRenderTiles(arguments)
        } else {
            d.apply(this, arguments)
        }
    };
    CM.Map.prototype._deferRenderTiles = function (a) {
        var b = this._baseLayer;
        CM.Event.addListener(b, 'ready', function () {
            if (b == this.getCurrentTileLayer()) {
                a.callee.apply(this, a)
            }
        }, this)
    }
})();
CM.Tiles.CloudMade = {};
CM.Tiles.CloudMade.Web = function (c) {
    var d = 'Map data <a target="_blank" href="http://creativecommons.org/licenses/by-sa/2.0/">CCBYSA</a> ' + (new Date()).getFullYear() + ' <a target="_blank" href="http://openstreetmap.org">OpenStreetMap.org</a> contributors';
    var f = CM.Util.getRootUrl();
    c = CM.Util.extend({
        title: 'CloudMade Web',
        tileUrlTemplate: 'http://#{subdomain}.tile.cloudmade.com/#{key}/#{styleId}/#{tileSize}/#{zoom}/#{x}/#{y}.png?servicesource=wma&libversion=0.8',
        outOfRangeTileUrl: f + 'images/empty-tile.png',
        errorTileUrl: f + 'images/empty-tile.png',
        styleId: 1,
        copyright: '&copy; ' + (new Date()).getFullYear() + ' <a target="_blank" href="http://cloudmade.com">CloudMade</a> - ' + d + ' - <a target="_blank" href="http://cloudmade.com/terms_conditions">Terms of Use</a>',
        tokenValidationUrl: 'http://cloudmade.com/tokens/is_valid.js',
        enableDataMarket: false
    }, c);
    if (!c.key) {
        throw "Please provide key property in options (your API key).";
    }
    if (c.token) {
        this._ready = false;
        var g = c.tokenValidationUrl + '?user_token=' + c.token + '&callback=_tokenValid';
        CM.Util.getJson(g, function (b) {
            if (b.code === 0) {
                this._ready = true;
                CM.Event.fire(this, 'ready')
            } else if (c.tokenUpdateUrl) {
                CM.Util.getJson(c.tokenUpdateUrl, function (a) {
                    if (a && a.token) {
                        this._options.token = a.token;
                        this._ready = true;
                        CM.Event.fire(this, 'ready')
                    }
                }, '_tokenUpdate', this)
            } else {
                throw 'Invalid token. Please specify tokenUpdateUrl in options.';
            }
        }, '_tokenValid', this)
    }
    if (c.enableDataMarket && CM.DataMarketLayer) {
        this._dmLayer = new CM.DataMarketLayer({
            key: c.key,
            styleId: c.styleId,
            checkStyle: true
        })
    }
    CM.Tiles.Base.call(this, c)
};
CM.Util.extend(CM.Tiles.CloudMade.Web.prototype, CM.Tiles.Base.prototype);
CM.Tiles.CloudMade.Web.prototype.getTileUrl = function (a, b) {
    var c = CM.Tiles.Base.prototype.getTileUrl.call(this, a, b);
    c = c.replace('#{tileSize}', this._options.tileSize).replace('#{key}', this._options.key).replace('#{styleId}', this._options.styleId);
    if (this._options.token) {
        c += '&token=' + this._options.token
    }
    return c
};
CM.Tiles.CloudMade.Mobile = function (a) {
    CM.Tiles.CloudMade.Web.call(this, CM.Util.extend({
        title: 'CloudMade Mobile',
        tileSize: 64,
        styleId: 2,
        minZoomLevel: 2,
        maxZoomLevel: 20
    }, a))
};
CM.Util.extend(CM.Tiles.CloudMade.Mobile.prototype, CM.Tiles.CloudMade.Web.prototype);
CM.Tiles.CloudMade.HeatMap = function (a) {
    var b = {
        tileUrlTemplate: 'http://heatmap.cloudmade.com/#{key}/#{styleId}/#{tileSize}/#{zoom}/#{x}/#{y}.png',
        outOfRangeTileUrl: '',
        errorTileUrl: '',
        opacity: 0.35
    };
    a = CM.Util.extend(b, a || {});
    CM.Tiles.CloudMade.Web.call(this, a)
};
CM.Util.extend(CM.Tiles.CloudMade.HeatMap.prototype, CM.Tiles.CloudMade.Web.prototype);
CM.Tiles.OpenStreetMap = {};
CM.Tiles.OpenStreetMap.COPYRIGHT = 'Map data <a href="http://creativecommons.org/licenses/by-sa/2.0/">CCBYSA</a> ' + (new Date()).getFullYear() + ' <a href="http://openstreetmap.org">OpenStreetMap.org</a> contributors';
CM.Tiles.OpenStreetMap.MISSING_TILE_URL = 'http://openstreetmap.org/openlayers/img/404.png';
CM.Tiles.OpenStreetMap.Mapnik = function (a) {
    CM.Tiles.Base.call(this, CM.Util.extend({
        title: 'OpenStreetMap Mapnik',
        tileUrlTemplate: 'http://#{subdomain}.tile.openstreetmap.org/#{zoom}/#{x}/#{y}.png',
        errorTileUrl: CM.Tiles.OpenStreetMap.MISSING_TILE_URL,
        outOfRangeTileUrl: CM.Tiles.OpenStreetMap.MISSING_TILE_URL,
        copyright: CM.Tiles.OpenStreetMap.COPYRIGHT
    }, a))
};
CM.Util.extend(CM.Tiles.OpenStreetMap.Mapnik.prototype, CM.Tiles.Base.prototype);
CM.Tiles.OpenStreetMap.Osmarender = function (a) {
    CM.Tiles.OpenStreetMap.Mapnik.call(this, CM.Util.extend({
        title: 'OpenStreetMap Osmarender',
        tileUrlTemplate: 'http://#{subdomain}.tah.openstreetmap.org/Tiles/tile/#{zoom}/#{x}/#{y}.png'
    }, a))
};
CM.Util.extend(CM.Tiles.OpenStreetMap.Osmarender.prototype, CM.Tiles.OpenStreetMap.Mapnik.prototype);
CM.Tiles.OpenStreetMap.Cycle = function (a) {
    CM.Tiles.OpenStreetMap.Mapnik.call(this, CM.Util.extend({
        title: 'OpenStreetMap Cycle Map',
        tileUrlTemplate: 'http://#{subdomain}.andy.sandbox.cloudmade.com/tiles/cycle/#{zoom}/#{x}/#{y}.png',
        maxZoomLevel: 17
    }, a))
};
CM.Util.extend(CM.Tiles.OpenStreetMap.Cycle.prototype, CM.Tiles.OpenStreetMap.Mapnik.prototype);
CM.Event = {
    addListener: function (a, b, c, d) {
        a._events = a._events || {};
        a._events[b] = a._events[b] || [];
        a._events[b].push({
            action: c,
            context: d
        })
    },
    hasListeners: function (a, b) {
        return !!(a._events && a._events[b])
    },
    removeListener: function (a, b, c, d) {
        if (!this.hasListeners(a, b)) {
            return
        }
        for (var f = 0; f < a._events[b].length; f++) {
            if ((a._events[b][f].action == c) && (!d || (a._events[b][f].context == d))) {
                a._events[b] = a._events[b].slice(0, f).concat(a._events[b].slice(f + 1));
                return
            }
        }
    },
    fire: function (a, b) {
        if (!this.hasListeners(a, b)) {
            return
        }
        var c = Array.prototype.slice.call(arguments, 2),
            d = [],
            f;
        for (f = 0; f < a._events[b].length; f++) {
            d[f] = a._events[b][f]
        }
        for (f = 0; f < d.length; f++) {
            d[f].action.apply(d[f].context || a, c)
        }
    }
};
CM.DomEvent = {
    addListener: (function () {
        var g = 0;

        function h() {
            var a = window.event;
            if (!a) {
                var b = h.caller;
                while (b) {
                    a = b['arguments'][0];
                    if (a && Event == a.constructor) {
                        break
                    }
                    b = b.caller
                }
            }
            return a
        }
        return function (b, c, d, f) {
            if (!d.guid) {
                d.guid = g++
            }
            b[c + d.guid] = function (a) {
                return d.call(f || b, a || h())
            };
            if (b.addEventListener) {
                if (c == 'mousewheel') {
                    b.addEventListener('DOMMouseScroll', b[c + d.guid], false)
                }
                b.addEventListener(c, b[c + d.guid], false)
            } else if (b.attachEvent) {
                b.attachEvent("on" + c, b[c + d.guid])
            }
        }
    })(),
    removeListener: function (a, b, c) {
        if (a.removeEventListener) {
            if (b == 'mousewheel') {
                a.removeEventListener('DOMMouseScroll', a[b + c.guid], false)
            }
            a.removeEventListener(b, a[b + c.guid], false)
        } else if (a.detachEvent) {
            a.detachEvent("on" + b, a[b + c.guid]);
            a[b + c.guid] = null
        }
    },
    stopPropagation: function (a) {
        if (a.stopPropagation) {
            a.stopPropagation()
        } else {
            a.cancelBubble = true
        }
    },
    preventDefault: function (a) {
        if (a.preventDefault) {
            a.preventDefault()
        } else {
            a.returnValue = false
        }
    }
};
CM.DomEvent.stopMousePropagation = function (a) {
    CM.DomEvent.addListener(a, 'mousedown', CM.DomEvent.stopPropagation);
    CM.DomEvent.addListener(a, 'click', CM.DomEvent.stopPropagation);
    CM.DomEvent.addListener(a, 'dblclick', CM.DomEvent.stopPropagation)
};
CM.DomEvent.disableTextSelection = function () {
    if (document.selection && document.selection.empty) {
        document.selection.empty()
    }
    if (!CM.DomEvent._onselectstart) {
        CM.DomEvent._onselectstart = document.onselectstart;
        document.onselectstart = function () {
            return false
        }
    }
};
CM.DomEvent.enableTextSelection = function () {
    document.onselectstart = CM.DomEvent._onselectstart;
    CM.DomEvent._onselectstart = null
};
CM.DomEvent.getMousePosition = function (a) {
    var b = 0,
        c = 0;
    if (a.pageX || a.pageY) {
        b = a.pageX;
        c = a.pageY
    } else if (a.clientX || a.clientY) {
        b = a.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        c = a.clientY + document.body.scrollTop + document.documentElement.scrollTop
    }
    return new CM.Point(b, c)
};
(function () {
    function f(d) {
        return function (a, b) {
            var c = a.relatedTarget ? a.relatedTarget : (d ? a.toElement : a.fromElement);
            if (!c) {
                return true
            }
            try {
                while (c != b && c !== null) {
                    c = c.parentNode
                }
            } catch (err) {
                return
            }
            return (c != b)
        }
    }
    CM.DomEvent.mouseLeft = f(true);
    CM.DomEvent.mouseEntered = f(false)
})();
CM.DraggableObject = function (a, b) {
    this._element = a;
    this._setOptions(b);
    this.enable()
};
CM.DraggableObject.prototype = {
    enable: function () {
        if (!this._draggingEnabled) {
            CM.DomEvent.addListener(this._element, 'mousedown', this._onMouseDown, this);
            this._draggingEnabled = true
        }
    },
    disable: function () {
        if (this._draggingEnabled) {
            CM.DomEvent.removeListener(this._element, 'mousedown', this._onMouseDown);
            this._draggingEnabled = false
        }
    },
    moved: function () {
        return (this.startX != this.x || this.startY != this.y)
    },
    _setOptions: function (a) {
        var b = {
            draggingCursor: 'move'
        };
        this._options = CM.Util.extend(b, a || {})
    },
    _captureDelta: function (a) {
        this.dx = this.x ? a.clientX - this.x : 0;
        this.dy = this.y ? a.clientY - this.y : 0;
        this.x = a.clientX;
        this.y = a.clientY
    },
    _onMove: function (a) {
        this._captureDelta(a);
        this.left += this.dx;
        this.top += this.dy;
        this._updatePosition();
        if (this._fireDragStart) {
            CM.Event.fire(this, 'dragstart');
            this._fireDragStart = false
        }
        CM.Event.fire(this, 'drag');
        CM.DomEvent.stopPropagation(a);
        CM.DomEvent.preventDefault(a)
    },
    _updatePosition: function () {
        this._element.style.left = this.left + 'px';
        this._element.style.top = this.top + 'px'
    },
    _initPosition: function () {
        this.left = parseInt(this._element.style.left);
        this.top = parseInt(this._element.style.top)
    },
    _onMouseDown: function (a) {
        if (a.shiftKey || ((a.which != 1) && (a.button != 1) && !a.touches)) {
            return false
        }
        this._fireDragStart = true;
        this._initPosition();
        this.started = true;
        CM.DomEvent.disableTextSelection();
        this._captureDelta(a);
        this.startX = this.x;
        this.startY = this.y;
        document.body.style.cursor = this._options.draggingCursor;
        if (this._element.style.cursor) {
            this.cursor = this._element.style.cursor
        }
        this._element.style.cursor = this._options.draggingCursor;
        CM.DomEvent.addListener(document, 'mousemove', this._onMove, this);
        CM.DomEvent.addListener(document, 'mouseup', this._stopDragging, this);
        if (this._options.container) {
            CM.DomEvent.addListener(this._options.container, 'mouseout', this._onMouseOut, this)
        }
        CM.DomEvent.stopPropagation(a);
        if (a.type != 'touchstart' || this.moved()) {
            CM.DomEvent.preventDefault(a)
        }
    },
    _stopDragging: function () {
        if (!this.started) {
            return false
        }
        this.started = false;
        CM.DomEvent.enableTextSelection();
        document.body.style.cursor = '';
        this._element.style.cursor = this.cursor || '';
        this.cursor = null;
        CM.DomEvent.removeListener(document, 'mousemove', this._onMove);
        CM.DomEvent.removeListener(document, 'mouseup', this._stopDragging);
        if (this._options.container) {
            CM.DomEvent.removeListener(this._options.container, 'mouseout', this._onMouseOut)
        }
        if (this.moved()) {
            CM.Event.fire(this, 'dragend')
        }
    },
    _onMouseOut: function (a) {
        if (this._options.container && CM.DomEvent.mouseLeft(a, this._options.container)) {
            this._stopDragging()
        }
    }
};
if (CM.Util.Browser.isMobileWebkit) {
    (function () {
        var b = CM.DraggableObject.prototype._captureDelta,
            c = CM.DraggableObject.prototype._onMouseDown,
            d = CM.DraggableObject.prototype._onMove,
            f = CM.DraggableObject.prototype._stopDragging,
            g = CM.DraggableObject.prototype.enable,
            h = CM.DraggableObject.prototype.disable;
        CM.Util.extend(CM.DraggableObject.prototype, {
            _captureDelta: function (a) {
                if (a.touches && a.touches.length == 1) {
                    b.call(this, a.touches[0])
                }
            },
            _onMouseDown: function (a) {
                if (a.touches && a.touches.length == 1) {
                    c.call(this, a);
                    CM.DomEvent.addListener(document, 'touchmove', this._onMove, this);
                    CM.DomEvent.addListener(document, 'touchend', this._stopDragging, this)
                }
            },
            _onMove: function (a) {
                if (a.touches && a.touches.length == 1) {
                    d.call(this, a)
                }
            },
            _stopDragging: function (a) {
                f.call(this, a);
                CM.DomEvent.removeListener(document, 'touchmove', this._onMove);
                CM.DomEvent.removeListener(document, 'touchend', this._stopDragging)
            },
            enable: function () {
                g.call(this);
                if (!this._iphoneDraggingEnabled) {
                    CM.DomEvent.addListener(this._element, 'touchstart', this._onMouseDown, this);
                    this._iphoneDraggingEnabled = true
                }
            },
            disable: function () {
                h.call(this);
                if (this._iphoneDraggingEnabled) {
                    CM.DomEvent.removeListener(this._element, 'touchstart', this._onMouseDown);
                    this._iphoneDraggingEnabled = false
                }
            }
        })
    })()
}
CM.Util.extend(CM.Map.prototype, {
    enableDragging: function () {
        if (!this._dragObject) {
            this._dragObject = new CM.DraggableObject(this._mapLayer);
            CM.Event.addListener(this._dragObject, 'dragend', function () {
                CM.Event.fire(this, 'dragend');
                CM.Event.fire(this, 'moveend')
            }, this);
            CM.Event.addListener(this._dragObject, 'dragstart', function () {
                if (this._panFx) {
                    this._panFx.complete()
                }
                CM.Event.fire(this, 'dragstart');
                CM.Event.fire(this, 'movestart')
            }, this);
            var a = CM.Util.limitExecByInterval(this._resetView, 200, this);
            CM.Event.addListener(this._dragObject, 'drag', function () {
                a();
                CM.Event.fire(this, 'drag');
                CM.Event.fire(this, 'move')
            }, this)
        } else {
            this._dragObject.enable()
        }
        this._draggingEnabled = true
    },
    disableDragging: function () {
        this._dragObject.disable();
        this._draggingEnabled = false
    },
    draggingEnabled: function () {
        return !!this._draggingEnabled
    }
});
CM.Util.extend(CM.Map.prototype, {
    enableMouseZoom: function () {
        if (this.enableScrollWheelZoom) {
            this.enableScrollWheelZoom()
        }
        if (this.enableDoubleClickZoom) {
            this.enableDoubleClickZoom()
        }
        if (this.enableShiftDragZoom) {
            this.enableShiftDragZoom()
        }
    },
    disableMouseZoom: function () {
        if (this.disableScrollWheelZoom) {
            this.disableScrollWheelZoom()
        }
        if (this.disableDoubleClickZoom) {
            this.disableDoubleClickZoom()
        }
        if (this.disableShiftDragZoom) {
            this.disableShiftDragZoom()
        }
    }
});
CM.Util.extend(CM.Map.prototype, {
    enableScrollWheelZoom: function () {
        if (this._scrollWheelZoomEnabled) {
            return false
        }
        var b = this.getContainer(),
            c = this._baseLayer.getMinZoomLevel(),
            d = this._baseLayer.getMaxZoomLevel(),
            f = 0,
            g, h;
        var j = CM.Util.bind(function () {
            if (g != this.getZoom()) {
                var a = this._getCenterForScrollWheelZoom(g);
                this.setCenter(a, g)
            }
            f = 0
        }, this);

        function l(a) {
            if (a.wheelDelta) {
                f += a.wheelDelta / 120
            } else if (a.detail) {
                f += -a.detail / 3
            }
            if (f) {
                f = (f > 0 ? Math.ceil(f) : Math.floor(f));
                g = this.getZoom() + f;
                g = Math.min(g, d);
                g = Math.max(g, c);
                clearTimeout(h);
                h = setTimeout(j, 50)
            }
            CM.DomEvent.preventDefault(a)
        }
        CM.DomEvent.addListener(b, 'mousewheel', l, this);
        this._scrollWheelZoomEnabled = true;
        this.disableScrollWheelZoom = function () {
            CM.DomEvent.removeListener(b, 'mousewheel', l, this);
            this._scrollWheelZoomEnabled = false
        }
    },
    scrollWheelZoomEnabled: function () {
        return !!this._scrollWheelZoomEnabled
    },
    _getCenterForScrollWheelZoom: function (a) {
        var b = this.getSize(),
            c = this.getCurrentTileLayer().getProjection(),
            d = this.getZoom();
        var f = 1 - Math.pow(2, d - a);
        var g = c.fromLatLngToPixel(this.getCenter(), d);
        var h = new CM.Point(g.x + (this._mousePos.x - b.width / 2) * f, g.y + (this._mousePos.y - b.height / 2) * f);
        return c.fromPixelToLatLng(h, d)
    }
});
if (CM.Util.Browser.isMobileWebkit) {
    CM.Util.extend(CM.Map.prototype, {
        enableScrollWheelZoom: function () {
            if (this._scrollWheelZoomEnabled) {
                return false
            }
            var d = this.getContainer();

            function f(a) {
                if (a.touches.length == 2) {
                    var b = Math.round((a.touches[0].pageX + a.touches[1].pageX) / 2);
                    var c = Math.round((a.touches[0].pageY + a.touches[1].pageY) / 2);
                    this._mousePos = new CM.Point(b - d.offsetLeft, c - d.offsetTop)
                }
                CM.DomEvent.preventDefault(a)
            }
            function g(a) {
                var b = this.getZoom() + Math.round(Math.log(a.scale) / Math.LN2);
                var c = this._getCenterForScrollWheelZoom(b);
                this.setCenter(c, b)
            }
            CM.DomEvent.addListener(d, 'touchstart', f, this);
            CM.DomEvent.addListener(d, 'gestureend', g, this);
            CM.DomEvent.addListener(d, 'gesturechange', CM.DomEvent.preventDefault);
            this._scrollWheelZoomEnabled = true;
            this.disableScrollWheelZoom = function () {
                CM.Event.removeListener(d, 'touchstart', f, this);
                CM.Event.removeListener(d, 'gestureend', g, this);
                CM.DomEvent.removeListener(d, 'gesturechange', CM.DomEvent.preventDefault);
                this._scrollWheelZoomEnabled = false
            }
        }
    })
}
CM.Util.extend(CM.Map.prototype, {
    enableDoubleClickZoom: function () {
        if (this._doubleClickZoomEnabled) {
            return false
        }
        var c = this.getContainer();

        function d() {
            var a = this.getZoom() + 1;
            var b = this.fromContainerPixelToLatLng(new CM.Point(this._mousePos.x, this._mousePos.y));
            this.setCenter(b, a)
        }
        CM.DomEvent.addListener(c, 'dblclick', d, this);
        this._doubleClickZoomEnabled = true;
        this.disableDoubleClickZoom = function () {
            CM.DomEvent.removeListener(c, 'dblclick', d, this);
            this._doubleClickZoomEnabled = false
        }
    },
    doubleClickZoomEnabled: function () {
        return !!this._doubleClickZoomEnabled
    }
});
CM.Util.extend(CM.Map.prototype, {
    enableShiftDragZoom: function () {
        if (this._shiftDragZoomEnabled) {
            return false
        }
        var d, f, g, h = this.getContainer();

        function j(a) {
            var b = this._mousePos.x - f;
            var c = this._mousePos.y - g;
            if (b < 0) {
                d.style.left = this._mousePos.x + 'px'
            }
            if (c < 0) {
                d.style.top = this._mousePos.y + 'px'
            }
            d.style.width = Math.abs(b) + 'px';
            d.style.height = Math.abs(c) + 'px'
        }
        function l() {
            h.removeChild(d);
            h.style.cursor = '';
            CM.DomEvent.enableTextSelection();
            CM.DomEvent.removeListener(h, 'mousemove', j);
            CM.DomEvent.removeListener(h, 'mouseup', l);
            var a = Math.abs(this._mousePos.x - f);
            var b = Math.abs(this._mousePos.y - g);
            f = Math.min(this._mousePos.x, f);
            g = Math.min(this._mousePos.y, g);
            var c = new CM.LatLngBounds(this.fromContainerPixelToLatLng(new CM.Point(f, g + b)), this.fromContainerPixelToLatLng(new CM.Point(f + a, g)));
            this.zoomToBounds(c)
        }
        function k(a) {
            if (!a.shiftKey || ((a.which != 1) && (a.button != 1))) {
                return false
            }
            CM.DomEvent.disableTextSelection();
            f = this._mousePos.x;
            g = this._mousePos.y;
            d = document.createElement('div');
            d.className = 'wml-shift-drag-box';
            d.style.top = g + 'px';
            d.style.left = f + 'px';
            h.appendChild(d);
            h.style.cursor = 'crosshair';
            CM.DomEvent.addListener(h, 'mousemove', j, this);
            CM.DomEvent.addListener(h, 'mouseup', l, this);
            CM.DomEvent.preventDefault(a)
        }
        CM.DomEvent.addListener(h, 'mousedown', k, this);
        this._shiftDragZoomEnabled = true;
        this.disableShiftDragZoom = function () {
            CM.DomEvent.removeListener(h, 'mousedown', k);
            this._shiftDragZoomEnabled = false
        }
    },
    shiftDragZoomEnabled: function () {
        return !!this._shiftDragZoomEnabled
    }
});
CM.Animation = function (a, b) {
    this.element = a;
    b = CM.Util.extend({
        duration: 200,
        fps: 50,
        transition: CM.Animation.Transitions.SINE_OUT
    }, b);
    CM.Util.extend(this, b)
};
CM.Animation.getTime = Date.now ||
function () {
    return +new Date()
};
CM.Animation.prototype = {
    start: function (a) {
        var b;
        CM.Event.fire(this, 'animationstart');
        this.properties = a;
        for (var c in this.properties) {
            if (this.properties.hasOwnProperty(c)) {
                b = this.properties[c];
                if (isNaN(b.to)) {
                    throw "Every animated property should have 'to' attribute";
                }
                b.from = b.from || parseInt(this.element.style[c]);
                b.unit = b.unit || 'px'
            }
        }
        if (this.timer) {
            clearInterval(this.timer)
        }
        this.timer = setInterval(CM.Util.bind(this.step, this), Math.round(1000 / this.fps));
        this.startTime = CM.Animation.getTime()
    },
    step: function () {
        var a = CM.Animation.getTime();
        if (a < this.startTime + this.duration) {
            var b = this.transition((a - this.startTime) / this.duration);
            this.set(b)
        } else {
            this.set(1);
            this.complete()
        }
    },
    set: function (a) {
        var b;
        for (var c in this.properties) {
            if (this.properties.hasOwnProperty(c)) {
                b = this.properties[c];
                this.element.style[c] = ((b.to - b.from) * a + b.from) + b.unit
            }
        }
        CM.Event.fire(this, 'animation')
    },
    complete: function () {
        clearInterval(this.timer);
        this.timer = null;
        CM.Event.fire(this, 'animationend')
    }
};
CM.Animation.Transitions = {
    LINEAR: function (a) {
        return a
    },
    SINE_OUT: function (a) {
        return Math.sin(a * Math.PI / 2)
    }
};
CM.Map.prototype.panBy = function (a) {
    if (!this._panFx) {
        this._panFx = new CM.Animation(this._mapLayer);
        CM.Event.addListener(this._panFx, 'animationend', function () {
            CM.Event.fire(this, 'moveend')
        }, this);
        var b = CM.Util.limitExecByInterval(this._resetView, 200, this);
        CM.Event.addListener(this._panFx, 'animation', function () {
            b();
            CM.Event.fire(this, 'move')
        }, this)
    }
    CM.Event.fire(this, 'movestart');
    this._panFx.start({
        top: {
            to: parseInt(this._mapLayer.style.top) - a.height
        },
        left: {
            to: parseInt(this._mapLayer.style.left) - a.width
        }
    })
};
CM.TOP_LEFT = ['left', 'top'];
CM.TOP_RIGHT = ['right', 'top'];
CM.BOTTOM_LEFT = ['left', 'bottom'];
CM.BOTTOM_RIGHT = ['right', 'bottom'];
CM.ControlPosition = function (a, b) {
    this._anchor = a;
    this._offset = b || new CM.Size(0, 0)
};
CM.ControlPosition.prototype.applyTo = function (a) {
    a.style.position = 'absolute';
    a.style[this._anchor[0]] = this._offset.width + 'px';
    a.style[this._anchor[1]] = this._offset.height + 'px'
};
CM.Copyright = function () {};
CM.Copyright.prototype = {
    initialize: function (a) {
        var b = document.createElement('div');
        b.className = 'wml-copyright';
        var c = document.createElement('div');
        c.className = 'wml-text-background';
        var d = document.createElement('div');
        d.className = 'wml-copyright-text';
        d.innerHTML = a.getCurrentTileLayer().getCopyright();
        b.appendChild(c);
        b.appendChild(d);
        CM.Event.addListener(a, 'tilelayerchanged', function () {
            d.innerHTML = a.getCurrentTileLayer().getCopyright()
        });
        return b
    },
    getDefaultPosition: function () {
        return new CM.ControlPosition(CM.BOTTOM_RIGHT)
    }
};
CM.PermalinkControl = function () {};
CM.PermalinkControl.prototype = {
    initialize: function (a) {
        this._map = a;
        var b = document.createElement('div');
        b.className = 'wml-permalink';
        var c = document.createElement('div');
        c.className = 'wml-text-background';
        this._link = document.createElement('a');
        this._link.innerHTML = 'Permalink';
        if (this._map.isLoaded()) {
            this._update();
            this._usePermalink()
        } else {
            CM.Event.addListener(this._map, 'load', this._update, this);
            CM.Event.addListener(this._map, 'load', this._usePermalink, this)
        }
        CM.Event.addListener(this._map, 'moveend', this._update, this);
        CM.Event.addListener(this._map, 'tilelayerchanged', this._update, this);
        b.appendChild(c);
        b.appendChild(this._link);
        return b
    },
    getDefaultPosition: function () {
        return new CM.ControlPosition(CM.TOP_RIGHT, new CM.Size(0, 0))
    },
    remove: function (a) {
        CM.Event.removeListener(a, 'tilelayerchanged', this._update, this);
        CM.Event.removeListener(a, 'load', this._update, this);
        CM.Event.removeListener(a, 'load', this._usePermalink, this);
        CM.Event.removeListener(a, 'moveend', this._update, this)
    },
    _update: function () {
        this._link.href = this._getPermalink()
    },
    _usePermalink: function () {
        var a = parseFloat(this._getUrlParam('lat'));
        var b = parseFloat(this._getUrlParam('lng'));
        var c = parseInt(this._getUrlParam('zoom'));
        var d = parseInt(this._getUrlParam('layer'));
        var f = this._getUrlParam('marker');
        if (this._areNumbers([a, b, c])) {
            var g = new CM.LatLng(a, b);
            this._map.setCenter(g, c);
            if (f && CM.Marker) {
                this._map.addOverlay(new CM.Marker(g, {
                    clickable: false
                }))
            }
            if (!isNaN(d)) {
                for (var h = 0, j = this._map.getTileLayers(); h < j.length; h++) {
                    if (j[h].getId() == d) {
                        this._map.setTileLayer(j[h])
                    }
                }
            }
        }
    },
    _getPermalink: function () {
        function c(a) {
            var b = Math.pow(10, 6);
            return Math.round(a * b) / b
        }
        var d = this._map.getCenter(),
            f = c(d.lat()),
            g = c(d.lng()),
            h = this._map.getZoom(),
            j = this._map.getCurrentTileLayer().getId();
        var l = window.location.href.split('#');
        var k = l[0];
        k = this._removeUrlParams(k, ['lat', 'lng', 'zoom', 'layer']);
        k += (k.match(/\?.+/) ? '&' : '?') + 'lat=' + f;
        k += '&lng=' + g;
        k += '&zoom=' + h;
        if (this._map.getTileLayers().length > 1) {
            k += '&layer=' + j
        }
        return k + (l[1] ? '#' + l[1] : '')
    },
    _getUrlParam: function (a) {
        a = a.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var b = new RegExp("[\\?&]" + a + "=([^&#]*)");
        var c = location.href.match(b);
        return (c ? c[1] : "")
    },
    _removeUrlParams: function (a, b) {
        for (var c = 0; c < b.length; c++) {
            a = a.replace(new RegExp("[&\?]" + b[c] + "=[^&#\?]+", 'g'), '')
        }
        return (a.indexOf('?') != -1 ? a : a.replace('&', '?'))
    },
    _areNumbers: function (a) {
        for (var b = 0; b < a.length; b++) {
            if (isNaN(a[b])) {
                return false
            }
        }
        return true
    }
};
CM.ScaleControl = function () {};
CM.ScaleControl.prototype = {
    initialize: function (a) {
        this._map = a;
        var b = document.createElement('div');
        b.className = 'wml-scale-control';
        var c = document.createElement('div');
        c.className = 'wml-text-background';
        this._mScale = document.createElement('div');
        this._mScale.className = 'wml-scale-control-m';
        this._fScale = document.createElement('div');
        this._fScale.className = 'wml-scale-control-f';
        b.appendChild(c);
        b.appendChild(this._mScale);
        b.appendChild(this._fScale);
        if (this._map.isLoaded()) {
            this._update()
        } else {
            CM.Event.addListener(this._map, 'load', this._update, this)
        }
        CM.Event.addListener(a, 'moveend', this._update, this);
        return b
    },
    getDefaultPosition: function () {
        return new CM.ControlPosition(CM.BOTTOM_LEFT)
    },
    _update: function () {
        var a = 100;
        var b = this._map.getSize();
        var c = this._map.fromContainerPixelToLatLng(new CM.Point(0, b.height));
        var d = this._map.getCurrentTileLayer().getProjection().getResolution(this._map.getZoom());
        var f = a * d * Math.cos(c.latRadians()),
            g = this._getRoundedLength(f);
        this._mScale.style.width = parseInt(a * g / f) + 'px';
        this._mScale.innerHTML = (g < 1000 ? g + ' m' : g / 1000 + ' km');
        var h = f * 3.2808399;
        if (h > 5280) {
            var j = h / 5280;
            var l = this._getRoundedLength(j);
            this._fScale.style.width = parseInt(a * l / j) + 'px';
            this._fScale.innerHTML = l + ' mi'
        } else {
            var k = this._getRoundedLength(h);
            this._fScale.style.width = parseInt(a * k / h) + 'px';
            this._fScale.innerHTML = k + ' ft'
        }
    },
    _getRoundedLength: function (a) {
        var b = Math.pow(10, parseInt(a).toString().length - 1),
            c = parseInt(a / b);
        return (c >= 5 ? 5 : (c >= 2 ? 2 : 1)) * b
    },
    remove: function (a) {
        if (!this._map.isLoaded()) {
            CM.Event.addListener(a, 'load', this._update, this)
        }
        CM.Event.removeListener(a, 'moveend', this._update, this)
    }
};
(function () {
    function g(a, b, c) {
        var d = document.createElement('a');
        d.href = '';
        d.title = a;
        d.className = b;
        CM.DomEvent.stopMousePropagation(d);
        CM.DomEvent.addListener(d, 'click', CM.DomEvent.preventDefault);
        d.onclick = c;
        return d
    }
    CM.SmallMapControl = function () {};
    CM.SmallMapControl.prototype = {
        initialize: function (a) {
            var b = document.createElement('div');
            b.className = 'wml-map-control';
            var c = document.createElement('div');
            c.className = 'wml-map-control-bottom';
            b.appendChild(c);
            var d = g('Zoom in', 'wml-button-zoom-in', function () {
                a.zoomIn()
            });
            var f = g('Zoom out', 'wml-button-zoom-out', function () {
                a.zoomOut()
            });
            b.appendChild(d);
            b.appendChild(f);
            return b
        },
        getDefaultPosition: function () {
            return new CM.ControlPosition(CM.TOP_LEFT, new CM.Size(10, 10))
        }
    }
})();
(function () {
    function m(a, b, c) {
        var d = document.createElement('a');
        d.href = '';
        d.title = a;
        d.className = b;
        CM.DomEvent.stopMousePropagation(d);
        CM.DomEvent.addListener(d, 'click', CM.DomEvent.preventDefault);
        d.onclick = c;
        return d
    }
    CM.LargeMapControl = function () {};
    CM.LargeMapControl.prototype = {
        initialize: function (d) {
            var f = document.createElement('div');
            f.className = 'wml-map-control';
            this._map = d;
            this._container = f;
            var g = document.createElement('div');
            g.className = 'wml-map-control-bottom';
            f.appendChild(g);
            var h = m('Zoom in', 'wml-button-zoom-in', function () {
                d.zoomIn()
            });
            var j = m('Zoom out', 'wml-button-zoom-out', function () {
                d.zoomOut()
            });
            f.appendChild(h);
            f.appendChild(j);
            this._slider = document.createElement('div');
            this._slider.className = 'wml-zoom-slider';
            CM.DomEvent.stopMousePropagation(this._slider);
            this._handle = document.createElement('div');
            this._handle.className = 'wml-zoom-handle';
            this._handle.style.left = '0';
            this._slider.appendChild(this._handle);
            this._updateSlider();
            if (d.isLoaded()) {
                this._initZoomLabels();
                this._updateHandle()
            } else {
                CM.Event.addListener(d, 'load', this._initZoomLabels, this);
                CM.Event.addListener(d, 'load', this._updateHandle, this)
            }
            CM.Event.addListener(d, 'zoomend', this._updateHandle, this);
            CM.Event.addListener(d, 'tilelayerchanged', this._updateHandle, this);
            var l = new CM.DraggableObject(this._handle, {
                container: this._map.getContainer(),
                draggingCursor: 'n-resize'
            });
            var k = this;
            l._updatePosition = function () {
                var a = Math.min(k._sliderHeight - 9, Math.max(0, this.top));
                this._element.style.top = a + 'px'
            };
            CM.Event.addListener(l, 'dragend', function () {
                var a = k._getZoom(parseInt(this._handle.style.top) + 4);
                var b = d.getZoom();
                if (a != b) {
                    d.setZoom(a)
                } else {
                    this._updateHandle()
                }
            }, this);
            CM.DomEvent.addListener(this._slider, 'click', function (a) {
                if (l.started) {
                    return
                }
                var b = CM.DomEvent.getMousePosition(a);
                var c = b.y - CM.Util.getCumulativeOffset(this._slider).y;
                d.setZoom(this._getZoom(c))
            }, this);
            CM.DomEvent.addListener(this._handle, 'click', CM.DomEvent.stopPropagation);
            this._container.appendChild(this._slider);
            return this._container
        },
        _getZoom: function (a) {
            return this._map.getCurrentTileLayer().getMaxZoomLevel() - Math.floor(a / 9)
        },
        _updateSlider: function () {
            var a = this._map.getCurrentTileLayer();
            this._sliderHeight = (a.getMaxZoomLevel() - a.getMinZoomLevel() + 1) * 9;
            this._slider.style.height = this._sliderHeight + 'px';
            this._container.style.height = (this._sliderHeight + 45) + 'px'
        },
        _updateHandle: function () {
            var a = this._map.getZoom();
            this._handle.style.top = (this._sliderHeight - (a + 1) * 9) + 'px';
            if (this._lastSelected && (!this._labels[a] || (this._labels[a] != this._lastSelected))) {
                this._lastSelected.className = 'wml-zoom-label'
            }
            if (this._labels[a]) {
                this._labels[a].className = 'wml-zoom-label wml-zoom-label-selected';
                this._lastSelected = this._labels[a]
            }
        },
        _initZoomLabels: function () {
            this._labelContainer = document.createElement('div');
            this._labelContainer.className = 'wml-zoom-label-container';
            this._labelContainer.style.visibility = 'hidden';
            this._labels = {};
            CM.DomEvent.addListener(this._container, 'mouseover', function (a) {
                if (!CM.DomEvent.mouseEntered(a, this._container)) {
                    return
                }
                clearTimeout(this._labelTimer);
                this._labelContainer.style.visibility = ''
            }, this);
            CM.DomEvent.addListener(this._container, 'mouseout', function (a) {
                if (!CM.DomEvent.mouseLeft(a, this._container)) {
                    return
                }
                this._labelTimer = setTimeout(CM.Util.bind(function () {
                    this._labelContainer.style.visibility = 'hidden'
                }, this), 1000)
            }, this);
            var c = this._map.getZoom();
            for (var d in this.zoomLabelConfig) {
                if (this.zoomLabelConfig.hasOwnProperty(d)) {
                    (function (a) {
                        var b = document.createElement('a');
                        b.className = 'wml-zoom-label';
                        if (c == a) {
                            b.className += ' wml-zoom-label-selected';
                            this._lastSelected = b
                        }
                        b.innerHTML = this.zoomLabelConfig[a];
                        b.href = '#zoom-to-' + a;
                        b.onclick = CM.Util.bind(function () {
                            this._map.setZoom(a);
                            return false
                        }, this);
                        b.style.top = (22 + this._sliderHeight - (a + 1) * 9) + 'px';
                        this._labels[a] = b;
                        this._labelContainer.appendChild(b)
                    }).call(this, parseInt(d))
                }
            }
            this._container.appendChild(this._labelContainer)
        },
        getDefaultPosition: function () {
            return new CM.ControlPosition(CM.TOP_LEFT, new CM.Size(10, 10))
        },
        zoomLabelConfig: {
            17: "Building",
            13: "Neighborhood",
            9: "County",
            5: "Country",
            1: "Region"
        }
    }
})();
CM.TileLayerControl = function () {};
CM.TileLayerControl.prototype = {
    initialize: function (a) {
        this._container = document.createElement('div');
        this._container.className = 'wml-tile-layer-control';
        CM.DomEvent.stopMousePropagation(this._container);
        this._map = a;
        this._layers = a.getTileLayers();
        for (var b = 0; b < this._layers.length; b++) {
            this._addLayer(this._layers[b])
        }
        this._update();
        CM.Event.addListener(a, 'tilelayerchanged', this._update, this);
        CM.Event.addListener(a, 'tilelayeradded', this._onLayerAdded, this);
        CM.Event.addListener(a, 'tilelayerremoved', this._onLayerRemoved, this);
        return this._container
    },
    getDefaultPosition: function () {
        return new CM.ControlPosition(CM.TOP_RIGHT)
    },
    remove: function (a) {
        CM.Event.removeListener(a, 'tilelayerchanged', this._update, this);
        CM.Event.removeListener(a, 'tilelayeradded', this._onLayerAdded, this);
        CM.Event.removeListener(a, 'tilelayerremoved', this._onLayerRemoved, this)
    },
    _addLayer: function (b) {
        var c = document.createElement('a');
        c.href = '#';
        c.innerHTML = b.getTitle();
        c.className = 'wml-tile-layer-control-link';
        var d = this._map;
        c.onclick = function (a) {
            d.setTileLayer(b);
            return false
        };
        this._links = this._links || {};
        this._links[b.getId()] = c;
        this._container.appendChild(c)
    },
    _onLayerRemoved: function (a) {
        var b = a.getId();
        this._links[b].parentNode.removeChild(this._links[b]);
        delete this._links[b];
        this._update()
    },
    _onLayerAdded: function (a) {
        this._addLayer(a);
        this._update()
    },
    _update: function () {
        var a = 'wml-tile-layer-control-link-active',
            b = this._container.getElementsByTagName('a'),
            c = this._links[this._map.getCurrentTileLayer().getId()];
        for (var d = 0; d < b.length; d++) {
            b[d].className = b[d].className.replace(' ' + a, '')
        }
        c.className += ' ' + a
    }
};
CM.OverviewMapControl = function () {};
CM.OverviewMapControl.prototype = {
    initialize: function (b) {
        this._map = b;
        this._container = document.createElement('div');
        this._container.className = 'wml-overview-map-control';
        this._container.style.width = '120px';
        this._container.style.height = '120px';
        CM.DomEvent.addListener(this._container, 'dblclick', CM.DomEvent.stopPropagation);
        CM.DomEvent.addListener(this._container, 'mousewheel', CM.DomEvent.stopPropagation);
        var c = b.getCurrentTileLayer();
        var d = CM.Util.extend(c._options, {
            copyright: ''
        });
        var f = new c.constructor(d);
        this._overviewMap = new CM.Map(this._container, f);
        this._overviewMap.disableMouseZoom();
        CM.Event.addListener(b, 'moveend', this._onMoveEnd, this);
        CM.Event.addListener(this._overviewMap, 'dragend', this._onOverviewMoveEnd, this);
        CM.Event.addListener(this._overviewMap, 'click', function (a) {
            if (!this._rectDragObject.moved()) {
                this._map.panTo(a)
            }
        }, this);
        b.getContainer().appendChild(this._container);
        this._initRect();
        this._onMoveEnd();
        return this._container
    },
    remove: function (a) {
        CM.Event.removeListener(a, 'moveend', this._onMoveEnd, this)
    },
    _initRect: function () {
        this._rect = document.createElement('div');
        this._rect.className = 'wml-overview-map-rect';
        this._container.appendChild(this._rect);
        this._rectShadow = document.createElement('div');
        this._rectShadow.className = 'wml-overview-map-rect wml-overview-map-rect-shadow';
        this._container.appendChild(this._rectShadow);
        this._rectDragObject = new CM.DraggableObject(this._rectShadow, {
            container: this._container
        });
        CM.Event.addListener(this._rectDragObject, 'dragend', this._onRectShadowDragEnd, this)
    },
    _onRectShadowDragEnd: function () {
        var a = this._rectShadow.clientWidth,
            b = this._rectShadow.clientHeight,
            c = parseInt(this._rectShadow.style.left),
            d = parseInt(this._rectShadow.style.top),
            f = new CM.Point(c + a / 2, d + b / 2);
        this._map.panTo(this._overviewMap.fromContainerPixelToLatLng(f))
    },
    _onMoveEnd: function () {
        var a = this._map.getBounds(),
            b = Math.max(0, this._overviewMap.getBoundsZoomLevel(a) - 1);
        this._overviewMap.setCenter(this._map.getCenter(), b);
        var c = this._overviewMap.fromLatLngToDivPixel(a.getSouthWest()),
            d = this._overviewMap.fromLatLngToDivPixel(a.getNorthEast());
        if (c.x > d.x) {
            c.x -= this._overviewMap.getCurrentTileLayer().getProjection().getWrapWidth(b)
        }
        var f = c.y - d.y,
            g = d.x - c.x;
        if (g >= this._container.clientWidth || f >= this._container.clientHeight) {
            this._rect.style.visibility = 'hidden';
            this._rectShadow.style.visibility = 'hidden'
        } else {
            this._rect.style.visibility = 'visible';
            this._rectShadow.style.visibility = 'visible'
        }
        var h = this._overviewMap.getSize();
        this._rect.style.height = this._rectShadow.style.height = f + 'px';
        this._rect.style.width = this._rectShadow.style.width = g + 'px';
        this._rect.style.top = this._rectShadow.style.top = Math.round(h.height / 2 - f / 2) + 'px';
        this._rect.style.left = this._rectShadow.style.left = Math.round(h.width / 2 - g / 2) + 'px'
    },
    _onOverviewMoveEnd: function () {
        this._map.panTo(this._overviewMap.getCenter())
    },
    getDefaultPosition: function () {
        return new CM.ControlPosition(CM.BOTTOM_LEFT, new CM.Size(0, 32))
    }
};
CM = window.CM || {};
CM.Icon = function (a, b) {
    if (a) {
        CM.Util.extend(this, a);
        this.image = b || this.image
    }
};
(function () {
    var a = new CM.Icon(),
        b = CM.Util.getRootUrl();
    a.image = b + 'images/marker.png';
    a.shadow = b + 'images/marker-shadow.png';
    a.printImage = b + 'images/marker.gif';
    a.iconSize = new CM.Size(24, 37);
    a.shadowSize = new CM.Size(42, 37);
    a.iconAnchor = new CM.Point(12, 37);
    a.infoWindowAnchor = new CM.Point(0, -30);
    CM.DEFAULT_ICON = a
})();
CM.Marker = function (a, b) {
    this._position = a;
    this._setOptions(b);
    this._id = CM.Util.generateId()
};
CM.Marker.prototype = {
    initialize: function (a) {
        this._map = a;
        if (!this._image) {
            this._image = CM.Util.createImage(this._options.icon.image);
            this._image.className = 'wml-marker';
            if (this._options.icon.iconSize) {
                this._image.style.width = this._options.icon.iconSize.width + 'px';
                this._image.style.height = this._options.icon.iconSize.height + 'px'
            } else if (!CM.Util.Browser.isIE6) {
                this._image.style.visibility = 'hidden'
            }
            if (this._options.title) {
                this._image.title = this._options.title
            }
            if (this._options.icon.shadow) {
                this._shadowImage = CM.Util.createImage(this._options.icon.shadow);
                this._shadowImage.className = 'wml-marker-shadow';
                this._shadowImage.style.width = this._options.icon.shadowSize.width + 'px';
                this._shadowImage.style.height = this._options.icon.shadowSize.height + 'px'
            }
            if (CM.Util.Browser.isIE6 && this._options.icon.printImage) {
                this._printImage = document.createElement('img');
                this._printImage.className = 'wml-marker-print';
                this._printImage.src = this._options.icon.printImage;
                this._printImage.style.width = this._options.icon.iconSize.width + 'px';
                this._printImage.style.height = this._options.icon.iconSize.height + 'px'
            } else {
                this._image.className += ' wml-marker-print'
            }
            this._initEvents()
        }
        this._map.getPane(CM.Map.MARKER_PANE).appendChild(this._image);
        if (this._shadowImage) {
            this._map.getPane(CM.Map.MARKER_SHADOW_PANE).appendChild(this._shadowImage)
        }
        if (this._printImage) {
            this._map.getPane(CM.Map.MARKER_PANE).appendChild(this._printImage)
        }
        if (this._options.icon.iconSize || CM.Util.Browser.isIE6) {
            this.redraw(true)
        } else {
            var b = CM.Util.bind(function () {
                this._options.icon.iconAnchor = new CM.Point(this._image.width / 2, this._image.height / 2);
                this.redraw(true);
                this._image.style.visibility = ''
            }, this);
            if (this._image.width) {
                b()
            } else {
                this._image.onload = b
            }
        }
        CM.Event.addListener(a, 'zoomend', this._forceRedraw, this);
        CM.Event.addListener(a, 'tilelayerchanged', this._forceRedraw, this)
    },
    redraw: function (a) {
        var b, c, d, f;
        if (a) {
            f = this._map.fromLatLngToDivPixel(this._position);
            b = (f.x - this._options.icon.iconAnchor.x);
            c = (f.y - this._options.icon.iconAnchor.y);
            this._image.style.left = b + 'px';
            this._image.style.top = c + 'px'
        } else {
            b = parseInt(this._image.style.left);
            c = parseInt(this._image.style.top)
        }
        d = c;
        this._image.style.zIndex = d;
        if (this._shadowImage) {
            this._shadowImage.style.left = b + 'px';
            this._shadowImage.style.top = c + 'px'
        }
        if (this._printImage) {
            this._printImage.style.left = b + 'px';
            this._printImage.style.top = c + 'px';
            this._printImage.style.zIndex = d
        }
    },
    _forceRedraw: function () {
        this.redraw(true)
    },
    remove: function (a) {
        a.getPane(CM.Map.MARKER_PANE).removeChild(this._image);
        if (this._shadowImage) {
            a.getPane(CM.Map.MARKER_SHADOW_PANE).removeChild(this._shadowImage)
        }
        if (this._printImage) {
            this._map.getPane(CM.Map.MARKER_PANE).removeChild(this._printImage)
        }
        CM.Event.removeListener(a, 'zoomend', this._forceRedraw, this);
        CM.Event.removeListener(a, 'tilelayerchanged', this._forceRedraw, this);
        CM.Event.fire(this, 'remove', true)
    },
    enableDragging: function () {
        if (!this._dragObject) {
            this._dragObject = new CM.DraggableObject(this._image, {
                container: this._map.getContainer()
            });
            CM.Event.addListener(this._dragObject, 'drag', function () {
                this.redraw(false);
                this._updateLatLng();
                CM.Event.fire(this, 'drag');
                CM.Event.fire(this, 'move')
            }, this);
            CM.Event.addListener(this._dragObject, 'dragend', function () {
                CM.Event.fire(this, 'dragend');
                CM.Event.fire(this, 'moveend')
            }, this);
            CM.Event.addListener(this._dragObject, 'dragstart', function () {
                CM.Event.fire(this, 'dragstart');
                CM.Event.fire(this, 'movestart')
            }, this)
        } else {
            this._dragObject.enable()
        }
        this._draggingEnabled = true
    },
    disableDragging: function () {
        this._dragObject.disable();
        this._draggingEnabled = false
    },
    draggingEnabled: function () {
        return !!this._draggingEnabled
    },
    getIcon: function () {
        return this._options.icon
    },
    getTitle: function () {
        return this._options.title
    },
    getLatLng: function () {
        return this._position
    },
    setLatLng: function (a) {
        this._position = a;
        if (this._map) {
            this.redraw(true)
        }
    },
    hide: function () {
        if (!this._hidden) {
            this._image.style.visibility = 'hidden';
            if (this._shadowImage) {
                this._shadowImage.style.visibility = 'hidden'
            }
            if (this._printImage) {
                this._printImage.style.visibility = 'hidden'
            }
            this._hidden = true;
            CM.Event.fire(this, 'visibilitychanged', false)
        }
    },
    show: function () {
        if (this._hidden) {
            this._image.style.visibility = '';
            if (this._shadowImage) {
                this._shadowImage.style.visibility = ''
            }
            if (this._printImage) {
                this._printImage.style.visibility = ''
            }
            this._hidden = false;
            CM.Event.fire(this, 'visibilitychanged', true)
        }
    },
    isHidden: function () {
        return this._hidden
    },
    _updateLatLng: function () {
        this._position = this._map.fromDivPixelToLatLng(new CM.Point(this._dragObject.left + this._options.icon.iconAnchor.x, this._dragObject.top + this._options.icon.iconAnchor.y))
    },
    _createMouseHandler: function (b) {
        return function (a) {
            if (this._draggingEnabled && this._dragObject.moved()) {
                return false
            }
            CM.Event.fire(this, b, this._position);
            CM.DomEvent.stopPropagation(a)
        }
    },
    _setOptions: function (a) {
        var b = {
            clickable: true,
            draggable: false,
            hoverable: true,
            icon: CM.DEFAULT_ICON,
            title: ''
        };
        this._options = CM.Util.extend(b, a || {});
        if (this._options.draggable) {
            this._options.clickable = true
        }
        if (!this._options.icon.iconAnchor && this._options.icon.iconSize) {
            this._options.icon.iconAnchor = new CM.Point(Math.round(this._options.icon.iconSize.width / 2), Math.round(this._options.icon.iconSize.height / 2))
        }
    },
    _initEvents: function () {
        if (this._options.draggable) {
            this.enableDragging()
        }
        if (this._options.clickable) {
            this._image.style.cursor = 'pointer';
            CM.DomEvent.stopMousePropagation(this._image);
            CM.DomEvent.addListener(this._image, 'click', this._createMouseHandler('click'), this);
            CM.DomEvent.addListener(this._image, 'dblclick', this._createMouseHandler('dblclick'), this)
        }
        if (this._options.hoverable) {
            CM.DomEvent.addListener(this._image, 'mouseover', this._createMouseHandler('mouseover'), this);
            CM.DomEvent.addListener(this._image, 'mouseout', this._createMouseHandler('mouseout'), this)
        }
    }
};
CM.InfoWindow = function (a) {
    this._map = a
};
CM.InfoWindow.prototype = {
    open: function (a, b, c) {
        this._position = a;
        this._setOptions(c);
        if (!this._container) {
            this._initLayout()
        }
        setTimeout(CM.Util.bind(function () {
            if (typeof b == 'string') {
                this._contentNode = null;
                this._content.innerHTML = b
            } else {
                this._content.innerHTML = '';
                this._contentNode = b;
                this._content.appendChild(b)
            }
            this._updateLayout();
            this._updatePosition();
            if (this._options.autoPan) {
                this._adjustMapPan()
            }
            this._container.style.visibility = '';
            this._open = true;
            CM.Event.fire(this._map, 'infowindowopen')
        }, this), 0);
        CM.Event.addListener(this._map, 'zoomend', this._updatePosition, this);
        CM.Event.addListener(this._map, 'tilelayerchanged', this._updatePosition, this);
        if (!this._options.noCloseOnClick) {
            CM.Event.addListener(this._map, 'click', this.close, this)
        }
    },
    isClosed: function () {
        return !this._open
    },
    close: function () {
        if (this._open) {
            this._container.style.visibility = 'hidden';
            if (this._contentNode) {
                this._content.removeChild(this._contentNode)
            } else {
                this._content.innerHTML = ''
            }
            this._open = false;
            CM.Event.removeListener(this._map, 'zoomend', this._updatePosition, this);
            CM.Event.removeListener(this._map, 'tilelayerchanged', this._updatePosition, this);
            if (!this.noCloseOnClick) {
                CM.Event.removeListener(this._map, 'click', this.close, this)
            }
            CM.Event.fire(this._map, 'infowindowclose')
        }
    },
    hide: function () {
        if (!this._hidden) {
            this._container.style.visibility = 'hidden';
            this._hidden = true;
            CM.Event.fire(this, 'visibilitychanged', false)
        }
    },
    show: function () {
        if (this._hidden) {
            this._container.style.visibility = '';
            this._hidden = false;
            CM.Event.fire(this, 'visibilitychanged', true)
        }
    },
    isHidden: function () {
        return (this._open ? !! this._hidden : true)
    },
    getLatLng: function () {
        return (this._open ? this._position : null)
    },
    getPixelOffset: function () {
        return (this._open ? this._options.pixelOffset : null)
    },
    updateContent: function (a) {
        if (this._contentNode) {
            this._content.removeChild(this._contentNode)
        } else {
            this._content.innerHTML = ''
        }
        if (typeof a == 'string') {
            this._contentNode = null;
            this._content.innerHTML = a
        } else {
            this._contentNode = a;
            this._content.appendChild(a)
        }
        this._updateLayout();
        this._updatePosition();
        if (this._options.autoPan) {
            this._adjustMapPan()
        }
    },
    _setOptions: function (a) {
        var b = {
            maxWidth: Math.min(this._map.getSize().width - 100, 600),
            pixelOffset: new CM.Size(0, 0),
            noCloseOnClick: false,
            autoPan: true
        };
        this._options = CM.Util.extend(b, a || {})
    },
    _initLayout: function () {
        this._container = document.createElement('div');
        this._container.className = 'wml-info-window';
        var b = document.createElement('a');
        b.href = '#';
        b.className = 'wml-info-window-close';
        CM.DomEvent.addListener(b, 'click', function (a) {
            this.close();
            CM.DomEvent.preventDefault(a)
        }, this);
        CM.DomEvent.stopMousePropagation(b);
        this._content = document.createElement('div');
        this._content.className = 'wml-info-window-content';
        this._container.appendChild(b);
        this._container.appendChild(this._content);
        this._initTip();
        this._container.style.visibility = 'hidden';
        this._map.getPane(CM.Map.INFO_WINDOW_PANE).appendChild(this._container);
        CM.DomEvent.stopMousePropagation(this._content)
    },
    _initTip: function () {
        var a = CM.Util.createImage(CM.Util.getRootUrl() + 'images/info-tip.png');
        a.className = 'wml-info-window-tip';
        this._container.appendChild(a)
    },
    _updatePosition: function () {
        var a = this._map.fromLatLngToDivPixel(this._position);
        this._container.style.bottom = (-a.y - this._anchor.y - this._options.pixelOffset.height) + 'px';
        this._container.style.left = (a.x - this._anchor.x + this._options.pixelOffset.width) + 'px'
    },
    _adjustMapPan: function () {
        var a = new CM.Point(parseInt(this._container.style.left), (-this._container.offsetHeight - parseInt(this._container.style.bottom))),
            b = this._map.getPane(CM.Map.MAP_PANE),
            c = new CM.Point(a.x + parseInt(b.style.left), a.y + parseInt(b.style.top)),
            d = this._map.getSize(),
            f = 0,
            g = 0;
        if (c.x < 0) {
            f = c.x - 5
        }
        if (c.x + this._container.offsetWidth > d.width) {
            f = c.x + this._container.offsetWidth - d.width + 5
        }
        if (c.y < 0) {
            g = c.y - 5
        }
        if (c.y + this._container.offsetHeight > d.height) {
            g = c.y + this._container.offsetHeight - d.height + 5
        }
        if (f || g) {
            this._map.panBy(new CM.Size(f, g))
        }
    },
    _updateLayout: function () {
        this._container.style.width = '';
        this._container.style.whiteSpace = 'nowrap';
        if (CM.Util.Browser.isIE) {
            this._content.style.zoom = '1'
        }
        if (this._container.offsetWidth > this._options.maxWidth) {
            this._container.style.width = this._options.maxWidth + 'px'
        } else {
            var a = this._container.offsetWidth;
            if (this._content.offsetHeight < 60) {
                a += 20
            }
            this._container.style.width = a + 'px'
        }
        this._container.style.whiteSpace = '';
        if (CM.Util.Browser.isIE) {
            this._content.style.zoom = ''
        }
        this._anchor = new CM.Point(this._container.offsetWidth / 2, 0)
    }
};
CM.Util.extend(CM.Map.prototype, {
    openInfoWindow: function (a, b, c, d) {
        if (this.infoWindowEnabled()) {
            this.closeInfoWindow();
            this.getInfoWindow(d).open(a, b, c)
        }
    },
    closeInfoWindow: function () {
        if (this._infoWindow && !this._infoWindow.isClosed()) {
            this._infoWindow.close()
        }
    },
    getInfoWindow: function (a) {
        a = a || CM.InfoWindow;
        if (!a._id) {
            a._id = CM.Util.generateId()
        }
        this._infoWindows = this._infoWindows || {};
        if (!this._infoWindows[a._id]) {
            this._infoWindows[a._id] = new a(this)
        }
        this._prevInfoWindow = this._infoWindow;
        this._infoWindow = this._infoWindows[a._id];
        return this._infoWindow
    },
    enableInfoWindow: function () {
        this._infoWindowDisabled = false
    },
    disableInfoWindow: function () {
        this.closeInfoWindow();
        this._infoWindowDisabled = true
    },
    infoWindowEnabled: function () {
        return !this._infoWindowDisabled
    }
});
if (CM.Marker) {
    CM.Util.extend(CM.Marker.prototype, {
        openInfoWindow: function (a, b, c) {
            if (this._infoWindowOpened) {
                return
            }
            var d = this._options.icon.infoWindowAnchor ? this._options.icon.infoWindowAnchor.toSize() : new CM.Size(0, 0);
            b = CM.Util.extend({
                pixelOffset: d
            }, b);
            this._map.openInfoWindow(this._position, a, b, c);
            CM.Event.addListener(this._map, 'infowindowopen', this._onInfoWindowOpen, this);
            CM.Event.addListener(this._map, 'infowindowclose', this._onInfoWindowClose, this);
            CM.Event.addListener(this, 'dragstart', this.closeInfoWindow, this);
            this._infoWindowOpened = true
        },
        bindInfoWindow: function (a, b, c) {
            if (this._iwClickHandler) {
                CM.Event.removeListener(this, 'click', this._iwClickHandler, this)
            }
            this._iwClickHandler = function () {
                if (this._infoWindowOpened) {
                    this.closeInfoWindow()
                } else {
                    this.openInfoWindow(a, b, c)
                }
            };
            CM.Event.addListener(this, 'click', this._iwClickHandler, this)
        },
        bindInfoWindowOnHover: function (c, d) {
            if (this._iwMouseoverHandler) {
                CM.DomEvent.removeListener(this._image, 'mouseover', this._iwMouseoverHandler, this)
            }
            if (this._iwMouseoutHandler) {
                CM.DomEvent.removeListener(this._image, 'mouseout', this._iwMouseoutHandler, this)
            }
            this._iwMouseoverHandler = function (a) {
                this.openInfoWindow(c, d)
            };
            var f;
            var g = function (a) {
                    if (!CM.DomEvent.mouseLeft(a, f)) {
                        return
                    }
                    CM.DomEvent.removeListener(f, 'mouseout', g, this);
                    if ((a.relatedTarget || a.toElement) == this._image) {
                        return
                    }
                    this.closeInfoWindow()
                };
            this._iwMouseoutHandler = function (a) {
                var b = a.relatedTarget || a.toElement;
                if (b && (b.className == 'wml-info-window-tip')) {
                    f = this._map.getInfoWindow()._container;
                    CM.DomEvent.addListener(f, 'mouseout', g, this);
                    return
                }
                this.closeInfoWindow()
            };
            CM.DomEvent.addListener(this._image, 'mouseover', this._iwMouseoverHandler, this);
            CM.DomEvent.addListener(this._image, 'mouseout', this._iwMouseoutHandler, this)
        },
        closeInfoWindow: function () {
            if (this._infoWindowOpened) {
                this._map.closeInfoWindow()
            }
        },
        _onInfoWindowClose: function () {
            this._infoWindowOpened = false;
            CM.Event.fire(this, 'infowindowclose');
            CM.Event.removeListener(this._map, 'infowindowclose', this._onInfoWindowClose, this);
            CM.Event.removeListener(this._map, 'infowindowopen', this._onInfoWindowOpen, this);
            CM.Event.removeListener(this, 'dragstart', this.closeInfoWindow, this)
        },
        _onInfoWindowOpen: function () {
            CM.Event.fire(this, 'infowindowopen')
        }
    })
}
CM.Util.extend(CM.Point.prototype, {
    distanceToLine: function (a, b) {
        var c = b.y - a.y,
            d = a.x - b.x,
            f = -c * a.x - d * a.y;
        return Math.abs(c * this.x + d * this.y + f) / Math.sqrt(c * c + d * d)
    },
    distanceToSegment: function (a, b) {
        if (((this.x - a.x) * (b.x - a.x) + (this.y - a.y) * (b.y - a.y)) * ((this.x - b.x) * (b.x - a.x) + (this.y - b.y) * (b.y - a.y)) >= 0) {
            var c = Math.pow(this.x - a.x, 2) + Math.pow(this.y - a.y, 2);
            var d = Math.pow(this.x - b.x, 2) + Math.pow(this.y - b.y, 2);
            return Math.sqrt(Math.min(c, d))
        } else {
            return this.distanceToLine(a, b)
        }
    }
});
CM.Util.clipLineSegment = function (d, f, g) {
    var h = 0,
        j = 1,
        l = f.x - d.x,
        k = f.y - d.y,
        m = g.min(),
        n = g.max();

    function o(a, b) {
        if (a === 0) {
            return (b >= 0)
        } else {
            var c = b / a;
            if (a < 0) {
                if (c > j) {
                    return false
                } else if (c > h) {
                    h = c
                }
            } else {
                if (c < h) {
                    return false
                } else if (c < j) {
                    j = c
                }
            }
            return true
        }
    }
    if (o(-l, d.x - m.x) && o(l, n.x - d.x) && o(-k, d.y - m.y) && o(k, n.y - d.y)) {
        if (j < 1) {
            f = new CM.Point(Math.round(d.x + j * l), Math.round(d.y + j * k))
        }
        if (h > 0) {
            d = new CM.Point(Math.round(d.x + h * l), Math.round(d.y + h * k))
        }
        return [d, f]
    }
    return false
};
CM.Util.clipPolygon = function (d, f) {
    var g = 0,
        h = 1,
        j = 2,
        l = 3,
        k = f.min(),
        m = f.max(),
        n = [];

    function o(a, b, c) {
        if (c == g) {
            return new CM.Point(a.x + (m.y - a.y) * (b.x - a.x) / (b.y - a.y), m.y)
        } else if (c == j) {
            return new CM.Point(a.x + (k.y - a.y) * (b.x - a.x) / (b.y - a.y), k.y)
        } else if (c == h) {
            return new CM.Point(m.x, a.y + (m.x - a.x) * (b.y - a.y) / (b.x - a.x))
        } else if (c == l) {
            return new CM.Point(k.x, a.y + (k.x - a.x) * (b.y - a.y) / (b.x - a.x))
        }
    }
    function r(a, b) {
        if (b == g) {
            return (a.y <= m.y)
        } else if (b == j) {
            return (a.y >= k.y)
        } else if (b == l) {
            return (a.x >= k.x)
        } else if (b == h) {
            return (a.x <= m.x)
        }
    }
    for (var p = 0; p < 4; p++) {
        for (var s = 0, t = d.length, q = t - 1; s < t; q = s++) {
            if (r(d[q], p)) {
                if (r(d[s], p)) {
                    n.push(d[s])
                } else {
                    n.push(o(d[q], d[s], p))
                }
            } else {
                if (r(d[s], p)) {
                    n.push(o(d[q], d[s], p));
                    n.push(d[s])
                }
            }
        }
        d = n;
        n = []
    }
    return d
};
CM.Polyline = function (a, b, c, d) {
    if (!(CM.Polyline.SVG || CM.Util.Browser.isIE)) {
        throw "Your browser doesn't support polyline and polygon rendering.";
    }
    this.latlngs = a || [];
    this.color = b || '#0033ff';
    this.weight = isNaN(c) ? 5 : c;
    this.opacity = isNaN(d) ? 0.5 : d
};
CM.Polyline.SVG = !! (window.SVGPreserveAspectRatio && window.SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMIN == 2);
CM.Polyline.CLIP_PADDING = CM.Polyline.SVG ? 0.5 : 0.02;
if (!CM.Polyline.SVG) {
    if (!document.namespaces['cmvml']) {
        document.namespaces.add("cmvml", "urn:schemas-microsoft-com:vml");
        var ss = document.createStyleSheet(),
            rule = "behavior: url(#default#VML); display: inline-block; position: absolute;";
        ss.addRule("cmvml\\:shape", rule);
        ss.addRule("cmvml\\:path", rule);
        ss.addRule("cmvml\\:stroke", rule);
        ss.addRule("cmvml\\:fill", rule)
    }
}
CM.Polyline.prototype = {
    initialize: function (a) {
        this.map = a;
        this._initNodes();
        this._updateStyle();
        this._initEvents();
        CM.Event.addListener(a, 'moveend', this._onMoveEnd, this);
        CM.Event.addListener(a, 'zoomend', this._onZoomEnd, this);
        CM.Event.addListener(a, 'tilelayerchanged', this._forceRedraw, this);
        this._forceRedraw()
    },
    _onZoomEnd: function () {
        this.redraw(true);
        this._zoomEndFired = true
    },
    _onMoveEnd: function () {
        if (!this._zoomEndFired) {
            this.redraw(false)
        }
        this._zoomEndFired = false
    },
    redraw: function (a) {
        if (a) {
            this._updatePoints()
        }
        this._updateDimensions();
        this._clipPoints();
        this._updatePathD();
        if (a && CM.Util.Browser.isIE) {
            this.canvas.style.display = 'none';
            this.canvas.style.display = ''
        }
    },
    remove: function (a) {
        (this.map._svgRoot || this.map.getPane(CM.Map.OVERLAY_PANE)).removeChild(this.canvas);
        CM.Event.removeListener(a, 'moveend', this._onMoveEnd, this);
        CM.Event.removeListener(a, 'zoomend', this._onZoomEnd, this);
        CM.Event.removeListener(a, 'tilelayerchanged', this._forceRedraw, this);
        CM.Event.fire(this, 'remove', true)
    },
    deleteVertex: function (a) {
        this.latlngs.splice(a, 1);
        this.redraw(true);
        CM.Event.fire(this, 'lineupdated')
    },
    getVertexCount: function () {
        return this.latlngs.length
    },
    getVertex: function (a) {
        return this.latlngs[a]
    },
    getBounds: function () {
        return new CM.LatLngBounds(this.latlngs)
    },
    insertVertex: function (a, b) {
        this.latlngs.splice(a, 0, b);
        this.redraw(true);
        CM.Event.fire(this, 'lineupdated')
    },
    setVertex: function (a, b) {
        this.latlngs[a] = b;
        this.redraw(true);
        CM.Event.fire(this, 'lineupdated')
    },
    hide: function () {
        if (!this._hidden) {
            this.canvas.style.visibility = 'hidden';
            this._hidden = true;
            CM.Event.fire(this, 'visibilitychanged', false)
        }
    },
    show: function () {
        if (this._hidden) {
            this.canvas.style.visibility = '';
            this._hidden = false;
            CM.Event.fire(this, 'visibilitychanged', true)
        }
    },
    isHidden: function () {
        return !!this._hidden
    },
    _forceRedraw: function () {
        this.redraw(true)
    },
    _initNodes: function () {
        if (CM.Polyline.SVG) {
            var a = 'http://www.w3.org/2000/svg';
            this.canvas = document.createElementNS(a, 'g');
            this.canvas.style.position = 'absolute';
            this.path = document.createElementNS(a, 'path');
            this.canvas.appendChild(this.path);
            if (!this.map._svgRoot) {
                this.map._svgRoot = document.createElementNS(a, 'svg');
                this.map._svgRoot.style.position = 'absolute';
                this.map.getPane(CM.Map.OVERLAY_PANE).appendChild(this.map._svgRoot)
            }
        } else {
            this.canvas = document.createElement('cmvml:shape');
            this.canvas.filled = false;
            this.canvas.coordsize = '1 1';
            this.canvas.style.width = this.canvas.style.height = '1px';
            this.canvas.style.position = 'absolute';
            this.canvas.style.top = this.canvas.style.left = '0';
            this.path = document.createElement('cmvml:path');
            this.canvas.appendChild(this.path);
            this.stroke = document.createElement('cmvml:stroke');
            this.canvas.appendChild(this.stroke)
        }(this.map._svgRoot || this.map.getPane(CM.Map.OVERLAY_PANE)).appendChild(this.canvas)
    },
    _initEvents: function () {
        var d = (CM.Polyline.SVG ? this.path : this.canvas);

        function f(a, b) {
            if (!CM.Event.hasListeners(a, b)) {
                return
            }
            var c = a.map.fromContainerPixelToLatLng(new CM.Point(a.map._mousePos.x, a.map._mousePos.y));
            CM.Event.fire(a, b, c)
        }
        CM.DomEvent.addListener(d, 'click', function (a) {
            if (this.map.draggingEnabled() && this.map._dragObject.moved()) {
                return false
            }
            f(this, 'click');
            CM.DomEvent.stopPropagation(a)
        }, this)
    },
    _updateStyle: function () {
        if (CM.Polyline.SVG) {
            this.path.setAttribute('stroke', this.color);
            this.path.setAttribute('stroke-opacity', this.opacity);
            this.path.setAttribute('stroke-width', this.weight);
            this.path.setAttribute('stroke-linejoin', 'round');
            this.path.setAttribute('stroke-linecap', 'round');
            this.path.setAttribute('fill', 'none')
        } else {
            this.stroke.weight = this.weight + 'px';
            this.stroke.color = this.color;
            this.stroke.opacity = this.opacity;
            this.stroke.endcap = 'round'
        }
    },
    _updatePoints: function () {
        this.points = [];
        var a, b;
        for (var c = 0, d = this.latlngs.length; c < d; c++) {
            b = this.map.fromLatLngToDivPixel(this.latlngs[c], CM.Polyline.SVG);
            if (!a || !b.equals(a)) {
                this.points.push(b);
                b.innerBoundaryStart = this.latlngs[c].innerBoundaryStart;
                a = b
            }
        }
        if (this.points.length && (this.points.length < 2)) {
            this.points.push(this.points[0])
        }
    },
    _clipPoints: function () {
        if (this._noClip) {
            if (this._clipInited) {
                return
            }
            this.clippedPoints = this.points.slice();
            this._clipInited = true;
            return
        }
        this.clippedPoints = [];
        if (this.points.length > 1) {
            for (var a = 0, b = this.points.length; a < b - 1; a++) {
                var c = CM.Util.clipLineSegment(this.points[a], this.points[a + 1], this._bounds);
                if (c) {
                    var d = this.clippedPoints[this.clippedPoints.length - 1];
                    if (!(d && d.equals(c[0]))) {
                        c[0].innerBoundaryStart = true;
                        this.clippedPoints.push(c[0])
                    }
                    this.clippedPoints.push(c[1])
                }
            }
        }
    },
    _updateDimensions: function () {
        var a = this.map.getSize(),
            b = this.map.getPane(CM.Map.MAP_PANE),
            c = CM.Polyline.CLIP_PADDING,
            d = new CM.Point(-parseInt(b.style.left) - c * a.width, -parseInt(b.style.top) - c * a.height),
            f = new CM.Point(d.x + a.width * (1 + c * 2), d.y + a.height * (1 + c * 2));
        this._bounds = new CM.Bounds([d, f]);
        if (CM.Polyline.SVG) {
            if (this._noDimensionUpdate) {
                return
            }
            var d = this._bounds.min(),
                f = this._bounds.max(),
                g = f.x - d.x,
                h = f.y - d.y;
            this.map._svgRoot.setAttribute('width', g);
            this.map._svgRoot.setAttribute('height', h);
            this.map._svgRoot.style.left = d.x + 'px';
            this.map._svgRoot.style.top = d.y + 'px';
            this.map._svgRoot.setAttribute('viewBox', d.x + ' ' + d.y + ' ' + g + ' ' + h)
        }
    },
    _updatePathD: function () {
        var a = '';
        for (var b = 0, c = this.clippedPoints.length; b < c; b++) {
            var d = this.clippedPoints[b];
            a += (b === 0 || d.innerBoundaryStart ? 'M' : 'L') + ' ' + d.x + ' ' + d.y + ' '
        }
        this._setPathD(a)
    },
    _setPathD: function (a) {
        if (CM.Polyline.SVG) {
            this.path.setAttribute('d', a)
        } else {
            this.path.v = a + ' '
        }
    }
};
CM.Polyline._getPointIcon = function () {
    if (!CM.Polyline.POINT_ICON) {
        var a = new CM.Icon();
        a.image = CM.Util.getRootUrl() + 'images/square.gif';
        a.iconSize = new CM.Size(10, 10);
        CM.Polyline.POINT_ICON = a
    }
    return CM.Polyline.POINT_ICON
};
CM.Util.extend(CM.Polyline.prototype, {
    enableEditing: function () {
        var a, b;
        if (!this.editingEnabled()) {
            this._markers = [];
            for (a = 0; a < this.latlngs.length; a++) {
                this._markers.push(this._createMarker(this.latlngs[a]))
            }
            for (a = 0, b = this._markers.length - 1; a < this._markers.length; b = a++) {
                if (a === 0 && !(CM.Polygon && (this instanceof CM.Polygon))) {
                    continue
                }
                this._createMiddleMarker(this._markers[b], this._markers[a])
            }
            this._editingEnabled = true
        }
    },
    disableEditing: function () {
        if (this.editingEnabled()) {
            for (var a = 0; a < this._markers.length; a++) {
                this.map.removeOverlay(this._markers[a]);
                if (this._markers[a].middleRight) {
                    this.map.removeOverlay(this._markers[a].middleRight)
                }
            }
            this._markers = [];
            this._editingEnabled = false
        }
    },
    editingEnabled: function () {
        return !!this._editingEnabled
    },
    _createMarker: function (a) {
        var b = new CM.Marker(a, {
            draggable: true,
            icon: CM.Polyline._getPointIcon()
        });
        this.map.addOverlay(b);
        this._attachMarkerOnDrag(b);
        return b
    },
    _attachMarkerOnDrag: function (d) {
        CM.Event.addListener(d, 'drag', function () {
            var a = this._getIndex(d);
            this.setVertex(a, d.getLatLng());
            var b = this._markers[(a > 0 ? a - 1 : this._markers.length - 1)];
            var c = this._markers[(a < this._markers.length - 1 ? a + 1 : 0)];
            if (d.middleLeft) {
                d.middleLeft.setLatLng(this._getMiddleLatLng(b, d))
            }
            if (d.middleRight) {
                d.middleRight.setLatLng(this._getMiddleLatLng(d, c))
            }
        }, this)
    },
    _getIndex: function (a) {
        return CM.Util.indexOf(this._markers, a)
    },
    _getMiddleLatLng: function (a, b) {
        var c = this.map.fromLatLngToDivPixel(a.getLatLng());
        var d = this.map.fromLatLngToDivPixel(b.getLatLng());
        return this.map.fromDivPixelToLatLng(new CM.Point((c.x + d.x) / 2, (c.y + d.y) / 2))
    },
    _createMiddleMarker: function (a, b) {
        var c = this._getMiddleLatLng(a, b);
        var d = this._createMarker(c);
        a.middleRight = d;
        b.middleLeft = d;
        CM.Util.setOpacity(d._image, 0.4);

        function f() {
            this._markers.splice(this._getIndex(b), 0, d);
            CM.Util.setOpacity(d._image, 1);
            this.insertVertex(this._getIndex(d), d.getLatLng())
        }
        CM.Event.addListener(d, 'dragstart', f, this);

        function g() {
            CM.Event.removeListener(d, 'dragstart', f, this);
            CM.Event.removeListener(d, 'dragend', g, this);
            this._createMiddleMarker(a, d);
            this._createMiddleMarker(d, b)
        }
        CM.Event.addListener(d, 'dragend', g, this)
    }
});
CM.Util.extend(CM.Polyline.prototype, {
    enableDrawing: function () {
        if (!this._drawingEnabled) {
            CM.Event.addListener(this.map, 'click', this._onDrawingClick, this);
            this._drawingEnabled = true
        }
    },
    disableDrawing: function () {
        if (this._drawingEnabled) {
            CM.Event.removeListener(this.map, 'click', this._onDrawingClick, this);
            this._drawingEnabled = false
        }
    },
    drawingEnabled: function () {
        return !!this._drawingEnabled
    },
    _onDrawingClick: function (a) {
        var b = this.latlngs.length;
        this.insertVertex(b, a);
        if (this._editingEnabled) {
            this._markers.push(this._createMarker(a));
            if (b > 0) {
                if (this._markers[b - 1].middleRight) {
                    this.map.removeOverlay(this._markers[b - 1].middleRight)
                }
                this._createMiddleMarker(this._markers[b - 1], this._markers[b]);
                if (CM.Polygon && (this instanceof CM.Polygon)) {
                    this._createMiddleMarker(this._markers[b], this._markers[0])
                }
            }
        }
    }
});
(function () {
    var c = CM.Polyline.prototype.initialize;
    CM.Polyline.prototype.initialize = function (b) {
        c.call(this, b);
        CM.Event.addListener(this, 'visibilitychanged', function (a) {
            if (a && this._editingWasEnabledOnHide) {
                this.enableEditing();
                this._editingWasEnabledOnHide = false
            } else if (this._editingEnabled) {
                this.disableEditing();
                this._editingWasEnabledOnHide = true
            }
        })
    }
})();
CM.Polygon = function (a, b, c, d, f, g) {
    if (a && (a[0] instanceof Array)) {
        var h = [].concat(a[0]);
        for (var j = 1; j < a.length; j++) {
            a[j][0].innerBoundaryStart = true;
            h = h.concat(a[j])
        }
        a = h
    }
    CM.Polyline.call(this, a, b, c, d || 1);
    this.fillColor = f || this.color;
    this.fillOpacity = g || 0.2;
    this.clippedPoints = []
};
CM.Util.extend(CM.Polygon.prototype, CM.Polyline.prototype);
CM.Util.extend(CM.Polygon.prototype, {
    _initNodes: function () {
        CM.Polyline.prototype._initNodes.call(this);
        if (!CM.Polyline.SVG) {
            this.canvas.filled = true;
            this.fill = document.createElement('cmvml:fill');
            this.canvas.appendChild(this.fill)
        }
    },
    _updateStyle: function () {
        CM.Polyline.prototype._updateStyle.call(this);
        if (CM.Polyline.SVG) {
            this.path.setAttribute('fill', this.fillColor);
            this.path.setAttribute('fill-opacity', this.fillOpacity);
            this.path.setAttribute('fill-rule', 'evenodd');
            if (!this.weight) {
                this.path.removeAttribute('stroke')
            }
        } else {
            this.fill.color = this.fillColor;
            this.fill.opacity = this.fillOpacity
        }
    },
    _updatePathD: function () {
        var a = '';
        var b = (CM.Polyline.SVG ? 'z ' : 'x ');
        for (var c = 0; c < this.clippedPoints.length; c++) {
            if (this.clippedPoints[c].innerBoundaryStart) {
                a += b
            }
            if (c === 0 || this.clippedPoints[c].innerBoundaryStart) {
                a += 'M'
            }
            if (c == 1 || (c > 1 && this.clippedPoints[c - 1].innerBoundaryStart)) {
                a += 'L'
            }
            a += ' ' + this.clippedPoints[c].x + ' ' + this.clippedPoints[c].y + ' '
        }
        if (a) {
            a += b
        }
        this._setPathD(a)
    },
    _clipPoints: function () {
        if (this._noClip) {
            if (this._clipInited) {
                return
            }
            this.clippedPoints = this.points.slice();
            this._clipInited = true
        } else if (this.points.length > 1) {
            this.clippedPoints = CM.Util.clipPolygon(this.points, this._bounds)
        }
    }
});
CM.Circle = function (a, b, c, d, f, g, h) {
    CM.Polygon.call(this, null, c, d, f, g, h);
    this._latlng = a;
    this._radius = b
};
CM.Util.extend(CM.Circle.prototype, CM.Polygon.prototype);
CM.Util.extend(CM.Circle.prototype, {
    _updatePoints: function () {
        this._point = this.map.fromLatLngToDivPixel(this._latlng, CM.Polyline.SVG)
    },
    _clipPoints: function () {},
    _updatePathD: function () {
        var a = this._getCirclePath(this._point.x, this._point.y, this._radius);
        this._setPathD(a)
    },
    _getCirclePath: function (a, b, c) {
        if (CM.Polyline.SVG) {
            return "M" + a + "," + (b - c) + "A" + c + "," + c + ",0,1,1," + (a - 0.1) + "," + (b - c) + " z"
        } else {
            c = Math.round(c);
            a = Math.round(a);
            b = Math.round(b);
            return "AL " + a + "," + b + " " + c + "," + c + " 0," + (65535 * 360)
        }
    }
});
CM.ArrowedPolyline = function (a, b, c, d, f) {
    CM.Polyline.apply(this, arguments);
    this._arrows = [];
    this._arrowOptions = CM.Util.extend({
        reverse: false,
        width: 15,
        height: 20,
        gap: 150,
        color: null,
        opacity: null,
        single: false,
        startCircle: true,
        startRadius: null,
        hidden: false
    }, f);
    if (this._arrowOptions.reverse) {
        this.latlngs = this.latlngs.slice().reverse()
    }
};
CM.Util.extend(CM.ArrowedPolyline.prototype, CM.Polyline.prototype);
CM.Util.extend(CM.ArrowedPolyline.prototype, {
    redraw: function (a) {
        CM.Polyline.prototype.redraw.call(this, a);
        this._clearArrows();
        this._removeCircle();
        this.hideMarks();
        if (!this._arrowOptions.hidden) {
            this.showMarks()
        }
    },
    remove: function (a) {
        this.hideMarks();
        CM.Polyline.prototype.remove.call(this, a)
    },
    hideMarks: function () {
        this._clearArrows();
        this._removeCircle()
    },
    showMarks: function () {
        this._addArrows();
        this._addCircle()
    },
    _updatePoints: function () {
        CM.Polyline.prototype._updatePoints.call(this);
        var a = 0,
            b = this.points.length;
        this.points[b - 1]._dist = 0;
        for (var c = b - 1; c >= 1; c--) {
            var d = this.points[c],
                f = this.points[c - 1];
            var g = f.x - d.x,
                h = f.y - d.y,
                j = Math.sqrt(g * g + h * h);
            a += j;
            f._dist = a
        }
    },
    _clearArrows: function () {
        for (var a = 0, b = this._arrows.length; a < b; a++) {
            this.map.removeOverlay(this._arrows[a])
        }
        this._arrows = []
    },
    _addArrows: function () {
        var a, b, c = this._arrowOptions.gap,
            d = this._arrowOptions.width,
            f = this._arrowOptions.height,
            g = this.weight,
            h = 2 * f / d,
            j = -(g / 2) * Math.sqrt(h * h + 1),
            l = this.clippedPoints.length,
            k = 0;
        for (var m = l - 1; m >= 1; m--) {
            a = this.clippedPoints[m];
            b = this.clippedPoints[m - 1];
            var n = b.x - a.x,
                o = b.y - a.y,
                r = Math.atan2(o, n),
                p = Math.sqrt(n * n + o * o),
                f = this._arrowOptions.height;
            if (this._arrowOptions.single) {
                this._addArrow(this._polar(a, k, r), r);
                break
            }
            if (a.innerBoundaryStart) {
                continue
            }
            if (b._dist) {
                k = c - ((b._dist - p) % c);
                if (!CM.Polyline.SVG) {
                    k = Math.floor(k)
                }
            }
            if (a._dist === 0) {
                k = j
            }
            while (k < p) {
                var s = this._polar(a, (k > p - f ? p - f : k), r);
                this._addArrow(s, r);
                k += c
            }
            k = k - p
        }
    },
    _polar: function (a, b, c) {
        return new CM.Point(a.x + b * Math.cos(c), a.y + b * Math.sin(c), CM.Polyline.SVG)
    },
    _addArrow: function (a, b) {
        var c = this._arrowOptions.width,
            d = this._arrowOptions.height,
            f = this._arrowOptions.color,
            g = this._arrowOptions.opacity,
            h = this._polar(a, d, b),
            j = this._polar(h, c / 2, b + Math.PI / 2),
            l = this._polar(h, c / 2, b - Math.PI / 2),
            k = this.map.fromDivPixelToLatLng(j),
            m = this.map.fromDivPixelToLatLng(l),
            n = this.map.fromDivPixelToLatLng(a);
        var o = new CM.Polygon([k, m, n], f, 0, 0, f || this.color, g || this.opacity);
        o._noClip = true;
        o._noDimensionUpdate = true;
        this.map.addOverlay(o);
        this._arrows.push(o)
    },
    _addCircle: function () {
        if (!this._arrowOptions.startCircle) {
            return
        }
        var a = this._arrowOptions.color,
            b = this._arrowOptions.opacity,
            c = this._arrowOptions.startRadius,
            d = this._arrowOptions.width;
        var f = this.map.fromDivPixelToLatLng(this.points[0]);
        this._circle = new CM.Circle(f, c || Math.round(d / 2), a, 0, 0, a || this.color, b || this.opacity);
        this.map.addOverlay(this._circle)
    },
    _removeCircle: function () {
        if (this._circle) {
            this.map.removeOverlay(this._circle);
            this._circle = null
        }
    }
});
CM.XmlJsonProxy = function (a, b, c) {
    this.proxyUrl = a;
    this.noCallback = c;
    this.name = b
};
CM.XmlJsonProxy.prototype = {
    get: function (a, b, c) {
        CM.Util.getJson(this.proxyUrl + a, b, this.name, c, this.noCallback)
    }
};
CM.Util.loadXml = function (b, c, d) {
    var f;
    try {
        f = new ActiveXObject("Microsoft.XMLDOM");
        f.onreadystatechange = function () {
            if (f.readyState && f.readyState != 4) {
                return
            }
            c.call(d, f)
        };
        f.load(b)
    } catch (e) {
        var g = new XMLHttpRequest();
        g.onreadystatechange = function () {
            if (g.readyState == 4) {
                try {
                    f = g.responseXML;
                    var a = f.firstChild.nodeValue
                } catch (e) {
                    try {
                        f = new DOMParser().parseFromString(g.responseText, 'text/xml')
                    } catch (e3) {
                        return null
                    }
                }
                c.call(d, f)
            }
        };
        g.open('GET', b, true);
        g.send(null)
    }
};
CM.Util.badgerfishEncode = (function () {
    function g(a, b) {
        for (var c in b) {
            if (b.hasOwnProperty(c)) {
                if (a[c]) {
                    if (!(a[c] instanceof Array)) {
                        a[c] = [a[c]]
                    }
                    a[c].push(b[c])
                } else {
                    a[c] = b[c]
                }
            }
        }
        return a
    }
    return function (a) {
        var b = {},
            c, d, f;
        switch (a.nodeType) {
        case 1:
            d = b[a.nodeName] = {};
            for (c = 0; c < a.attributes.length; c++) {
                f = a.attributes[c];
                d['@' + f.name] = f.value
            }
            for (c = 0; c < a.childNodes.length; c++) {
                g(d, arguments.callee(a.childNodes[c]))
            }
            break;
        case 2:
            b['@' + a.name] = a.value;
            break;
        case 3:
        case 4:
            b.$ = a.nodeValue;
            break;
        case 9:
        case 11:
            b = arguments.callee(a.firstChild);
            break;
        default:
            break
        }
        return b
    }
})();
CM.GeoXml = function (c, d) {
    this._setOptions(d);
    if (this._options.local) {
        CM.Util.loadXml(c, function (a) {
            var b = CM.Util.badgerfishEncode(a.documentElement);
            this._onJsonLoad(b)
        }, this)
    } else {
        this._options.proxy.get(c, this._onJsonLoad, this)
    }
};
CM.GeoXml.prototype = {
    initialize: function (a) {
        this.map = a;
        if (!this._ready) {
            this._addOverlaysOnReady = true
        } else {
            this._addOverlays()
        }
    },
    redraw: function (a) {
        for (var b = 0; b < this._overlays.length; b++) {
            this._overlays[b].redraw(a)
        }
    },
    remove: function (a) {
        for (var b = 0; b < this._overlays.length; b++) {
            this.map.removeOverlay(this._overlays[b])
        }
    },
    getDefaultBounds: function () {
        var a = [];
        for (var b = 0; b < this._placemarks.length; b++) {
            if (this._placemarks[b].latlng) {
                a.push(this._placemarks[b].latlng)
            } else if (this._placemarks[b].latlngs) {
                if (this._placemarks[b].latlngs[0] instanceof Array) {
                    for (var c = 0; c < this._placemarks[b].latlngs.length; c++) {
                        a = a.concat(this._placemarks[b].latlngs[c])
                    }
                } else {
                    a = a.concat(this._placemarks[b].latlngs)
                }
            }
        }
        return new CM.LatLngBounds(a)
    },
    hasLoaded: function () {
        return !!this._ready
    },
    _setOptions: function (a) {
        this._options = CM.Util.extend({
            local: false,
            defaultIcon: CM.DEFAULT_ICON
        }, a || {});
        if (!this._options.local && !this._options.proxy) {
            var b = 'cmGeoXMLCallback' + (+new Date());
            this._options.proxy = new CM.XmlJsonProxy('http://tile.cloudmade.com/json/xml2json.php?callback=' + b + '&url=', b)
        }
    },
    _onJsonLoad: function (a) {
        this._styles = {};
        this._styleMaps = {};
        this._placemarks = [];
        this._parseJson(a);
        this._renderKmlPlacemarks();
        CM.Event.fire(this, 'load')
    },
    _addOverlays: function () {
        for (var a = 0; a < this._overlays.length; a++) {
            this.map.addOverlay(this._overlays[a])
        }
    },
    _parseJson: function (a, b) {
        var c, d;
        if (b == 'Style') {
            this._parseKmlStyle(a)
        } else if (b == 'StyleMap') {
            this._parseKmlStyleMap(a)
        } else if (b == 'Placemark') {
            this._parseKmlPlacemark(a)
        } else if (b == 'item') {
            this._parseGeoRSSItem(a)
        } else {
            for (c in a) {
                if (a.hasOwnProperty(c)) {
                    if (a[c] instanceof Array) {
                        for (d = 0; d < a[c].length; d++) {
                            this._parseJson(a[c][d], c)
                        }
                    } else if (typeof a[c] == 'object') {
                        this._parseJson(a[c], c)
                    }
                }
            }
        }
    },
    _parseKmlStyle: function (a) {
        var b = {};
        if (a.LineStyle) {
            if (a.LineStyle.color) {
                var c = this._parseKmlColor(a.LineStyle.color.$);
                b.color = c.rgb;
                b.opacity = c.opacity
            }
            b.weight = a.LineStyle.width && parseInt(a.LineStyle.width.$)
        }
        if (a.PolyStyle) {
            var d = a.PolyStyle.fill && (a.PolyStyle.fill.$ == '0');
            var f = a.PolyStyle.outline && (a.PolyStyle.outline.$ == '0');
            if (f) {
                b.weight = 0;
                b.opacity = 0
            }
            if (a.PolyStyle.color && !d) {
                var g = this._parseKmlColor(a.PolyStyle.color.$);
                b.fillColor = g.rgb;
                b.fillOpacity = g.opacity
            }
        }
        if (a.IconStyle) {
            b.icon = new CM.Icon();
            b.icon.image = a.IconStyle.Icon.href.$;
            var h = a.IconStyle.w ? parseInt(a.IconStyle.w.$) : 32;
            var j = a.IconStyle.h ? parseInt(a.IconStyle.h.$) : 32;
            if (a.IconStyle.scale) {
                h = parseInt(h * parseFloat(a.IconStyle.scale.$));
                j = parseInt(j * parseFloat(a.IconStyle.scale.$))
            }
            b.icon.iconSize = new CM.Size(h, j)
        }
        this._styles['#' + a['@id']] = b
    },
    _parseKmlStyleMap: function (a) {
        if (a.Pair && a.Pair[0]) {
            if (a.Pair[0].Style) {
                this._parseKmlStyle(a.Pair[0].Style)
            } else {
                this._styleMaps['#' + a['@id']] = a.Pair[0].styleUrl.$
            }
        }
    },
    _parseKmlPlacemark: function (a) {
        var b = {};
        if (a.Point) {
            b.latlng = this._parseKmlCoordinates(a.Point.coordinates.$)[0];
            b.type = 'Marker'
        } else if (a.LineString || a.LinearRing) {
            b.latlngs = this._parseKmlCoordinates((a.LineString || a.LinearRing).coordinates.$);
            b.type = (a.LinearRing ? 'Polygon' : 'Polyline')
        } else if (a.Polygon) {
            var c = this._parseKmlCoordinates(a.Polygon.outerBoundaryIs.LinearRing.coordinates.$),
                d;
            if (a.Polygon.innerBoundaryIs) {
                if (a.Polygon.innerBoundaryIs.LinearRing instanceof Array) {
                    var f = [];
                    for (var g = 0; g < a.Polygon.innerBoundaryIs.LinearRing.length; g++) {
                        d = a.Polygon.innerBoundaryIs.LinearRing[g].coordinates.$;
                        f.push(this._parseKmlCoordinates(d))
                    }
                    b.latlngs = [c].concat(f)
                } else {
                    d = a.Polygon.innerBoundaryIs.LinearRing.coordinates.$;
                    b.latlngs = [c, this._parseKmlCoordinates(d)]
                }
            } else {
                b.latlngs = c
            }
            b.type = 'Polygon'
        } else if (a.MultiGeometry) {
            for (var g in a.MultiGeometry) {
                if (a.MultiGeometry.hasOwnProperty(g)) {
                    if (a.MultiGeometry[g] instanceof Array) {
                        for (var h = 0; h < a.MultiGeometry[g].length; h++) {
                            var j = CM.Util.extend({}, a);
                            j.MultiGeometry = null;
                            j[g] = a.MultiGeometry[g][h];
                            this._parseKmlPlacemark(j)
                        }
                    } else {
                        var j = CM.Util.extend({}, a);
                        j.MultiGeometry = null;
                        j[g] = a.MultiGeometry[g];
                        this._parseKmlPlacemark(j)
                    }
                }
            }
            return
        } else {
            return
        }
        b.name = a.name && a.name.$;
        b.description = a.description && a.description.$;
        b.styleUrl = a.styleUrl && a.styleUrl.$;
        this._placemarks.push(b)
    },
    _parseKmlColor: function (a) {
        return {
            rgb: '#' + a.slice(6, 8) + a.slice(4, 6) + a.slice(2, 4),
            opacity: parseInt(a.slice(0, 2), 16) / 255
        }
    },
    _parseKmlCoordinates: function (b) {
        function c(a) {
            return a.replace(/^\s*|\s*$/g, '')
        }
        if (b instanceof Array) {
            b = b.join('')
        }
        var d = [];
        var f = b.split("\n");
        for (var g = 0; g < f.length; g++) {
            if (f[g]) {
                var h = f[g].split(',');
                h[0] = h[0] && parseFloat(c(h[0]));
                h[1] = h[1] && parseFloat(c(h[1]));
                if (!isNaN(h[0]) && !isNaN(h[1])) {
                    var j = new CM.LatLng(h[1], h[0]);
                    d.push(j)
                }
            }
        }
        return d
    },
    _renderKmlPlacemarks: function () {
        this._overlays = [];
        for (var j = 0; j < this._placemarks.length; j++) {
            (function (b) {
                var c = this._placemarks[b],
                    d = c.styleUrl && (this._styles[c.styleUrl] || this._styles[this._styleMaps[c.styleUrl]]),
                    f, g = this._getHtmlForInfoWindow(c);
                if ((c.type == 'Polyline') || (c.type == 'Polygon')) {
                    f = new CM[c.type](c.latlngs, d && d.color, d && d.weight, d && d.opacity, d && d.fillColor, d && d.fillOpacity);
                    if (g) {
                        CM.Event.addListener(f, 'click', function (a) {
                            this.map.openInfoWindow(a, g)
                        }, this)
                    }
                } else if (c.type == 'Marker') {
                    var h = {
                        icon: (d && d.icon) || this._options.defaultIcon
                    };
                    f = new CM.Marker(c.latlng, h);
                    if (g) {
                        f.bindInfoWindow(g)
                    }
                }
                if (f) {
                    this._overlays.push(f)
                }
            }).call(this, j)
        }
        this._ready = true;
        if (this._addOverlaysOnReady) {
            this._addOverlays()
        }
    },
    _getHtmlForInfoWindow: function (a) {
        var b = '';
        if (a.name) {
            b += '<div class="wml-info-window-heading">';
            if (a.link) {
                b += '<a href="' + a.link + '">'
            }
            b += a.name;
            if (a.link) {
                b += '</a>'
            }
            b += '</div>'
        }
        if (a.description) {
            b += '<div class="wml-info-window-desc">' + a.description + '</div>'
        }
        return b
    },
    _parseGeoRSSItem: function (a) {
        var b = {};
        var c = a['geo:lat'] && parseFloat(a['geo:lat'].$),
            d = a['geo:long'] && parseFloat(a['geo:long'].$);
        if ((!c || !d) && a['georss:point']) {
            var f = a['georss:point'].$.replace(/^\s*|\s*$/g, '').split(/\s+/);
            c = parseFloat(f[0]);
            d = parseFloat(f[1])
        }
        if (c && d) {
            b.name = a.title && a.title.$;
            b.description = a.description && a.description.$;
            b.link = a.link && a.link.$;
            b.type = 'Marker';
            b.latlng = new CM.LatLng(c, d);
            this._placemarks.push(b)
        }
    }
};
CM.TileLayerOverlay = function (a) {
    this._tileLayer = a
};
CM.TileLayerOverlay.prototype = {
    initialize: function (a) {
        this._map = a;
        this._limitedResetView = CM.Util.limitExecByInterval(this._resetView, 200, this);
        if (a.isLoaded()) {
            this._resetView()
        } else {
            CM.Event.addListener(a, 'load', this._resetView, this)
        }
        CM.Event.addListener(a, 'move', this._limitedResetView, this)
    },
    remove: function (a) {
        CM.Event.removeListener(a, 'move', this._limitedResetView, this)
    },
    redraw: function (a) {
        if (a) {
            this._resetView()
        } else {
            this._limitedResetView()
        }
    },
    _resetView: function () {
        this._map._resetView(this._tileLayer)
    }
};
CM.DRIVING = 'car';
CM.WALKING = 'foot';
CM.CYCLING = 'bicycle';
CM.Directions = function (a, b, c) {
    if (!c) {
        throw "Please provide your API as a third argument.";
    }
    this.map = a;
    this.panel = (typeof b == 'string' ? document.getElementById(b) : b);
    this.key = c
};
CM.Directions.cache = {};
(function () {
    var a = new CM.Icon(),
        b = CM.Util.getRootUrl();
    a.printImage = b + 'images/marker.gif';
    a.iconSize = new CM.Size(23, 26);
    a.iconAnchor = new CM.Point(12, 26);
    a.infoWindowAnchor = new CM.Point(0, -24);
    CM.Directions._iconTemplate = a
})();
CM.Directions.prototype = {
    loadFromWaypoints: function (a, b) {
        var c;
        this._setOptions(b);
        if (this.panel) {
            this.panel.innerHTML = ''
        }
        this.total_distance = 0;
        this.total_duration = 0;
        this.waypoints = a;
        this.routes = [];
        this.latlngs = [];
        this.errorMessages = [];
        this._requests = [];
        this._routesToLoad = a.length - 1;
        if (this._markers) {
            for (c = 0; c < this._markers.length; c++) {
                this.map.removeOverlay(this._markers[c])
            }
        }
        this._markers = [];
        if (this.polyline) {
            this.map.removeOverlay(this.polyline);
            this.polyline = null
        }
        for (c = 0; c < a.length; c++) {
            this.map.addOverlay(this._createMarker(a[c]))
        }
        for (c = 0; c < this._routesToLoad; c++) {
            this._requests.push(a[c] + a[c + 1] + this._options.travelMode)
        }
        for (c = 0; c < this._routesToLoad; c++) {
            this._getRoute(a[c], a[c + 1])
        }
    },
    getBounds: function () {
        return new CM.LatLngBounds(this.latlngs)
    },
    getNumRoutes: function () {
        return this.routes.length
    },
    getRoute: function (a) {
        return this.routes[a]
    },
    getDistance: function () {
        var a = 0;
        if (this.routes) {
            for (var b = 0; b < this.routes.length; b++) {
                a += this.routes[b].getDistance()
            }
        }
        return a
    },
    getErrorMessages: function () {
        return this.errorMessages
    },
    getPolyline: function () {
        return this.polyline
    },
    getMarker: function (a) {
        return this._markers[a]
    },
    _createMarker: function (c) {
        var d = new CM.Icon(CM.Directions._iconTemplate, CM.Util.getRootUrl() + 'images/routing/route_icon_' + (this._markers.length + 1) + '.png'),
            f = new CM.Marker(c, {
                icon: d,
                draggable: this._options.draggableWaypoints
            });
        if (this._options.draggableWaypoints) {
            CM.Event.addListener(f, 'dragend', function () {
                var a = [];
                for (var b = 0; b < this._markers.length; b++) {
                    a.push(this._markers[b].getLatLng())
                }
                this.loadFromWaypoints(a, this._options)
            }, this)
        }
        this._markers.push(f);
        return f
    },
    _setOptions: function (a) {
        var b = {
            host: 'http://routes.cloudmade.com',
            travelMode: CM.DRIVING,
            preserveViewport: false,
            draggableWaypoints: false,
            units: 'km',
            lang: 'en'
        };
        this._options = CM.Util.extend(b, a)
    },
    _getRoute: function (b, c) {
        var d = this._generateId();
        var f = this._options.host + '/' + this.key + '/api/0.3/' + b.lat() + ',' + b.lng() + ',' + c.lat() + ',' + c.lng() + '/';
        f += this._options.travelMode + '.js?units=' + this._options.units + '&lang=' + this._options.lang + '&callback=getRoute' + d;
        f += '&translation=common';
        var g = b + c + this._options.travelMode;
        if (!CM.Directions.cache[g]) {
            CM.Directions.cache[g] = 'requesting';
            CM.Util.getJson(f, function (a) {
                CM.Directions.cache[g] = a;
                CM.Util.extend(this._translations, a.translations || {});
                this._checkIfReadyToRender()
            }, 'getRoute' + d, this)
        } else if (CM.Directions.cache[g] != 'requesting') {
            this._checkIfReadyToRender()
        }
    },
    _generateId: function () {
        CM.Directions._lastId = (CM.Directions._lastId || 0) + 1;
        return CM.Directions._lastId
    },
    _checkIfReadyToRender: function () {
        var a = true,
            b;
        for (var c = 0; c < this._requests.length; c++) {
            b = CM.Directions.cache[this._requests[c]];
            if (!b || b == 'requesting') {
                a = false;
                break
            }
        };
        if (a && this._requests.length) {
            for (c = 0; c < this._requests.length; c++) {
                if (c == (this._requests.length - 1)) {
                    this._responseHandler(CM.Directions.cache[this._requests[c]], true)
                } else {
                    this._responseHandler(CM.Directions.cache[this._requests[c]])
                }
            };
            this._requests = [];
            if (this.errorMessages.length) {
                if (this.polyline) {
                    this.map.removeOverlay(this.polyline);
                    this.polyline = null
                }
                CM.Event.fire(this, 'error')
            } else {
                this._renderRoutes()
            }
        }
    },
    _responseHandler: function (a, b) {
        if (a.status) {
            this.errorMessages.push(a.status_message);
            if (this.panel) {
                this._displayError(a)
            }
        } else {
            var c = new CM.Route(a);
            if (this.panel) {
                this._addPanel(c, b)
            }
            this._addRoute(c)
        }
    },
    _translations: {
        total_length: 'Total length',
        total_duration: 'Time',
        total_route_distance: 'Total route distance',
        total_route_duration: 'Total route time',
        m: 'm',
        km: 'km',
        ft: 'ft',
        mile: 'mile',
        sec: 'sec',
        secs: 'secs',
        hr: 'hr',
        hrs: 'hrs',
        min: 'min',
        mins: 'mins'
    },
    _addPanel: function (j, l) {
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
                var f = document.createElement('dd');
                var g = document.createElement('a');
                g.href = '#';
                var h = o(j.getStep(d).getDistance());
                g.innerHTML = '<img border="0" width="23" height="23" src="' + CM.Util.getRootUrl() + 'images/routing/arrows/' + j.getStep(d).direction_instruction + '.png" alt="' + j.getStep(d).description + '" /><span class="waypoint_text">' + j.getStep(d).description + ' <b>' + h.distance + '</b> ' + h.points + '</span>';
                f.appendChild(g);
                w.appendChild(f);
                CM.DomEvent.addListener(g, 'click', function (a) {
                    if (g.className == 'wml-selected-step') {
                        k.map.closeInfoWindow();
                        g.className = ''
                    } else {
                        k.map.openInfoWindow(j.getStep(d).getLatLng(j.getStep(d).latlngs.length - 1), j.getStep(d).description + ' <b>' + h.distance + '</b> ' + h.points);
                        var b = k.panel.getElementsByTagName('a');
                        for (var c = 0; c < b.length; c++) {
                            b[c].className = ''
                        };
                        g.className = 'wml-selected-step'
                    }
                    CM.DomEvent.preventDefault(a)
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
        var G = o(j.getDistance());
        var H = r(j.getDuration());
        var N = document.createTextNode(G.distance + ' ' + G.points);
        var O = document.createTextNode(H.duration + ' ' + H.points);
        E.appendChild(N);
        z.appendChild(L);
        F.appendChild(O);
        A.appendChild(M);
        z.appendChild(E);
        A.appendChild(F);
        this.total_distance += j.getDistance();
        this.total_duration += j.getDuration();
        var I = o(this.total_distance);
        var J = r(this.total_duration);
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
        this.panel.appendChild(n);
        this.panel.appendChild(z);
        this.panel.appendChild(A)
    },
    _displayError: function (a) {
        var b = document.createElement('div');
        b.className = 'wml-error-message';
        b.innerHTML = a.status_message;
        this.panel.insertBefore(b, this.panel.firstChild);
        CM.Event.fire(this, 'load')
    },
    _addRoute: function (a) {
        this.routes.push(a);
        for (var b = 0; b < a.steps.length; b++) {
            this.latlngs = this.latlngs.concat(a.steps[b].latlngs)
        }
    },
    _renderRoutes: function () {
        this.polyline = new CM.Polyline(this.latlngs);
        this.map.addOverlay(this.polyline);
        if (!this._options.preserveViewport) {
            this.map.zoomToBounds(this.getBounds())
        }
        if (this.polyline) {
            this.getPolyline().show()
        }
        CM.Event.fire(this, 'load')
    }
};
CM.Route = function (a) {
    var b = a.route_instructions,
        c = a.route_geometry,
        d, f;
    this.start_point = a.route_summary.start_point;
    this.end_point = a.route_summary.end_point;
    this.distance = a.route_summary.total_distance;
    this.duration = a.route_summary.total_time;
    this.steps = [];
    for (d = 0; d < b.length; d++) {
        var g = b[d][2],
            h = (d == b.length - 1 ? c.length : b[d + 1][2]),
            j = [];
        for (f = g; f < h; f++) {
            j.push(c[f])
        }
        this._addStep(new CM.Step(b[d], j))
    }
};
CM.Route.prototype = {
    getDistance: function () {
        return this.distance
    },
    getDuration: function () {
        return this.duration
    },
    getNumSteps: function () {
        return this.steps.length
    },
    getStep: function (a) {
        return this.steps[a]
    },
    getEndLatLng: function () {
        return this.steps[this.steps.length - 1].getLatLng()
    },
    getStartPoint: function () {
        return this.start_point
    },
    getEndPoint: function () {
        return this.end_point
    },
    _addStep: function (a) {
        this.steps.push(a)
    }
};
CM.Step = function (a, b) {
    this.description = a[0];
    this.distance = a[1];
    this.duration = a[3];
    if (a[7]) {
        this.direction_instruction = a[7]
    } else {
        this.direction_instruction = a[5]
    }
    this.latlngs = [];
    for (var c = 0; c < b.length; c++) {
        this.latlngs[c] = new CM.LatLng(b[c][0], b[c][1])
    }
};
CM.Step.prototype = {
    getLatLng: function () {
        return this.latlngs[0]
    },
    getDistance: function () {
        return this.distance
    },
    getDuration: function () {
        return this.duration
    },
    getDescriptionHtml: function () {
        return this.description
    }
};
CM.Geocoder = function (a) {
    if (!a) {
        throw "Please provide your API as a third argument.";
    }
    this.key = a
};
CM.Geocoder.prototype = {
    getLocations: function (a, b, c) {
        c = c || {};
        if (a instanceof CM.LatLng) {
            c.around = a.lat() + ',' + a.lng();
            if (!c.distance) {
                c.distance = 'closest'
            }
        } else if (typeof a == 'string') {
            c.query = a
        } else {
            throw new Error("Invalid query argument for getLocations method.");
        }
        this._setOptions(c);
        var d = 'cmGeocodeCallback' + (+new Date());
        var f = this._options.host + '/' + this.key + '/geocoding/v2/find.js?callback=' + d;
        f += '&return_location=' + this._options.detailedDescription;
        f += '&results=' + this._options.resultsNumber;
        f += '&skip=' + (this._options.resultsNumber * this._options.activePage);
        if (this._options.bounds) {
            var g = this._options.bounds.getSouthWest(),
                h = this._options.bounds.getNorthEast();
            var j = g.lat() + '+' + g.lng() + ',' + h.lat() + '+' + h.lng();
            f += '&bbox_only=' + this._options.boundsOnly + '&bbox=' + j
        } else if (this._options.around) {
            f += '&around=' + this._options.around;
            f += '&distance=' + this._options.distance
        }
        if (this._options.query) {
            f += '&query=' + this._options.query
        }
        if (this._options.objectType) {
            f += '&object_type=' + this._options.objectType
        }
        f += '&return_geometry=' + this._options.geometry;
        CM.Util.getJson(f, b, d, this)
    },
    _setOptions: function (a) {
        var b = {
            host: 'http://geocoding.cloudmade.com',
            detailedDescription: false,
            bounds: null,
            boundsOnly: false,
            activePage: 0,
            resultsNumber: 10,
            around: null,
            distance: 100,
            objectType: null,
            geometry: false
        };
        this._options = CM.Util.extend(b, a)
    }
};
CM.Util.extend(CM.Map.prototype, {
    openSidebar: function () {
        if (!this._isSidebarOpened) {
            this._sidebar.style.visibility = 'visible';
            this._container.style.marginLeft = this._sidebarWidth + 'px';
            this.checkResize();
            CM.Event.fire(this, 'sidebaropened');
            this._isSidebarOpened = true
        }
    },
    closeSidebar: function () {
        if (this._isSidebarOpened) {
            this._sidebar.style.visibility = 'hidden';
            this._container.style.marginLeft = '0px';
            this.checkResize();
            CM.Event.fire(this, 'sidebarclosed');
            this._isSidebarOpened = false
        }
    },
    toggleSidebar: function (a) {
        if (a && (a._id != this._currentSidebarId)) {
            this.setSidebar(a);
            this.openSidebar()
        } else {
            if (!this._isSidebarOpened) {
                this.openSidebar()
            } else {
                this.closeSidebar()
            }
        }
    },
    isSidebarOpened: function () {
        return !!this._isSidebarOpened
    },
    setSidebarContent: function (a, b) {
        if (!this._sidebar) {
            this._sidebar = document.createElement('div');
            this._sidebar.className = 'wml-sidebar';
            this._sidebar.style.visibility = 'hidden';
            this._wrapper.appendChild(this._sidebar)
        }
        this._sidebarWidth = b || this._sidebarWidth || 200;
        this._sidebar.style.width = this._sidebarWidth + 'px';
        if (typeof a == 'string') {
            this._sidebar.innerHTML = a
        } else {
            this._sidebar.appendChild(a)
        }
    },
    setSidebar: function (a) {
        this._currentSidebarId = a._id;
        a.initialize(this)
    }
});
CM.SearchSidebar = function (a) {
    this._options = CM.Util.extend({
        sponsored: false,
        resultsNumber: 10,
        container: null
    }, a || {});
    this._options.boundsOnly = this._options.boundsOnly || this._options.sponsored;
    this._id = CM.Util.generateId()
};
CM.SearchSidebar.prototype = {
    initialize: function (a) {
        this._map = a;
        if (this._options.sponsored) {
            this._geocoder = new CM.SponsoredPois(this._options.key)
        } else {
            this._geocoder = new CM.Geocoder(this._options.key)
        }
        this._markers = [];
        var b = document.createElement('div');
        b.className = 'wml-sidebar-container';
        if (!this._options.container) {
            var c = document.createElement('div');
            c.className = 'wml-sidebar-heading';
            c.innerHTML = 'Search the Map';
            b.appendChild(c)
        }
        var d = document.createElement('div');
        d.className = 'wml-sidebar-content';
        b.appendChild(d);
        var f = document.createElement('form');
        f.method = 'get';
        f.className = 'wml-sidebar-input-form';
        f.onsubmit = CM.Util.bind(this._onSubmit, this);
        this._input = document.createElement('input');
        this._input.type = 'text';
        this._input.className = 'wml-sidebar-input';
        f.appendChild(this._input);
        if (!this._options.container) {
            CM.Event.addListener(this._map, 'sidebaropened', this._onSidebarOpened, this);
            CM.Event.addListener(this._map, 'sidebarclosed', this._onSidebarClosed, this)
        }
        var g = document.createElement('input');
        g.type = 'image';
        g.className = 'wml-sidebar-go';
        g.src = CM.Util.getRootUrl() + 'images/search/go.png';
        f.appendChild(g);
        d.appendChild(f);
        this._list = document.createElement('div');
        this._list.className = 'wml-search-panel-list';
        d.appendChild(this._list);
        this._pager = document.createElement('div');
        this._pager.className = 'wml-search-panel-pager';
        d.appendChild(this._pager);
        if (!this._options.container) {
            var h = document.createElement('a');
            h.href = '#close-sidebar';
            h.className = 'wml-sidebar-close';
            h.onclick = CM.Util.bind(this._onCloseClick, this);
            b.appendChild(h)
        }
        if (!this._options.container) {
            this._map.setSidebarContent(b, 215)
        } else {
            this._options.container.appendChild(b)
        }
    },
    _onCloseClick: function () {
        this._map.closeSidebar();
        return false
    },
    _onSidebarOpened: function () {
        this._input.focus()
    },
    _onSidebarClosed: function () {
        this._input.value = '';
        this._clearResults()
    },
    _onSubmit: function (a) {
        var b = (typeof a == 'number');
        if (!b) {
            CM.Event.fire(this, 'search', this._input.value)
        }
        this._activePage = (b ? a : 0);
        this._query = (b ? this._query : this._input.value);
        if (!this._query) {
            return false
        }
        if (b) {
            this._map.zoomToBounds(this._bounds)
        } else {
            this._bounds = this._map.getBounds()
        }
        this._clearResults();
        this._list.innerHTML = '<div class="wml-search-panel-item">Searching the map...</div>';
        this._geocoder.getLocations(this._query, CM.Util.bind(this._handleResponse, this), {
            bounds: this._bounds,
            boundsOnly: this._options.boundsOnly,
            activePage: this._activePage,
            detailedDescription: true,
            resultsNumber: this._options.resultsNumber
        });
        return false
    },
    _clearResults: function () {
        this._map.closeInfoWindow();
        for (var a = 0; a < this._markers.length; a++) {
            this._map.removeOverlay(this._markers[a])
        }
        this._markers = [];
        this._list.innerHTML = '';
        this._pager.innerHTML = ''
    },
    _handleResponse: function (c) {
        var d = c.features || c.points;
        if (!d || (d && !d.length)) {
            this._list.innerHTML = '<div class="wml-search-panel-item">No results found.</div>';
            return
        }
        this._list.innerHTML = '';
        for (var f = 0; f < d.length; f++) {
            var g = '';
            var h = ((this._activePage * this._options.resultsNumber) + f + 1) + '';
            for (var j = 0, l = (d.length + '').length - h.length; j < l; j++) {
                g += '0'
            }
            h = g + h;
            if (!this._options.sponsored) {
                this._processGeocodingPoint(d[f], h)
            } else {
                this._processSponsoredPoint(d[f], h)
            }
        }
        var k = c.found ? Math.ceil(c.found / this._options.resultsNumber) : c.points[0].pageCount;
        if (k > 1) {
            for (f = 0; f < Math.min(k, this._options.resultsNumber); f++) {
                (function (a) {
                    var b = document.createElement('a');
                    b.className = 'wml-search-panel-page-num';
                    if (a == this._activePage) {
                        b.className += '-selected'
                    }
                    b.href = '#search-result-page-' + (a + 1);
                    b.onclick = CM.Util.bind(function () {
                        this._onSubmit(a);
                        return false
                    }, this);
                    b.innerHTML = a + 1;
                    this._pager.appendChild(b)
                }).call(this, f)
            }
        }
    },
    _processGeocodingPoint: function (a, b) {
        var c = a.centroid.coordinates,
            d = new CM.LatLng(c[0], c[1]);
        var f = (a.properties && (a.properties.name || a.properties.synthesized_name)) || "(untitled)";
        var g = new CM.LabeledMarker(d, {
            title: b
        });
        var h = '<b>' + f + '</b>';
        g.bindInfoWindow(h, {}, CM.DataCard);
        this._map.addOverlay(g);
        this._markers.push(g);
        f = f.replace(new RegExp(this._query, "gi"), '<b>' + this._input.value + '</b>');
        var j = document.createElement('a');
        j.className = 'wml-search-panel-item';
        j.href = '#search-result-' + b;
        j.onclick = CM.Util.bind(function () {
            g.openInfoWindow(h, {
                autoPan: false
            }, CM.DataCard);
            this._map.panTo(g.getLatLng());
            return false
        }, this);
        j.innerHTML = '<span class="wml-search-panel-item-num">' + b + '</span> <span class="wml-search-panel-item-text">' + f + '</span>';
        this._list.appendChild(j)
    },
    _processSponsoredPoint: function (g, h) {
        var j = g.name || g.synthesized_name || "(untitled)",
            l = new CM.LatLng(g.location[0], g.location[1]),
            k = CM.Util.extend({}, g.tags);
        var m = new CM.Icon();
        m.image = g.icon.imageUrl;
        m.iconSize = new CM.Size(g.icon.width, g.icon.height);
        if (g.type == 'CLIK') {
            var n = "<div class='wml-sponsored-card-heading'>" + j + "</div>";
            if (k.address || k.city || k.state) {
                n += "<div style='margin-bottom: 10px;'>";
                if (k.address) {
                    n += k.address + "<br />"
                }
                if (k.city) {
                    n += k.city
                }
                if (k.state) {
                    n += ", " + k.state
                }
                n += "</div>"
            }
            var o = CM.Util.generateId();
            n += "<div><a href='#' id='datacard-link-zoom" + o + "'>Zoom to this point</a><br /><a href='#' id='datacard-link-more" + o + "'>More info &raquo;</a></div>";
            var r = document.createElement('div');
            r.innerHTML = n;
            var p = this._map;
            var s = this._geocoder._options.host;
            var t = r.getElementsByTagName('a');
            t[0].onclick = function () {
                p.setCenter(l, 18);
                return false
            };
            t[1].onclick = function () {
                var a = CM.Util.extend({}, k);
                var b = "<table width='372' class='wml-extended-datacard-table'><tr><td valign='top'>";
                b += "<div class='wml-info-window-heading wml-sponsored-card-heading'>" + j + "</div>";
                if (a.phone) {
                    b += a.phone + "<br />";
                    delete a.phone
                }
                if (a.address) {
                    b += a.address + "<br />";
                    delete a.address
                }
                if (a.city) {
                    b += a.city;
                    delete a.city;
                    if (a.state) {
                        b += ", " + a.state;
                        delete a.state
                    }
                    b += '<br />'
                }
                if (a.url) {
                    b += "<a href='" + s + a.url + "' target='blank'>" + (a.urlLabel || a.url) + "</a>";
                    delete a.url;
                    delete a.urlLabel
                }
                delete a.uuid;
                delete a.category;
                delete a.websiteUrl;
                b += "<td width='152'><div style='margin-top: 8px; width:150px; height:100px; border: 1px solid #ccc'></td></tr></table>";
                b += "<div style='border-bottom: 1px solid #ccc; height: 0px; overflow: hidden; margin: 10px 0'>&nbsp;</div>";
                b += "<table class='wml-datacard-tags'>";
                for (var c in a) {
                    if (a.hasOwnProperty(c)) {
                        b += "<tr><th>" + c + '</th><td>' + a[c] + "</td></tr>"
                    }
                }
                b += "</table>";
                var d = document.createElement('div');
                d.innerHTML = b;
                p.getInfoWindow(CM.SponsoredCard).expand(d);
                var f = new CM.Map(d.getElementsByTagName('div')[1], p.getCurrentTileLayer());
                f.setCenter(l, 16);
                f.addOverlay(new CM.Marker(l, {
                    icon: m
                }));
                f.disableMouseZoom();
                f.disableDragging();
                return false
            };
            var q = new CM.SponsoredMarker(l, {
                title: j,
                icon: m
            });
            CM.Event.addListener(q, 'click', function () {
                this._geocoder.fireEvent('card_opened', g.tags.uuid)
            }, this);
            CM.Event.addListener(q, 'infowindowopen', function () {
                q.hide()
            }, this);
            CM.Event.addListener(q, 'infowindowclose', function () {
                q.show()
            }, this);
            q.bindInfoWindow(r, {
                maxWidth: 800
            }, CM.SponsoredCard)
        } else {
            var n = "<div class='wml-info-window-heading'>" + j + "</div>";
            if (k.address || k.city || k.state) {
                n += "<div style='margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #aaa'>";
                if (k.address) {
                    n += k.address + "<br />"
                }
                if (k.city) {
                    n += k.city
                }
                if (k.city && k.state) {
                    n += ", "
                }
                if (k.state) {
                    n += k.state
                }
                n += "</div>"
            }
            var o = CM.Util.generateId();
            n += "<div><a href='#' id='datacard-link-zoom" + o + "'>Zoom to this point</a><br /><a href='#' id='datacard-link-more" + o + "'>More info &raquo;</a></div>";
            var r = document.createElement('div');
            r.innerHTML = n;
            var p = this._map;
            var s = this._geocoder._options.host;
            var t = r.getElementsByTagName('a');
            t[0].onclick = function () {
                p.setCenter(l, 18);
                return false
            };
            t[1].onclick = function () {
                var a = CM.Util.extend({}, k);
                var b = "<div class='wml-info-window-heading wml-extended-datacard-heading'>" + j + "</div>";
                b += "<table class='wml-extended-datacard-table'><tr><td valign='top' width='300'>";
                if (a.phone) {
                    b += a.phone + "<br />";
                    delete a.phone
                }
                if (a.address) {
                    b += a.address + "<br />";
                    delete a.address
                }
                if (a.city) {
                    b += a.city;
                    delete a.city;
                    if (a.state) {
                        b += ", " + a.state;
                        delete a.state
                    }
                    b += '<br />'
                }
                if (k.url) {
                    b += "<a href='" + s + a.url + "' target='blank'>" + (a.urlLabel || a.url) + "</a>";
                    delete a.url;
                    delete a.urlLabel
                }
                delete a.uuid;
                delete a.category;
                delete a.websiteUrl;
                b += "<td><div style='width:150px; height:100px; border: 1px solid #ccc'></td></tr></table>";
                b += "<div class='wml-info-window-heading wml-extended-datacard-heading' style='background: #eee; font-size: 11px'>Overview</div>";
                b += "<table class='wml-datacard-tags'>";
                for (var c in a) {
                    if (a.hasOwnProperty(c) && a[c]) {
                        b += "<tr><th>" + c + '</th><td>' + a[c] + "</td></tr>"
                    }
                }
                b += "</table>";
                var d = document.createElement('div');
                d.innerHTML = b;
                p.getInfoWindow(CM.DataCard).updateContent(d);
                var f = new CM.Map(d.getElementsByTagName('div')[1], p.getCurrentTileLayer());
                f.setCenter(l, 16);
                f.addOverlay(new CM.Marker(l, {
                    icon: m
                }));
                f.disableMouseZoom();
                f.disableDragging();
                return false
            };
            var q = new CM.LabeledMarker(l, {
                title: h
            });
            q.bindInfoWindow(r, {
                maxWidth: 800
            }, CM.DataCard)
        }
        this._map.addOverlay(q);
        this._markers.push(q);
        j = j.replace(new RegExp(this._query, "gi"), '<b>' + this._input.value + '</b>');
        var u = document.createElement('a');
        u.className = 'wml-search-panel-item';
        u.href = '#search-result-' + h;
        u.onclick = function () {
            CM.Event.fire(q, 'click');
            return false
        };
        u.innerHTML = '<span class="wml-search-panel-item-num">' + h + '</span> ' + j;
        this._list.appendChild(u)
    }
};
CM.LabeledMarker = function (a, b) {
    this._position = a;
    this._setOptions(b)
};
CM.LabeledMarker.prototype = new CM.Marker();
CM.LabeledMarker.prototype.initialize = function (a) {
    this._map = a;
    this._image = document.createElement('div');
    this._image.className = 'wml-labeled-marker';
    this._label = document.createElement('div');
    this._label.className = 'wml-labeled-marker-content';
    this._image.appendChild(this._label);
    var b = CM.Util.createImage(CM.Util.getRootUrl() + 'images/marker-tip.gif');
    b.className = 'wml-labeled-marker-tip';
    this._image.appendChild(b);
    if (this._options.title) {
        this._label.innerHTML = this._options.title
    } else {
        throw new Error("Please provide a title for the labeled marker.");
    }
    this._map.getPane(CM.Map.MARKER_PANE).appendChild(this._image);
    this._initEvents();
    this._options.icon = {
        iconAnchor: {
            x: 0,
            y: this._image.offsetHeight
        }
    };
    this.redraw(true);
    CM.Event.addListener(a, 'zoomend', this._forceRedraw, this);
    CM.Event.addListener(a, 'tilelayerchanged', this._forceRedraw, this)
};
CM.LabeledMarker.prototype.setTitle = function (a) {
    this._label.innerHTML = a
};
CM.DataCard = function () {
    CM.InfoWindow.apply(this, arguments)
};
CM.Util.extend(CM.DataCard.prototype, CM.InfoWindow.prototype);
CM.DataCard.prototype._initLayout = function () {
    CM.InfoWindow.prototype._initLayout.apply(this, arguments);
    this._container.className += ' wml-datacard'
};
CM.DataCard.prototype._initTip = function () {
    var a = CM.Util.createImage(CM.Util.getRootUrl() + 'images/marker-tip.gif');
    a.className = 'wml-info-window-tip';
    this._container.appendChild(a)
};
CM.DataCard.prototype._updateLayout = function () {
    CM.InfoWindow.prototype._updateLayout.apply(this, arguments);
    this._container.style.width = (parseInt(this._container.style.width) + 15) + 'px';
    this._anchor = this._anchor = new CM.Point(0, 0)
};
CM.DataMarketLayer = function (a) {
    this._setOptions(a);
    if (this._options.styleId && this._options.checkStyle) {
        this._checkStyle()
    }
};
CM.DataMarketLayer.prototype = {
    initialize: function (a) {
        this._map = a;
        this._cache = {};
        this._markerMgr = new CM.MarkerManager(a);
        this._removed = false;
        this.redraw(true);
        CM.Event.addListener(a, 'moveend', this.redraw, this)
    },
    redraw: function (a) {
        if (!a && this._options.styleId && this._options.checkStyle && !this._hasDataSets) {
            return
        }
        if (this._options.styleId && this._lastZoom && (this._map.getZoom() < this._lastZoom)) {
            this._markerMgr.clearMarkers()
        }
        var b = 'cmDataMarket' + (+new Date());
        var c = this._map.getBounds(),
            d = c.getSouthWest(),
            f = c.getNorthEast();
        var g = d.lat() + ',' + d.lng() + ',' + f.lat() + ',' + f.lng();
        var h = this._options.dataHost;
        if (this._options.dataHost.match(/dmp\..*/)) {
            h += '/' + this._options.key + '/find?'
        } else {
            h += '/find?api_key=' + this._options.key + '&'
        }
        h += 'limit=80&bbox=' + g + '&callback=' + b + '&client_type=WML';
        if (this._options.sets) {
            h += '&sets=' + this._options.sets.join(',')
        } else if (this._options.styleId) {
            h += '&styleId=' + this._options.styleId
        }
        h += '&zoom=' + this._map.getZoom();
        CM.Util.getJson(h, this._handleResponse, b, this)
    },
    _checkStyle: function () {
        var a = 'cmDataMarket' + (+new Date());
        var b = this._options.dataHost;
        if (this._options.dataHost.match(/dmp\.cloudmade\.com/)) {
            b += '/' + this._options.key + '/check?'
        } else {
            b += '/check?api_key=' + this._options.key + '&'
        }
        b += 'styleId=' + this._options.styleId + '&callback=' + a + '&client_type=WML';
        CM.Util.getJson(b, this._handleCheckStyle, a, this)
    },
    _handleCheckStyle: function (a) {
        this._hasDataSets = a
    },
    remove: function (a) {
        this._removed = true;
        this._markerMgr.clearMarkers();
        this._lastZoom = null;
        CM.Event.removeListener(a, 'moveend', this.redraw, this)
    },
    _handleResponse: function (q) {
        if (this._removed) {
            return
        }
        this._lastZoom = this._map.getZoom();
        if (q && q.points) {
            var u = {},
                v = [];
            for (i = 0; i < q.points.length; i++) {
                (function (a) {
                    var b = q.points[a],
                        c = b.name,
                        d = new CM.LatLng(b.location[0], b.location[1]),
                        f = CM.Util.extend({}, b.tags);
                    var g = new CM.Icon();
                    g.image = q.icons[b.setId];
                    var h = "<div class='wml-info-window-heading'>" + c + "</div>";
                    h += "<div style='margin-bottom: 10px;'>";
                    if (f.phone) {
                        h += f.phone + "<br />"
                    }
                    if (f.address) {
                        h += f.address + "<br />"
                    }
                    var j = '';
                    if (f.zip) {
                        j += f.zip + ', '
                    }
                    var l = /(, $|^$)/;
                    j += f.city || '';
                    j += j.match(l) ? '' : ', ';
                    j += f.state || '';
                    j += j.match(l) ? '' : ', ';
                    j += f.country || '';
                    h += j.replace(l, '');
                    delete f.phone;
                    delete f.address;
                    delete f.zip;
                    delete f.city;
                    delete f.state;
                    delete f.country;
                    var k = '';
                    for (var m in f) {
                        if (f.hasOwnProperty(m) && f[m]) {
                            k += "<tr><th>" + m + '</th><td>' + f[m] + "</td></tr>"
                        }
                    }
                    if (k) {
                        h += "<table style='margin-top: 10px; border-collapse: collapse' class='wml-datacard-tags'>";
                        h += k;
                        h += "</table>"
                    }
                    h += "</div>";
                    var n = CM.Util.generateId();
                    h += "<div><a href='#' id='datacard-link-zoom" + n + "'>Zoom to this point</a>";
                    var o = document.createElement('div');
                    o.innerHTML = h;
                    var r = this._map;
                    var p = this._options.dataHost;
                    var s = o.getElementsByTagName('a');
                    s[0].onclick = function () {
                        r.setCenter(d, 18);
                        return false
                    };
                    var t = new CM.Marker(d, {
                        title: c,
                        icon: g
                    });
                    t.bindInfoWindow(o, {
                        maxWidth: 300
                    }, CM.DataCard);
                    CM.Event.addListener(t, 'click', function () {
                        CM.Event.fire(this, 'click', b.setId)
                    }, this);
                    v.push(t)
                }).call(this, i)
            }
            this._markerMgr.addMarkers(v)
        }
    },
    _setOptions: function (a) {
        var b = {
            dataHost: "http://dmp.cloudmade.com",
            sets: null,
            styleId: null,
            checkStyle: false
        };
        this._options = CM.Util.extend(b, a || {})
    }
};
CM.ButtonGroupControl = function (a) {
    this._buttons = a
};
CM.ButtonGroupControl.prototype = {
    initialize: function (c) {
        this._map = c;
        this._container = document.createElement('div');
        this._container.className = 'wml-button-group';
        var d = document.createElement('div');
        d.className = 'wml-text-background';
        this._container.appendChild(d);
        for (var f = 0; f < this._buttons.length; f++) {
            (function (a) {
                var b = document.createElement('a');
                b.href = '#';
                b.innerHTML = this._buttons[a].title;
                CM.DomEvent.addListener(b, 'click', CM.DomEvent.stopPropagation);
                CM.DomEvent.addListener(b, 'click', CM.DomEvent.preventDefault);
                CM.DomEvent.addListener(b, 'click', this._buttons[a].action, this);
                this._container.appendChild(b)
            }).call(this, f)
        }
        c.getContainer().appendChild(this._container);
        return this._container
    },
    getDefaultPosition: function () {
        return new CM.ControlPosition(CM.TOP_RIGHT)
    }
};
CM.StyleSidebar = function (a) {
    this._options = CM.Util.extend({
        host: 'http://maps.cloudmade.com'
    }, a || {});
    this._id = CM.Util.generateId()
};
CM.StyleSidebar.prototype = {
    initialize: function (a) {
        this._map = a;
        var b = document.createElement('div');
        b.className = 'wml-sidebar-container';
        var c = document.createElement('div');
        c.className = 'wml-sidebar-heading';
        c.innerHTML = 'Change Style';
        b.appendChild(c);
        var d = document.createElement('div');
        d.className = 'wml-sidebar-content';
        b.appendChild(d);
        var f = document.createElement('form');
        f.method = 'get';
        f.className = 'wml-sidebar-input-form';
        f.onsubmit = CM.Util.bind(this._onSubmit, this);
        this._input = document.createElement('input');
        this._input.type = 'text';
        this._input.className = 'wml-sidebar-input';
        f.appendChild(this._input);
        CM.Event.addListener(this._map, 'sidebaropened', this._onSidebarOpened, this);
        CM.Event.addListener(this._map, 'sidebarclosed', this._onSidebarClosed, this);
        var g = document.createElement('input');
        g.type = 'image';
        g.className = 'wml-sidebar-go';
        g.src = CM.Util.getRootUrl() + 'images/search/go.png';
        f.appendChild(g);
        d.appendChild(f);
        this._list = document.createElement('div');
        this._list.className = 'wml-styles-list';
        d.appendChild(this._list);
        var h = document.createElement('div');
        h.className = 'wml-sidebar-footer';
        var j = document.createElement('a');
        j.href = '#close-sidebar';
        j.className = 'wml-sidebar-close';
        j.onclick = CM.Util.bind(this._onCloseClick, this);
        h.appendChild(j);
        b.appendChild(j);
        this._map.setSidebarContent(b, 215);
        this._search('', '', 0, this._handleResponse)
    },
    _search: function (a, b, c, d) {
        a = a ? a : '';
        var f = 'cmStylesCallback' + (+new Date());
        var g = this._options.host + '/map_styles/search?pattern=' + a + (b ? '&group=' + b : '') + '&offset=' + c + '&callback=' + f;
        if (!c) {
            this._list.innerHTML = '<div class="wml-style-sidebar-item wml-search-panel-item">Searching styles...</div>'
        }
        CM.Util.getJson(g, d, f, this)
    },
    _onCloseClick: function () {
        this._map.closeSidebar();
        return false
    },
    _onSidebarOpened: function () {
        this._input.focus()
    },
    _onSidebarClosed: function () {
        this._input.value = ''
    },
    _onSubmit: function () {
        this._clearResults();
        this._search(this._input.value, '', 0, this._handleResponse);
        return false
    },
    _clearResults: function () {
        this._list.innerHTML = ''
    },
    _typeNames: {
        'default': 'CloudMade Styles',
        featured: 'Featured Styles',
        user: 'Community Styles',
        my: 'My Styles',
        favorite: 'Favourite Styles'
    },
    _handleResponse: function (m) {
        this._list.innerHTML = '';
        if (!m || (m && !m.length)) {
            this._list.innerHTML = '<div class="wml-style-sidebar-item wml-search-panel-item">No styles found.</div>'
        }
        this._oneSelected = false;
        for (var n = 0; n < m.length; n++) {
            (function (b) {
                var c = document.createElement('div');
                c.className = 'wml-style-sidebar-heading';
                c.innerHTML = this._typeNames[m[b].type];
                var d = m[b].elements;
                this._list.appendChild(c);
                var f = 5,
                    g = Math.min(d.length, f),
                    h = d.length,
                    j = d.length - f;
                for (var l = 0; l < g; l++) {
                    this._list.appendChild(this._processItem(d[l]))
                }
                if (j > 0) {
                    var k = document.createElement('a');
                    k.href = '#more-styles';
                    k.className = 'wml-style-sidebar-item wml-search-panel-item wml-style-sidebar-more';
                    k.innerHTML = 'Show ' + j + ' more style' + (j % 10 == 1 ? '' : 's');
                    k.onclick = CM.Util.bind(function () {
                        for (l = g; l < d.length; l++) {
                            this._list.insertBefore(this._processItem(d[l]), k)
                        }
                        k.style.display = 'none';
                        if (j == f) {
                            f += (f < 15 ? 5 : 0);
                            this._search(this._input.value, m[b].type, h, function (a) {
                                d = a[0].elements;
                                g = 0;
                                j = d.length;
                                h += j;
                                k.innerHTML = 'Show ' + j + ' more style' + (j % 10 == 1 ? '' : 's');
                                k.style.display = ''
                            })
                        }
                        return false
                    }, this);
                    this._list.appendChild(k)
                }
            }).call(this, n)
        }
    },
    _processItem: function (a) {
        var b = document.createElement('a');
        b.className = 'wml-style-sidebar-item wml-search-panel-item';
        b.href = '#set-style-' + a.id;
        b.innerHTML = a.name;
        var c = this._map.getCurrentTileLayer();
        if ((a.id == (c.getStyleId && c.getStyleId())) && !this._oneSelected) {
            this._selected = b;
            this._oneSelected = true;
            b.className = b.className.replace('wml-style-sidebar-item ', 'wml-style-sidebar-item-selected ')
        }
        b.onclick = CM.Util.bind(function () {
            if (this._selected) {
                this._selected.className = this._selected.className.replace('wml-style-sidebar-item-selected ', 'wml-style-sidebar-item ')
            }
            this._map.setTileLayer(new CM.Tiles.CloudMade.Web({
                styleId: a.id,
                name: a.name,
                key: this._options.key
            }));
            b.className = b.className.replace('wml-style-sidebar-item ', 'wml-style-sidebar-item-selected ');
            this._selected = b;
            return false
        }, this);
        return b
    }
};
CM.LocationSidebar = function (m) {
    if (!m.token) {
        throw new Error("Please provide a token in CM.LocationSidebar constructor.");
    }
    this._id = CM.Util.generateId();
    this._locations = new CM.Locations(m);
    var n = this;
    this._locations._showLocations = function (a) {
        this._clearLocations();
        if (!a || (a && !a.length)) {
            n._list.innerHTML = '<div class="wml-search-panel-item">No results found.</div>';
            return
        }
        n._list.innerHTML = '';
        if (a && a.length) {
            for (var b = 0; b < a.length; b++) {
                var c = new CM.LatLng(a[b].longitude, a[b].latitude);
                var d = new CM.Marker(c);
                var f = '';
                var g = (b + 1) + '';
                for (var h = 0, j = (a.length + '').length - g.length; h < j; h++) {
                    f += '0'
                }
                g = f + g;
                var l = '';
                if (a[b].photo) {
                    l += '<div classname="wml-location-photo"><img src="' + a[b].photo + '_thumb125+&token=' + m.token + '" alt="' + a[b].description + '" onclick="window.open(\'' + a[b].photo + '&token=' + m.token + '\')" /></div>'
                }
                d.bindInfoWindow(l + '<div class="wml-info-window-heading">Name: ' + a[b].name + '</div><p><b>Description:</b> ' + a[b].description + '</p>');
                this._map.addOverlay(d);
                this._markers.push(d);
                var k = document.createElement('a');
                k.className = 'wml-search-panel-item';
                k.href = '#search-result-' + g;
                k.onclick = function () {
                    CM.Event.fire(d, 'click');
                    return false
                };
                k.innerHTML = '<span class="wml-search-panel-item-num">' + g + '</span> ' + a[b].name;
                n._list.appendChild(k)
            }
        }
    }
};
CM.LocationSidebar.prototype = {
    initialize: function (a) {
        this._map = a;
        var b = document.createElement('div');
        b.className = 'wml-sidebar-container';
        var c = document.createElement('div');
        c.className = 'wml-sidebar-heading';
        c.innerHTML = 'My Places';
        b.appendChild(c);
        var d = document.createElement('div');
        d.className = 'wml-sidebar-content';
        b.appendChild(d);
        var f = document.createElement('form');
        f.method = 'get';
        f.className = 'wml-sidebar-input-form';
        f.onsubmit = CM.Util.bind(this._onSubmit, this);
        this._input = document.createElement('input');
        this._input.type = 'text';
        this._input.className = 'wml-sidebar-input';
        f.appendChild(this._input);
        var g = document.createElement('input');
        g.type = 'image';
        g.className = 'wml-sidebar-go';
        g.src = CM.Util.getRootUrl() + 'images/search/go.png';
        f.appendChild(g);
        d.appendChild(f);
        this._list = document.createElement('div');
        this._list.className = 'wml-search-panel-list';
        d.appendChild(this._list);
        var h = document.createElement('div');
        h.className = 'wml-sidebar-footer';
        var j = document.createElement('a');
        j.href = '#close-sidebar';
        j.className = 'wml-sidebar-close';
        j.onclick = CM.Util.bind(this._onCloseClick, this);
        h.appendChild(j);
        b.appendChild(j);
        CM.Event.addListener(this._map, 'sidebaropened', this._onSidebarOpened, this);
        CM.Event.addListener(this._map, 'sidebarclosed', this._onSidebarClosed, this);
        this._map.setSidebarContent(b, 215)
    },
    _onCloseClick: function () {
        this._map.closeSidebar();
        return false
    },
    _onSidebarOpened: function () {
        this._input.focus();
        this._map.addOverlay(this._locations)
    },
    _onSidebarClosed: function () {
        this._input.value = '';
        this._clearResults();
        this._map.removeOverlay(this._locations)
    },
    _onSubmit: function () {
        this._clearResults();
        this._list.innerHTML = '<div class="wml-search-panel-item">Searching the map...</div>';
        this._locations.search(this._input.value);
        return false
    },
    _clearResults: function () {
        this._map.closeInfoWindow();
        this._locations._clearLocations();
        this._list.innerHTML = ''
    }
};
CM.CloudMadeToolbar = function (a) {
    if (!a.key) {
        throw "Please provide your API key in the CM.CloudMadeToolbar constructor.";
    }
    a = CM.Util.extend({
        styles: true,
        search: true
    }, a || {});
    var b = [];
    if (a.styles) {
        var c = new CM.SearchSidebar({
            key: a.key
        });
        b.push({
            title: 'Search the Map',
            action: function () {
                this._map.toggleSidebar(c)
            }
        })
    }
    if (a.search) {
        var d = new CM.StyleSidebar({
            key: a.key
        });
        b.push({
            title: 'Change Style',
            action: function () {
                this._map.toggleSidebar(d)
            }
        })
    }
    CM.ButtonGroupControl.call(this, b)
};
CM.Util.extend(CM.CloudMadeToolbar.prototype, CM.ButtonGroupControl.prototype);
CM.MarkerManager = function (a, b) {
    this._map = a;
    this._setOptions(b);
    this._cache = {};
    this._queue = []
};
CM.MarkerManager.prototype = {
    addMarker: function (a) {
        this.addMarkers([a])
    },
    addMarkers: function (a) {
        var b = this._map.getBounds(),
            c = b.getSouthWest(),
            d = b.getNorthEast(),
            f, g;
        for (var h = 0, j = a.length; h < j; h++) {
            f = a[h]._position.toString() + ':' + a[h]._options.title + ':' + a[h]._options.icon.image;
            g = a[h]._position;
            if (!this._cache[f]) {
                this._cache[f] = a[h]
            }
            if (!this._cache[f]._added && (g._lat >= c._lat) && (g._lng >= c._lng) && (g._lat <= d._lat) && (g._lng <= d._lng)) {
                this._map.addOverlay(this._cache[f]);
                this._cache[f]._added = true;
                this._queue.push(this._cache[f])
            }
        }
        var l = 0,
            k = false;
        while (this._queue.length > this._options.maxVisible) {
            g = this._queue[l]._position;
            if (k || ((g._lat < c._lat) || (g._lng < c._lng) || (g._lat > d._lat) || (g._lng > d._lng))) {
                this._map.removeOverlay(this._queue[l]);
                this._queue[l]._added = false;
                this._queue.splice(l, 1)
            }
            l++;
            if (l == this._queue.length) {
                l = 0;
                k = true
            }
        }
    },
    clearMarkers: function () {
        for (var a = 0; a < this._queue.length; a++) {
            this._map.removeOverlay(this._queue[a]);
            this._queue[a]._added = false
        }
        this._queue = []
    },
    _setOptions: function (a) {
        this._options = CM.Util.extend({
            maxVisible: 100
        }, a || {})
    }
};
CM.LBA = function (a) {
    this._setOptions(a)
};
CM.LBA.prototype = {
    initialize: function (c) {
        this._map = c;
        this._container = document.createElement('div');
        this._container.className = 'wml-banner';
        var d = function () {
                this.style.display = 'none'
            };
        this._bannerLink = document.createElement('a');
        this._bannerLink.className = 'wml-banner-link';
        this._bannerLink.target = '_blank';
        this._bannerImg = document.createElement('img');
        this._bannerImg.className = 'wml-banner-image';
        this._bannerImg.style.display = 'none';
        this._bannerImg.onerror = d;
        this._bannerLinkExt = document.createElement('a');
        this._bannerLinkExt.className = 'wml-banner-link-ext';
        this._bannerLinkExt.target = '_blank';
        this._bannerImgExt = document.createElement('img');
        this._bannerImgExt.className = 'wml-banner-image-ext';
        this._bannerImgExt.style.display = 'none';
        this._bannerImgExt.onerror = d;
        this._bannerLink.appendChild(this._bannerImg);
        this._container.appendChild(this._bannerLink);
        this._slideFx = new CM.Animation(this._bannerLinkExt);
        CM.DomEvent.addListener(this._container, 'mouseover', function (a) {
            if (!CM.DomEvent.mouseEntered(a, this._container)) {
                return
            }
            this._bannerHovered = true;
            if (!this._extValidated && this._bannerImgExt.validationUrls) {
                this._validateUrls(this._bannerImgExt.validationUrls);
                this._extValidated = true
            }
            var b = {};
            b[this._vProp] = {
                to: 0
            };
            b[this._hProp] = {
                to: 0
            };
            this._slideFx.start(b)
        }, this);
        CM.DomEvent.addListener(this._container, 'mouseout', function (a) {
            if (!CM.DomEvent.mouseLeft(a, this._container)) {
                return
            }
            this._bannerHovered = false;
            var b = {};
            b[this._vProp] = {
                to: -this._bannerImgExt.height - parseInt(this._container.style[this._vProp])
            };
            b[this._hProp] = {
                to: -this._bannerImgExt.width - parseInt(this._container.style[this._hProp])
            };
            this._slideFx.start(b)
        }, this);
        this._bannerLinkExt.appendChild(this._bannerImgExt);
        this._container.appendChild(this._bannerLinkExt);
        this._limitedUpdate = CM.Util.limitExecByInterval(this._update, this._options.updateInterval, this, true);
        if (c.isLoaded()) {
            this._update()
        } else {
            CM.Event.addListener(this._map, 'load', this._limitedUpdate, this)
        }
        CM.Event.addListener(this._map, 'moveend', this._limitedUpdate, this);
        return this._container
    },
    _update: function () {
        var a = this._map.getBounds(),
            b = a.getSouthWest(),
            c = a.getNorthEast(),
            d = this._options.bannerSize,
            f = [b.lat(), b.lng(), c.lat(), c.lng()].join(','),
            g = this._map.getZoom(),
            h = this._options.host,
            j = this._options.key,
            l = 'lba' + (+new Date());
        if (!d) {
            var k = this._map.getSize(),
                m = this._options.bannerMaxWidthPercent,
                n = this._options.bannerMaxHeightPercent;
            d = '0..' + Math.round(k.width * m) + 'x0..' + Math.round(k.height * n)
        }
        this._bannerImgExt.style.display = 'none';
        var o = h + '/' + j + '/api/v2/' + f + '/' + g + '.js?callback=' + l + '&enable=extension&size=' + d;
        if (this._options.testMode) {
            o += '&mode=test'
        }
        CM.Util.getJson(o, this._responseHandler, l, this)
    },
    _responseHandler: function (a) {
        if (!this._posPropInitialized) {
            this._hProp = this._container.style.left ? 'left' : 'right';
            this._vProp = this._container.style.top ? 'top' : 'bottom';
            this._posPropInitialized = true
        }
        var b = a && a[0];
        if (b) {
            this._bannerLink.href = b.websiteUrl;
            this._bannerImg.onload = CM.Util.bind(function () {
                this._bannerImg.style.display = '';
                this._validateUrls(b.validationUrls)
            }, this);
            this._bannerImg.src = b.imageUrl;
            if (b.extension) {
                this._bannerLinkExt.href = b.extension.websiteUrl;
                this._bannerImgExt.onload = CM.Util.bind(function () {
                    if (this._bannerHovered) {
                        this._bannerLinkExt.style[this._vProp] = '0';
                        this._bannerLinkExt.style[this._hProp] = '0';
                        this._validateUrls(b.extension.validationUrls);
                        this._extValidated = true
                    } else {
                        this._bannerLinkExt.style[this._vProp] = (-this._bannerImgExt.height - parseInt(this._container.style[this._vProp])) + 'px';
                        this._bannerLinkExt.style[this._hProp] = (-this._bannerImgExt.width - parseInt(this._container.style[this._hProp])) + 'px';
                        this._extValidated = false
                    }
                    this._bannerImgExt.style.display = '';
                    this._bannerImgExt.validationUrls = b.extension.validationUrls
                }, this);
                this._bannerImgExt.src = b.extension.imageUrl
            }
        } else {
            this._bannerImg.style.display = 'none';
            this._bannerImgExt.style.display = 'none'
        }
    },
    _validateUrls: function (a) {
        for (var b = 0; b < a.length; b++) {
            (new Image()).src = a[b]
        }
    },
    _setOptions: function (a) {
        if (!a.key) {
            throw "Please provide your API as a third argument.";
        }
        var b = {
            host: "http://lba.cloudmade.com",
            keyword: '',
            bannerSize: '',
            bannerMaxWidthPercent: 2 / 3,
            bannerMaxHeightPercent: 1 / 3,
            updateInterval: 5000,
            testMode: false
        };
        this._options = CM.Util.extend(b, a)
    },
    getDefaultPosition: function () {
        return new CM.ControlPosition(CM.BOTTOM_RIGHT, new CM.Size(0, 17))
    }
};
CM.MarkerClusterer = function (a, b) {
    this._map = a;
    this._setOptions(b);
    this._markers = [];
    this._clusters = {};
    this._redrawPool = {};
    CM.Event.addListener(a, 'moveend', this._resetView, this)
};
CM.MarkerClusterer.prototype = {
    _setOptions: function (a) {
        this._options = CM.Util.extend({
            clusterRadius: 70,
            maxZoomLevel: this._map._baseLayer.getMaxZoomLevel() - 1
        }, a || {})
    },
    addMarker: function (a, b) {
        var c = this._options.clusterRadius,
            d = this._map._baseLayer.getProjection(),
            f = this._map.getZoom(),
            g = d.fromLatLngToPixel(a.getLatLng(), f),
            h;
        if (f <= this._options.maxZoomLevel) {
            for (var j in this._clusters) {
                if (this._clusters.hasOwnProperty(j)) {
                    var l = d.fromLatLngToPixel(this._clusters[j]._center, f);
                    if (Math.pow(g.x - l.x, 2) + Math.pow(g.y - l.y, 2) <= c * c) {
                        h = this._clusters[j];
                        break
                    }
                }
            }
        }
        if (!h) {
            h = new CM.MarkerClusterer.Cluster(this);
            this._clusters[h._id] = h
        }
        h.addMarker(a);
        if (b) {
            this._redrawPool[h._id] = h
        } else {
            h.redraw()
        }
    },
    addMarkers: function (a, b) {
        for (var c = 0, d = a.length; c < d; c++) {
            this.addMarker(a[c], true)
        }
        if (!b) {
            this._redraw()
        }
    },
    _redraw: function () {
        for (var a in this._redrawPool) {
            if (this._redrawPool.hasOwnProperty(a)) {
                this._redrawPool[a].redraw()
            }
        }
        this._redrawPool = {}
    },
    _resetView: function () {
        var a = this._getClustersInView(),
            b = this._map.getZoom(),
            c = [];
        for (var d = 0, f = a.length; d < f; d++) {
            if (a[d]._zoom != b) {
                a[d].remove();
                delete this._clusters[a[d]._id];
                c = c.concat(a[d]._markers)
            }
        }
        this.addMarkers(c)
    },
    _getClustersInView: function () {
        var a = this._map.getZoom(),
            b = [],
            c = this._options.clusterRadius,
            d = this._map.getBounds(),
            f = this._map._baseLayer.getProjection(),
            g = f.fromLatLngToPixel(d.getSouthWest(), a),
            h = f.fromLatLngToPixel(d.getNorthEast(), a);
        for (var j in this._clusters) {
            if (this._clusters.hasOwnProperty(j)) {
                var l = f.fromLatLngToPixel(this._clusters[j]._center, a);
                if ((a <= 1) || ((l.x >= g.x - c) && (l.y >= h.y - c) && (l.x <= h.x + c) && (l.y <= g.y + c))) {
                    b.push(this._clusters[j])
                }
            }
        }
        return b
    }
};
CM.MarkerClusterer.Cluster = function (a) {
    this._id = CM.Util.generateId();
    this._clusterer = a;
    this._map = a._map;
    this._zoom = this._map.getZoom();
    this._markers = []
};
CM.MarkerClusterer.Cluster.prototype = {
    addMarker: function (a) {
        if (!this._center) {
            this._center = a.getLatLng()
        }
        this._markers.push(a)
    },
    zoomToCluster: function () {
        var a = [];
        for (var b = 0, c = this._markers.length; b < c; b++) {
            a.push(this._markers[b].getLatLng())
        }
        this._map.zoomToBounds(new CM.LatLngBounds(a))
    },
    redraw: function () {
        var a = this._markers.length;
        if (!this._clusterMarker) {
            this._createClusterMarker(a)
        } else {
            if (a != this._prevLen) {
                this.remove();
                this._createClusterMarker(a)
            }
        }
        this._prevLen = a
    },
    remove: function () {
        this._map.removeOverlay(this._clusterMarker)
    },
    _createClusterMarker: function (a) {
        if (a > 1) {
            var b = a,
                c = -1;
            while (b !== 0) {
                b = Math.floor(b / 10);
                c++
            }
            c = Math.min(CM.MarkerClusterer.ICONS.length - 1, c);
            this._clusterMarker = new CM.MarkerClusterer.ClusterMarker(this._center, {
                title: a,
                icon: CM.MarkerClusterer.ICONS[c]
            });
            CM.Event.addListener(this._clusterMarker, 'click', this.zoomToCluster, this)
        } else if (a == 1) {
            this._clusterMarker = this._markers[0]
        }
        this._map.addOverlay(this._clusterMarker)
    },
    _updateClusterMarker: function (a) {
        if (a > 1) {
            this._clusterMarker.setTitle(this._markers.length)
        }
    }
};
(function () {
    rootUrl = CM.Util.getRootUrl();
    CM.MarkerClusterer.ICONS = [];
    for (var a = 0; a < 5; a++) {
        var b = new CM.Icon();
        b.image = rootUrl + 'images/clustering/0' + (5 - a) + '.png';
        CM.MarkerClusterer.ICONS.push(b)
    }
})();
CM.MarkerClusterer.ClusterMarker = function (a, b) {
    this._position = a;
    this._setOptions(b)
};
CM.MarkerClusterer.ClusterMarker.prototype = new CM.Marker();
CM.MarkerClusterer.ClusterMarker.prototype.initialize = function (a) {
    this._label = document.createElement('div');
    this._label.className = 'wml-cluster-marker-content';
    this._label.innerHTML = this._options.title;
    CM.Marker.prototype.initialize.call(this, a);
    this._map.getPane(CM.Map.MARKER_PANE).appendChild(this._label)
};
CM.MarkerClusterer.ClusterMarker.prototype.redraw = function (a) {
    CM.Marker.prototype.redraw.call(this, a);
    this._label.style.left = this._image.style.left;
    this._label.style.top = this._image.style.top;
    this._label.style.zIndex = this._image.style.zIndex;
    this._label.style.width = this._image.offsetWidth + 'px';
    this._label.style.height = this._label.style.lineHeight = this._image.offsetHeight + 'px'
};
CM.MarkerClusterer.ClusterMarker.prototype.remove = function (a) {
    CM.Marker.prototype.remove.call(this, a);
    this._map.getPane(CM.Map.MARKER_PANE).removeChild(this._label)
};
CM.MarkerClusterer.ClusterMarker.prototype._initEvents = function () {
    CM.Marker.prototype._initEvents.call(this);
    CM.DomEvent.stopMousePropagation(this._label);
    CM.DomEvent.addListener(this._label, 'click', this._createMouseHandler('click'), this)
};