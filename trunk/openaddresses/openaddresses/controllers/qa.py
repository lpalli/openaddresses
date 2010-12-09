# -*- coding: utf-8 -*-
import logging
import StringIO
# Imports for mail sending
import smtplib
from email.mime.text import MIMEText

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.decorators import jsonify

from pylons import config
from pylons.i18n.translation import *

from openaddresses.lib.base import *
from openaddresses.model.qa import Qaoa
from openaddresses.model.addresses import Address
from openaddresses.model.meta import Session
from openaddresses.model.meta import metadata

from mapfish.lib.filters import *
from mapfish.lib.protocol import Protocol, create_default_filter
"""from mapfish.lib.filters.spatial import Spatial"""

import locale 

from datetime import datetime

from sqlalchemy.sql import and_

log = logging.getLogger(__name__)


def sendamail(mailreceiver, mailtext):
  sender = 'hansjoerg.stark@fhnw.ch'
  sender = 'quality.manager@openaddresses.org'
  receiver = mailreceiver #'hansjoerg.stark@openaddresses.ch'
  msg = MIMEText(mailtext)
  msg['Subject'] = 'One of your addresses in OpenAddresses.org has changed'
  msg['From'] = sender
  msg['To'] = receiver

# Send the message via external SMTP server
  smtpusername = 'qm@openaddresses.ch'
  smtppwd = '**qmOA!!'
  s = smtplib.SMTP('smtp.openaddresses.ch')
  s.login(smtpusername,smtppwd)
  s.sendmail(sender, receiver, msg.as_string())
  s.quit()


