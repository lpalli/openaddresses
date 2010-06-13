/**
 * @requires app/js/OpenAddressesMobileOsm.js
 * @requires OpenLayers/BaseTypes/Class.js
 * @include IOL/Control/Panel.js
 * @include IOL/Control/Navigation.js
 * @include OpenLayers/Control/ZoomIn.js
 * @include OpenLayers/Control/ZoomOut.js
 * @include OpenLayers/Control/ZoomToMaxExtent.js
 * @include OpenLayers/Map.js
 * @include OpenLayers/Layer/XYZ.js
 * @include OpenLayers/Layer/WMS.js
 * @include OpenLayers/Layer/Markers.js
 * @include OpenLayers/Marker.js
 * @include OpenLayers/Projection.js
 * @include OpenLayers/BaseTypes/Bounds.js
 */

openaddressesGeolocation = (function() {

    /**
     * private
     */

    var map, osm, markers;
    //var DEFAULT_EXTENT = [-20000000,-20000000,20000000,20000000];
    var DEFAULT_EXTENT = [730154.802927831,5863118.72088469,733325.224489161,5865045.8547912];

    var getZoomPanel = function() {
        var zoomPanel = new IOL.Control.Panel({
            map: map,
            displayClass: "olBigControlZoomPanel"
        });
        zoomPanel.addControls([
            new OpenLayers.Control.ZoomIn(),
            new OpenLayers.Control.ZoomToMaxExtent(),
            new OpenLayers.Control.ZoomOut()
        ]);

        return zoomPanel;
    };


    return {

        /**
         * public
         */

        setCenter: function(lon, lat) {
            map.setCenter(new OpenLayers.LonLat(lon, lat), 17);
            markers.clearMarkers();
            markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(lon, lat)));
        },

        centerMap: function(position) {
            console.log(position);
            position.transform(
                    new OpenLayers.Projection("EPSG:4326"),
                    map.getProjectionObject()
                    );
            openaddressesGeolocation.setCenter(position.coords.latitude, position.coords.longitude);
            // Show a map centered at (position.coords.latitude, position.coords.longitude).
        },

        getMap: function() {
            return map;
        },

        init: function() {
            map = new OpenLayers.Map('map', {
                projection: new OpenLayers.Projection("EPSG:900913"),
                displayProjection: new OpenLayers.Projection("EPSG:4326"),
                units: "m",
                maxResolution: 156543.0339,
                maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
                        20037508, 20037508.34),
                numZoomLevels: 23,
                allOverlays: false,
                controls: [
                    getZoomPanel(),
                    new IOL.Control.Navigation()
                ]
            });
            osm = new OpenLayers.mobileOSM({
                isBaseLayer: true,
                buffer: 0,
                transitionEffect: "resize"
            });
            markers = new OpenLayers.Layer.Markers("Markers");
            map.addLayers([osm,markers]);

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(openaddressesGeolocation.centerMap);
                //map.zoomToExtent(new OpenLayers.Bounds.fromArray(DEFAULT_EXTENT));
            } else {
                alert('Your navigation doesn\'t support geolocation');
            }
        }
    };
})();

