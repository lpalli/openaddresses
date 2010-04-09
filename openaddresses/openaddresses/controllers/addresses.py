# -*- coding: utf-8 -*-
import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.decorators import jsonify

from openaddresses.lib.base import BaseController
from openaddresses.model.addresses import Address
from openaddresses.model.meta import Session

from mapfish.lib.filters import *
from mapfish.lib.protocol import Protocol, create_default_filter
from mapfish.lib.filters.spatial import Spatial

try:
    from json import dumps as json_dumps
except:
    from simplejson import dumps as json_dumps

from datetime import datetime

from shapely.wkt import loads as geojson_loads

from geojson import dumps as geojson_dumps

from sqlalchemy.sql import and_

log = logging.getLogger(__name__)

class AddressesController(BaseController):
    readonly = False # if set to True, only GET is supported

    def __init__(self):
        self.protocol = Protocol(Session, Address, self.readonly, before_create = self.before_create)

    def index(self, format='json'):
        """GET /: return all features."""
        # If no filter argument is passed to the protocol index method
        # then the default MapFish filter is used. This default filter
        # is constructed based on the box, lon, lat, tolerance GET
        # params.
        #
        # If you need your own filter with application-specific params 
        # taken into acount, create your own filter and pass it to the
        # protocol index method.
        #
        # E.g.
        #
        # default_filter = create_default_filter(
        #     request, Address
        # )
        # compare_filter = comparison.Comparison(
        #     comparison.Comparison.ILIKE,
        #     Address.mycolumnname,
        #     value=myvalue
        # )
        # filter = logical.Logical(logical.Logical.AND, [default_filter, compare_filter])
        # return self.protocol.index(request, response, format=format, filter=filter)
        #
        #
        # You can also create filters using sqlalchemy syntax.
        # It is possible for example to mix a custom sqlalchemy filter
        # with the default mapfish filter.
        #
        # E.g.
        #
        # from sqlalchemy.sql import and_
        #
        # default_filter = create_default_filter(
        #     request, Address
        # )
        # compare_filter = Address.mycolumnname.ilike('%myvalue%')
        # if default_filter is not None:
        #     filter = and_(default_filter.to_sql_expr(), compare_filter)
        # else:
        #     filter = compare_filter
        # return self.protocol.index(request, response, format=format, filter=filter)
        if 'query' in request.params:
           # http://lowmanio.co.uk/blog/entries/postgresql-full-text-search-and-sqlalchemy/
           terms = request.params.get('query').split()
           terms = ' & '.join([term + ('' if term.isdigit() else ':*')  for term in terms])

           if 'attrs' in request.params:
              attributes = request.params.get('attrs').split(',')
              if (len(attributes) == 3) and ('street' in request.params.get('attrs')) and ('city' in request.params.get('attrs')) and ('housenumber' in request.params.get('attrs')):
                 tsvector = 'tsvector_street_housenumber_city'
              elif (len(attributes) == 1) and ('street' in request.params.get('attrs')):
                 tsvector = 'tsvector_street'
              else:
                 attributes = " || ' ' ||".join([attribute for attribute in attributes])
                 tsvector = attributes
           else:
              tsvector = 'tsvector_street_housenumber_city'
           
           default_filter = create_default_filter(
              request, Address
           )
           ftsFilter = "%(tsvector)s @@ to_tsquery('english', '%(terms)s')" %{'tsvector': tsvector, 'terms': terms}
           if default_filter is not None:
              filter = and_(default_filter.to_sql_expr(), ftsFilter)
           else:
              filter = ftsFilter
