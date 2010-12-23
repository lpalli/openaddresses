# -*- coding: utf-8 -*-
"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from pylons import config
from routes import Mapper

def make_map():
    """Create, configure and return the routes Mapper"""
    map = Mapper(directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'])

    # The ErrorController route (handles 404/500 error pages); it should
    # likely stay at the top, ensuring it can always be resolved
    map.connect('error/:action/:id', controller='error')

    # CUSTOM ROUTES HERE

    map.resource("address", "addresses")
    map.resource("hello", "hello")
    map.resource("Qaoa", "qa")
    map.resource("Qmaddresses", "qm")
    map.resource("upload", "uploads")
    
    map.connect('', controller='home', action='index')
    map.connect('mobile/', controller='home', action='mobile')
    map.connect('geolocation/', controller='home', action='geolocation')
    map.connect('impressum/', controller='home', action='impressum')
    map.connect(':controller/:action/:id')

    return map