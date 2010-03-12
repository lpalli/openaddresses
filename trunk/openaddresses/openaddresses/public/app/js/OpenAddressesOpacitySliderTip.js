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

/**
 * @requires GeoExt/widgets/tips/SliderTip.js
 */

Ext.namespace("openaddresses");

openaddresses.OpacitySliderTip = Ext.extend(GeoExt.SliderTip, {

    template: '<div>' + OpenLayers.i18n('Overlay opacity') + ': {opacityValue}</div>',

    /** private: property[compiledTemplate]
     *  ``Ext.Template``
     *  The template compiled from the ``template`` string on init.
     */
    compiledTemplate: null,

    /** private: method[init]
     *  Called to initialize the plugin.
     */
    init: function(slider) {
        this.compiledTemplate = new Ext.Template(this.template);
        openaddresses.OpacitySliderTip.superclass.init.call(this, slider);
    },

    /** private: method[getText]
     *  :param slider: ``Ext.Slider`` The slider this tip is attached to.
     */
    getText: function(slider) {
        var data = {
            opacityValue: slider.getValue()
        };
        return this.compiledTemplate.apply(data);
    }
});
