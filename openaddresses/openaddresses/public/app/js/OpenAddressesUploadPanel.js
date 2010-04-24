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

Ext.namespace("openaddresses");

openaddresses.UploadPanel = Ext.extend(Ext.form.FormPanel, {

    initComponent : function() {
        var defConfig = {
            plain: true,
            border: false,
            fileUpload: true,
            frame: false,
            autoHeight: true,
            bodyStyle: 'padding: 5px 5px 0 5px;',
            labelWidth: 50,
            defaults: {
                anchor: '100%',
                allowBlank: false
            }
        };

        Ext.applyIf(this, defConfig);

        // Create items of upload panel
        this.items = [
            {
                layout: 'form',
                border:false,
                labelWidth: 70,
                items: [
                    {
                        layout: 'column',
                        border: false,
                        defaults:{
                            layout:'form',
                            border:false,
                            labelWidth: 70,
                            bodyStyle:'padding:5px 0px 0px 5px'
                        },
                        items:[
                            {
                                columnWidth:1,
                                defaults:{
                                    anchor:'100%'
                                },
                                items: [
                                    {
                                        xtype:'textfield',
                                        fieldLabel: OpenLayers.i18n('Email'),
                                        name: 'email',
                                        vtype:'email'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        layout: 'column',
                        border: false,
                        defaults:{
                            layout:'form',
                            border:false,
                            labelWidth: 70,
                            bodyStyle:'padding:5px 0px 0px 5px'
                        },
                        items:[
                            {
                                columnWidth:1,
                                defaults:{
                                    anchor:'100%'
                                },
                                items: [
                                    {
                                        xtype: 'fileuploadfield',
                                        emptyText: OpenLayers.i18n('Select a file...'),
                                        fieldLabel: OpenLayers.i18n('File'),
                                        name: 'uploaded_file',
                                        buttonText: '...'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                layout: 'column',
                border: false,
                bodyStyle:'padding:5px 0px 0px 5px',
                items: [
                    {
                        columnWidth: 1,
                        border: false,
                        bodyCfg: {tag:'center'},
                        items: [
                            {
                                xtype:'button',
                                width: 100,
                                text: OpenLayers.i18n('Upload'),
                                handler: function() {
                                    if (this.getForm().isValid()) {
                                        this.getForm().submit({
                                            url: openaddresses.config.uploadsURL,
                                            waitMsg: OpenLayers.i18n('Uploading file'),
                                            success: function(fp, o) {
                                                alert(OpenLayers.i18n('Your file has been uploaded. Thanks !'));
                                            }
                                        });
                                    } else {
                                        alert(OpenLayers.i18n('Please enter a valid email address and select a file.'));
                                    }
                                },
                                scope: this
                            }
                        ]
                    }
                ]

            }
        ];
        openaddresses.UploadPanel.superclass.initComponent.call(this);
    },

    /** private: method[afterRender]
     *  Private afterRender override.
     */
    afterRender: function() {
        openaddresses.UploadPanel.superclass.afterRender.call(this);
    }
});

/** api: xtype = oa_uploadpanel */
Ext.reg('oa_uploadpanel', openaddresses.UploadPanel);
