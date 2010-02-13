Ext.namespace("openaddresses");

openaddresses.quality = [
    [OpenLayers.i18n('Digitized')],
    [OpenLayers.i18n('GPS')],
    [OpenLayers.i18n('Linear interpolation')]
];

openaddresses.qualityStore = new Ext.data.ArrayStore({
    storeId: 'qualityStore',
    data: openaddresses.quality,
    autoLoad: true,
    fields: [
        'quality',
    ]
});