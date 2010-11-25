openaddressesMobileConfig = (function() {
    return {
       baseWMS: function() {
           return 'http://127.0.0.1/cgi-bin/mapserv.exe?map=C:\\Sandbox\\openaddresses\\trunk\\openaddresses\\mapserver\\cascading.map';
       },
       addressWMS: function() {
           return 'http://127.0.0.1/cgi-bin/mapserv.exe?map=C:\\Sandbox\\openaddresses\\trunk\\openaddresses\\mapserver\\cascading.map';
       },
       searchURL: function() {
           return '/search'
       }
    }
})();