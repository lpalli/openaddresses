# -*- coding: utf-8 -*-
<html xmlns="http://www.w3.org/1999/xhtml" lang="${c.lang}" xml:lang="${c.lang}">
<head>

    <!--
    Site developed with MapFish (http://www.mapfish.org) framework technology
    -->

    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="content-language" content="${c.lang}"/>
    <title>OpenAddresses.org</title>
    <meta name="Generator" content="MapFish - 2010"/>
    <meta name="revisit-after" content="7 days"/>
    <meta name="robots" content="index,follow "/>

    <link rel="stylesheet" type="text/css" href="mfbase/ext31/resources/css/ext-all.css" />
    
</head>

<body>
<form><input type="hidden" id="lang" value="${c.lang}"/></form>

% if c.debug:
   <style type="text/css">.olTileImage {
      border: 1px solid lime;
   }   </style>

   <script type="text/javascript" src="mfbase/ext31/adapter/ext/ext-base.js"></script>
   <script type="text/javascript" src="mfbase/ext31/ext-all-debug.js"></script>

   <script type="text/javascript" src="mfbase/openlayers/lib/OpenLayers.js"></script>
   <script type="text/javascript" src="mfbase/geoext/lib/GeoExt.js"></script>
   <script type="text/javascript" src="mfbase/mapfish/MapFish.js"></script>

   <script type="text/javascript" src="mfbase/openlayers/lib/OpenLayers/Lang/${c.lang}.js"></script>
   <script type="text/javascript" src="mfbase/mapfish/lang/${c.lang}.js"></script>
   <script type="text/javascript" src="mfbase/ext31/src/locale/ext-lang-${c.lang}.js"></script>
   <script type="text/javascript" src="OpenAddressesApi/js/lang/${c.lang}.js"></script>

   <script type="text/javascript" src="app/js/OpenAddressesLanguage.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesLayout.js"></script>
   <script type="text/javascript" src="app/js/OpenAddressesInit.js"></script>
% else:
   <script type="text/javascript" src="mfbase/ext31/adapter/ext/ext-base.js"></script>
   <script type="text/javascript" src="mfbase/ext31/ext-all.js"></script>
   <script type="text/javascript" src="mfbase/openlayers/lib/OpenLayers/Lang/${c.lang}.js"></script>
   <script type="text/javascript" src="mfbase/mapfish/lang/${c.lang}.js"></script>
   <script type="text/javascript" src="mfbase/ext31/src/locale/ext-lang-${c.lang}.js"></script>
   <script type="text/javascript" src="OpenAddressesApi/js/lang/${c.lang}.js"></script>
   <script type="text/javascript" src="build/openaddresses.js"></script>
% endif

</body>
</html>