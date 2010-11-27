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
        self.protocol = Protocol(Session, Qaoa, self.readonly)

    def index(self, format='json'):
        """GET /: return all features."""
        default_filter = create_default_filter(
              request, Qaoa
        )
        response.headers['Content-Type'] = 'application/json'
        return self.protocol.index(request, response, format=format, filter=default_filter)
		
    def show(self, id, format='json'):
        """GET /id: Show a specific feature."""
        if (id == 'qareport'):
           return self.qareport(request)
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

    def qareport(self, request):
       c.charset = 'utf-8'

       # Create SQL Query
       #sqlQuery = "SELECT qaoa.id, address.created_by, address.street, address.housenumber, address.postcode, address.city, address.country, qaoa.bing_dist, qaoa.bing_addr, qaoa.bing_zip, qaoa.bing_city, qaoa.bing_precision, qaoa.google_dist, qaoa.google_addr, qaoa.google_zip, qaoa.google_city, qaoa.google_precision, qaoa.yahoo_dist, qaoa.yahoo_addr, qaoa.yahoo_zip, qaoa.yahoo_city, qaoa.yahoo_precision, qaoa.date "\
       #without Yahoo yet:
       sqlQuery = "SELECT qaoa.id, address.created_by,address.street, address.housenumber, address.postcode, address.city, address.country, qaoa.bing_dist, qaoa.bing_addr, qaoa.bing_zip, qaoa.bing_city, qaoa.bing_precision, qaoa.google_dist, qaoa.google_addr, qaoa.google_zip, qaoa.google_city, qaoa.google_precision, qaoa.date "\
          " FROM qaoa, address "\
          " WHERE qaoa.id = address.id and address.quality='Digitized' "\
          " ORDER BY qaoa.date desc limit 200"

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






