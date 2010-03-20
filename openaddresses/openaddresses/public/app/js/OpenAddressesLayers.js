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
            "CH_SITN_Ortho",
            openaddresses.config.baseWMS,
    {layers: 'SITN_ortho',
        transparent: "false",
        format:"image/jpeg"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        opacity: 0.7,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 50,
        attribution:"CH_SITN_Ortho: Server WMS du SITN open",
        maxExtent: openaddresses.createBoundsFrom4326(6.31728, 46.7671, 7.1777, 47.222)}
            ),
    new OpenLayers.Layer.WMS(
            "CH_GENEVE_ortho",
            openaddresses.config.baseWMS,
    {layers: 'GENEVE_ortho',
        transparent: "false",
        format:"image/jpeg"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        opacity: 0.7,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 50,
        attribution:"CH_GENEVE_ortho: etat.geneve.ch",
        maxExtent: openaddresses.createBoundsFrom4326(5.918669, 46.105563, 6.314182, 46.379977)}
            ),
    new OpenLayers.Layer.WMS(
            "DE_adv_dop",
            openaddresses.config.baseWMS,
    {layers: 'adv_dop',
        transparent: "false",
        format:"image/jpeg"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        opacity: 0.7,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 200,
        attribution:"DE_adv_dop: Staatsbetrieb Geobasisinformation und Vermessung Sachsen (GeoSN)",
        maxExtent: openaddresses.createBoundsFrom4326(11.863, 50.145, 15.034, 51.716)}
            ),
    new OpenLayers.Layer.WMS(
            "CH_Lausanne_EPFL",
            openaddresses.config.baseWMS,
    {layers: 'lausanne_epfl',
        transparent: "false",
        format:"image/jpeg"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        opacity: 0.7,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 20,
        attribution:"CH_Lausanne_EPFL: WMS server for Lausanne and EPFL raster images",
        maxExtent: openaddresses.createBoundsFrom4326(6.558, 46.500, 6.682, 46.555)}
            ),
    new OpenLayers.Layer.WMS(
            "ES_Andalucia",
            openaddresses.config.baseWMS,
    {layers: 'andalucia',
        transparent: "false",
        format:"image/jpeg"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        opacity: 0.7,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 20,
        attribution:"ES_Andalucia: Instituto de Cartografia de Andalucia. Consejeria de Vivienda y Ordenacion del Territorio. Junta de Andalucia",
        maxExtent: openaddresses.createBoundsFrom4326(-4.536, 37.320, -1.94, 38.572)}
            ),
    new OpenLayers.Layer.WMS(
            "CH_SOGIS",
            openaddresses.config.baseWMS,
    {layers: 'sogis',
        transparent: "false",
        format:"image/jpeg"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        opacity: 0.7,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 20,
        attribution:"CH_SOGIS: Abteilung SO!GIS Koordination Amt fuer Geoinformation",
        maxExtent: openaddresses.createBoundsFrom4326(7.34084, 47.0741, 8.03378, 47.5041)}
            ),
    new OpenLayers.Layer.WMS(
            "AT_Kärnten",
            openaddresses.config.baseWMS,
    {layers: 'karnten',
        transparent: "false",
        format:"image/jpeg"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        opacity: 0.7,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 3,
        attribution:"AT_Kärnten: Amt der Kärntner Landesregierung, Kärntner Geographisches Informationssystem (KAGIS)",
        maxExtent: openaddresses.createBoundsFrom4326(12.6078, 46.3413, 15.11358, 47.16447)}
            ),
    new OpenLayers.Layer.WMS(
            "IT_Toscana",
            openaddresses.config.baseWMS,
    {layers: 'toscana',
        transparent: "false",
        format:"image/jpeg"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        opacity: 0.7,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 3,
        attribution:"IT_Toscana: GeoscopipWMS _rt_wms_wgs84 Web Map Service",
        maxExtent: openaddresses.createBoundsFrom4326(10.07729, 43.73522, 11.26259, 44.303045)}
            ),
    new OpenLayers.Layer.WMS(
            "US_Minnesota",
            openaddresses.config.baseWMS,
    {layers: 'minnesota',
        transparent: "false",
        format:"image/jpeg"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        opacity: 0.7,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 1500,
        attribution:"US_Minnesota: LMIC WMS server (aerial photography)",
        maxExtent: openaddresses.createBoundsFrom4326(-97.39, 43.3699, -89.32999, 49.409)}
            ),
    new OpenLayers.Layer.WMS(
            "DE_Mecklenburg_Vorpommern",
            openaddresses.config.baseWMS,
    {layers: 'mecklenburg',
        transparent: "false",
        format:"image/jpeg"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        opacity: 0.7,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 20,
        attribution:"DE_Mecklenburg_Vorpommern: Geodateninfrastruktur Mecklenburg-Vorpommern",
        maxExtent: openaddresses.createBoundsFrom4326(10.3493, 53.0058, 14.6948, 54.7744)}
            ),
    new OpenLayers.Layer.WMS(
            "DE_Bayern",
            openaddresses.config.baseWMS,
    {layers: 'bayern',
        transparent: "false",
        format:"image/jpeg"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        opacity: 0.7,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 300,
        minResolution: 2,
        attribution:"DE_Bayern: Web Map Service der Bayerischen Vermessungsverwaltung",
        maxExtent: openaddresses.createBoundsFrom4326(8.89292, 47.08279, 13.97819, 50.626899)}
            ),
    new OpenLayers.Layer.WMS(
            "CH_Building",
            openaddresses.config.baseWMS,
    {layers: 'building',
        transparent: "true",
        format:"image/png"},
    {singleTile:true,
        isBaseLayer: false,
        transitionEffect: "resize",
        ratio: 1.0,
        opacity: 0.7,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 5,
        attribution:"CH_Building: BGDI WMS Dienst mit oeffentlich zugaenglichen Daten",
        maxExtent: openaddresses.createBoundsFrom4326(5.90971, 45.7899, 10.5604, 47.8154)}
            )
];

