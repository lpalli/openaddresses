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
          authenticated = session.get('authenticated')
          if authenticated:
             if authenticated == 'True':
                return 'True'
             else:
                return 'False'
          else:
             return 'False'
       else:
          return 'False'

    def createSession(self):
        session['authenticated'] = 'True'
        session.save()

    def killSession(self):
        session['authenticated'] = 'False'
        session.save()
