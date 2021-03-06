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
 * @requires OpenLayers/Control.js
 * @include OpenLayers/Handler/Click.js
 * @include OpenLayers/Projection.js
 * @include OpenLayers/BaseTypes/LonLat.js
 * @include OpenLayers/Feature/Vector.js
 * @include OpenLayers/Geometry/Point.js
 * @include OpenLayers/Format/GeoJSON.js
 * @include GeoExt/widgets/Popup.js
 */

Ext.namespace("openaddresses");

openaddresses.EditControl = OpenLayers.Class(OpenLayers.Control, {

    isAuthenticated: false,

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
        openaddresses.qualityStore = new Ext.data.ArrayStore({
            storeId: 'qualityStore',
            data: [
                ['Digitized', OpenLayers.i18n('Digitized')],
                ['Donated', OpenLayers.i18n('Donated')],
                ['GPS', OpenLayers.i18n('GPS')],
                ['Linear interpolation', OpenLayers.i18n('Linear interpolation')]
            ],
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
        if (openaddresses.layout.map.zoom < 9) {
            alert(OpenLayers.i18n('Please zoom further to create or edit an address'));
            return;
        }
        openaddresses.layout.showWaitingMask();
        var clickedPosition = openaddresses.layout.map.getLonLatFromViewPortPx(evt.xy);
        var clickedPositionWGS84 = clickedPosition.clone();
        clickedPositionWGS84.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
        var clickedPosition21781 = clickedPosition.clone();
        clickedPosition21781.transform(openaddresses.layout.map.getProjectionObject(), new OpenLayers.Projection("EPSG:21781"));

        var vectorLayer = openaddresses.layout.map.drawingLayer;
        var map = openaddresses.layout.map;

        var tolerance = 0;
        if (map.zoom < 16) {
            tolerance = 0.000000;
        }
        if (map.zoom == 16) {
            tolerance = 0.000128987;
        }
        if (map.zoom == 17) {
            tolerance = 0.000064494;
        }
        if (map.zoom == 18) {
            tolerance = 0.000064494;
        }
        if (map.zoom == 19) {
            tolerance = 0.000032247;
        }
        if (map.zoom == 20) {
            tolerance = 0.000016123;
        }
        if (map.zoom == 21) {
            tolerance = 0.000008062;
        }
        if (map.zoom == 22) {
            tolerance = 0.000004031;
        }
        if (map.zoom == 23) {
            tolerance = 0.000002015;
        }

        /** method[cancelEditing]
         */
        var cancelEditing = function(feature, redraw) {
            openaddresses.layout.showWaitingMask();
            if (feature.editingPopup) {
                feature.editingPopup.close();
                delete feature.editingPopup;
            }
            vectorLayer.removeFeatures(feature);
            if (redraw) {
                openaddresses.layout.map.addressLayer.redraw(true);
                openaddresses.layout.map.addressNumberLayer.redraw(true);
            }
            openaddresses.layout.modifyFeatureControl.deactivate();
            openaddresses.layout.editControl.activate();
            if (openaddresses.config.activateHover) {
                openaddresses.layout.hoverControl.activate();
            }
            map.editedFeature = null;
            openaddresses.layout.hideWaitingMask();
        };

        /** method[saveEditing]
         */
        var saveEditing = function(feature) {
            openaddresses.layout.showWaitingMask();
            // Check that mandatory fields ar filled
            if (!feature.editingFormPanel.getForm().isValid()) {
                Ext.Msg.alert(OpenLayers.i18n('Address Validation'), OpenLayers.i18n('Please fill all mandatory fields: ') + OpenLayers.i18n('Username') + " - " + OpenLayers.i18n('Street') + " - " + OpenLayers.i18n('City'));
                return;
            }

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
                } else if (item.name == 'created_by' || item.name == 'street' || item.name == 'housenumber' || item.name == 'housename' || item.name == 'postcode' || item.name == 'city' || item.name == 'locality' || item.name == 'region') {
                    feature.attributes['' + item.name + ''] = item.getValue();
                }
            }

            Ext.Ajax.request({
                url: 'addresses/checkSession',
                method: 'GET',
                disableCaching: true,
                success: function(responseObject) {
                    if (responseObject.responseText == 'True' && this.isAuthenticated) {
                        saveFeature(feature);
						} else {
                        Ext.Msg.show({
                            title: OpenLayers.i18n('User Validation'),
                            msg: OpenLayers.i18n('Please confirm that you agree with the OpenAddresses.org license and terms of services'),
                            buttons: Ext.Msg.OKCANCEL,
                            fn: function(btn) {
                                if (btn == 'ok') {
                                    // Not working due to session issues in mod_wsgi
                                    // createSession();
                                    this.isAuthenticated = true;
                                    saveFeature(feature);
                                }
                            },
                            icon: Ext.MessageBox.QUESTION
                        });

                    }
                },
                failure: function() {
                    openaddresses.layout.hideWaitingMask();
                    //alert('Error in createSession GET query');
                }
            });

            var saveFeature = function(feature) {
                // Save feature
                var conn = new Ext.data.Connection();
                var json = new OpenLayers.Format.GeoJSON();
                // Transform geometry to 4326
                feature.geometry.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
                if (feature.attributes.id) {
                    feature.id = feature.attributes.id;
                }
                var jsonData = json.write(feature);
                conn.request({
                    url: "addresses",
                    method: 'POST',
                    jsonData: '{"type":"FeatureCollection", "features":[' + jsonData + ']}',
                    success: function(resp, opt) {
                        endSaveFeature(feature);
					    //kick-off QA mechanism
						var curaddrID;
						if (feature.attributes.id){
							curaddrID = feature.attributes.id;
							}
						else {
							//determine ID of address
							var response = eval('(' + resp.responseText + ')');
							curaddrID = response.features[0].id;
						}

						//addition for qa mechanism
						var curCountry=feature.attributes.country;
						qa_ComparisonWithOWMS(feature.attributes.street,feature.attributes.housenumber,feature.attributes.housename,feature.attributes.postcode,feature.attributes.city,feature.attributes.created_by,feature.geometry.x,feature.geometry.y,curaddrID,curCountry);			

                    },
                    failure: function(resp, opt) {
                        cancelEditing(feature, true);
                        alert(OpenLayers.i18n('Error during data storage'));
                    }
                });

            };

            var endSaveFeature = function(feature) {
                // Store as previousEditedFeature
                map.previousEditedFeature = feature.clone();
                if (map.previousEditedFeature.attributes.id) {
                    delete map.previousEditedFeature.attributes.id;
                }
                if (map.previousEditedFeature.attributes.housenumber) {
                    delete map.previousEditedFeature.attributes.housenumber;
                }
                if (map.previousEditedFeature.attributes.housename) {
                    delete map.previousEditedFeature.attributes.housename;
                }
                if (map.previousEditedFeature.attributes.time_created) {
                    delete map.previousEditedFeature.attributes.time_created;
                }
                if (map.previousEditedFeature.attributes.time_updated) {
                    delete map.previousEditedFeature.attributes.time_updated;
                }
                if (map.previousEditedFeature.attributes.osmid) {
                    delete map.previousEditedFeature.attributes.osmid;
                }
                if (map.previousEditedFeature.attributes.externalid) {
                    delete map.previousEditedFeature.attributes.externalid;
                }
                if (map.previousEditedFeature.attributes.status) {
                    delete map.previousEditedFeature.attributes.status;
                }
                if (map.previousEditedFeature.attributes.tsvector_street) {
                    delete map.previousEditedFeature.attributes.tsvector_street;
                }
                if (map.previousEditedFeature.attributes.tsvector_street_housenumber_city) {
                    delete map.previousEditedFeature.attributes.tsvector_street_housenumber_city;
                }
                if (map.previousEditedFeature.attributes.ipaddress) {
                    delete map.previousEditedFeature.attributes.ipaddress;
                }

                // Cancel editing
                cancelEditing(feature, true);
            };
        };

        var createSession = function() {
            Ext.Ajax.request({
                url: 'addresses/createSession',
                disableCaching: true,
                method: 'POST',
                success: function(responseObject) {
                    this.isAuthenticated = true;
                    //alert('Session created');
                },
                failure: function() {
                    openaddresses.layout.hideWaitingMask();
                    alert('Error in createSession GET query');
                }
            });

        };

        var deleteEditing = function(feature) {
            openaddresses.layout.showWaitingMask();
            Ext.Ajax.request({
                url: 'addresses/checkSession',
                method: 'GET',
                disableCaching: true,
                success: function(responseObject) {
                    if (responseObject.responseText == 'True' && this.isAuthenticated) {
                        deleteFeature(feature);
                    } else {
                        Ext.Msg.show({
                            title: OpenLayers.i18n('User Validation'),
                            msg: OpenLayers.i18n('Please confirm that you agree with the OpenAddresses.org license and terms of services'),
                            buttons: Ext.Msg.OKCANCEL,
                            fn: function(btn) {
                                if (btn == 'ok') {
                                    // Doesn't work due to mod_wsgi
                                    //createSession();
                                    this.isAuthenticated = true;
                                    deleteFeature(feature);
                                }
                            },
                            icon: Ext.MessageBox.QUESTION
                        });

                    }
                },
                failure: function() {
                    openaddresses.layout.hideWaitingMask();
                    //alert('Error in createSession GET query');
                }
            });

            var deleteFeature = function(feature) {
                var conn = new Ext.data.Connection();
                var conn4mailchk = new Ext.data.Connection();

                if (feature.attributes.id) {
                    feature.id = feature.attributes.id;
                }
                Ext.Msg.show({
                    title: OpenLayers.i18n('Deletion Confirmation'),
                    msg: OpenLayers.i18n('Do you really want to delete this address ?'),
                    buttons: Ext.Msg.YESNO,
                    fn: function(btn) {
                        if (btn == 'yes') {
                            if (feature.id) {
                                conn.request({
                                    url: "addresses/" + feature.id,
                                    method: 'DELETE',
                                    success: function(resp, opt) {
                                        cancelEditing(feature, true);										
										conn4mailchk.request({
											url: "qa/ondelete/" + feature.id,
											method: 'GET'
										});
									},
                                    failure: function(resp, opt) {
                                        openaddresses.layout.hideWaitingMask();
                                        alert(OpenLayers.i18n('Error during data deletion'));
                                    }
                                });
                            } else {
                                cancelEditing(feature, false);
                            }
                        }
                    },
                    icon: Ext.MessageBox.QUESTION
                });
            };
        };

        /** method[addEditingPopup]
         */
        var addEditingPopup = function(feature) {
            openaddresses.layout.showWaitingMask();
            var keyListener = {
                specialkey: function(f, o) {
                    if (o.getKey() == 13) {
                        saveEditing(feature);
                    }
                }
            };
            var comboCountry = new Ext.form.ComboBox({
                name: 'country',
                store: openaddresses.countryStore,
                fieldLabel: OpenLayers.i18n('Country'),
                displayField:'countryName',
                typeAhead: true,
                mode: 'local',
                triggerAction: 'all',
                width: 240,
                emptyText: OpenLayers.i18n('Select a country...'),
                listeners: keyListener,
                qtip: OpenLayers.i18n('The country of the city.')
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
                emptyText: OpenLayers.i18n('Select a quality...'),
                listeners: keyListener,
                qtip: OpenLayers.i18n('The quality. If you use the web interface, this will be "Digitized".')
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
                defaults: {
                    listeners: keyListener
                },
                items:[
                    {
                        id:'created_by',
                        name:'created_by',
                        fieldLabel: OpenLayers.i18n('Username'),
                        allowBlank: false,
                        width: 160,
                        value: feature.attributes.created_by,
                        qtip: OpenLayers.i18n('The person or entity who created the address. ONLY used for statistic purpose.')
                    },
                    {
                        id:'street',
                        name:'street',
                        fieldLabel: OpenLayers.i18n('Street'),
                        allowBlank: false,
                        width: 240,
                        value: feature.attributes.street,
                        qtip: OpenLayers.i18n('The street name used by the persons living in this area.')
                    },
                    {
                        id:'housenumber',
                        name:'housenumber',
                        fieldLabel: OpenLayers.i18n('House number'),
                        allowBlank: true,
                        width: 80,
                        value: feature.attributes.housenumber,
                        qtip: OpenLayers.i18n('The house number, if one exists.')
                    },
                    {
                        id:'postcode',
                        name:'postcode',
                        fieldLabel: OpenLayers.i18n('Postal code'),
                        allowBlank: true,
                        width: 80,
                        value: feature.attributes.postcode,
                        qtip: OpenLayers.i18n('The postal code.')
                    },
                    {
                        id:'city',
                        name:'city',
                        fieldLabel: OpenLayers.i18n('City'),
                        allowBlank: false,
                        width: 240,
                        value: feature.attributes.city,
                        qtip: OpenLayers.i18n('The city.')

                    },
                    comboCountry,
                    comboQuality,
                    {
                        id:'housename',
                        name:'housename',
                        fieldLabel: OpenLayers.i18n('House name'),
                        allowBlank: true,
                        width: 240,
                        value: feature.attributes.housename,
                        qtip: OpenLayers.i18n('The house name if one exists.')
                    },
                    {
                        name:'locality',
                        id:'locality',
                        fieldLabel: OpenLayers.i18n('Locality'),
                        allowBlank: true,
                        width: 240,
                        value: feature.attributes.locality,
                        qtip: OpenLayers.i18n('The locality. It is an addition to the city information.')
                    },
                    {
                        name:'region',
                        id:'region',
                        fieldLabel: OpenLayers.i18n('Region'),
                        allowBlank: true,
                        width: 240,
                        value: feature.attributes.region,
                        qtip: OpenLayers.i18n('The region. This can be a department, a state, a canton.')
                    }
                ]
            });

            var buttonText;
            var getPreviousValueButton = new Ext.Button({
                id: 'getPreviousValueButton',
                text: OpenLayers.i18n('Get missing values from previous address'),
                qtip: OpenLayers.i18n('Fill the empty attributes of this address with the value of the previous edited address. For all attributes except house number and house name.'),
                disabled: false,
                handler: function() {
                    var attribute;
                    if (map.previousEditedFeature) {
                        for (attribute in map.previousEditedFeature.attributes) {
                            if (attribute && !map.editedFeature.attributes['' + attribute + '']) {
                                map.editedFeature.attributes['' + attribute + ''] = map.previousEditedFeature.attributes['' + attribute + ''];
                                if (attribute == 'country') {
                                    comboCountry.setValue(openaddresses.countryStore.getValueFromCode(map.editedFeature.attributes['' + attribute + '']));
                                } else if (attribute == 'quality') {
                                    comboQuality.setValue(openaddresses.qualityStore.getValueFromCode(map.editedFeature.attributes['' + attribute + '']));
                                } else {
                                    if (attribute == 'created_by' || attribute == 'street' || attribute == 'postcode' || attribute == 'city' || attribute == 'locality' || attribute == 'region') {
                                        Ext.getCmp(attribute).setValue(map.editedFeature.attributes['' + attribute + '']);
                                    }
                                }
                            }
                        }
                    }
                    for (var i = 0; i < feature.editingFormPanel.items.getCount(); ++i) {
                        var comp = feature.editingFormPanel.items.get(i);
                        if (!comp.value) {
                            comp.focus(true, 300);
                            break;
                        }
                    }
                }
            });
            var getSwissAddress = function() {
                openaddresses.layout.showWaitingMask();
                Ext.Ajax.request({
                    url: 'swissBuilding/',
                    method: 'GET',
                    success: function(responseObject) {
                        var buildingFeatures = eval('(' + responseObject.responseText + ')');
                        if (buildingFeatures[0].result) {
                            alert(OpenLayers.i18n('No data found'));
                        } else {
                            if (buildingFeatures[0].housenumber) {
                                map.editedFeature.attributes['housenumber'] = buildingFeatures[0].housenumber;
                                Ext.getCmp('housenumber').setValue(map.editedFeature.attributes['housenumber']);
                            }
                            if (buildingFeatures[0].city) {
                                map.editedFeature.attributes['city'] = buildingFeatures[0].city;
                                Ext.getCmp('city').setValue(map.editedFeature.attributes['city']);
                            }
                            if (buildingFeatures[0].postcode) {
                                map.editedFeature.attributes['postcode'] = buildingFeatures[0].postcode;
                                Ext.getCmp('postcode').setValue(map.editedFeature.attributes['postcode']);
                            }
                            if (buildingFeatures[0].street) {
                                map.editedFeature.attributes['street'] = buildingFeatures[0].street;
                                Ext.getCmp('street').setValue(map.editedFeature.attributes['street']);
                            }
                            comboCountry.setValue('Switzerland');
                        }
                        openaddresses.layout.hideWaitingMask();
                    },
                    failure: function() {
                        openaddresses.layout.hideWaitingMask();
                        alert('Error in swissBuilding GET query');
                    },
                    params: {
                        easting: clickedPosition21781.lon,
                        northing: clickedPosition21781.lat
                    }
                });
            };
            var getSwissValueButton = new Ext.Button({
                id: 'getSwissValueButton',
                text: OpenLayers.i18n('Get values from authorized source'),
                qtip: OpenLayers.i18n('Get the address from an authorized source'),
                disabled: false,
                handler: function() {
                    getSwissAddress();
                }
            });
            if (feature.attributes && feature.attributes.id) {
                buttonText = OpenLayers.i18n('Save');
                getSwissValueButton.hide();
                if (map.previousEditedFeature) {
                    getPreviousValueButton.show();
                } else {
                    getPreviousValueButton.hide();
                }
            } else {
                buttonText = OpenLayers.i18n('Create');
                var bboxminx = clickedPosition21781.lon - 200;
                var bboxminy = clickedPosition21781.lat - 200;
                var bboxmaxx = clickedPosition21781.lon + 200;
                var bboxmaxy = clickedPosition21781.lat + 200;
                if (bboxminx > 480000 && bboxminx < 835000 && bboxminy > 70000 && bboxmaxy < 298000) {
                    if (openaddresses.config.autoload) {
                        getSwissAddress();
                    }
                    getSwissValueButton.show();
                } else {
                    getSwissValueButton.hide();
                }
                getPreviousValueButton.hide();
            }

            feature.editingPopup = new GeoExt.Popup({
                title: OpenLayers.i18n('Address Editor'),
                location: feature,
                collapsible: true,
                closable: false,
                unpinnable: false,
                draggable: true,
                width: 410,
                map: map,
                bbar: new Ext.Toolbar({
                    items: [
                        {
                            xtype: 'tbbutton',
                            text: OpenLayers.i18n('Delete'),
                            disabled: false,
                            handler: function() {
                                openaddresses.layout.showWaitingMask();
                                deleteEditing(feature);
                            }
                        },
                        getPreviousValueButton,
                        getSwissValueButton,
                        {
                            xtype: 'tbfill'
                        },
                        {
                            xtype: 'tbbutton',
                            text: OpenLayers.i18n('Cancel'),
                            disabled: false,
                            handler: function() {
                                openaddresses.layout.showWaitingMask();
                                cancelEditing(feature, false);
                            }
                        },
                        {
                            xtype: 'tbbutton',
                            text: buttonText,
                            disabled: false,
                            handler: function() {
                                openaddresses.layout.showWaitingMask();
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
            feature.editingFormPanel.getForm().isValid();
            // Focus on the first empty field
            for (var i = 0; i < feature.editingFormPanel.items.getCount(); ++i) {
                var comp = feature.editingFormPanel.items.get(i);
                if (!comp.value) {
                    comp.focus(true, 300);
                    break;
                }
            }
        };

        Ext.Ajax.request({
            url: 'addresses/',
            method: 'GET',
            success: function(responseObject) {
                var mapfishFeatures = eval('(' + responseObject.responseText + ')');

                // Check that another feature is edited
                if (map.editedFeature) {
                    cancelEditing(map.editedFeature, true);
                }
                var attribute;
                // Add the feature
                if (mapfishFeatures.features.length === 0) {
                    map.editedFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(clickedPosition.lon, clickedPosition.lat));
                    delete map.editedFeature.id;
                    if (map.previousEditedFeature) {
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
                    delete map.editedFeature.id;
                    var property;
                    // Keep the ID, in order to differentiate between a create and an update
                    map.editedFeature.attributes['id'] = mapfishFeatures.features[0].id;
                    for (property in mapfishFeatures.features[0].properties) {
                        map.editedFeature.attributes['' + property + ''] = mapfishFeatures.features[0].properties['' + property + ''];
                    }
                }

                vectorLayer.addFeatures(map.editedFeature);
                openaddresses.layout.modifyFeatureControl.activate();
                openaddresses.layout.editControl.deactivate();
                if (openaddresses.config.activateHover) {
                    openaddresses.layout.hoverControl.deactivate();
                }
                openaddresses.layout.modifyFeatureControl.selectControl.select(map.editedFeature);
                openaddresses.layout.modifyFeatureControl.selectControl.handlers.feature.feature = map.editedFeature;

                // Add the popup associated to the feature
                addEditingPopup(map.editedFeature);
                openaddresses.layout.hideWaitingMask();
            },
            failure: function() {
                openaddresses.layout.hideWaitingMask();
                alert('Error in addresses GET query');
            },
            params: {
                lon: clickedPositionWGS84.lon,
                lat: clickedPositionWGS84.lat,
                tolerance: tolerance
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
