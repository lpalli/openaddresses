# -*- coding: utf-8 -*-
<html xmlns="http://www.w3.org/1999/xhtml" lang="${c.lang}" xml:lang="${c.lang}">
<head>

    <!--
    Site developed with MapFish (http://www.mapfish.org) framework technology
    -->

    <meta http-equiv="Content-Type" content="text/html; charset=${c.charset}"/>
    <meta name="content-language" content="${c.lang}"/>
    <title>OpenAddresses.org</title>
    <meta name="Generator" content="MapFish - 2010"/>
    <meta name="revisit-after" content="7 days"/>
    <meta name="robots" content="index,follow "/>

   <!--script src="http://www.google.com/jsapi?key=ABQIAAAAXP_8MYDI21DrDldhFCNqohSHQfVSIhQI6ECr286wVQ34_evcPRTow3UQ9rqhzod2zMXPH_sSoe-xBA" type="text/javascript"></script-->
   <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;sensor=true_or_false&amp;key=ABQIAAAAmF9bNI4nQInzlORfshwB9hQChx54JYdgbPKio935j7RDK0bGdhSRJ4EAIkt7qwyaYpYR6IpKHQDL7g" type="text/javascript"></script>
	
    <link rel="stylesheet" type="text/css" href="ext32/resources/css/ext-all.css" />
    <link rel="stylesheet" type="text/css" href="ext32/examples/ux/css/ux-all.css" />
    <link rel="stylesheet" type="text/css" href="ext32/resources/css/xtheme-gray.css" />
    <link rel="stylesheet" type="text/css" href="mfbase/geoext/resources/css/popup.css" />
    <link rel="stylesheet" type="text/css" href="mfbase/openlayers/theme/default/style.css" />
    <link rel="stylesheet" type="text/css" href="resources/css/OpenAddresses.css" />
    
</head>

<body onload="initiatebing()";>
<form><input type="hidden" id="lang" value="${c.lang}"/></form>

<div id="MouseOver" style="display: none;"></div>
<div id="SearchResult" style="display: none; position: absolute;"></div>
<div id="titleText" style="position: absolute; left: 85px; top: 43px; font:bold 13px tahoma,arial,verdana,sans-serif;">${_('Management of free and open worldwide localized addresses')}</div>
<div id="OpacitySlider"></div>
<div id="loading-mask" style=""></div>
<div id="loading">
    <div class="loading-indicator"><img src="resources/img/OpenAddressesLoader.gif" width="32" height="32" style="margin-right:8px;float:left;vertical-align:top;"/>${_('OpenAddresses.org soon ready for you !')}<br /><span id="loading-msg">${_('Loading application...')}</span></div>
</div>

 <div id="waiting">
    <div class="loading-indicator"><img src="resources/img/OpenAddressesLoader.gif" width="32" height="32" style="margin-right:8px;float:left;vertical-align:top;"/>${_('OpenAddresses.org works for you !')}<br /></div>
</div>
<!--the following tag is necessary for the bing geocoding-->
<div id='BingMap' style="position:relative; width:1px; height:1px;"></div>

% if c.debug:
   <style type="text/css">.olTileImage {
      border: 1px solid lime;
   }   </style>

   <script src="http://api.maps.yahoo.com/ajaxymap?v=3.0&appid=X5v6V_PV34H4r2cBAwU2Ba6eimyZp6WAxo3y2pnvY_vGLfj4.zFsb6gzup25PyNBJ.sW2cM-"></script>
   <script type="text/javascript" src="ext32/adapter/ext/ext-base-debug.js"></script>
   <script type="text/javascript" src="ext32/ext-all-debug.js"></script>
   <script type="text/javascript" src="ext32/examples/ux/ux-all-debug.js"></script>

   <script type="text/javascript" src="mfbase/openlayers/lib/OpenLayers.js"></script>
   <script type="text/javascript" src="proj4js/lib/proj4js-compressed.js"></script>
   <script type="text/javascript" src="proj4js/lib/projCode/merc.js"></script>
   <script type="text/javascript" src="proj4js/lib/defs/EPSG900913.js"></script>
   <script type="text/javascript" src="proj4js/lib/defs/EPSG21781.js"></script>
   <script type="text/javascript" src="geoext-ux-dev/DisplayProjectionSelectorCombo/ux/widgets/form/DisplayProjectionSelectorCombo.js"></script>
   <script type="text/javascript" src="geoext-ux-dev/Toolbar/ux/widgets/LoadingStatusBar.js"></script>
   <script type="text/javascript" src="geoext-ux-dev/OpenAddressesSearchCombo/lib/GeoExt.ux/OpenAddressesSearchCombo.js"></script>
   <script type="text/javascript" src="geoext-ux-dev/RoutingPanel/ux/widgets/RoutingPanel.js"></script>
   <script type="text/javascript" src="mfbase/geoext/lib/GeoExt.js"></script>
   <script type="text/javascript" src="mfbase/geoext-ux/ux/GeoNamesSearchCombo/lib/GeoExt.ux/GeoNamesSearchCombo.js"></script>
   <script type="text/javascript" src="mfbase/mapfish/MapFish.js"></script> 
   <script type="text/javascript" src="app/js/OpenAddressesExtOverride.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesHover.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesOpacitySliderTip.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesCountryList.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesEditControl.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesGlobalSearchCombo.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesOsm.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesConfig.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesLanguage.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesLayers.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesLayout.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesUploadPanel.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesInit.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesQA.js"></script>
   <!--the following JS are necessary for the bing geocoding-->
   <script type="text/javascript" src="http://dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6.2"></script>
   <script type="text/javascript">
		var bingmap = null;
		function initiatebing() {
			bingmap = new VEMap('BingMap');
			bingmap.LoadMap(new VELatLong(47, 8.3), 6 );
		}
   </script>

   

% else:
   <script src="http://api.maps.yahoo.com/ajaxymap?v=3.0&appid=X5v6V_PV34H4r2cBAwU2Ba6eimyZp6WAxo3y2pnvY_vGLfj4.zFsb6gzup25PyNBJ.sW2cM-"></script>
   <script type="text/javascript" src="ext32/adapter/ext/ext-base.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="ext32/ext-all.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="ext32/examples/ux/ux-all.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="proj4js/lib/proj4js-compressed.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="proj4js/lib/projCode/merc.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="proj4js/lib/defs/EPSG900913.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="proj4js/lib/defs/EPSG21781.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="build/openaddresses.js?version=${c.versionTime}"></script>

    <script type="text/javascript">
        var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
        document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
        </script>
        <script type="text/javascript">
        try {
            var pageTracker = _gat._getTracker("UA-3355818-8");
            pageTracker._setDomainName(".openaddresses.org");
            pageTracker._trackPageview();
        } catch(err) {}
    </script>

% endif

% if c.lang == 'zh':
   <script type="text/javascript" src="mfbase/openlayers/lib/OpenLayers/Lang/zh-CN.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="mfbase/mapfish/lang/zh_CN.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="ext32/src/locale/ext-lang-zh_CN.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="app/lang/zh_CN.js?version=${c.versionTime}"></script>
% elif c.lang == 'mk':
   <script type="text/javascript" src="app/lang/mk.js?version=${c.versionTime}"></script>
% elif c.lang == 'pl':
   <script type="text/javascript" src="ext32/src/locale/ext-lang-${c.lang}.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="app/lang/${c.lang}.js?version=${c.versionTime}"></script>
%else:
   <script type="text/javascript" src="mfbase/openlayers/lib/OpenLayers/Lang/${c.lang}.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="mfbase/mapfish/lang/${c.lang}.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="ext32/src/locale/ext-lang-${c.lang}.js?version=${c.versionTime}"></script>
   <script type="text/javascript" src="app/lang/${c.lang}.js?version=${c.versionTime}"></script>
% endif

</body>
</html>
