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
 * @requires app/js/OpenAddressesConfig.js
 * @requires app/js/OpenAddressesExtOverride.js
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
 * @include OpenLayers/Control/Attribution.js
 * @include OpenLayers/Control/WMSGetFeatureInfo.js
 * @include OpenLayers/Popup/FramedCloud.js
 * @include GeoExt/data/LayerStore.js
 * @include GeoExt/widgets/MapPanel.js
 * @include GeoExt/widgets/tree/LayerContainer.js
 * @include app/js/OpenAddressesOpacitySliderTip.js
 * @include app/js/OpenAddressesCountryList.js
 * @include app/js/OpenAddressesOsm.js
 * @include app/js/OpenAddressesLanguage.js
 * @include app/js/OpenAddressesLayers.js
 * @include app/js/OpenAddressesEditControl.js
 * @include app/js/OpenAddressesHover.js
 * @include geoext-ux-dev/DisplayProjectionSelectorCombo/ux/widgets/form/DisplayProjectionSelectorCombo.js
 * @include geoext-ux-dev/Toolbar/ux/widgets/LoadingStatusBar.js
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
        OpenLayers.Control.Attribution.prototype.updateAttribution = function() {
            var attributions = [];
            if (this.map && this.map.layers) {
                for (var i = 0, len = this.map.layers.length; i < len; i++) {
                    var layer = this.map.layers[i];
                    var withinMaxExtent = (layer.maxExtent && this.map.getExtent() &&
                                           this.map.getExtent().intersectsBounds(layer.maxExtent, false));
                    if (layer.attribution && layer.getVisibility() && withinMaxExtent) {
                        // add attribution only if attribution text is unique
                        if (OpenLayers.Util.indexOf(
                                attributions, layer.attribution) === -1) {
                            attributions.push(layer.attribution);
                        }
                    }
                }
                this.div.innerHTML = attributions.join(this.separator);
            }
        };

        var attributionControl = new OpenLayers.Control.Attribution();

        return new OpenLayers.Map({
            projection: new OpenLayers.Projection("EPSG:900913"),
            displayProjection: new OpenLayers.Projection("EPSG:4326"),
            units: "m",
            maxResolution: 156543.0339,
            maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
                    20037508, 20037508.34),
            numZoomLevels: 23,
            allOverlays: false,
            controls: [
                attributionControl,
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
            maxResolution: 500}
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
        try {
            if (YAHOO_MAP_SAT !== undefined) {
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
            }
        } catch(e) {
            return openaddresses.layers.concat([
                new openaddresses.OSM({
                    isBaseLayer: true,
                    buffer: 0,
                    transitionEffect: "resize"
                }),
                new OpenLayers.Layer(OpenLayers.i18n("Empty Layer"), {
                    isBaseLayer: true,
                    displayInLayerSwitcher: true
                }),
                openaddresses.layout.map.addressLayer,
                openaddresses.layout.map.drawingLayer
            ]);
        }
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
        return new GeoExt.ux.LoadingStatusBar({
            map: map,
            statusAlign: 'left',
            busyText: OpenLayers.i18n('...still loading layers...'),
            items: [
                '->',
                displayProjectionSelectorCombo
            ]
        });
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
        var langvalue = 'en';
        if (Ext.get('lang')) {
            langvalue = Ext.get('lang').dom.value;
        }
        return new Ext.Viewport({
            layout: "border",
            items: [
                {
                    region: 'north',
                    height: 74,
                    html: '<div><img src="resources/img/OpenAddressesLogoOri64.png" alt="OpenAddressesLogo" style="margin-top:5px;margin-left:5px"/><span style="position: absolute; top: 8px; right: 5px;font-size:48px;">OpenAddresses.org BETA</span></div>',
                    bodyStyle: 'backgroundColor: #F0F0F0;'
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
                    width: 335,
                    minSize: 256,
                    maxSize: 512,
                    split: true,
                    margins: '5 0 5 5',
                    layout:'accordion',
                    defaults: {
                        bodyStyle: 'padding-left:5px; padding-top:5px; padding-right:5px; backgroundColor: #F0F0F0; font-size:11px;font-family:tahoma,arial,verdana,sans-serif;line-height: 1.5;'
                    },
                    items: [
                        {
                            title: OpenLayers.i18n('OpenAddresses'),
                            html: '<img src="resources/img/Help_' + langvalue + '.png"><br>' + OpenLayers.i18n('OpenAddresses is a web portail for the management of Open Source worldwide localized postal addresses.')

                        },
                        {
                            title: OpenLayers.i18n('Upload'),
                            html: OpenLayers.i18n('Ongoing development...<br> For now, take contact with us through openaddresses[at]googlegroups.com.')
                        },
                        {
                            title: OpenLayers.i18n('Download'),
                            html: OpenLayers.i18n('Ongoing development...<br> For now, take contact with us through openaddresses[at]googlegroups.com.')
                        },
                        {
                            title: OpenLayers.i18n('Services'),
                            html: '<a href="http://code.google.com/p/openaddresses/wiki/RESTService" target="new">' + OpenLayers.i18n('Documentation of GeoCoding and Reverse GeoCoding services') + "</a>"
                        },
                        {
                            title: OpenLayers.i18n('Statistics'),
                            html: OpenLayers.i18n('Ongoing development...<br> About 4.3 millions in OpenAddresses.org.For now, take contact with us through openaddresses[at]googlegroups.com.')
                        },
                        {
                            title: OpenLayers.i18n('License'),
                            html: '<a href="http://creativecommons.org/licenses/by/3.0/" target="new">' + OpenLayers.i18n('OpenAddresses Data Licence') + '</a><li>' + OpenLayers.i18n('The addresses must be associated to the url of http://www.openaddresses.org.') + '</li><li>' + OpenLayers.i18n('The person or entity that submitted the data is stored in a field CREATED_BY.') + '</li><a href="http://www.opensource.org/licenses/gpl-3.0.html" target="new">' + OpenLayers.i18n('OpenAddresses Code Licence') + '</a>'
                        },
                        {
                            title: OpenLayers.i18n('About'),
                            html: '<a href="http://code.google.com/p/openaddresses/" target="new">' + OpenLayers.i18n('Project Wiki') + '</a><br><a href="http://groups.google.com/group/OpenAddresses" target="new">' + OpenLayers.i18n('Project Discussion') + '</a>'
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
        if (!$('lang')) {
            params.lang = 'en';
        }
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

    var createLocationTooltip = function(map) {
        //FOR PERFORMANCE: map.events.register('mousemove', this, openaddresses.layout.showLocationTooltip);
        map.events.register('mouseout', this, hideMouseOver);
    };

    var hideMouseOver = function(evt) {
        var mouseOver = Ext.get('MouseOver').dom;
        mouseOver.innerHTML = "";
        mouseOver.style.top = "0px";
        mouseOver.style.left = "0px";
        mouseOver.style.display = "none";
    };

    var handleRightMouseClick = function(map) {
        openaddresses.layout.navControl.handlers.click.callbacks.rightclick = function() {
            openaddresses.layout.showWaitingMask();
            var lonlat = map.getLonLatFromViewPortPx(openaddresses.layout.navControl.handlers.click.evt.xy);
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
                openaddresses.layout.hideWaitingMask();
            }, this);

            map.geocoderStore.load();
        };
    };

    var createPermalinkButton = function() {
        return new Ext.Button({
            text: OpenLayers.i18n('Permalink'),
            handler: function(b, e) {
                window.open(openaddresses.layout.createPermalink(true));
            }
        });
    };

    var setPermalink = function() {
        var params = Ext.urlDecode(window.location.search.substring(1));
        // Manage map
        if (params.easting && params.northing && params.zoom) {
            var center = new OpenLayers.LonLat(parseFloat(params.easting), parseFloat(params.northing));
            var zoom = parseInt(params.zoom, 10);
            openaddresses.layout.map.setCenter(center, zoom);
        }
        if (params.overlayOpacity) {
            Ext.getCmp('opacity_slider').setValue(parseFloat(params.overlayOpacity));
        }
    };

    var createOpacitySlider = function(map) {
        var opacitySlider = new Ext.Slider({
            id: 'opacity_slider',
            renderTo: Ext.get('OpacitySlider'),
            width: 100,
            value: 1,
            increment: 0.01,
            minValue: 0,
            maxValue: 1,
            decimalPrecision: 2,
            plugins: new openaddresses.OpacitySliderTip()
        });
        opacitySlider.on('change', function(slider, opacity) {
            for (var i = 0; i < map.layers.length; i++) {
                if (!map.layers[i].isBaseLayer) {
                    if (map.layers[i].setOpacity) {
                        if (map.layers[i].name != OpenLayers.i18n("Addresses")) {
                            map.layers[i].setOpacity(opacity);
                        }
                    }
                }
            }
        });
        return opacitySlider;
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
            parametersObj.overlayOpacity = Ext.getCmp('opacity_slider').getValue();

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

        showWaitingMask: function() {
            if (Ext.get('waiting')) {
                Ext.get('waiting').dom.style.display = "block";
            }
        },

        hideWaitingMask: function() {
            if (Ext.get('waiting')) {
                Ext.get('waiting').dom.style.display = "none";
            }
        },

        showLocationTooltip: function(evt) {
            var map = openaddresses.layout.map;
            if (map.showLocationInMapRequestOngoing || map.zoom < 16) {
                return;
            }
            var updateTooltip = function(response) {
                var x = Ext.decode(response.responseText);
                var mouseOver = Ext.get('MouseOver').dom;
                if (!x.features[0]) {
                    mouseOver.innerHTML = "";
                    mouseOver.style.top = "0px";
                    mouseOver.style.left = "0px";
                    mouseOver.style.display = "none";
                } else {
                    mouseOver.innerHTML = x.features[0].properties.street + " " + x.features[0].properties.housenumber + " " + x.features[0].properties.city;
                    var topPixel = this.clientY + 10;
                    var leftPixel = this.clientX + 10;
                    var topPixel1 = this.clientY - 10;
                    var leftPixel1 = this.clientX - 10;
                    mouseOver.style.top = topPixel + "px";
                    mouseOver.style.left = leftPixel + "px";
                    mouseOver.style.display = "block";
                }
                map.showLocationInMapRequestOngoing = false;
            };
            var lonLat = map.getLonLatFromPixel(evt.xy);
            lonLat.transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));
            this.clientX = evt.clientX;
            this.clientY = evt.clientY;
            // addresses/fullTextSearch?fields=street&tolerance=0.005&easting=6.62379551&northing=46.51687241&limit=10
            if (map.zoom == 16) {
                map.tooltipTolerance = 0.000128987 / 2;
            }
            if (map.zoom == 17) {
                map.tooltipTolerance = 0.000064494 / 2;
            }
            if (map.zoom == 18) {
                map.tooltipTolerance = 0.000064494 / 2;
            }
            if (map.zoom == 19) {
                map.tooltipTolerance = 0.000032247 / 2;
            }
            if (map.zoom == 20) {
                map.tooltipTolerance = 0.000016123 / 2;
            }
            if (map.zoom == 21) {
                map.tooltipTolerance = 0.000008062 / 2;
            }
            if (map.zoom == 22) {
                map.tooltipTolerance = 0.000004031 / 2;
            }
            if (map.zoom == 23) {
                map.tooltipTolerance = 0.000002015 / 2;
            }
            map.tooltipRequest = Ext.Ajax.request({
                url: 'addresses',
                success: updateTooltip,
                failure: function() {
                    map.showLocationInMapRequestOngoing = false;
                },
                method: 'GET',
                params: {
                    tolerance: map.tooltipTolerance,
                    limit: 1,
                    lon: lonLat.lon,
                    lat: lonLat.lat,
                    attrs: 'street,housenumber,city',
                    no_geom: 'true'
                },
                scope: this
            });
            map.showLocationInMapRequestOngoing = true;
        },
        /**
         * APIMethod: init
         * Initialize the page layout.
         */
        init: function() {
            Ext.QuickTips.init();

            OpenLayers.ImgPath = "resources/img/OpenLayers/";
            Ext.BLANK_IMAGE_URL = 'ext31/resources/images/default/s.gif';

            if (Ext.isIE6) {
                alert(OpenLayers.i18n('You are using Internet Explorer 6. We strongly recommend that you update it to a safer and newer version !'))
            }

            if (Ext.isChrome) {
                alert(OpenLayers.i18n('You are using Chrome. Some unsolved known issues affect this browser. We recommend to use Firefox, Safari or Internet Explorer.'))
            }

            // Manage language
            var languageStore = createLanguageStore();
            var languageCombo = createLanguageCombo(languageStore);
            setLangPermalink(languageStore, languageCombo);


            this.map = createMap();
            this.layers = createLayers();
            var layerStore = createLayerStore(this.map, this.layers);

            // Create controls
            this.navControl = new OpenLayers.Control.Navigation({
                handleRightClicks: true
            });
            this.editControl = new openaddresses.EditControl({
                handlerOptions: {
                    "single": true
                }
            });
            this.modifyFeatureControl = new OpenLayers.Control.ModifyFeature(openaddresses.layout.map.drawingLayer);
            this.hoverControl = new openaddresses.hover({
                handlerOptions: {
                    'delay': 100
                }
            });

            /*this.buildingControl = new OpenLayers.Control.WMSGetFeatureInfo({
                url: openaddresses.config.baseWMS,
                clickCallback: "rightclick",
                layers: openaddresses.layout.map.getLayersByName('CH_Building'),
                eventListeners: {
                    getfeatureinfo: function(event) {
                        alert('hello');
                    }
                }
            });*/

            this.map.addControls([this.editControl,this.navControl,this.modifyFeatureControl,this.hoverControl]);
            this.editControl.activate();
            this.navControl.activate();
            this.hoverControl.activate();
            //this.buildingControl.activate();

            var geonamesSearchCombo = createGeonamesSearchCombo(this.map);
            var permalinkButton = createPermalinkButton();
            var topToolbar = createTopToolbar(this.map, languageCombo, geonamesSearchCombo, permalinkButton);
            var displayProjectionSelectorCombo = createDisplayProjectionSelectorCombo(this.map);
            var bottomToolbar = createBottomToolbar(this.map, displayProjectionSelectorCombo);
            var opacitySlider = createOpacitySlider(this.map);

            // Manage controlers for reverse geocoding and editing 
            handleRightMouseClick(this.map);

            createLocationTooltip(this.map);

            this.viewport = createViewPort(this.map, this.layers, layerStore, topToolbar, bottomToolbar);
            this.map.zoomTo(1);
            this.map.events.register('zoomend', this, function(record) {
                if (this.map.zoom === 0) {
                    this.map.zoomTo(1);
                }
            });
            setPermalink();

            var hideMask = function () {
                if (Ext.get('loading')) {
                    Ext.get('loading').remove();
                    Ext.fly('loading-mask').fadeOut({
                        remove:true
                    });
                }
            };
            hideMask.defer(250);
        }
    };
})();

