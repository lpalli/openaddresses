import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

import smtplib
from email.MIMEMultipart import MIMEMultipart
from email.MIMEBase import MIMEBase
from email.MIMEText import MIMEText
from email import Encoders

from simplejson import dumps

from openaddresses.lib.base import BaseController, render

import os
import shutil

log = logging.getLogger(__name__)

class UploadsController(BaseController):
    """REST Controller styled on the Atom Publishing Protocol"""
    # To properly map this controller, ensure your config/routing.py
    # file has a resource setup:
    #     map.resource('upload', 'uploads')

    def index(self, format='html'):
        """GET /uploads: All items in the collection"""
        # url('uploads')
        return os.getcwd()

    def create(self):
        """POST /uploads: Create a new item"""
        archive = request.POST['uploaded_file']
        email = request.POST['email']
        permanent_file = open(archive.filename.lstrip(os.sep),'w')
        shutil.copyfileobj(archive.file, permanent_file)
        archive.file.close()
        permanent_file.close()
        self.mail(email,"OpenAddresses.org upload confirmation","The file " + permanent_file.name + " has been uploaded. Thanks ! The OpenAddresses.org team.")
        self.mail("info@openaddresses.org","OpenAddresses.org new file uploaded !","The file " + permanent_file.name + " has been uploaded by " + email)
        return dumps({"success": True})        

    def new(self, format='html'):
        """GET /uploads/new: Form to create a new item"""
        # url('new_upload')

    def update(self, id):
        """PUT /uploads/id: Update an existing item"""
        # Forms posted to this method should contain a hidden field:
        #    <input type="hidden" name="_method" value="PUT" />
        # Or using helpers:
        #    h.form(url('upload', id=ID),
        #           method='put')
        # url('upload', id=ID)

    def delete(self, id):
        """DELETE /uploads/id: Delete an existing item"""
        # Forms posted to this method should contain a hidden field:
        #    <input type="hidden" name="_method" value="DELETE" />
        # Or using helpers:
        #    h.form(url('upload', id=ID),
        #           method='delete')
        # url('upload', id=ID)

    def show(self, id, format='html'):
        """GET /uploads/id: Show a specific item"""
        # url('upload', id=ID)

    def edit(self, id, format='html'):
        """GET /uploads/id/edit: Form to edit an existing item"""
        # url('edit_upload', id=ID)

    def mail(self, to, subject, text):
        # http://kutuma.blogspot.com/2007/08/sending-emails-via-gmail-with-python.html
        msg = MIMEMultipart()

        msg['From'] = 'cedric.moullet@gmail.com'
        msg['To'] = to
        msg['Subject'] = subject

        msg.attach(MIMEText(text))

        mailServer = smtplib.SMTP("smtp.gmail.com", 587)
        mailServer.ehlo()
        mailServer.starttls()
        mailServer.ehlo()
        mailServer.login('cedric.moullet@openaddresses.org', 'XXX NOT CRAZY')
        mailServer.sendmail('cedric.moullet@openaddresses.org', to, msg.as_string())
        mailServer.close()