class QaController(BaseController):
    readonly = False # if set to True, only GET is supported

    def __init__(self):
        self.protocol = Protocol(Session, Qaoa, self.readonly)

    def index(self):
        htmlinfo = "Please call <a href='/qa/qareport' target='_blank'>http://www.openaddresses.org/qa/qareport</a> for a report on quality information.<br>"\
        "You may also use keyvalues to customise the report. In the following are some examples given:<br><br>"\
        "The last 20 addresses from user Pete:<br><a href='/qa/qareport?limit=20&user=pete' target='_blank'>http://www.openaddresses.org/qa/qareport?limit=20&user=pete</a><br><br>"\
        "All addresses from December 7 2010:<br><a href='/qa/qareport?date=20101207' target='_blank'>http://www.openaddresses.org/qa/qareport?date=20101207</a><br><br>"\
        "All addresses since December 1 2010:<br><a href='/qa/qareport?datesince=20101201' target='_blank'>http://www.openaddresses.org/qa/qareport?datesince=20101201</a><br><br>"\
        "All addresses with a deviation to Bing Maps greater than 50m of city Muttenz, ordered descending by deviation:<br><a href='/qa/qareport?bdistgr=50&city=Muttenz&orderby=bing_dist desc' target='_blank'>http://www.openaddresses.org/qa/qareport?bdistgr=50&city=Muttenz&orderby=bing_dist desc</a><br><br>"\
        "All addresses with a deviation to Google Maps smaller than 20m of zip 4132, ordered ascending by user:<br><a href='/qa/qareport?gdistsh=20&zip=4132&orderby=created_by asc' target='_blank'>http://www.openaddresses.org/qa/qareport?gdistsh=20&zip=4132&orderby=created_by asc</a><br><br>"

        return htmlinfo
		
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

        #do check only once - not twice because doupdate is called both from Google and Bing verification
        if 'bing_dist' in request.params:
          self.checkfornoticebymail()

    def checkfornoticebymail(self):
	    #check if the changed address has a contact mail who should be informed about a change
        queryA = Session.query(Address)
        currecA = queryA.filter_by(id=c.id).one()

        mailReceiver = currecA.email
        if mailReceiver:
          #extract new values:
          new_street = currecA.street
          new_housenumber = currecA.housenumber
          new_housename = currecA.housename
          new_postcode = currecA.postcode
          new_region = currecA.region
          new_city = currecA.city
          new_country = currecA.country
          user = currecA.created_by

          #extract old values:
          sqlQuery = "select  address_archive.street,address_archive.housenumber,address_archive.housename,address_archive.postcode,address_archive.region,address_archive.city,address_archive.country,round(cast(ST_Distance_Sphere(address_archive.geom,address.geom) as Numeric),3) as deviation"\
            " from address, address_archive where (address.id=%i and address.id=address_archive.id) order by address_archive.archive_date desc limit 1 " % int(c.id)

          # Execute query
          result = Session.execute(sqlQuery)
          for row in result: 
            old_street = row['street']
            old_housenumber = row['housenumber']
            old_housename = row['housename']
            old_postcode = row['postcode']
            old_region = row['region']
            old_city = row['city']
            old_country = row['country']
            deviation = str(row['deviation'])

          msgtext = '[changed?]\t\t[old value]  \t|  \t[new value] \n'
          if old_street == new_street:
             msgtext += '[ ] street: \t[%s]  \t|  \t[%s] \n' % (old_street, new_street)
          else:
             msgtext += '[x] street: \t[%s]  \t|  \t[%s] \n' % (old_street, new_street)
          if old_housenumber == new_housenumber:
             msgtext += '[ ] housenumber: \t[%s]  \t|  \t[%s] \n' % (old_housenumber, new_housenumber)
          else:
             msgtext += '[x] housenumber: \t[%s]  \t|  \t[%s] \n' % (old_housenumber, new_housenumber)
          if old_housename == new_housename:
             msgtext += '[ ] housename: \t[%s]  \t|  \t[%s] \n' % (old_housename, new_housename)
          else:
             msgtext += '[x] housename: \t[%s]  \t|  \t[%s] \n' % (old_housename, new_housename)
          if old_postcode == new_postcode:
             msgtext += '[ ] postcode: \t[%s]  \t|  \t[%s] \n' % (old_postcode, new_postcode)
          else:
             msgtext += '[x] postcode: \t[%s]  \t|  \t[%s] \n' % (old_postcode, new_postcode)
          if old_region == new_region:
             msgtext += '[ ] region: \t[%s]  \t|  \t[%s] \n' % (old_region, new_region)			 
          else:
             msgtext += '[x] region: \t[%s]  \t|  \t[%s] \n' % (old_region, new_region)			 
          if old_city == new_city:
             msgtext += '[ ] city: \t[%s]  \t|  \t[%s] \n' % (old_city, new_city)
          else:
             msgtext += '[x] city: \t[%s]  \t|  \t[%s] \n' % (old_city, new_city)
          if old_country == new_country:
             msgtext += '[ ] country: \t[%s]  \t|  \t[%s] \n' % (old_country, new_country)
          else:
             msgtext += '[x] country: \t[%s]  \t|  \t[%s] \n\n' % (old_country, new_country)
          if float(deviation)>0:
             msgtext += '[x] Deviation: \t%sm \n' % (deviation)
          else:
             msgtext += '[ ] Deviation: \t%sm \n' % (deviation)
          msgtext += 'user: \t%s \n' % (user)
          
          sendamail(mailReceiver, msgtext)

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
       if 'orderby' in request.params:
          orderby = request.params.get('orderby')
       else:
          orderby = 'qaoa.date desc'
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
       if 'ydistgr' in request.params:
          ydistgr = int(request.params.get('ydistgr'))
          condition += " AND yahoo_dist>=%s" % ydistgr
       if 'ydistsh' in request.params:
          ydistsh = int(request.params.get('ydistsh'))
          condition += " AND yahoo_dist<=%s" % ydistsh
       if 'qmname' in request.params:
          tables2use =", qm_regions" 
          qmname = request.params.get('qmname')
          condition += " AND contains(qm_regions.geom,address.geom) and qm_regions.qmname='%s'" % qmname
       else:
          tables2use ="" 

       c.charset = 'utf-8'
       # Create SQL Query
       sqlQuery = "SELECT ST_y(ST_Transform(address.geom,900913)) AS lat, ST_x(ST_Transform(address.geom,900913)) as lng, qaoa.id,"\
          " address.created_by,address.street, address.housenumber, address.postcode, address.city, address.country,"\
          " qaoa.bing_dist, qaoa.bing_addr, qaoa.bing_zip, qaoa.bing_city, qaoa.bing_precision,"\
          " qaoa.google_dist, qaoa.google_addr, qaoa.google_zip, qaoa.google_city, qaoa.google_precision,"\
          " qaoa.yahoo_dist, qaoa.yahoo_addr, qaoa.yahoo_zip, qaoa.yahoo_city, qaoa.yahoo_precision,"\
          " qaoa.date "\
          " FROM qaoa, address %s"\
          " WHERE qaoa.id = address.id and address.quality='Digitized' %s "\
          " ORDER BY %s "\
          " limit %i " % (tables2use, condition, orderby, limit)

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






