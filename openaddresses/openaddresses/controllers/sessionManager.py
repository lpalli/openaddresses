# -*- coding: utf-8 -*-
import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from openaddresses.lib.base import BaseController, render

log = logging.getLogger(__name__)

class SessionmanagerController(BaseController):

    def index(self):
        return 'Hello World'

    def checkSession(self):
        if 'authenticated' in session:
            if session['authenticated'] == 'True':
               return 'True'
        return 'False'

    def createSession(self):
        session['authenticated'] = 'True'
        session.save()
        session.persist()      
        return session['authenticated']
