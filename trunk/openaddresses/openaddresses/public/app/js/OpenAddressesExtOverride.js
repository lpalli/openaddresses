Ext.override(Ext.form.Field, {
    afterRender: Ext.form.Field.prototype.afterRender.createSequence(function() {
        if (this.qtip) {
            var target = this.getTipTarget();
            if (typeof this.qtip == 'object') {
                Ext.QuickTips.register(Ext.apply({
                    target: target
                }, this.qtip));
            } else {
                target.dom.qtip = this.qtip;
            }
        }
    }),
    getTipTarget: function() {
        return this.el;
    }
});

Ext.form.Field.prototype.msgTarget = 'side';

Ext.override(Ext.form.Checkbox, {
    getTipTarget: function() {
        return this.imageEl;
    }
});