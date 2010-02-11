/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/*
 * @requires OpenLayers/Control.js
 * @include OpenLayers/Handler/Click.js
 * @include OpenLayers/Projection.js
 * @include OpenLayers/Control/ModifyFeature.js
 * @include OpenLayers/BaseTypes/LonLat.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Geometry/Point.js
 */

Ext.namespace("openaddresses");

openaddresses.EditControl = OpenLayers.Class(OpenLayers.Control, {

    /** api: property[defaultHandlerOptions]
     *  Default options.
     */
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },

    /** private: method[initialize]
     *  Initializes the control
     */
    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.handler = new OpenLayers.Handler.Click(this, {
            'click': this.onClick,
            'dblclick': this.onDblclick},
                this.handlerOptions
                );
    },

    /** private: method[onClick]
     */
    onClick: function(evt) {
        // Pseudo code
        // 1. Check if an address exists at this position
        //  2. If yes
        //     - show a movable circle in the map at the position of the address (create a modify feature control)
        //     - show the edition popup
        //  3. if no
        //     - show a movable circle in the map at the digitized poistion
        //     - show the edition popup
        var clickedPosition = openaddresses.layout.map.getLonLatFromViewPortPx(evt.xy);
        var clickePositionWGS84 = clickedPosition.clone();
        clickePositionWGS84.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));

        var vectorLayer = openaddresses.layout.map.getLayersByName('DrawingLayer')[0];

        // 1. Check if an address exists at this position
        Ext.Ajax.request({
            url: 'addresses/',
            method: 'GET',
            success: function(responseObject) {
                var mapfishFeatures = eval('(' + responseObject.responseText + ')');

                if (!openaddresses.layout.map.modifyFeatureControl) {
                    openaddresses.layout.map.modifyFeatureControl = new OpenLayers.Control.ModifyFeature(vectorLayer);
                    openaddresses.layout.map.addControl(openaddresses.layout.map.modifyFeatureControl);
                    openaddresses.layout.map.modifyFeatureControl.activate();
                }
                var feature;
                if (mapfishFeatures.features.length === 0) {
                    feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(clickedPosition.lon, clickedPosition.lat));
                } else {
                    var featurePosition = new OpenLayers.LonLat(mapfishFeatures.features[0].geometry.coordinates[0], mapfishFeatures.features[0].geometry.coordinates[1]);
                    featurePosition.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
                    feature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(featurePosition.lon, featurePosition.lat));
                }

                vectorLayer.addFeatures(feature);
                openaddresses.layout.map.modifyFeatureControl.selectControl.select(feature);
                openaddresses.layout.map.modifyFeatureControl.selectControl.handlers.feature.feature = feature;
            },
            failure: function() {
                alert('Error in addresses GET query');
            },
            params: { lon: clickePositionWGS84.lon,
                lat: clickePositionWGS84.lat,
                //tolerance: 0.0001
                tolerance: 3
            }
        });

    },

    /** private: method[onDblclick]
     *  Not implemented
     */
    onDblclick: function(evt) {
        alert('doubleClick');
    }
});
