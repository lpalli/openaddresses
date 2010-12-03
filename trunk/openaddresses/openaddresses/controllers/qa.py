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

    def doupdate(self, id):
        #http://127.0.0.1:5000/qa/doupdate/13898308?type=keiner&yahoo_addr=TRUE&yahoo_dist=99.123
        query = Session.query(Qaoa)
        myrec = query.filter_by(id=c.id).one()

        #update BING values
        if 'bing_dist' in request.params:
          bing_dist = request.params.get('bing_dist')
          myrec.bing_dist = bing_dist
        if 'bing_addr' in request.params:
          bing_addr = request.params.get('bing_addr')
          myrec.bing_addr = bing_addr
        if 'bing_city' in request.params:
          bing_city = request.params.get('bing_city')
          myrec.bing_city = bing_city
        if 'bing_zip' in request.params:
          bing_zip = request.params.get('bing_zip')
          myrec.bing_zip = bing_zip
        if 'bing_precision' in request.params:
          bing_precision = request.params.get('bing_precision')
          myrec.bing_precision = bing_precision

        #update GOOGLE values
        if 'google_dist' in request.params:
          google_dist = request.params.get('google_dist')
          myrec.google_dist = google_dist
        if 'google_addr' in request.params:
          google_addr = request.params.get('google_addr')
          myrec.google_addr = google_addr
        if 'google_city' in request.params:
          google_city = request.params.get('google_city')
          myrec.google_city = google_city
        if 'google_zip' in request.params:
          google_zip = request.params.get('google_zip')
          myrec.google_zip = google_zip
        if 'google_precision' in request.params:
          google_precision = request.params.get('google_precision')
          myrec.google_precision = google_precision

		  #update YAHOO values
        if 'yahoo_dist' in request.params:
          yahoo_dist = request.params.get('yahoo_dist')
          myrec.yahoo_dist = yahoo_dist
        if 'yahoo_addr' in request.params:
          yahoo_addr = request.params.get('yahoo_addr')
          myrec.yahoo_addr = yahoo_addr
        if 'yahoo_city' in request.params:
          yahoo_city = request.params.get('yahoo_city')
          myrec.yahoo_city = yahoo_city
        if 'yahoo_zip' in request.params:
          yahoo_zip = request.params.get('yahoo_zip')
          myrec.yahoo_zip = yahoo_zip
        if 'yahoo_precision' in request.params:
          yahoo_precision = request.params.get('yahoo_precision')
          myrec.yahoo_precision = yahoo_precision

        if 'type' in request.params:
          type = request.params.get('type')
          myrec.type = type
        if 'date' in request.params:
          date = request.params.get('date')
          myrec.date = date
		  
        Session.update(myrec)
        Session.commit()		
        Session.close()

    @jsonify
    def index(self):
        qaoa = []
        for s in Session.query(Qaoa):
            qaoa.append({
                "id": s.id
                })
        return qaoa

		
    def show(self, id, format='json'):
        """GET /id: Show a specific feature."""
        if (id == 'qareport'):
           return self.qareport(request)
        else:
           return self.protocol.show(request, response, id, format=format)

    def qareport(self, request):
       condition=''
       user=''	   
       if 'limit' in request.params:
          limit = int(request.params.get('limit'))
       else:
          limit = 100
       if 'user' in request.params:
          user = request.params.get('user')
          condition = " AND created_by='%s'" % user
       if 'street' in request.params:
          street = request.params.get('street')
          condition += " AND street='%s'" % street
       if 'zip' in request.params:
          zip = request.params.get('zip')
          condition += " AND postcode='%s'" % zip
       if 'city' in request.params:
          city = request.params.get('city')
          condition += " AND city='%s'" % city
       if 'country' in request.params:
          country = request.params.get('country')
          condition += " AND country='%s'" % country
       if 'date' in request.params:
          date = request.params.get('date')
          condition += " AND (to_char(time_created,'YYYYMMDD')='%s' OR to_char(time_updated,'YYYYMMDD')='%s')" % (date, date)
       if 'datesince' in request.params:
          datesince = int(request.params.get('datesince'))
          condition += " AND (to_number(to_char(time_created,'YYYYMMDD'),'99999999')>=%s OR to_number(to_char(time_updated,'YYYYMMDD'),'99999999')>=%s)" % (datesince, datesince)
       if 'gdistgr' in request.params:
          gdistgr = int(request.params.get('gdistgr'))
          condition += " AND google_dist>=%s" % gdistgr
       if 'gdistsh' in request.params:
          gdistsh = int(request.params.get('gdistsh'))
          condition += " AND google_dist<=%s" % gdistsh
       if 'bdistgr' in request.params:
          bdistgr = int(request.params.get('bdistgr'))
          condition += " AND bing_dist>=%s" % bdistgr
       if 'bdistsh' in request.params:
          bdistsh = int(request.params.get('bdistsh'))
          condition += " AND bing_dist<=%s" % bdistsh

       c.charset = 'utf-8'
       # Create SQL Query
       sqlQuery = "SELECT ST_y(ST_Transform(address.geom,900913)) AS lat, ST_x(ST_Transform(address.geom,900913)) as lng, qaoa.id,"\
          " address.created_by,address.street, address.housenumber, address.postcode, address.city, address.country, qaoa.bing_dist, qaoa.bing_addr, qaoa.bing_zip, qaoa.bing_city, qaoa.bing_precision, qaoa.google_dist, qaoa.google_addr, qaoa.google_zip, qaoa.google_city, qaoa.google_precision, qaoa.date "\
          " FROM qaoa, address "\
          " WHERE qaoa.id = address.id and address.quality='Digitized' %s "\
          " ORDER BY qaoa.date desc "\
          " limit %i " % (condition, limit)

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

       c.count = len(qaCreator)  
       c.qaCreator = qaCreator
       return render('/qareport.mako')






