from openaddresses.tests import *

class TestSessionmanagerController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='sessionManager', action='index'))
        # Test response...
