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

    <link rel="stylesheet" type="text/css" href="ext31/resources/css/ext-all.css" />
    <link rel="stylesheet" type="text/css" href="ext31/resources/css/xtheme-gray.css" />
    <link rel="stylesheet" type="text/css" href="mfbase/geoext/resources/css/popup.css" />
    
</head>

<body>
<form><input type="hidden" id="lang" value="${c.lang}"/></form>

% if c.debug:
   <style type="text/css">.olTileImage {
      border: 1px solid lime;
   }   </style>

   <script src="http://api.maps.yahoo.com/ajaxymap?v=3.0&appid=X5v6V_PV34H4r2cBAwU2Ba6eimyZp6WAxo3y2pnvY_vGLfj4.zFsb6gzup25PyNBJ.sW2cM-"></script>
   <script type="text/javascript" src="ext31/adapter/ext/ext-base.js"></script>
   <script type="text/javascript" src="ext31/ext-all-debug.js"></script>

   <script type="text/javascript" src="mfbase/openlayers/lib/OpenLayers.js"></script>
   <script type="text/javascript" src="proj4js/lib/proj4js.js"></script>
   <script type="text/javascript" src="proj4js/lib/projCode/merc.js"></script>
   <script type="text/javascript" src="proj4js/lib/defs/EPSG900913.js"></script>
   <script type="text/javascript" src="geoext-ux-dev/DisplayProjectionSelectorCombo/ux/widgets/form/DisplayProjectionSelectorCombo.js"></script>
   <script type="text/javascript" src="mfbase/geoext/lib/GeoExt.js"></script>
   <script type="text/javascript" src="mfbase/geoext-ux/ux/GeoNamesSearchCombo/lib/GeoExt.ux.geonames/GeoNamesSearchCombo.js"></script>
   <script type="text/javascript" src="mfbase/mapfish/MapFish.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesCountryList.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesQualityList.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesEditControl.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesOsm.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesConfig.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesLanguage.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesLayers.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesLayout.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesInit.js"></script>

% else:
   <script src="http://api.maps.yahoo.com/ajaxymap?v=3.0&appid=X5v6V_PV34H4r2cBAwU2Ba6eimyZp6WAxo3y2pnvY_vGLfj4.zFsb6gzup25PyNBJ.sW2cM-"></script>
   <script type="text/javascript" src="ext31/adapter/ext/ext-base.js"></script>
   <script type="text/javascript" src="ext31/ext-all.js"></script>
   <script type="text/javascript" src="proj4js/lib/proj4js.js"></script>
   <script type="text/javascript" src="proj4js/lib/projCode/merc.js"></script>
   <script type="text/javascript" src="proj4js/lib/defs/EPSG900913.js"></script>
   <script type="text/javascript" src="build/openaddresses.js"></script>
% endif

% if c.lang == 'zh':
   <script type="text/javascript" src="mfbase/openlayers/lib/OpenLayers/Lang/zh-CN.js"></script>
   <script type="text/javascript" src="mfbase/mapfish/lang/zh_CN.js"></script>
   <script type="text/javascript" src="ext31/src/locale/ext-lang-zh_CN.js"></script>
   <script type="text/javascript" src="app/lang/zh_CN.js"></script>
%else:
   <script type="text/javascript" src="mfbase/openlayers/lib/OpenLayers/Lang/${c.lang}.js"></script>
   <script type="text/javascript" src="mfbase/mapfish/lang/${c.lang}.js"></script>
   <script type="text/javascript" src="ext31/src/locale/ext-lang-${c.lang}.js"></script>
   <script type="text/javascript" src="app/lang/${c.lang}.js"></script>
% endif

</body>
</html>