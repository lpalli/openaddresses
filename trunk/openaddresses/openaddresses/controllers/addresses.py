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
        else:
           return self.protocol.show(request, response, id, format=format)

    def create(self):
        """POST /: Create a new feature."""
        for key in session:
           if key == 'authenticated':
              return self.protocol.create(request, response)
        abort(403, 'no right')

    def update(self, id):
        """PUT /id: Update an existing feature."""
        return self.protocol.update(request, response, id)

    def delete(self, id):
        """DELETE /id: Delete an existing feature."""
        for key in session:
           if key == 'authenticated':
              return self.protocol.delete(request, response, id)
        abort(403, 'no right')

    def before_create(self,request,feature):
       feature.properties['ipaddress'] = request.environ['REMOTE_ADDR']
       if isinstance(feature.id, int):
           feature.properties['time_updated'] = datetime.now()
       else:
           feature.properties['time_updated'] = None

    def fullTextSearch(self,request):
       # Read request parameters
       fields = request.params['fields']
       query = request.params['query']

       # Manage attributes
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

       # Creat SQL Query
       sqlQuery = "SELECT "
       if ('distinct' in request.params):
          sqlQuery = sqlQuery + "distinct "

       sqlQuery = sqlQuery + fields +" FROM address WHERE to_tsvector(" + tsvector + ") @@ to_tsquery('" + tsquery + "')"

       if ('easting' in request.params) and ('northing' in request.params) and ('tolerance' in request.params):
          easting = request.params['easting']
          northing = request.params['northing']
          tolerance = request.params['tolerance']
          # Add spatial filter
          sqlQuery = sqlQuery + " and ST_Distance(geom, ST_GeomFromText('POINT("+easting+" "+northing+")', 4326)) < "+tolerance

       # Add limit
       if 'limit' in request.params:
          limit = request.params['limit']
          sqlQuery = sqlQuery + " LIMIT " + limit

       result = Session.execute(sqlQuery)

       rows = result.fetchall()

       return rows
