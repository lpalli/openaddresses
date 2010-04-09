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
           #  log.warning(filter)
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
