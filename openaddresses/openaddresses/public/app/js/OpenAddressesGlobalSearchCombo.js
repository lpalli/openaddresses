/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

Ext.namespace("openaddresses");

openaddresses.OpenAddressesGlobalSearchCombo = Ext.extend(Ext.form.ComboBox, {
    /** api: config[map]
     *  ``OpenLayers.Map or Object``  A configured map or a configuration object
     *  for the map constructor, required only if :attr:`zoom` is set to
     *  value greater than or equal to 0.
     */
    /** private: property[map]
     *  ``OpenLayers.Map``  The map object.
     */
    map: null,

    /** api: config[width]
     *  See http://www.extjs.com/deploy/dev/docs/source/BoxComponent.html#cfg-Ext.BoxComponent-width,
     *  default value is 350.
     */
    width: 400,

    /** api: config[listWidth]
     *  See http://www.extjs.com/deploy/dev/docs/source/Combo.html#cfg-Ext.form.ComboBox-listWidth,
     *  default value is 350.
     */
    listWidth: 400,

    /** api: config[minChars]
     *  ``Number`` Minimum number of characters to be typed before
     *  search occurs, defaults to 1.
     */
    minChars: 1,

    /** api: config[queryDelay]
     *  ``Number`` Delay before the search occurs, defaults to 50 ms.
     */
    queryDelay: 100,

    /** api: config[tpl]
     *  ``Ext.XTemplate or String`` Template for presenting the result in the
     *  list (see http://www.extjs.com/deploy/dev/docs/output/Ext.XTemplate.html),
     *  if not set a default value is provided.
     */
    tpl: '<tpl for="."><div class="x-combo-list-item">{displayText}</div></tpl>',

    /** private: property[hideTrigger]
     *  Hide trigger of the combo.
     */
    hideTrigger: true,

    /** private: property[displayField]
     *  Display field name
     */
    displayField: 'displayText',

    /** private: property[url]
     *  Url of the OpenAddresses service
     */
    url: '',

    /** private: constructor
     */
    initComponent: function() {
        openaddresses.OpenAddressesGlobalSearchCombo.superclass.initComponent.apply(this, arguments);
        this.loadingText =  OpenLayers.i18n('Search address or location...');
        this.emptyText = OpenLayers.i18n('Search address or location');
        this.url = openaddresses.config.searchURL;
        this.store = new Ext.data.Store({
            proxy: new Ext.data.ScriptTagProxy({
                url: this.url,
                method: 'GET'
            }),
            reader: new Ext.data.JsonReader({
                root: 'features',
                fields: [
                   {name: 'geometry'},
                   {name: 'properties'},
                   {name: 'displayText', mapping: 'properties.display'},
                   {name: 'origin', mapping: 'properties.origin'}
                ]
            })
        });

        if(this.zoom > 0) {
            this.on("select", function(combo, record, index) {
                var position = new OpenLayers.LonLat(
                    record.data.geometry.coordinates[0], record.data.geometry.coordinates[1]
                );
                position.transform(
                    new OpenLayers.Projection("EPSG:4326"),
                    this.map.getProjectionObject()
                );
                if (record.data.properties.origin == 'geonames') {
                    this.map.setCenter(position, 12);
                } else {
                    this.map.setCenter(position, this.zoom);
                }
            }, this);
        }
    }
});
