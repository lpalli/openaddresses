import site
import os, sys

site.addsitedir('/srv/www/htdocs/oa_os/openaddresses/env/lib/python2.5/site-packages')

sys.path.append('/srv/www/htdocs/oa_os/openaddresses/trunk/openaddresses')
os.environ['PYTHON_EGG_CACHE'] = '/tmp/python-eggs'

# configure the loggin system
from paste.script.util.logging_config import fileConfig
fileConfig('/srv/www/htdocs/oa_os/openaddresses/trunk/openaddresses/development.ini')

from paste.deploy import loadapp
application = loadapp('config:/srv/www/htdocs/oa_os/openaddresses/trunk/openaddresses/development.ini')

