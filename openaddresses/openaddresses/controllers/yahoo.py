#!/usr/bin/python
# -*- coding: utf-8 -*-

import logging
import urllib2, urllib
import simplejson as json
import codecs, sys

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from openaddresses.lib.base import BaseController, render
from mapfish.lib.protocol import Protocol, create_default_filter

from openaddresses.lib.base import *
from openaddresses.model.meta import Session
from openaddresses.model.meta import metadata
from openaddresses.model.qa import Qaoa

log = logging.getLogger(__name__)
### Mathe-Paket importieren
import math


def points2distance(start,  end):
    """
    Calculate distance (in kilometers) between two points given as (long, latt) pairs
    based on Haversine formula (http://en.wikipedia.org/wiki/Haversine_formula).
    Implementation inspired by JavaScript implementation from http://www.movable-type.co.uk/scripts/latlong.html
    Edited by Christian Karrié
    """
    start_long = math.radians(start[0]) # Start-Long
    start_latt = math.radians(start[1]) # Start-Lat
    end_long = math.radians(end[0])     # End-Long
    end_latt = math.radians(end[1])     # End-Lat
    d_latt = end_latt - start_latt
    d_long = end_long - start_long
    a = math.sin(d_latt/2)**2 + math.cos(start_latt) * math.cos(end_latt) * math.sin(d_long/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return 6371 * c * 1000

class YahooController(BaseController):
    readonly = False # if set to True, only GET is supported

    def __init__(self):
        self.protocol = Protocol(Session, self.readonly)
    def index(self):
        return ''
    def doupdate(self, id):
        #http://127.0.0.1:5000/yahoo/doupdate/13898437?street=Kriegackerstrasse&house=40&postal=4132&city=Muttenz&lat=47.53&lng=7.63
        if 'street' in request.params:
          street = urllib.quote(request.params.get('street').encode('utf-8'))
        if 'house' in request.params:
          house = request.params.get('house')
        if 'postal' in request.params:
          postal = request.params.get('postal')
        if 'city' in request.params:
          city = urllib.quote(request.params.get('city').encode('utf-8'))
        if 'lat' in request.params:
          lat = request.params.get('lat')
        else:
          lat = '0'
        if 'lng' in request.params:
          lng = request.params.get('lng')
        else:
          lng = '0'
        #testlink: http://127.0.0.1:5000/yahoo/doupdate?street=Ramsteinerstrasse&house=10&postal=4052&city=Basel		  
        urlStr = 'http://where.yahooapis.com/geocode?street=%s&house=%s&postal=%s&city=%s&flags=J&appid=dj0yJmk9aG5YOFZqRmwxQTNyJmQ9WVdrOVNVWmtaelJOTkdFbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD04Nw--' %(street, house, postal, city)

        query = Session.query(Qaoa)
        myrec = query.filter_by(id=c.id).one()

        fileHandle = urllib2.urlopen(urlStr)
        thefile = fileHandle.read()
        fileHandle.close()
        decoded = json.loads(thefile)
        y_lat = decoded['ResultSet']['Results'][0]['latitude']
        y_lon = decoded['ResultSet']['Results'][0]['longitude']
        y_street = decoded['ResultSet']['Results'][0]['street']
        y_house = decoded['ResultSet']['Results'][0]['house']
        y_postal = decoded['ResultSet']['Results'][0]['postal']
        y_city = decoded['ResultSet']['Results'][0]['city']
        y_quality = decoded['ResultSet']['Results'][0]['quality']

        from_geocoder = [float(y_lon), float(y_lat)]
        from_request = [float(lng), float(lat)]
        distance = points2distance(from_geocoder, from_request)

        myrec.yahoo_dist=distance
        
        if (y_street != street) or (y_house != house):
            myrec.yahoo_addr='False'
        else:
            myrec.yahoo_addr='True'
        if y_postal != postal:
            myrec.yahoo_zip='False'
        else:
            myrec.yahoo_zip='True'
        if y_city != city:
            myrec.yahoo_city='False'
        else:
            myrec.yahoo_city='True'
        if y_quality>=87:
            myrec.yahoo_precision='True'
        else:
            myrec.yahoo_precision='False'
        Session.update(myrec)
        Session.commit()		
        Session.close()

