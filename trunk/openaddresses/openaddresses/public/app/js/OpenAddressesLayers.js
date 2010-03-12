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

Ext.namespace('openaddresses');

/*
 * @requires app/js/OpenAddressesConfig.js
 * @requires OpenLayers/Layer/WMS.js
 * @include OpenLayers/Projection.js
 * @include OpenLayers/BaseTypes/LonLat.js
 */
openaddresses.createBoundsFrom4326 = function(minx, miny, maxx, maxy) {
    var bl = new OpenLayers.LonLat(minx, miny);
    var tr = new OpenLayers.LonLat(maxx, maxy);
    bl.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
    tr.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
    var bounds = new OpenLayers.Bounds();
    bounds.extend(bl);
    bounds.extend(tr);
    return bounds;
};

openaddresses.layers = [
    new OpenLayers.Layer.WMS(
            "SITN_Ortho",
            openaddresses.config.baseWMS,
    {layers: 'SITN_ortho',
        transparent: "true",
        format:"image/png"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 50,
        maxExtent: openaddresses.createBoundsFrom4326(6.31728, 46.7671, 7.1777, 47.222)}
            ),
    new OpenLayers.Layer.WMS(
            "GENEVE_ortho",
            openaddresses.config.baseWMS,
    {layers: 'GENEVE_ortho',
        transparent: "false",
        format:"image/jpeg"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 50,
        maxExtent: openaddresses.createBoundsFrom4326(5.918669, 46.105563, 6.314182, 46.379977)}
            )
];

