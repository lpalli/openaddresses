# -*- coding: utf-8 -*-
<html xmlns="http://www.w3.org/1999/xhtml">
<head>

<!--
Site developed with MapFish (http://www.mapfish.org) framework technology
-->

  <meta http-equiv="Content-Type" content="text/html; charset=utf8" />
  <meta name="content-language" content="${c.lang}" />
  <meta name="Generator" content="MapFish / CampToCamp - 2010" />
  <title>OpenAddresses - Mobile</title>
  <meta name="revisit-after" content="7 days" />
  <meta name="robots" content="index,follow " />

  <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"/>

  <link rel="stylesheet" type="text/css" href="${c.root_path}mobile/lib/iUI/iui/iui.css" />
  <link rel="stylesheet" type="text/css" href="${c.root_path}mobile/examples/iol-iui.css" />
% if c.debug:
  <script type="text/javascript" src="${c.root_path}mobile/lib/openlayers/lib/OpenLayers.js"></script>
  <script type="text/javascript" src="${c.root_path}mobile/lib/IOL/lib/loader.js"></script>
  <script type="text/javascript" src="${c.root_path}mobile/lib/iUI/iui/iui.js"></script>
  <script type="text/javascript" src="${c.root_path}app/js/OpenAddressesMobileConfig.js"></script>
  <script type="text/javascript" src="${c.root_path}app/js/OpenAddressesMobile.js"></script>
% else:
  <script type="text/javascript" src="${c.root_path}build/mobile.js"></script>
% endif
  <script type="text/javascript">
      window.addEventListener("load", function() {
          OpenLayers.ImgPath = "${c.root_path}mfbase/openlayers/img/";
          openaddressesMobile.init();
      }, false);
  </script>
</head>

<body>

    <div class="toolbar">
        <h1 id="pageTitle"></h1>
        <a id="backButton" class="button" href="#"></a>
        <a id="actionButton" class="button" href="#"></a>
    </div>

    <div id="map" title="${_('Map')}" class="panel" selected="true" actionbutton="{'title': '${_('Search')}', 'href': '#searchForm'}">
    </div>

</body>
</html>