#           log.warning(filter)
           return self.protocol.index(request, response, format=format, filter=filter)
        else:
           return self.protocol.index(request, response, format=format)

    def show(self, id, format='json'):
        """GET /id: Show a specific feature."""
        if (id == 'count'):
           return self.protocol.count(request)
        elif (id == 'countCreatedToday'):
           return self.countCreatedToday(request)
        elif (id == 'countUpdatedToday'):
           return self.countUpdatedToday(request)
        elif (id == 'fullTextSearch'):
           return self.fullTextSearch(request)
        elif (id == 'json'):
           return self.json(request)
        elif (id == 'checkSession'):
           return self.checkSession()
        elif (id == 'createSession'):
           return self.createSession()
        else:
           return self.protocol.show(request, response, id, format=format)

    def create(self):
        """POST /: Create a new feature."""
        return self.protocol.create(request, response)

    def update(self, id):
        """PUT /id: Update an existing feature."""
        return self.protocol.update(request, response, id)

    def delete(self, id):
        """DELETE /id: Delete an existing feature."""
        return self.protocol.delete(request, response, id)

    def before_create(self,request,feature):
       feature.properties['ipaddress'] = request.environ['REMOTE_ADDR']
       if isinstance(feature.id, int):
           feature.properties['time_updated'] = datetime.now()
       else:
           feature.properties['time_updated'] = None

    def fullTextSearch(self,request):
       #  addresses/fullTextSearch?fields=street,city,housenumber&query=ch%20du%2028&tolerance=0.005&easting=6.62379551&northing=46.51687241&limit=20&distinct=true
       # Read request parameters
       fields = request.params['fields']

       # Manage fields
       fieldList =  fields.split(",")
       fieldCount = 0
       tsvector = ''
       fields = ''
       for field in fieldList:
          fieldCount = fieldCount + 1
          if (field == 'geom'):
             field = 'astext(geom)'
          if (fieldCount == len(fieldList)):
             tsvector = tsvector + field
             fields = fields + field
          else:
             tsvector = tsvector + field + " || ' ' ||"
             fields = fields + field + ","

       # Create SQL Query
       sqlQuery = "SELECT "

       # Add distinct to SQL Query
       if ('distinct' in request.params):
          sqlQuery = sqlQuery + "distinct "

       sqlQuery = sqlQuery + fields + " FROM address "

       if 'query' in request.params:
          query = request.params['query']
          # Manage query
          queryList = query.split();
          queryCount = 0
          tsquery = ''
          for queri in queryList:
             queryCount = queryCount + 1
             if (queryCount == len(queryList)):
                if queri.isdigit():
                   tsquery = tsquery + queri
                else:
                   tsquery = tsquery + queri + ":*"
             else:
                if queri.isdigit():
                   tsquery = tsquery + queri + " & "
                else:
                    tsquery = tsquery + queri + ":* & "
          if (len(fieldList) == 3) and ('street' in request.params['fields']) and ('city' in request.params['fields']) and ('housenumber' in request.params['fields']):
             sqlQuery = sqlQuery + " WHERE tsvector_street_housenumber_city @@ to_tsquery('english', '" + tsquery + "')"
          elif (len(fieldList) == 4) and ('geom' in request.params['fields']) and ('street' in request.params['fields']) and ('city' in request.params['fields']) and ('housenumber' in request.params['fields']):
             sqlQuery = sqlQuery + " WHERE tsvector_street_housenumber_city @@ to_tsquery('english','" + tsquery + "')"
          elif (len(fieldList) == 1) and ('street' in request.params['fields']):
             sqlQuery = sqlQuery + " WHERE tsvector_street @@ to_tsquery('english','" + tsquery + "')"
          else:
             sqlQuery = sqlQuery + " WHERE to_tsvector(" + tsvector + ") @@ to_tsquery('english','" + tsquery + "')"

       # Add spatial filter to SQL Query
       if ('easting' in request.params) and ('northing' in request.params) and ('tolerance' in request.params):
          easting = float(request.params['easting'])
          northing = float(request.params['northing'])
          tolerance = float(request.params['tolerance'])
          minx =  easting-tolerance
          maxx =  easting+tolerance
          miny =  northing-tolerance
          maxy =  northing+tolerance
          spatialFilter =  "geom && ST_SetSRID('BOX3D("+ str(minx) +" "+ str(miny) +","+ str(maxx) +" "+ str(maxy) +")'::box3d,4326) AND ST_Distance(geom, ST_GeomFromText('POINT("+str(easting)+" "+str(northing)+")', 4326)) < "+str(tolerance)
          if 'query' in request.params:
             sqlQuery = sqlQuery + " and " + spatialFilter
          else:
             sqlQuery = sqlQuery + " WHERE " + spatialFilter

       # Add limit to SQL Query
       if 'limit' in request.params:
          limit = int(request.params['limit'])
          sqlQuery = sqlQuery + " LIMIT " + str(limit)

       # Execute query
       result = Session.execute(sqlQuery)

       rows = result.fetchall()

       # Create a GeoJSON response
       rowsDict = {}
       featuresArray = []
       for row in rows:
          columnCount = 0
          displayText = ''
          featureDict = {}
          featureDict.update(type='Feature')
          featurePropertiesDict = {}
          for column in row:
             fieldName = fieldList[columnCount]
             if (fieldName == 'geom'):
                # Convert to GeoJSON
                coordinates = geojson_loads(column)
                geojson = geojson_dumps(coordinates)
             else:
                featurePropertiesDict.update({'' + fieldName + '': column})
                if column is not None:
                   displayText = displayText + column + ' '
             columnCount = columnCount + 1
          featurePropertiesDict.update({'displayText': displayText.rstrip().lstrip()})
          featureDict.update(properties=featurePropertiesDict)
          if 'geojson' in locals():
             featureDict.update(geometry=eval(geojson))
          featuresArray.append(featureDict)

       rowsDict.update(type='FeatureCollection')
       rowsDict.update(features=featuresArray)

       if 'callback' in request.params:
          response.headers['Content-Type'] = 'text/javascript; charset=utf-8'
          return request.params['callback'] + '(' + json_dumps(rowsDict) + ');'
       else:
          response.headers['Content-Type'] = 'application/json'
          return json_dumps(rowsDict)

    def checkSession(self):
       return 'True'

    def createSession(self):
        return 'True'

    def countCreatedToday(self,request):

       # Create SQL Query
       sqlQuery = "select count(1) count from address where time_created::date=now()::date"

       # Execute query
       result = Session.execute(sqlQuery)

       for row in result:
          for column in row:
             return str(column)

    def countUpdatedToday(self,request):

       # Create SQL Query
       sqlQuery = "select count(1) from address where time_updated::date=now()::date"

       # Execute query
       result = Session.execute(sqlQuery)

       for row in result:
          for column in row:
             return str(column)

    @jsonify
    def json(self,request):
        # http://lowmanio.co.uk/blog/entries/postgresql-full-text-search-and-sqlalchemy/
        terms = request.params.get('query').split()
        terms = ' & '.join([term + ('' if term.isdigit() else ':*')  for term in terms])

        limit = None

        query = self.protocol.Session.query(Address)
        
        # Read request parameters
        tsvector = ''
        if 'fields' in request.params:
           fields = request.params['fields']
           # Manage fields
           fieldList =  fields.split(",")
           fieldCount = 0
           fields = ''
           for field in fieldList:
              fieldCount = fieldCount + 1
              if (field == 'geom'):
                 field = 'astext(geom)'
              if (fieldCount == len(fieldList)):
                 tsvector = tsvector + field
                 fields = fields + field
              else:
                 tsvector = tsvector + field + " || ' ' ||"
                 fields = fields + field + ","
        else:
           tsvector = 'tsvector_street_housenumber_city'


        params = {
            'tsvector': tsvector,
            'tsquery' : "to_tsquery('english', :terms)"
        }
           
        query = query.filter("%(tsvector)s @@ %(tsquery)s"%params)

        query = query.params(terms=terms)

        if ('easting' in request.params) and ('northing' in request.params) and ('tolerance' in request.params):
          easting = float(request.params['easting'])
          northing = float(request.params['northing'])
          tolerance = float(request.params['tolerance'])
          geom_column = Address.geometry_column()
          filter = Spatial(
             Spatial.WITHIN,
             geom_column,
             lon=easting,
             lat=northing,
             tolerance=tolerance,
             epsg=4326
          )
          query = query.filter(filter.to_sql_expr())

        if 'limit' in request.params:
           limit = int(request.params['limit'])
           query = query.limit(limit)
           
        return {
            'success': True,
            'results': [result.format() for result in query]
        }
