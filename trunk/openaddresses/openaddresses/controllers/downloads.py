# -*- coding: utf-8 -*-
import logging
import uuid
import os
import locale
import zipfile
import mimetypes
import StringIO
import httplib

from datetime import datetime

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.decorators import jsonify
from pylons import config
from pylons.i18n.translation import *

from openaddresses.lib.base import *
from openaddresses.model.addresses import Address
from openaddresses.model.meta import Session

from mapfish.lib.filters import *
from mapfish.lib.protocol import Protocol, create_default_filter
from mapfish.lib.filters.spatial import Spatial

from sqlalchemy.sql import and_

log = logging.getLogger(__name__)

class DownloadsController(BaseController):
    """REST Controller styled on the Atom Publishing Protocol"""
    # To properly map this controller, ensure your config/routing.py
    # file has a resource setup:
    #     map.resource('download', 'downloads')

    def __before__(self):
       self.main_root = config['main_root']
       self.root_path = config['root_path']

    def index(self, format='html'):
        """GET /downloads: All items in the collection"""
        # url('downloads')
        # Create SQL Query

        uniqueId = uuid.uuid1()
        outputCsvFileName = self.main_root + '/trunk/openaddresses/downloads/' + str(uniqueId)

        sqlQuery = "select id,street,postcode,region,city,housenumber,housename,osmid,country,created_by,quality,reference,ST_Y(geom) latitude,ST_X(geom) longitude from address"

        idFilter = None
        cityFilter = None
        filterList = []

        if 'id' in request.params:
           idFilter = "id=" + str(int(request.params['id']))
           filterList.append(idFilter)

        if 'city' in request.params:
           cityFilter = "upper(rtrim(city)) like upper(rtrim('" + request.params['city'] + "'))"
           filterList.append(cityFilter)

        if 'created_by' in request.params:
           created_byFilter = "upper(rtrim(created_by)) like upper(rtrim('" + request.params['created_by'] + "'))"
           filterList.append(created_byFilter)

        if 'country' in request.params:
           countryFilter = "upper(rtrim(country)) like upper(rtrim('" + request.params['country'] + "'))"
           filterList.append(countryFilter)

        # Create spatial filter
        spatialFilter = None
        box = None
        if 'bbox' in request.params:
           box = request.params['bbox']
           box = box.split(',')
           spatialFilter = "geom && ST_SetSRID(ST_Envelope('LINESTRING(" + str(float(box[0])) + " " + str(float(box[1])) + ", " + str(float(box[2])) + " " + str(float(box[3])) + ")'::geometry),4326)";
           filterList.append(spatialFilter)

        if len(filterList) > 0:
           filter = ' and '.join([myfilter for myfilter in filterList])
           sqlQuery = sqlQuery + ' where ' + filter

        sqlCsvQuery = "COPY (" + sqlQuery + ") TO '" + outputCsvFileName.lstrip(os.sep) + '.csv' + "' CSV"
        
        # Create CSV file
        result = Session.execute(sqlCsvQuery)

        # Create zip file
        file = zipfile.ZipFile(outputCsvFileName.lstrip(os.sep) + '.zip', "w", zipfile.ZIP_DEFLATED)
        file.write(outputCsvFileName.lstrip(os.sep) + '.csv', os.path.basename(outputCsvFileName.lstrip(os.sep) + '.csv'))
        file.close()

        # Send zip file to client
        outputFile = open(os.path.join(outputCsvFileName.lstrip(os.sep) + '.zip'), 'r')
        def stream_file():
            chunk = outputFile.read(4096)
            while chunk:
                yield chunk
                chunk = outputFile.read(4096)
            outputFile.close()
        response.headers['Content-Type'] = mimetypes.types_map['.zip']
        response.headers['Content-Disposition'] = 'attachment; filename="' + str(uniqueId) + '.zip"'
        return stream_file()

    def create(self):
        """POST /downloads: Create a new item"""
        # url('downloads')

    def new(self, format='html'):
        """GET /downloads/new: Form to create a new item"""
        # url('new_download')

    def update(self, id):
        """PUT /downloads/id: Update an existing item"""
        # Forms posted to this method should contain a hidden field:
        #    <input type="hidden" name="_method" value="PUT" />
        # Or using helpers:
        #    h.form(url('download', id=ID),
        #           method='put')
        # url('download', id=ID)

    def delete(self, id):
        """DELETE /downloads/id: Delete an existing item"""
        # Forms posted to this method should contain a hidden field:
        #    <input type="hidden" name="_method" value="DELETE" />
        # Or using helpers:
        #    h.form(url('download', id=ID),
        #           method='delete')
        # url('download', id=ID)

    def show(self, id, format='html'):
        """GET /downloads/id: Show a specific item"""
        # url('download', id=ID)

    def edit(self, id, format='html'):
        """GET /downloads/id/edit: Form to edit an existing item"""
        # url('edit_download', id=ID)
