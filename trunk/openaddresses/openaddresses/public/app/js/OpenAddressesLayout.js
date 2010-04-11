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
 * @include OpenLayers/Control/ZoomBox.js
 * @include OpenLayers/Control/PanZoomBar.js
 * @include OpenLayers/Control/MousePosition.js
 * @include OpenLayers/Control/LayerSwitcher.js
 * @include OpenLayers/Control/ModifyFeature.js
 * @include OpenLayers/Control/Attribution.js
 * @include OpenLayers/Control/WMSGetFeatureInfo.js
 * @include OpenLayers/Popup/FramedCloud.js
 * @include GeoExt/data/LayerStore.js
 * @include GeoExt/widgets/MapPanel.js
 * @include GeoExt/widgets/Action.js
 * @include GeoExt/widgets/tree/LayerContainer.js
 * @include app/js/OpenAddressesOpacitySliderTip.js
 * @include app/js/OpenAddressesCountryList.js
 * @include app/js/OpenAddressesOsm.js
 * @include app/js/OpenAddressesLanguage.js
 * @include app/js/OpenAddressesLayers.js
 * @include app/js/OpenAddressesEditControl.js
 * @include app/js/OpenAddressesHover.js
 * @include app/js/OpenAddressesGlobalSearchCombo.js
 * @include geoext-ux-dev/DisplayProjectionSelectorCombo/ux/widgets/form/DisplayProjectionSelectorCombo.js
 * @include geoext-ux-dev/Toolbar/ux/widgets/LoadingStatusBar.js
 * @include geoext-ux-dev/RoutingPanel/ux/widgets/RoutingPanel.js
 * @include geoext-ux-dev/OpenAddressesSearchCombo/lib/GeoExt.ux.openaddresses/OpenAddressesSearchCombo.js
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
                    if (layer.name == 'OpenStreetMap' && layer.getVisibility()) {
                        if (OpenLayers.Util.indexOf(
                                attributions, layer.attribution) === -1) {
                            attributions.push(layer.attribution);
                        }
                    }
                    var withinMaxExtent = (layer.maxExtent && this.map.getExtent() &&
                                           this.map.getExtent().intersectsBounds(layer.maxExtent, false));
                    if (layer.attribution && layer.getVisibility() && withinMaxExtent && layer.inRange) {
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

        OpenLayers.Control.LayerSwitcher.prototype.redraw = function() {
            //if the state hasn't changed since last redraw, no need
            // to do anything. Just return the existing div.
            if (!this.checkRedraw()) {
                return this.div;
            }

            //clear out previous layers
            this.clearLayersArray("base");
            this.clearLayersArray("data");

            var containsOverlays = false;
            var containsBaseLayers = false;

            // Save state -- for checking layer if the map state changed.
            // We save this before redrawing, because in the process of redrawing
            // we will trigger more visibility changes, and we want to not redraw
            // and enter an infinite loop.
            var len = this.map.layers.length;
            this.layerStates = new Array(len);
            for (var i = 0; i < len; i++) {
                var layer = this.map.layers[i];
                this.layerStates[i] = {
                    'name': layer.name,
                    'visibility': layer.visibility,
                    'inRange': layer.inRange,
                    'id': layer.id
                };
            }

            var layers = this.map.layers.slice();
            if (!this.ascending) {
                layers.reverse();
            }
            for (var i = 0, len = layers.length; i < len; i++) {

                var layer = layers[i];
                var withinMaxExtent = true;
                if (!layer.inRange) {
                    withinMaxExtent = false;
                }
                if (this.map.getExtent()) {
                    withinMaxExtent = (layer.maxExtent &&
                                       this.map.getExtent().intersectsBounds(layer.maxExtent, false) && layer.inRange);
                }
                if (layer.isBaseLayer) {
                    withinMaxExtent = true;
                }
                var baseLayer = layer.isBaseLayer;

                if (layer.displayInLayerSwitcher && withinMaxExtent) {

                    if (baseLayer) {
                        containsBaseLayers = true;
                    } else {
                        containsOverlays = true;
                    }

                    // only check a baselayer if it is *the* baselayer, check data
                    //  layers if they are visible
                    var checked = (baseLayer) ? (layer == this.map.baseLayer)
                            : layer.getVisibility();

                    // create input element
                    var inputElem = document.createElement("input");
                    inputElem.id = this.id + "_input_" + layer.name;
                    inputElem.name = (baseLayer) ? this.id + "_baseLayers" : layer.name;
                    inputElem.type = (baseLayer) ? "radio" : "checkbox";
                    inputElem.value = layer.name;
                    inputElem.checked = checked;
                    inputElem.defaultChecked = checked;

                    if (!baseLayer && !layer.inRange) {
                        inputElem.disabled = true;
                    }
                    var context = {
                        'inputElem': inputElem,
                        'layer': layer,
                        'layerSwitcher': this
                    };
                    OpenLayers.Event.observe(inputElem, "mouseup",
                            OpenLayers.Function.bindAsEventListener(this.onInputClick,
                                    context)
                            );

                    // create span
                    var labelSpan = document.createElement("span");
                    OpenLayers.Element.addClass(labelSpan, "labelSpan");
                    if (!baseLayer && !layer.inRange) {
                        labelSpan.style.color = "gray";
                    }
                    labelSpan.innerHTML = layer.name;
                    labelSpan.style.verticalAlign = (baseLayer) ? "bottom"
                            : "baseline";
                    OpenLayers.Event.observe(labelSpan, "click",
                            OpenLayers.Function.bindAsEventListener(this.onInputClick,
                                    context)
                            );
                    // create line break
                    var br = document.createElement("br");


                    var groupArray = (baseLayer) ? this.baseLayers
                            : this.dataLayers;
                    groupArray.push({
                        'layer': layer,
                        'inputElem': inputElem,
                        'labelSpan': labelSpan
                    });


                    var groupDiv = (baseLayer) ? this.baseLayersDiv
                            : this.dataLayersDiv;
                    groupDiv.appendChild(inputElem);
                    groupDiv.appendChild(labelSpan);
                    groupDiv.appendChild(br);
                }
            }

            // if no overlays, dont display the overlay label
            this.dataLbl.style.display = (containsOverlays) ? "" : "none";

            // if no baselayers, dont display the baselayer label
            this.baseLbl.style.display = (containsBaseLayers) ? "" : "none";

            return this.div;
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
                openaddresses.config.addressWMS,
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
        openaddresses.layout.map.drawingLayer = new OpenLayers.Layer.Vector("DrawingLayer", {
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

    var createTopToolbar = function(map, languageCombo, permalinkButton, openAddressesGlobalSearchCombo) {
        var tools = [];

        var actionZoomBox = new GeoExt.Action({
            control: new OpenLayers.Control.ZoomBox(),
            tooltip: OpenLayers.i18n('Zoom in: drag to create a rectangle'),
            map: map,
            iconCls: 'zoomin',
            toggleGroup: 'map'
        });

        tools.push(actionZoomBox);
        tools.push('-');
        tools.push(openAddressesGlobalSearchCombo);
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

        if (location.host.indexOf('openaddresses.org') > -1) {
            openaddresses.config.cloudmadeKey = openaddresses.config.cloudmadeKeyOpenAddresses;
        }
        if (location.host.indexOf('openaddress.org') > -1) {
            openaddresses.config.cloudmadeKey = openaddresses.config.cloudmadeKeyOpenAddress;
        }
        if (location.host.indexOf('openaddressmap.org') > -1) {
            openaddresses.config.cloudmadeKey = openaddresses.config.cloudmadeKeyOpenAddressMap;
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
                            html: '<img src="resources/img/Help_' + langvalue + '.png"><br>' + OpenLayers.i18n('OpenAddresses is a web portail for the management of Open Source worldwide localized postal addresses.') + '<br><br><a href="javascript:openaddresses.layout.showHelpWindow()">' + OpenLayers.i18n('Do you need help ?') + '</a>'

                        },
                        {
                            id: "routingpanel",
                            title: OpenLayers.i18n('Routing'),
                            listeners: {
                                'expand': function(panel) {
                                    openaddresses.layout.editControl.deactivate();
                                    if (!Ext.getCmp('routingPanelItem')) {
                                        this.add({
                                            xtype: 'gxux_routingpanel',
                                            id: 'routingPanelItem',
                                            map: openaddresses.layout.map,
                                            cloudmadeKey: openaddresses.config.cloudmadeKey,
                                            geocodingType: 'openaddresses',
                                            showGoogleItinerary: false,
                                            listeners:{
                                                routingcomputed: function() {
                                                },
                                                beforeroutingcomputed: function() {
                                                }
                                            }
                                        });
                                    }
                                    Ext.getCmp('routingpanel').doLayout();
                                    Ext.getCmp('routingPanelItem').setVisible(false);
                                    Ext.getCmp('routingPanelItem').setVisible(true);
                                    Ext.getCmp('routingPanelItem').doLayout();
                                },
                                'collapse': function(panel) {
                                    openaddresses.layout.editControl.activate();
                                    if (Ext.getCmp('routingPanelItem')) {
                                        Ext.getCmp('routingPanelItem').clearItinerary();
                                    }
                                }
                            }
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
                            html: '<a href="addresses/statistic?lang=' + Ext.get('lang').dom.value + '" target="new">' + OpenLayers.i18n('Statistics') + '</a>'
                            //<IFRAME src="addresses/statistic?lang=' + Ext.get('lang').dom.value + '" width="100%" height="100%" frameborder="0"></IFRAME>'
                            //html: OpenLayers.i18n('Ongoing development...<br> About 4.3 millions in OpenAddresses.org.For now, take contact with us through openaddresses[at]googlegroups.com.')
                        },
                        {
                            title: OpenLayers.i18n('License'),
                            html: '<a href="http://creativecommons.org/licenses/by-sa/2.0/" target="new">' + OpenLayers.i18n('OpenAddresses Data Licence') + '</a><li>' + OpenLayers.i18n('The addresses must be associated to the url of http://www.openaddresses.org.') + '</li><li>' + OpenLayers.i18n('The person or entity that submitted the data is stored in a field CREATED_BY.') + '</li><a href="http://www.opensource.org/licenses/gpl-3.0.html" target="new">' + OpenLayers.i18n('OpenAddresses Code Licence') + '</a>'
                        },
                        {
                            title: OpenLayers.i18n('Impressum'),
                            anchor : '100%',
                            html: '<IFRAME src="impressum?lang=' + Ext.get('lang').dom.value + '" width="100%" height="100%" frameborder="0"></IFRAME>'
                        },
                        {
                            title: OpenLayers.i18n('About'),
                            html: '<a href="http://code.google.com/p/openaddresses/" target="new">' + OpenLayers.i18n('Project Wiki') + '</a><br><a href="http://groups.google.com/group/OpenAddresses" target="new">' + OpenLayers.i18n('Project Discussion') + '</a> <br>' + OpenLayers.i18n('This project is a joint effort of several persons:') + '<br>' + OpenLayers.i18n('Several universities:') + '<br>' + OpenLayers.i18n('Several companies:') + '<br>' + OpenLayers.i18n('Powered by MapFish: the web mapping development framework !')
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

    var createOpenAddressesGlobalSearchCombo = function(map) {
        return new openaddresses.OpenAddressesGlobalSearchCombo({
            map: map,
            zoom: 18
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

    var handleMouseOutEvent = function(map) {
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
        if (openaddresses.config.geocoding) {
            openaddresses.layout.navControl.handlers.click.callbacks.rightclick = function() {
                openaddresses.layout.showWaitingMask();
                var lonlat = map.getLonLatFromViewPortPx(openaddresses.layout.navControl.handlers.click.evt.xy);
                var content = "<h1 style='font-size: 14px;'>" + OpenLayers.i18n("Digitized Position") + "</h1><table style='font-size: 14px;'><tr><td width=\"150\">" + "" + OpenLayers.i18n("Spherical Mercator") + "</td><td>" + Math.round(lonlat.lon * 10) / 10 + " " + Math.round(lonlat.lat * 10) / 10 + '</td></tr>';
                lonlat.transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"));
                content = content + "<tr><td>" + OpenLayers.i18n("WGS84") + "</td><td>" + Math.round(lonlat.lon * 100000) / 100000 + " " + Math.round(lonlat.lat * 100000) / 100000 + '</td></tr></table>';
                // Create empty proxy
                var key = openaddresses.config.googleKey;
                if (location.host.indexOf('openaddresses.org') > -1) {
                    key = openaddresses.config.googleKeyOpenAddresses;
                }
                if (location.host.indexOf('openaddress.org') > -1) {
                    key = openaddresses.config.googleKeyOpenAddress;
                }
                if (location.host.indexOf('openaddressmap.org') > -1) {
                    key = openaddresses.config.googleKeyOpenAddressMap;
                }
                map.myProxy = new Ext.data.ScriptTagProxy({
                    url: "http://maps.google.com/maps/geo?q=" + lonlat.lat + "," + lonlat.lon + "&output=json&sensor=true&key=" + key,
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
        } else {
            openaddresses.layout.navControl.handlers.click.callbacks.rightclick = function() {
                var lonlat = map.getLonLatFromViewPortPx(openaddresses.layout.navControl.handlers.click.evt.xy);
                lonlat.transform(map.getProjectionObject(), new OpenLayers.Projection("EPSG:21781"));
                var bboxminx = lonlat.lon - 200;
                var bboxminy = lonlat.lat - 200;
                var bboxmaxx = lonlat.lon + 200;
                var bboxmaxy = lonlat.lat + 200;
                if (bboxminx > 480000 && bboxminx < 835000 && bboxminy > 70000 && bboxmaxy < 298000) {
                    window.open("http://map.housing-stat.ch/index.php?reset_session&recenter_bbox=" + bboxminx + "," + bboxminy + "," + bboxmaxx + "," + bboxmaxy);
                }
            };
        }
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
        if (params.geocoding) {
            openaddresses.config.geocoding = true;
        } else {
            openaddresses.config.geocoding = false;
        }
    };

    var createOpacitySlider = function(map) {
        var opacitySlider = new Ext.Slider({
            id: 'opacity_slider',
            renderTo: Ext.get('OpacitySlider'),
            width: 100,
            value: 0.7,
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
                        if (map.layers[i].name != OpenLayers.i18n("Addresses") && map.layers[i].name != "Routing" && map.layers[i].name != "DrawingLayer") {
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

        showHelpWindow: function() {
            var win = new Ext.Window({
                width:440,
                height:420,
                title: OpenLayers.i18n('Help'),
                html: '<div style="width:425px" id="__ss_3471274"><object width="425" height="355"><param name="movie" value="http://static.slidesharecdn.com/swf/ssplayer2.swf?doc=openaddressesfordummiesen-100318164801-phpapp02&stripped_title=open-addresses-for-dummies-english" /><param name="allowFullScreen" value="true"/><param name="allowScriptAccess" value="always"/><embed src="http://static.slidesharecdn.com/swf/ssplayer2.swf?doc=openaddressesfordummiesen-100318164801-phpapp02&stripped_title=open-addresses-for-dummies-english" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="425" height="355"></embed></object></div>',
                bbar:['->',
                    {
                        text:OpenLayers.i18n('Close'),
                        handler:function() {
                            win.close();
                        }
                    }
                ]
            });
            win.show();
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
                alert(OpenLayers.i18n('You are using Internet Explorer 6. We strongly recommend that you update it to a safer and newer version !'));
            }

            if (Ext.isChrome) {
                alert(OpenLayers.i18n('You are using Chrome. Some unsolved known issues affect this browser. We recommend to use Firefox, Safari or Internet Explorer.'));
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
            //this.modifyFeatureControl.dragControl.handlers.feature.stopClick = false;
            //this.modifyFeatureControl.dragControl.handlers.feature.stopDown = false;
            this.hoverControl = new openaddresses.hover({
                handlerOptions: {
                    'delay': 100
                }
            });


            /* http://trac.openlayers.org/ticket/2528: OK */
            /* http://trac.osgeo.org/mapserver/ticket/1617 NO SUPPORT IN CASCADING WMS...
             this.buildingControl = new OpenLayers.Control.WMSGetFeatureInfo({
             url: openaddresses.config.baseWMS,
             handleRightClicks: true,
             clickCallback: "rightclick",
             infoFormat: 'text/plain',
             layers: openaddresses.layout.map.getLayersByName('CH_Building'),
             eventListeners: {
             getfeatureinfo: function(event) {
             alert('hello');
             },
             beforegetfeatureinfo: function(event) {

             }
             }
             });
             */

            this.map.addControls([this.editControl,this.navControl,this.modifyFeatureControl,this.hoverControl]);
            this.editControl.activate();
            this.navControl.activate();
            if (openaddresses.config.activateHover) {
                this.hoverControl.activate();
                handleMouseOutEvent(this.map);
            }
            //this.buildingControl.activate();

            var openAddressesGlobalSearchCombo = createOpenAddressesGlobalSearchCombo(this.map);
            var permalinkButton = createPermalinkButton();
            var topToolbar = createTopToolbar(this.map, languageCombo, permalinkButton, openAddressesGlobalSearchCombo);
            var displayProjectionSelectorCombo = createDisplayProjectionSelectorCombo(this.map);
            var bottomToolbar = createBottomToolbar(this.map, displayProjectionSelectorCombo);
            var opacitySlider = createOpacitySlider(this.map);

            this.viewport = createViewPort(this.map, this.layers, layerStore, topToolbar, bottomToolbar);
            this.map.zoomTo(1);
            this.map.events.register('zoomend', this, function(record) {
                if (this.map.zoom === 0) {
                    this.map.zoomTo(1);
                }
            });
            setPermalink();

            // Manage controlers for reverse geocoding and editing, associated to navControl
            handleRightMouseClick(this.map);

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

