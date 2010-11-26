# -*- coding: utf-8 -*-
import logging
import StringIO

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.decorators import jsonify

from pylons import config
from pylons.i18n.translation import *

from openaddresses.lib.base import *
from openaddresses.model.qa import Qaoa
from openaddresses.model.meta import Session
from openaddresses.model.meta import metadata

from mapfish.lib.filters import *
from mapfish.lib.protocol import Protocol, create_default_filter
"""from mapfish.lib.filters.spatial import Spatial"""

import locale 

from datetime import datetime

from sqlalchemy.sql import and_

log = logging.getLogger(__name__)

class QaController(BaseController):
    readonly = False # if set to True, only GET is supported

    def __init__(self):
        self.protocol = Protocol(Session, Qaoa, self.readonly, before_create = self.before_create)

    def index(self, format='json'):
        """GET /: return all features."""
        default_filter = create_default_filter(
              request, Qaoa
        )
        response.headers['Content-Type'] = 'application/json'
        return self.protocol.index(request, response, format=format, filter=default_filter)

        """
        # Convert attribute KVP to filter
        for column in Qaoa.__table__.columns:
           if column.name in request.params:
              column_name = column.name
              column_value = request.params[column.name]
              # PGString, PGInteger are supported
              # PGDateTime, Geometry, NullType are not supported
              if str(column.type).find('PGInteger') > -1:
                 compareFilter = comparison.Comparison(
	                comparison.Comparison.EQUAL_TO,
	                Qaoa.__table__.columns[column_name],
	                value=column_value
	             )
                 if default_filter is not None:
                    default_filter = and_(default_filter.to_sql_expr(), compareFilter)
                 else:
                    default_filter = compareFilter
              if str(column.type).find('PGString') > -1:
                 compareFilter = comparison.Comparison(
	                comparison.Comparison.LIKE,
	                Qaoa.__table__.columns[column_name],
	                value=column_value
	             )
                 if default_filter is not None:
                    default_filter = and_(default_filter.to_sql_expr(), compareFilter)
                 else:
                    default_filter = compareFilter
        # Check query for full text search
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

           ftsFilter = "%(tsvector)s @@ to_tsquery('english', '%(terms)s')" %{'tsvector': tsvector, 'terms': terms}
           if default_filter is not None:
              filter = and_(default_filter.to_sql_expr(), ftsFilter)
           else:
              filter = ftsFilter
              
           if format == 'csv':
              return self.exportCsv(request,filter)
           if format == 'zip':
              return self.exportZip(request,filter)

           json = self.protocol.index(request, response, format=format, filter=filter)
           if 'callback' in request.params:
              response.headers['Content-Type'] = 'text/javascript; charset=utf-8'
              return request.params['callback'] + '(' + json + ');'
           else:
              response.headers['Content-Type'] = 'application/json'
              return json
        else:
           if format == 'csv':
              return self.exportCsv(request,default_filter)
           if format == 'zip':
              return self.exportZip(request,default_filter)
           return self.protocol.index(request, response, format=format, filter=default_filter)
        """
		
    def show(self, id, format='json'):
        """GET /id: Show a specific feature."""
        if (id == 'countCreatedToday'):
           return self.countCreatedToday(request)
        elif (id == 'countUpdatedToday'):
           return self.countUpdatedToday(request)
        elif (id == 'statistic'):
           return self.statistic(request)
        elif (id == 'checkSession'):
           return self.checkSession()
        elif (id == 'createSession'):
           return self.createSession()
        elif (id == 'qareport'):
           return self.qareport(request)
        else:
           return self.protocol.show(request, response, id, format=format)

    def create(self):
        """POST /: Create a new feature."""
        "%%%%%%%%%%%%%%%%%create%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
        return self.protocol.create(request, response)

    def update(self, id):
        """PUT /id: Update an existing feature."""
        "%%%%%%%%%%%%%%%%%update%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%" + id
        return self.protocol.update(request, response, id)

    def delete(self, id):
        """DELETE /id: Delete an existing feature."""
        "%%%%%%%%%%%%%%%%%delete%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%" + id
        return self.protocol.delete(request, response, id)

    def before_create(self,request,feature):
       "%%%%%%%%%%%%%%%%%before_create%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%" + str(feature.id)
       feature.properties['ipaddress'] = request.environ['REMOTE_ADDR']
       if isinstance(feature.id, int):
           feature.properties['time_updated'] = datetime.now()
       else:
           feature.properties['time_updated'] = None

    def checkSession(self):
       return 'True'

    def createSession(self):
        return 'True'

    def countCreatedToday(self,request):

       # Create SQL Query
       sqlQuery = "select count(1) from address where time_created::date=now()::date"
       #sqlQuery = "select count(*) count from qaoa" # where time_created::date=now()::date"

       # Execute query
       result = Session.execute(sqlQuery)

       for row in result:
          for column in row:
             return str(column) + " <br> so viele schon..."

    def countUpdatedToday(self,request):

       # Create SQL Query
       sqlQuery = "select count(*) from address where time_updated::date=now()::date"

       # Execute query
       result = Session.execute(sqlQuery)

       for row in result:
          for column in row:
             return str(column)

    def statistic(self,request):
       if 'lang' in request.params:
          c.lang = request.params.get('lang')
       else:
          c.lang = 'en'
       c.charset = 'utf-8'

       # Create SQL Query
       sqlQuery = "select created_by, count(1) as numberAddresses " \
          " from address where extract(week from time_created) = extract(week from now()) "\
          " and extract(year from time_created) = extract (year from now()) "\
          " group by created_by "\
          " order by numberAddresses DESC "\
          " LIMIT 20"

       # Execute query
       result = Session.execute(sqlQuery)

       weekCreator=[]
       for row in result:
          weekRow = []
          for column in row:
             weekRow.append(str(column))
          weekCreator.append(weekRow)

       c.weekCreator = weekCreator
       c.count = locale.format("%s", self.protocol.count(request), True)
       return render('/statistic.mako')


    def qareport(self, request):
       c.charset = 'utf-8'

       # Create SQL Query
       #sqlQuery = "SELECT qaoa.id, address.created_by, address.street, address.housenumber, address.postcode, address.city, address.country, qaoa.bing_dist, qaoa.bing_addr, qaoa.bing_zip, qaoa.bing_city, qaoa.bing_precision, qaoa.google_dist, qaoa.google_addr, qaoa.google_zip, qaoa.google_city, qaoa.google_precision, qaoa.yahoo_dist, qaoa.yahoo_addr, qaoa.yahoo_zip, qaoa.yahoo_city, qaoa.yahoo_precision, qaoa.date "\
       #without Yahoo yet:
       sqlQuery = "SELECT qaoa.id, address.created_by,address.street, address.housenumber, address.postcode, address.city, address.country, qaoa.bing_dist, qaoa.bing_addr, qaoa.bing_zip, qaoa.bing_city, qaoa.bing_precision, qaoa.google_dist, qaoa.google_addr, qaoa.google_zip, qaoa.google_city, qaoa.google_precision, qaoa.date "\
          " FROM qaoa, address "\
          " WHERE qaoa.id = address.id and address.quality='Digitized' "\
          "ORDER BY qaoa.date"

       # Execute query
       result = Session.execute(sqlQuery)
		  
       qaCreator=[]

       for row in result:
          qaRow = []
          for column in row:
             if str(type(column)).find('float') == 7: #this means a float value
                #qaRow.append(str(round(column,4)))
                qaRow.append(round(column,4))				
             else:			 
                qaRow.append(str(column))
          qaCreator.append(qaRow)

       c.qaCreator = qaCreator
       c.count = locale.format("%s", self.protocol.count(request), True)
       return render('/qareport.mako')






