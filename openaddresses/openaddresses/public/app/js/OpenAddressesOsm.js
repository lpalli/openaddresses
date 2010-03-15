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

/**
 * @requires OpenLayers/BaseTypes/Class.js
 * @requires OpenLayers/Layer/XYZ.js
 */

Ext.namespace("openaddresses");

openaddresses.OSM = OpenLayers.Class(OpenLayers.Layer.OSM, {

    initialize: function(options) {
        options.numZoomLevels = 23;
        options.ratio = 1;
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