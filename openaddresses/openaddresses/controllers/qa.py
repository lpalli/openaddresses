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

from mapfish.lib.filters import *
from mapfish.lib.protocol import Protocol, create_default_filter
from mapfish.lib.filters.spatial import Spatial

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
          
    def show(self, id, format='json'):
        """GET /id: Show a specific feature."""
        if (id == 'count'):
           return self.protocol.count(request)
        elif (id == 'countCreatedToday'):
           return self.countCreatedToday(request)
        elif (id == 'countUpdatedToday'):
           return self.countUpdatedToday(request)
        elif (id == 'statistic'):
           return self.statistic(request)
        elif (id == 'weekstatistic'):
           return self.weekstatistic(request)
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

    def checkSession(self):
       return 'True'

    def createSession(self):
        return 'True'

    def countCreatedToday(request):

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

    def weekstatistic(self,request):
       if 'lang' in request.params:
          c.lang = request.params.get('lang')
       else:
          c.lang = 'en'
       c.charset = 'utf-8'

       # Create SQL Query
       sqlQuery = "select extract(week from time_created), count(1) as numberAddresses " \
          " from address where extract(year from time_created) = extract (year from now()) "\
          " group by 1 "\
          " order by 1 desc"

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
       return render('/weekstatistic.mako')

