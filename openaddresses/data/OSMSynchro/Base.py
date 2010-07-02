import logging

class Base():
    """Base Class for all the OSM_2_OA class that have to be instanciated
    Takes care of the Logging"""
    def __init__(self):
        self.logger=logging.getLogger(self.__class__.__name__)
        self.logger.info("Object created")