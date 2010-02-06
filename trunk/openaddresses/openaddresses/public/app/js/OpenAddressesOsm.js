/**
 * @requires OpenLayers/BaseTypes/Class.js
 * @requires OpenLayers/Layer/XYZ.js
 */

Ext.namespace("openaddresses");

openaddresses.OSM = OpenLayers.Class(OpenLayers.Layer.OSM, {

    initialize: function(options) {
        options.numZoomLevels = 23;
        var newArguments = [null, options.url ? options.url : null, options];
        OpenLayers.Layer.OSM.prototype.initialize.apply(this, newArguments);
    },

    getURL: function (bounds) {
        if (this.map.getZoom() > 18) {
            return null;
        } else {
            return OpenLayers.Layer.OSM.prototype.getURL.apply(this, arguments);
        }
    },

    CLASS_NAME: "openaddresses.OSM"
});