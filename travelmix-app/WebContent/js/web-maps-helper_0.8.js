/*
 * Copyright (c) 2008-2010 CloudMade. version 0.8
 */
MapState = {
    map : null,
    map_base_config : {},
    map_config : function(id) {
        MapState.map_base_config.styleId = id
        return MapState.map_base_config;
    },
    init : function(map_div, map_state, is_my_style) {
        MapState.tile_server_url = map_state.tile_server_url;
        MapState.tile_cache = null;
        MapState.map_base_config = {
            tileUrlTemplate : 'http://' + (map_state.subdomains ? '#{subdomain}.' : '') + map_state.tile_server_url.replace('http://', '')
                    + '/#{key}/#{styleId}/#{tileSize}/#{zoom}/#{x}/#{y}.png',
            subdomains : map_state.subdomains,
            key : map_state.api_key,
            styleId : map_state.styleId,
            enableDataMarket : false
        };
        MapState.load_tile_layer();
        var map = new CM.Map(map_div, MapState.tile_layer);
        MapState.init_params = {
            lat : Number(map_state.lat),
            lng : Number(map_state.lng),
            zoom : Number(map_state.zoom)
        }
        MapLayout.init();
        MapState.map = map;
        MapState.init_view();
        MapState.updateDM(is_my_style);
    },
    updateDM : function(is_my_style) {
        if (MapState.DMlayer) {
            MapState.map.closeInfoWindow()
            MapState.map.removeOverlay(MapState.DMlayer)
            MapState.DMlayer = null;
        }
        if (is_my_style) {
            MapState.DMlayer = new CM.DataMarketLayer({
                dataHost : DATA_MARKET_SERVER_URL,
                key : MapState.map_base_config.key,
                styleId : MapState.id()
            });
            MapState.map.addOverlay(MapState.DMlayer);
        }
    },
    load_tile_layer : function() {
        MapState.tile_layer = new CM.Tiles.CloudMade.Web(MapState.map_base_config);
        MapState.tile_layer.getTileUrl = function() {
            var url = CM.Tiles.CloudMade.Web.prototype.getTileUrl.apply(this, arguments);
            return (null == MapState.tile_cache) ? url : (url + "?" + MapState.tile_cache)
        };
    },
    init_view : function() {
        MapState.map.setCenter(new CM.LatLng(MapState.init_params.lat, MapState.init_params.lng), MapState.init_params.zoom);
        MapState.initMapContols(MapState.map);
        if (MapState.initCustomEvent) {
            MapState.initCustomEvent(MapState.map);
        }
    },
    switchMapStyle : function(id, is_my_style) {
        if (MapState.id() != id) {
            MapState.map_base_config.styleId = id;
            MapState.load_tile_layer();
            MapState.map.setTileLayer(MapState.tile_layer);
            MapState.updateDM(is_my_style);
        }
    },  
    initMapContols : function(map) {
        map.enableDoubleClickZoom();
        map.enableShiftDragZoom();
        map.enableScrollWheelZoom();
        map.addControl(new CM.LargeMapControl());
        MapState.permalinkControl = new CM.PermalinkControl();
        MapState.permalinkControl._update = function() {
            this._link.href = this._getPermalink().replace(/\&?(styleId|layer)=\d*/g, "") + '&styleId=' + MapState.id();
        }
        var bottomLeft = new CM.ControlPosition(CM.BOTTOM_LEFT, new CM.Size(0, 0));
        map.addControl(MapState.permalinkControl, bottomLeft);
        map.addControl(new CM.ScaleControl());
    },
    refresh : function() {
        MapState.map._forceRedraw = true;
        MapState.map.setCenter(MapState.map.getCenter(), MapState.zoom());
    },
    set_zoom : function(zoom) {
        MapState.map.setZoom(zoom);
    },
    zoom : function() {
        return MapState.map.getZoom();
    },
    lat : function() {
        return MapState.map.getBounds().getCenter().lat();
    },
    lng : function() {
        return MapState.map.getBounds().getCenter().lng();
    },
    id : function() {
        return MapState.map.styleId || MapState.map.getCurrentTileLayer().getStyleId();
    }
}

MapLayout = {
    init : function() {
        MapLayout.refresh();
        $(window).resize(MapLayout.refresh);
    },
    refresh : function() {
        var map_block = document.getElementById('map');
        var bg = document.getElementById('mapContainer');
        var screenHeight = document.body.offsetHeight;
        map_block.style.height = (screenHeight >= 0 ? screenHeight : 0) + 'px';
        bg.style.height = (screenHeight >= 0 ? screenHeight : 0) + 'px';
    }
};
