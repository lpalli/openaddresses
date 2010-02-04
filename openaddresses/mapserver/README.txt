TESTS URL
DONT FORGET TO ADD THE FOLLOWING DEFINITION IN EPSG:
<900913> +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs

GetCapabilities:
http://127.0.0.1/cgi-bin/mapserv.exe?map=C:\Sandbox\openadresses\trunk\openaddresses\mapserver\dummy.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities
http://127.0.0.1/cgi-bin/mapserv.exe?map=C:\Sandbox\openadresses\trunk\openaddresses\mapserver\cascading.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities
http://sitn.ne.ch/ogc-sitn-open/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities

GetMap:
http://127.0.0.1/cgi-bin/mapserv.exe?map=C:\Sandbox\openadresses\trunk\openaddresses\mapserver\dummy.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=bluemarble&STYLES=&SRS=EPSG:4326&BBOX=-10,30,20,60&WIDTH=400&HEIGHT=300&FORMAT=image/png
http://127.0.0.1/cgi-bin/mapserv.exe?map=C:\Sandbox\openadresses\trunk\openaddresses\mapserver\cascading.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=prov_bound&STYLES=&SRS=EPSG:4326&BBOX=-180,-90,180,90&WIDTH=400&HEIGHT=300&FORMAT=image/png
http://127.0.0.1/cgi-bin/mapserv.exe?map=C:\Sandbox\openadresses\trunk\openaddresses\mapserver\cascading.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=SITN&STYLES=&SRS=EPSG:4326&BBOX=6.93,47.00,6.96,47.03&WIDTH=400&HEIGHT=300&FORMAT=image/png
http://127.0.0.1/cgi-bin/mapserv.exe?map=C:\Sandbox\openadresses\trunk\openaddresses\mapserver\cascading.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=SITN&STYLES=&SRS=EPSG:900913&BBOX=763167,5933966,768059,5938839&WIDTH=800&HEIGHT=800&FORMAT=image/png
