Ext.namespace("openaddresses");

openaddresses.quality = [
    ['Digitized', OpenLayers.i18n('Digitized')],
    ['GPS', OpenLayers.i18n('GPS')],
    ['Linear interpolation', OpenLayers.i18n('Linear interpolation')]
];

openaddresses.qualityStore = new Ext.data.ArrayStore({
    storeId: 'qualityStore',
    data: openaddresses.quality,
    autoLoad: true,
    fields: [
        'qualityCode',
        'quality'
    ]
});

openaddresses.qualityStore.getValueFromCode = function(code) {
    var qualityIndex = openaddresses.qualityStore.find('qualityCode', code);
    var qualityRecord = openaddresses.qualityStore.getAt(qualityIndex);
    return qualityRecord.data.quality;
};

openaddresses.qualityStore.getCodeFromValue = function(value) {
    var qualityIndex = openaddresses.qualityStore.find('quality', value);
    var qualityRecord = openaddresses.qualityStore.getAt(qualityIndex);
    return qualityRecord.data.qualityCode;
};