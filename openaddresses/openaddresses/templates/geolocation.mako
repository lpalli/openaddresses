# -*- coding: utf-8 -*-
<html xmlns="http://www.w3.org/1999/xhtml">
<head>

<!--
Site developed with MapFish (http://www.mapfish.org) framework technology
-->

  <meta http-equiv="Content-Type" content="text/html; charset=utf8" />
  <meta name="content-language" content="${c.lang}" />
  <meta name="Generator" content="MapFish - 2010" />
  <title>OpenAddresses - Geolocation</title>
  <meta name="revisit-after" content="7 days" />
  <meta name="robots" content="index,follow " />

  <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"/>

  <link rel="stylesheet" type="text/css" href="${c.root_path}mobile/examples/iol-iui.css" />
% if c.debug:
  <script type="text/javascript" src="${c.root_path}mobile/lib/openlayers/lib/OpenLayers.js"></script>
  <script type="text/javascript" src="${c.root_path}proj4js/lib/proj4js-compressed.js"></script>
  <script type="text/javascript" src="${c.root_path}proj4js/lib/projCode/merc.js"></script>
  <script type="text/javascript" src="${c.root_path}proj4js/lib/defs/EPSG900913.js"></script>
  <script type="text/javascript" src="${c.root_path}proj4js/lib/defs/EPSG21781.js"></script>
  <script type="text/javascript" src="${c.root_path}mobile/lib/IOL/lib/loader.js"></script>
  <script type="text/javascript" src="${c.root_path}app/js/OpenAddressesMobileOsm.js"></script>
  <script type="text/javascript" src="${c.root_path}app/js/OpenAddressesGeolocation.js"></script>
% else:
  <script type="text/javascript" src="${c.root_path}proj4js/lib/proj4js-compressed.js?version=${c.versionTime}"></script>
  <script type="text/javascript" src="${c.root_path}proj4js/lib/projCode/merc.js?version=${c.versionTime}"></script>
  <script type="text/javascript" src="${c.root_path}proj4js/lib/defs/EPSG900913.js?version=${c.versionTime}"></script>
  <script type="text/javascript" src="${c.root_path}proj4js/lib/defs/EPSG21781.js?version=${c.versionTime}"></script>
  <script type="text/javascript" src="${c.root_path}build/geolocation.js"></script>
% endif
  <script type="text/javascript">
      var startGeolocation = function() {
            OpenLayers.ImgPath = "${c.root_path}mfbase/openlayers/img/";
            openaddressesGeolocation.init();
        };
      if (window.addEventListener) {
        window.addEventListener("load", startGeolocation , false);
      } else {
        window.attachEvent("onload", startGeolocation ) 
      }
  </script>
</head>

<body>

    <div id="map" title="Geolocation map">
    </div>

</body>
</html>