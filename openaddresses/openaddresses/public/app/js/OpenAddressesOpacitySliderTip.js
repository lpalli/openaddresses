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
