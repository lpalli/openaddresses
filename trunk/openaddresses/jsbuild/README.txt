To build the JavaScript code in a single, compressed file run the
following commands in the current directory:

$ jsbuild -o ../openaddresses/public/build app.cfg
$ cp -r ../openaddresses/public/mfbase/mapfish/img ../openaddresses/public/build/mapfish/
$ cp -r ../openaddresses/public/mfbase/openlayers/img ../openaddresses/public/build/openlayers/
$ cp -r ../openaddresses/public/mfbase/openlayers/theme ../openaddresses/public/build/openlayers/
