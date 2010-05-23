# -*- coding: utf-8 -*-
import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

import urllib2
import urllib
import uuid

try:
    from json import loads as json_loads
except:
    from simplejson import loads as json_loads

try:
    from json import dumps as json_dumps
except:
    from simplejson import dumps as json_dumps

from openaddresses.lib.base import BaseController, render

log = logging.getLogger(__name__)

class SwissbuildingController(BaseController):

    def index(self):
        if 'latitude' in request.params and 'longitude' in request.params:
           latitude = float(request.params['latitude'])
           longitude = float(request.params['longitude'])      
        if 'easting' in request.params:
           easting = float(request.params['easting'])
        if 'northing' in request.params:
           northing = float(request.params['northing'])

        queryString = 'http://wms.geo.admin.ch/?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&SRS=EPSG:21781'
        queryString = queryString + '&BBOX=' + str(easting-1.0) + ',' + str(northing-1.0) + ',' + str(easting+1.0) + ',' + str(northing+1.0) + ''
        queryString = queryString + '&WIDTH=2&HEIGHT=2&QUERY_LAYERS=ch.bfs.gebaeude_wohnungs_register&LAYERS=ch.bfs.gebaeude_wohnungs_register&X=1&Y=1&uuid=' + str(uuid.uuid1())
        response = urllib2.urlopen(queryString)
        responseText = response.read()
        if responseText.rfind('Search returned no results') == -1:
           responseElements = responseText.split('\'')
           housenumber = responseElements[7]
           street = responseElements[3]
           postcode = responseElements[5]
           city = responseElements[11]
           swissBuildingArray = [{'housenumber': housenumber, 'street': street, 'postcode': postcode, 'city': city}]
           if 'callback' in request.params:
              response.headers['Content-Type'] = 'text/javascript; charset=utf-8'
              return request.params['callback'] + '(' + json_dumps(swissBuildingArray) + ');'
           else:
              response.headers['Content-Type'] = 'application/json'
              return json_dumps(swissBuildingArray)
        else:
           if 'callback' in request.params:
              response.headers['Content-Type'] = 'text/javascript; charset=utf-8'
              return request.params['callback'] + '(' + json_dumps([{'result':'Search returned no results'}]) + ');'
           else:
              response.headers['Content-Type'] = 'application/json'
              return json_dumps([{'result':'Search returned no results'}])


