# -*- coding: utf-8 -*-
import logging
import time

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to

from pylons import config

from openaddresses.lib.base import *
from pylons.i18n.translation import *

log = logging.getLogger(__name__)

class HomeController(BaseController):

    available_languages = []

    current_lang = ''

    deactivate_cache = True

    def getAvailableLanguages(self):
        if not self.available_languages:
            self.available_languages = config['available_languages'].split(',')
        return self.available_languages

    def _isLangAvailable(self, lang):
        return lang in self.getAvailableLanguages()

    def __before__(self):

        update_session = True
        lang = None
        self.charset = 'utf-8'

        self.root_path = config['root_path']
        self.mobile_search_url = config['mobile_search_url']
        self.versionTime = config['versionTime']

        if 'lang' in request.params and self._isLangAvailable(request.params['lang']):
            lang = request.params['lang']
        elif 'lang' in session:
            lang = session['lang']
            update_session = False
        else:
            # get from user agent
            for language in request.languages:
                language = language[0:2]
                if self._isLangAvailable(language):
                    lang = unicode(language)
                    break
        if lang is None:
            lang = unicode(config['lang'])

        if 'charset' in request.params:
           self.charset = request.params['charset']

        set_lang(lang)
        if update_session:
            session['lang'] = lang
            session.save()

    def index(self):
        lang = str(get_lang())
        c.lang = self.current_lang = lang[3:5]
        c.charset = self.charset
        c.versionTime = self.versionTime
        c.root_path = self.root_path

        c.available_languages = self.getAvailableLanguages()

        if 'mode' in request.params:
            c.debug = (request.params['mode'].lower() == 'debug')
        else:
            c.debug = config['debug']
            
        # Return a rendered template
        return render('/index.mako')

    def impressum(self):
        lang = str(get_lang())
        c.lang = self.current_lang = lang[3:5]
        c.charset = self.charset
        c.versionTime = time.time()

        c.available_languages = self.getAvailableLanguages()

        if 'mode' in request.params:
            c.debug = (request.params['mode'].lower() == 'debug')
        else:
            c.debug = config['debug']

        # Return a rendered template
        return render('/impressum.mako')

    def mobile(self):
        c.root_path = self.root_path
        c.mobile_search_url = self.mobile_search_url
        if 'mode' in request.params:
            c.debug = (request.params['mode'].lower() == 'debug')
        else:
            c.debug = config['debug']
        if not c.debug:
            # cache for 8 hours
            del response.headers["Pragma"]
            response.headers["Cache-Control"] = "public"
            return render('/mobile.mako',
                          cache_key=c.lang, cache_type='memory', cache_expire=28800)
        else:
            return render('/mobile.mako')
