/*
 * @requires OpenLayers/Control.js
 * @include OpenLayers/Handler/Hover.js
 */

Ext.namespace("openaddresses");

openaddresses.hover = OpenLayers.Class(OpenLayers.Control, {
    defaultHandlerOptions: {
        'delay': 500,
        'pixelTolerance': null,
        'stopMove': false
    },

    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend(
        {}, this.defaultHandlerOptions
                );
        OpenLayers.Control.prototype.initialize.apply(
                this, arguments
                );
        this.handler = new OpenLayers.Handler.Hover(
                this,
        {'pause': this.onPause, 'move': this.onMove},
                this.handlerOptions
                );
    },

    onPause: function(evt) {
        openaddresses.layout.map.showLocationInMapRequestOngoing = false;
        openaddresses.layout.showLocationTooltip(evt);
    },

    onMove: function(evt) {
        // if this control sent an Ajax request (e.g. GetFeatureInfo) when
        // the mouse pauses the onMove callback could be used to abort that
        // request.
    }
});