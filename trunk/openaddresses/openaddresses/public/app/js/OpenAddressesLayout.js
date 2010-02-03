/*
 * @include OpenLayers/Map.js
 * @include OpenLayers/Lang.js
 * @include OpenLayers/Projection.js
 * @include OpenLayers/Layer/XYZ.js
 * @include OpenLayers/Tile/Image.js
 * @include OpenLayers/Control/Navigation.js
 * @include OpenLayers/Control/PanZoomBar.js
 * @include OpenLayers/Control/MousePosition.js
 * @include GeoExt/data/LayerStore.js
 * @include GeoExt/widgets/MapPanel.js
 * @include GeoExt/widgets/tree/LayerContainer.js
 * @include app/js/OpenAddressesLanguage.js
 * @include geoext-ux-dev/DisplayProjectionSelectorCombo/ux/widgets/form/DisplayProjectionSelectorCombo.js
 * @include geoext-ux-dev/ScaleSelectorCombo/ux/widgets/form/ScaleSelectorCombo.js
 */

Ext.namespace("openaddresses");

openaddresses.layout = (function() {
    /*
     * Private
     */

    /**
     * Method: createMap
     * Create the map.
     *
     * Returns:
     * {OpenLayers.Map} The OpenLayers.Map instance.
     */
    var createMap = function() {
        return new OpenLayers.Map({
            projection: new OpenLayers.Projection("EPSG:900913"),
            displayProjection: new OpenLayers.Projection("EPSG:4326"),
            units: "m",
            numZoomLevels: 18,
            maxResolution: 156543.0339,
            maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
                    20037508, 20037508.34),
            allOverlays: false,
            controls: [new OpenLayers.Control.Navigation(), new OpenLayers.Control.PanZoomBar(), new OpenLayers.Control.MousePosition({
                numDigits: 2
            })]
        });
    };

    /**
     * Method: createLayers
     * Create the layers.
     *
     * Returns:
     * {Array({OpenLayers.Layer}) Array of layers.
     */
    var createLayers = function() {
        return [
            new OpenLayers.Layer.OSM("OSM"),
            new OpenLayers.Layer.OSM(
                    "OSMap (T@H)",
                    "http://tah.openstreetmap.org/Tiles/tile/${z}/${x}/${y}.png"
                    )
        ];
    };

    /**
     * Method: createLayerStore
     * Create a GeoExt layer store.
     *
     * Parameters:
     * map - {OpenLayers.Map} The Map instance.
     * layers - {Array({OpenLayers.Layer})} The layers to add to the store.
     *
     * Returns:
     * {GeoExt.data.LayerStore} The layer store.
     *
     */
    var createLayerStore = function(map, layers) {
        return new GeoExt.data.LayerStore({
            map: map,
            layers: layers
        });
    };

    var createTopToolbar = function(map, languageCombo) {
        var tools = [];
        tools.push('->');
        tools.push(languageCombo);
        return tools;
    };

    var createBottomToolbar = function(map, displayProjectionSelectorCombo, scaleSelectorCombo) {
        var tools = [];
        tools.push(scaleSelectorCombo);
        tools.push('->');
        tools.push(displayProjectionSelectorCombo);
        return tools;
    };

    var createLanguageStore = function() {
        return new Ext.data.ArrayStore({
            fields: ['code', 'language', 'charset'],
            data : openaddresses.languages
        });
    };

    var createLanguageCombo = function(languageStore) {
        return new Ext.form.ComboBox({
            store: languageStore,
            displayField:'language',
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            emptyText: OpenLayers.i18n('Select a language...'),
            selectOnFocus: true,
            onSelect: function(record) {
                var params = Ext.urlDecode(window.location.search.substring(1));
                var parametersObj = {};
                for (var param in params) {
                    if (param == 'lang' || param == 'charset') {
                    } else {
                        parametersObj[param] = params[param];
                    }
                }
                parametersObj.lang = record.get("code");
                parametersObj.charset = record.get("charset");
                window.location.search = Ext.urlEncode(parametersObj);
            }
        });
    };

    var createViewPort = function(map, layers, layerStore, topToolbar, bottomToolbar) {
        return new Ext.Viewport({
            layout: "border",
            items: [
                {
                    region: 'north',
                    height: 64
                },
                {
                    region: "center",
                    xtype: "gx_mappanel",
                    margins: '5 0 5 0',
                    map: map,
                    layers: layerStore,
                    tbar: topToolbar,
                    bbar: bottomToolbar
                },
                {
                    region: 'west',
                    width: 256,
                    minSize: 256,
                    maxSize: 512,
                    split: true,
                    margins: '5 0 5 5',
                    layout:'accordion',
                    items: [
                        {
                            title: OpenLayers.i18n('OpenAddresses')
                        },
                        {
                            title: OpenLayers.i18n('Upload')
                        },
                        {
                            title: OpenLayers.i18n('Download')
                        },
                        {
                            title: OpenLayers.i18n('Services')
                        },
                        {
                            title: OpenLayers.i18n('Statistics')
                        },
                        {
                            title: OpenLayers.i18n('License')
                        },
                        {
                            title: OpenLayers.i18n('About')
                        }
                    ]
                }
            ]
        });
    };

    var createDisplayProjectionSelectorCombo = function(map) {
        return new GeoExt.ux.form.DisplayProjectionSelectorCombo({
            map: map,
            updateMapDisplayProjection: true,
            projections: ['EPSG:4326', 'EPSG:900913'],
            width: 200
        });
    };

    var createScaleSelectorCombo = function(map) {
        return new GeoExt.ux.form.ScaleSelectorCombo({
            map: map,
            fakeScaleValue: ['1000','1500','2500','5000','10000','25000','50000','100000','200000','450000','850000','1500000','2500000','5000000','10000000','50000000','100000000','200000000','400000000',]
        });
    };

    var setPermalink = function(languageStore, languageCombo) {
        var params = Ext.urlDecode(window.location.search.substring(1));
        if (!params.lang && $('lang').value) {
            params.lang = $('lang').value;
        }
        if (params.lang) {
            OpenLayers.Lang.setCode(params.lang);
            // check if there's really a language with that language code
            var record = languageStore.data.find(function(item, key) {
                return (item.data.code == params.lang);
            });
            // if language was found in store assign it as current value in combobox
            if (record) {
                languageCombo.setValue(record.data.language);
            }
        }
    };

    /*
     * Public
     */
    return {

        /**
         * APIMethod: init
         * Initialize the page layout.
         */
        init: function() {
            Ext.QuickTips.init();

            // Manage language
            var languageStore = createLanguageStore();
            var languageCombo = createLanguageCombo(languageStore);
            setPermalink(languageStore, languageCombo);

            var map = createMap();
            var layers = createLayers();
            var layerStore = createLayerStore(map, layers);
            var topToolbar = createTopToolbar(map, languageCombo);
            var displayProjectionSelectorCombo = createDisplayProjectionSelectorCombo(map);
            var scaleSelectorCombo = createScaleSelectorCombo(map);
            var bottomToolbar = createBottomToolbar(map, displayProjectionSelectorCombo, scaleSelectorCombo);

            createViewPort(map, layers, layerStore, topToolbar, bottomToolbar);
        }
    };
})();