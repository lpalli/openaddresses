/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/*
 * @requires OpenLayers/Control.js
 * @include OpenLayers/Handler/Click.js
 * @include OpenLayers/Projection.js
 * @include OpenLayers/BaseTypes/LonLat.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Geometry/Point.js
 * @include GeoExt/widgets/Popup.js
 */

Ext.namespace("openaddresses");

openaddresses.EditControl = OpenLayers.Class(OpenLayers.Control, {

    /** api: property[defaultHandlerOptions]
     *  Default options.
     */
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },

    /** private: method[initialize]
     *  Initializes the control
     */
    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.handler = new OpenLayers.Handler.Click(this, {
            'click': this.onClick,
            'dblclick': this.onDblclick},
                this.handlerOptions
                );
    },

    /** private: method[onClick]
     */
    onClick: function(evt) {
        // Pseudo code
        // 1. Check if an address exists at this position
        //  2. If yes
        //     - show a movable circle in the map at the position of the address (create a modify feature control)
        //     - show the edition popup
        //  3. if no
        //     - show a movable circle in the map at the digitized poistion
        //     - show the edition popup
        var clickedPosition = openaddresses.layout.map.getLonLatFromViewPortPx(evt.xy);
        var clickedPositionWGS84 = clickedPosition.clone();
        clickedPositionWGS84.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));

        var vectorLayer = openaddresses.layout.map.getLayersByName('DrawingLayer')[0];
        var map = openaddresses.layout.map;

        /** method[cancelEditing]
         */
        var cancelEditing = function(feature) {
            if (feature.editingPopup) {
                feature.editingPopup.close();
                delete feature.editingPopup;
            }
            vectorLayer.removeFeatures(feature);
            delete feature;
        };

        /** method[saveEditing]
         */
        var saveEditing = function(feature) {
            // Check that mandatory fields ar filled

            // Store the form attributes in the feature
            for (var i = 0; i < feature.editingFormPanel.items.length; i++) {
                var item = feature.editingFormPanel.items.items[i];
                if (item.name == 'country') {
                    if (item.value) {
                        feature.attributes['' + item.name + ''] = openaddresses.countryStore.getCodeFromValue(item.value);
                    }
                } else if (item.name == 'quality') {
                    if (item.value) {
                        feature.attributes['' + item.name + ''] = openaddresses.qualityStore.getCodeFromValue(item.value);
                    }
                } else if (item.name == 'created_by' || item.name == 'street' || item.name == 'housenumber' || item.name == 'housename' || item.name == 'postcode' || item.name == 'city' || item.name == 'region') {
                    feature.attributes['' + item.name + ''] = item.getValue();
                }
            }
            // Check session

            // Store in database

            // Store as previousEditedFeature
            map.previousEditedFeature = feature.clone();

            // Cancel editing
            cancelEditing(feature);

            // Refresh WMS layer
            // TODO
        };

        /** method[addEditingPopup]
         */
        var addEditingPopup = function(feature) {

            var comboCountry = new Ext.form.ComboBox({
                name: 'country',
                store: openaddresses.countryStore,
                fieldLabel: OpenLayers.i18n('Country'),
                displayField:'countryName',
                typeAhead: true,
                mode: 'local',
                triggerAction: 'all',
                width: 240,
                emptyText: OpenLayers.i18n('Select a country...')
            });

            var comboQuality = new Ext.form.ComboBox({
                name: 'quality',
                store: openaddresses.qualityStore,
                fieldLabel: OpenLayers.i18n('Quality'),
                displayField:'quality',
                typeAhead: true,
                mode: 'local',
                triggerAction: 'all',
                width: 240,
                emptyText: OpenLayers.i18n('Select a quality...')
            });

            if (feature.attributes.country) {
                comboCountry.setValue(openaddresses.countryStore.getValueFromCode(feature.attributes.country));
            }

            if (feature.attributes.quality) {
                comboQuality.setValue(openaddresses.qualityStore.getValueFromCode(feature.attributes.quality));
            } else {
                comboQuality.setValue(OpenLayers.i18n('Digitized'));
            }

            feature.editingFormPanel = new Ext.form.FormPanel({
                border: false,
                frame: true,
                labelWidth:120,
                defaultType:'textfield',
                items:[
                    {
                        name:'created_by',
                        fieldLabel: OpenLayers.i18n('Username'),
                        allowBlank: false,
                        width: 160,
                        value: feature.attributes.created_by
                    },
                    {
                        name:'street',
                        fieldLabel: OpenLayers.i18n('Street'),
                        allowBlank: false,
                        width: 240,
                        value: feature.attributes.street
                    },
                    {
                        name:'housenumber',
                        fieldLabel: OpenLayers.i18n('House number'),
                        allowBlank: true,
                        width: 80,
                        value: feature.attributes.housenumber
                    },
                    {
                        name:'housename',
                        fieldLabel: OpenLayers.i18n('House name'),
                        allowBlank: true,
                        width: 240,
                        value: feature.attributes.housename
                    },
                    {
                        name:'postcode',
                        fieldLabel: OpenLayers.i18n('Postal code'),
                        allowBlank: true,
                        width: 80,
                        value: feature.attributes.postcode
                    },
                    {
                        name:'city',
                        fieldLabel: OpenLayers.i18n('City'),
                        allowBlank: false,
                        width: 240,
                        value: feature.attributes.city
                    },
                    {
                        name:'region',
                        fieldLabel: OpenLayers.i18n('Region'),
                        allowBlank: true,
                        width: 240,
                        value: feature.attributes.region
                    },
                    comboCountry,
                    comboQuality
                ]
            });
            feature.editingPopup = new GeoExt.Popup({
                title: OpenLayers.i18n('Address Editor'),
                feature: feature,
                collapsible: false,
                closable: false,
                width: 400,
                bbar: new Ext.Toolbar({
                    items: [
                        {
                            xtype: 'tbbutton',
                            text: OpenLayers.i18n('Delete'),
                            disabled: false,
                            handler: function() {
                                alert('delete');
                            }
                        },
                        {
                            xtype: 'tbfill'
                        },
                        {
                            xtype: 'tbbutton',
                            text: OpenLayers.i18n('Cancel'),
                            disabled: false,
                            handler: function() {
                                cancelEditing(feature);
                            }
                        },
                        {
                            xtype: 'tbbutton',
                            text: OpenLayers.i18n('Save'),
                            disabled: false,
                            handler: function() {
                                saveEditing(feature);
                            }
                        }
                    ]
                }),
                items: [
                    feature.editingFormPanel
                ]
            });
            feature.editingPopup.show();
        };

        // 1. Check if an address exists at this position
        Ext.Ajax.request({
            url: 'addresses/',
            method: 'GET',
            success: function(responseObject) {
                var mapfishFeatures = eval('(' + responseObject.responseText + ')');

                // Check that another feature is edited
                if (map.editedFeature) {
                    cancelEditing(map.editedFeature);
                }

                // Add the feature
                if (mapfishFeatures.features.length === 0) {
                    map.editedFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(clickedPosition.lon, clickedPosition.lat));
                    // Keep previous values
                    if (map.previousEditedFeature) {
                        var attribute;
                        for (attribute in map.previousEditedFeature.attributes) {
                            if (attribute) {
                                map.editedFeature.attributes['' + attribute + ''] = map.previousEditedFeature.attributes['' + attribute + ''];
                            }
                        }
                    }
                } else {
                    var featurePosition = new OpenLayers.LonLat(mapfishFeatures.features[0].geometry.coordinates[0], mapfishFeatures.features[0].geometry.coordinates[1]);
                    featurePosition.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
                    map.editedFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(featurePosition.lon, featurePosition.lat));
                    var property;
                    // Keep the ID, in order to differentiate between a create and an update
                    map.editedFeature.attributes['id'] = mapfishFeatures.features[0].id;
                    for (property in mapfishFeatures.features[0].properties) {
                        map.editedFeature.attributes['' + property + ''] = mapfishFeatures.features[0].properties['' + property + ''];
                    }
                }

                vectorLayer.addFeatures(map.editedFeature);
                map.modifyFeatureControl.selectControl.select(map.editedFeature);
                map.modifyFeatureControl.selectControl.handlers.feature.feature = map.editedFeature;

                // Add the popup associated to the feature
                addEditingPopup(map.editedFeature);
            },
            failure: function() {
                alert('Error in addresses GET query');
            },
            params: {
                lon: clickedPositionWGS84.lon,
                lat: clickedPositionWGS84.lat,
                //tolerance: 0.0001
                tolerance: 0.2
            }
        });

    },

    /** private: method[onDblclick]
     *  Not implemented
     */
    onDblclick: function(evt) {
        alert('doubleClick');
    }
});
