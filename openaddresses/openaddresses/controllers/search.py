# -*- coding: utf-8 -*-
import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from openaddresses.lib.base import BaseController, render

from threading import Thread
import urllib2
import urllib

try:
    from json import loads as json_loads
except:
    from simplejson import loads as json_loads

try:
    from json import dumps as json_dumps
except:
    from simplejson import dumps as json_dumps

from shapely.wkt import loads as geojson_loads
from geojson import dumps as geojson_dumps
import geojson

log = logging.getLogger(__name__)

class SearchController(BaseController):

    def index(self):
        if 'query' in request.params:
           query = request.params['query']
        else:
           return 'ERROR: Use a query parameter'

        #log.warning(type(query)) 

        searchList = []

        threadGeonames = searchThread('geonames',query)
        searchList.append(threadGeonames)
        threadGeonames.start()

        threadOpenAddresses = searchThread('openaddresses',query)
        searchList.append(threadOpenAddresses)
        threadOpenAddresses.start()

        for search in searchList:
           search.join(1)
        
        rowsDict = {}
        featuresArray = []

        # Manage GeoNames search result
        if threadGeonames.json != 'ko':
           geonamesJson = json_loads(threadGeonames.json)

           # Create a GeoJSON response

           # Iterate over json result
           for geoname in geonamesJson['geonames']:
              featureDict = {}
              featureDict.update(type='Feature')
              featurePropertiesDict = {}
              # Create three attributes  display / origin / description
              displayText = geoname['name'] + ' (' + geoname['countryName'] + ',' + geoname['fcodeName'] + ')'
              featurePropertiesDict.update({'display': displayText})
              featurePropertiesDict.update({'origin': 'geonames'})
              featureDict.update(properties=featurePropertiesDict)
              # Create geometry
              pointCoordinate = geojson.Point([geoname['lng'], geoname['lat']])
              geojsonCoordinate = geojson_dumps(pointCoordinate)
              featureDict.update(geometry=eval(geojsonCoordinate))
              featuresArray.append(featureDict)

        # Manage OpenAddresses search result

        if threadOpenAddresses.json != 'ko':
           openaddressesJson = json_loads(threadOpenAddresses.json)

           # Create a GeoJSON response

           # Iterate over json result
           for openaddress in openaddressesJson['features']:
              featureDict = {}
              featureDict.update(type='Feature')
              featurePropertiesDict = {}
              # Create three attributes  display / origin / description
              display = [openaddress['properties']['street'],openaddress['properties']['housenumber'],openaddress['properties']['city']]
              featurePropertiesDict.update({'display': " ".join([n for n in display if n is not None])})
              featurePropertiesDict.update({'origin': 'openaddresses'})
              featureDict.update(properties=featurePropertiesDict)
              # Create geometry
              pointCoordinate = geojson.Point([openaddress['geometry']['coordinates'][0], openaddress['geometry']['coordinates'][1]])
              geojsonCoordinate = geojson_dumps(pointCoordinate)
              featureDict.update(geometry=eval(geojsonCoordinate))
              featuresArray.append(featureDict)

        rowsDict.update(type='FeatureCollection')
        rowsDict.update(features=featuresArray)

        if 'callback' in request.params:
           response.headers['Content-Type'] = 'text/javascript; charset=utf-8'
           return request.params['callback'] + '(' + json_dumps(rowsDict) + ');'
        else:
           response.headers['Content-Type'] = 'application/json'
           return json_dumps(rowsDict)

class searchThread(Thread):
   def __init__ (self,type,query):
      Thread.__init__(self)
      self.type = type
      self.query = query
      self.json = 'ko'
   def run(self):
      if self.type == 'geonames':
         self.queryString = 'http://ws.geonames.org/searchJSON?maxRows=10&name_startsWith='+self.query.replace(' ','%20')+'&lang=en&charset=UTF8'

      if self.type == 'openaddresses':
         self.queryString = 'http://www.openaddresses.org/addresses/?limit=10&attrs=street,housenumber,city&query='+urllib.quote(self.query.encode('utf8'))

      response = urllib2.urlopen(self.queryString)
      self.json = response.read()


