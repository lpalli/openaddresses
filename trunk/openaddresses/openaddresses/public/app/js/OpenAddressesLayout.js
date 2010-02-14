/*
 * @requires app/js/OpenAddressesConfig.js
 * @include OpenLayers/Map.js
 * @include OpenLayers/BaseTypes/LonLat.js
 * @include OpenLayers/Lang.js
 * @include OpenLayers/Projection.js
 * @include OpenLayers/Layer.js
 * @include OpenLayers/Layer/XYZ.js
 * @include OpenLayers/Layer/Yahoo.js
 * @include OpenLayers/Tile/Image.js
 * @include OpenLayers/Renderer.js
 * @include OpenLayers/Renderer/Canvas.js
 * @include OpenLayers/Renderer/SVG.js
 * @include OpenLayers/Renderer/VML.js
 * @include OpenLayers/Control/Navigation.js
 * @include OpenLayers/Control/PanZoomBar.js
 * @include OpenLayers/Control/MousePosition.js
 * @include OpenLayers/Control/LayerSwitcher.js
 * @include OpenLayers/Control/ModifyFeature.js
 * @include OpenLayers/Popup/FramedCloud.js
 * @include GeoExt/data/LayerStore.js
 * @include GeoExt/widgets/MapPanel.js
 * @include GeoExt/widgets/tree/LayerContainer.js
 * @include app/js/OpenAddressesCountryList.js
 * @include app/js/OpenAddressesQualityList.js
 * @include app/js/OpenAddressesOsm.js
 * @include app/js/OpenAddressesLanguage.js
 * @include app/js/OpenAddressesLayers.js
 * @include app/js/OpenAddressesEditControl.js
 * @include geoext-ux-dev/DisplayProjectionSelectorCombo/ux/widgets/form/DisplayProjectionSelectorCombo.js
 * @include mfbase/geoext-ux/ux/GeoNamesSearchCombo/lib/GeoExt.ux.geonames/GeoNamesSearchCombo.js
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
        var navControl = new OpenLayers.Control.Navigation({
            handleRightClicks: true
        });

        var editControl = new openaddresses.EditControl({
            handlerOptions: {
                "single": true
            }
        });

        return new OpenLayers.Map({
            projection: new OpenLayers.Projection("EPSG:900913"),
            displayProjection: new OpenLayers.Projection("EPSG:4326"),
            units: "m",
            maxResolution: 156543.0339,
            maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
                    20037508, 20037508.34),
            numZoomLevels: 23,
            allOverlays: false,
            controls: [navControl,
                editControl,
                new OpenLayers.Control.PanZoomBar(),
                new OpenLayers.Control.MousePosition({
                    numDigits: 2
                }),
                new OpenLayers.Control.LayerSwitcher({'ascending':false})]
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
        openaddresses.layout.map.addressLayer = new OpenLayers.Layer.WMS(
                OpenLayers.i18n("Addresses"),
                openaddresses.config.baseWMS,
        {layers: 'address',
            transparent: "true",
            format:"image/png"},
        {singleTile:true,
            isBaseLayer: false,
            transitionEffect: "resize",
            ratio: 1.5,
            numZoomLevels: 23,
            maxResolution: 50}
                );
        openaddresses.layout.map.drawingLayer = new OpenLayers.Layer.Vector(OpenLayers.i18n("DrawingLayer"), {
            isBaseLayer: false,
            displayInLayerSwitcher: false
        });
        openaddresses.layout.map.drawingLayer.events.on({
            "featuremodified": function(evt) {
                // TODO problem after feature is modified
            }
        });
        return openaddresses.layers.concat([
            new openaddresses.OSM({
                isBaseLayer: true,
                buffer: 0,
                transitionEffect: "resize"
            }),
            new OpenLayers.Layer.Yahoo(
                    OpenLayers.i18n("Yahoo Satellite"),
            {'type': YAHOO_MAP_SAT, 'sphericalMercator': true}
                    ),
            new OpenLayers.Layer(OpenLayers.i18n("Empty Layer"), {
                isBaseLayer: true,
                displayInLayerSwitcher: true
            }),
            openaddresses.layout.map.addressLayer,
            openaddresses.layout.map.drawingLayer
        ]);
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

    var createTopToolbar = function(map, languageCombo, geonamesSearchCombo, permalinkButton) {
        var tools = [];
        tools.push(geonamesSearchCombo);
        tools.push('->');
        tools.push(languageCombo);
        tools.push(permalinkButton);
        return tools;
    };

    var createBottomToolbar = function(map, displayProjectionSelectorCombo) {
        var tools = [];
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
                window.location.search = openaddresses.layout.createPermalink(false, record.get("code"), record.get("charset"));
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
                    layout:'absolute',
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
            projections: ['EPSG:4326', 'EPSG:900913'],
            width: 200
        });
    };

    var createGeonamesSearchCombo = function(map) {
        return new GeoExt.ux.geonames.GeoNamesSearchCombo({
            map: map,
            zoom: 12,
            loadingText: OpenLayers.i18n('Search in Geonames...'),
            emptyText: OpenLayers.i18n('Search location in Geonames')
        });
    };

    var setLangPermalink = function(languageStore, languageCombo) {
        var params = Ext.urlDecode(window.location.search.substring(1));
        if (!params.lang && $('lang').value) {
            params.lang = $('lang').value;
        }
        if (params.lang) {
            if (params.lang == 'zh_CN') {
                OpenLayers.Lang.setCode('zh-CN');
            } else {
                OpenLayers.Lang.setCode(params.lang);
            }
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

    var handleRightMouseClick = function(map) {
        map.controls[0].handlers.click.callbacks.rightclick = function() {
            var lonlat = map.getLonLatFromViewPortPx(map.controls[0].handlers.click.evt.xy);
            var content = "<h1 style='font-size: 14px;'>" + OpenLayers.i18n("Digitized Position") + "</h1><table style='font-size: 14px;'><tr><td width=\"150\">" + "" + OpenLayers.i18n("Spherical Mercator") + "</td><td>" + Math.round(lonlat.lon * 10) / 10 + " " + Math.round(lonlat.lat * 10) / 10 + '</td></tr>';
            lonlat.transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));
            content = content + "<tr><td>" + OpenLayers.i18n("WGS84") + "</td><td>" + Math.round(lonlat.lon * 100000) / 100000 + " " + Math.round(lonlat.lat * 100000) / 100000 + '</td></tr></table>';
            // Create empty proxy
            map.myProxy = new Ext.data.ScriptTagProxy({
                url: "http://maps.google.com/maps/geo?q=" + lonlat.lat + "," + lonlat.lon + "&output=json&sensor=true&key=" + openaddresses.config.googleKey,
                nocache: false
            });
            map.geocoderStore = new Ext.data.Store({
                proxy: map.myProxy,
                reader: new Ext.data.JsonReader({
                    root: 'Placemark',
                    fields: [
                        {
                            name: 'address'
                        }
                    ]
                })
            });

            map.geocoderStore.on(
                    'load', function(store) {
                var placemark = store.reader.jsonData.Placemark[0];
                var position = new OpenLayers.LonLat(placemark.Point.coordinates[0], placemark.Point.coordinates[1]);
                position.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
                if (map.myPopup) {
                    map.myPopup.destroy();
                }
                map.myPopup = new OpenLayers.Popup.FramedCloud(
                        "chicken",
                        position,
                        null,
                        content + "<h1 style='font-size: 14px;'>" + OpenLayers.i18n("Address") + "</h1>" + placemark.address,
                        null,
                        true
                        );
                map.addPopup(map.myPopup);
            }, this);

            map.geocoderStore.load();
        };
    };

    var handleEdit = function(map) {
        map.controls[1].activate();
    };

    var createPermalinkButton = function() {
        return new Ext.Button({
            text: OpenLayers.i18n('Permalink'),
            handler: function(b, e) {
                window.open(openaddresses.layout.createPermalink(true));
            }
        });
    };

    var createModifyFeatureControl = function(map) {
        if (!map.modifyFeatureControl) {
            var vectorLayer = openaddresses.layout.map.drawingLayer;
            map.modifyFeatureControl = new OpenLayers.Control.ModifyFeature(vectorLayer);
            map.addControl(map.modifyFeatureControl);
            map.modifyFeatureControl.activate();
        }
        return map.modifyFeatureControl;
    };

    var setPermalink = function() {
        var params = Ext.urlDecode(window.location.search.substring(1));
        // Manage map
        if (params.easting && params.northing && params.zoom) {
            var center = new OpenLayers.LonLat(parseFloat(params.easting), parseFloat(params.northing));
            var zoom = parseInt(params.zoom, 10);
            openaddresses.layout.map.setCenter(center, zoom);
        }
    };

    /*
     * Public
     */
    return {
        createPermalink: function(fullUrl, overrideLang, overrideCharset) {
            var params = Ext.urlDecode(window.location.search.substring(1));
            var parametersObj = {};

            // Manage lang, charset and mode
            for (var param in params) {
                if (param == 'lang' || param == 'charset' || param == 'mode') {
                    parametersObj[param] = params[param];
                }
            }
            if (overrideLang) {
                parametersObj.lang = overrideLang;
            }
            if (overrideCharset) {
                parametersObj.charset = overrideCharset;
            }

            // Manage northing, easting and zoom
            parametersObj.northing = this.map.center.lat;
            parametersObj.easting = this.map.center.lon;
            parametersObj.zoom = this.map.zoom;

            var base = '';
            if (fullUrl) {
                if (document.location.href.indexOf("?") > 0) {
                    base = document.location.href.substring(0, document.location.href.indexOf("?"));
                } else {
                    base = document.location.href;
                }
            }
            return base + '?' + Ext.urlEncode(parametersObj);
        },

        /**
         * APIMethod: init
         * Initialize the page layout.
         */
        init: function() {
            Ext.QuickTips.init();

            // Manage language
            var languageStore = createLanguageStore();
            var languageCombo = createLanguageCombo(languageStore);
            setLangPermalink(languageStore, languageCombo);

            this.map = createMap();
            this.layers = createLayers();
            var layerStore = createLayerStore(this.map, this.layers);
            var modifyFeatureControl = createModifyFeatureControl(this.map);
            var geonamesSearchCombo = createGeonamesSearchCombo(this.map);
            var permalinkButton = createPermalinkButton();
            var topToolbar = createTopToolbar(this.map, languageCombo, geonamesSearchCombo, permalinkButton);
            var displayProjectionSelectorCombo = createDisplayProjectionSelectorCombo(this.map);
            var bottomToolbar = createBottomToolbar(this.map, displayProjectionSelectorCombo);

            // Manage controlers for reverse geocoding and editing 
            handleRightMouseClick(this.map);
            handleEdit(this.map);

            this.viewport = createViewPort(this.map, this.layers, layerStore, topToolbar, bottomToolbar);
            this.map.zoomTo(1);
            this.map.events.register('zoomend', this, function(record) {
                if (this.map.zoom === 0) {
                    this.map.zoomTo(1);
                }
            });
            setPermalink();
        }
    };
})();