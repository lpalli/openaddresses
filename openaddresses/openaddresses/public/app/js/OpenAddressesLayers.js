Ext.namespace('openaddresses');

openaddresses.layers = [
    new OpenLayers.Layer.WMS(
            "SITN_Ortho",
            "http://127.0.0.1/cgi-bin/mapserv.exe?map=C:\\Sandbox\\openadresses\\trunk\\openaddresses\\mapserver\\cascading.map",
    {layers: 'SITN_sitn',
        transparent: "true",
        format:"image/png"},
    {singleTile:true,
        buffer: 0,
        ratio: 1,
    numZoomLevels: 25}
            )
];