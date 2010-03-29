/*
 * Copyright (C) 2009  www.openaddresses.org
 *
 * This file is part openaddresses.org
 *
 * www.openaddresses.org is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * www.openaddresses.org is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with www.openaddresses.org.  If not, see <http://www.gnu.org/licenses/>.
 */

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
        {'pause': this.onPause,
            'move': this.onMove},
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