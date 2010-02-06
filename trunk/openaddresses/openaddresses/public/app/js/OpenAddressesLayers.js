Ext.namespace('openaddresses');

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
        buffer: 0,
        ratio: 1,
        numZoomLevels: 23,
        displayOutsideMaxExtent: false,
        maxResolution: 50,
        maxExtent: openaddresses.createBoundsFrom4326(6.31728, 46.7671, 7.1777, 47.222)}
            )
];

