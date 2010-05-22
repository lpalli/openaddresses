from openaddresses.tests import *

class TestSwissbuildingController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='swissBuilding', action='index'))
        # Test response...
