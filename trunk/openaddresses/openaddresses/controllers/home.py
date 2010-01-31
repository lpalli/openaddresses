import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from pylons import config

from openaddresses.lib.base import *
from pylons.i18n.translation import *

log = logging.getLogger(__name__)

class HomeController(BaseController):

    def index(self):
        if 'mode' in request.params:
            c.debug = (request.params['mode'].lower() == 'debug')
        else:
            c.debug = config['debug']
            
        # Return a rendered template
        return render('/index.mako')
