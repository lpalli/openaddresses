# -*- coding: utf-8 -*-
from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from openaddresses.lib.base import BaseController
from openaddresses.model.addresses import Address
from openaddresses.model.meta import Session

from mapfish.lib.filters import *
from mapfish.lib.protocol import Protocol, create_default_filter

try:
    from json import dumps as json_dumps
except:
    from simplejson import dumps as json_dumps

from datetime import datetime

from shapely.wkt import loads as geojson_loads

from geojson import dumps as geojson_dumps


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

        return self.protocol.index(request, response, format=format)

    def show(self, id, format='json'):
        """GET /id: Show a specific feature."""
        if (id == 'count'):
           return self.protocol.count(request)
        elif (id == 'fullTextSearch'):
           return self.fullTextSearch(request)
        elif (id == 'checkSession'):
           return self.checkSession()
        elif (id == 'createSession'):
           return self.createSession()
        else:
           return self.protocol.show(request, response, id, format=format)

    def create(self):
        """POST /: Create a new feature."""
        if session['authenticated'] == 'True':
            return self.protocol.create(request, response)
        else:
            abort(403, 'No right to create an address.')

    def update(self, id):
        """PUT /id: Update an existing feature."""
        if session['authenticated'] == 'True':
            return self.protocol.update(request, response, id)
        else:
            abort(403, 'No right to update an address.')

    def delete(self, id):
        """DELETE /id: Delete an existing feature."""
        if session['authenticated'] == 'True':
            return self.protocol.delete(request, response, id)
        else:
            abort(403, 'No right to delete an address.')

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
                tsquery = tsquery + queri + ":*"
             else:
                tsquery = tsquery + queri + ":* & "
          if (len(fieldList) == 3) and ('street' in request.params['fields']) and ('city' in request.params['fields']) and ('housenumber' in request.params['fields']):
             sqlQuery = sqlQuery + " WHERE tsvector_street_housenumber_city @@ to_tsquery('" + tsquery + "')"
          elif (len(fieldList) == 4) and ('geom' in request.params['fields']) and ('street' in request.params['fields']) and ('city' in request.params['fields']) and ('housenumber' in request.params['fields']):
             sqlQuery = sqlQuery + " WHERE tsvector_street_housenumber_city @@ to_tsquery('" + tsquery + "')"
          elif (len(fieldList) == 1) and ('street' in request.params['fields']):
             sqlQuery = sqlQuery + " WHERE tsvector_street @@ to_tsquery('" + tsquery + "')"
          else:
             sqlQuery = sqlQuery + " WHERE to_tsvector(" + tsvector + ") @@ to_tsquery('" + tsquery + "')"

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
          limit = request.params['limit']
          sqlQuery = sqlQuery + " LIMIT " + limit

       # Execute query
       result = Session.execute(sqlQuery)

       rows = result.fetchall()

       # Create a GeoJSON response
       rowsDict = {}
       featuresArray = []
       for row in rows:
          columnCount = 0
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
             columnCount = columnCount + 1
          featureDict.update(properties=featurePropertiesDict)
          if 'geojson' in locals():
             featureDict.update(geometry=eval(geojson))
          featuresArray.append(featureDict)

       rowsDict.update(type='FeatureCollection')
       rowsDict.update(features=featuresArray)

       if 'cb' in request.params:
          response.headers['Content-Type'] = 'text/javascript; charset=utf-8'
          return request.params['cb'] + '(' + json_dumps(rowsDict) + ');'
       else:
          response.headers['Content-Type'] = 'application/json'
          return json_dumps(rowsDict)

    def checkSession(self):
       if 'authenticated' in session:
          authenticated = session.get('authenticated')
          if authenticated:
             if authenticated == 'True':
                return 'True'
             else:
                return 'False'
          else:
             return 'False'
       else:
          return 'False'

    def createSession(self):
        session['authenticated'] = 'True'
        session.save()

    def killSession(self):
        session['authenticated'] = 'False'
        session.save()
