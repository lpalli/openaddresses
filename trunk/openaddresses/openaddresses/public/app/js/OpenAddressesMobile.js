/**
 * @requires app/js/OpenAddressesMobileConfig.js
 * @include iui/iui.js
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
 */

openaddressesMobile = (function() {

    /**
     * private
     */

    var map, osm, address, markers;
    var ZOOMLEVEL_ON_RECENTER = 0;
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
            map.setCenter(new OpenLayers.LonLat(lon, lat), ZOOMLEVEL_ON_RECENTER);
            markers.clearMarkers();
            markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(lon, lat)));
        },

        getMap: function() {
            return map;
        },

        init: function() {
            map = new OpenLayers.Map('map', {
                controls: [
                    getZoomPanel(),
                    new IOL.Control.Navigation()
                ]
            });
            osm = new OpenLayers.Layer.OSM();
            address = new OpenLayers.Layer.WMS(
                    OpenLayers.i18n("Addresses"),
                    openaddressesMobileConfig.addressWMS(),
            {layers: 'address',
                transparent: "true",
                format:"image/png"},
            {singleTile:true,
                isBaseLayer: false,
                transitionEffect: "resize",
                ratio: 1.5,
                numZoomLevels: 23}
                    );
            markers = new OpenLayers.Layer.Markers("Markers");
            map.addLayers([osm, address, markers]);
            map.zoomToExtent(new OpenLayers.Bounds.fromArray(DEFAULT_EXTENT));

            iui.parsers.__default_parser__ = function(json) {
                var html = '';
                var obj = eval('(' + json + ')');
                if (obj && obj.features && obj.features.length > 0) {
                    html += '<ul title="Results" actionbutton="{visible: false}">';
                    for (var i = 0, len = obj.features.length; i < len; i++) {
                        var feature = obj.features[i];
                        html += '<li><a href="#map" onclick="app.setCenter(' +
                                feature.geometry.coordinates[0] + ',' +
                                feature.geometry.coordinates[1] + ')">[' +
                                feature.properties.category + '] ' +
                                feature.properties.text + '</a></li>';
                    }
                    html += '</ul>';
                }
                else {
                    html = "#no_result";
                }
                return html;
            };
        }
    };
})();

