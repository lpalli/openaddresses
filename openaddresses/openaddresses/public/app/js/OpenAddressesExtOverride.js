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