from Base import Base
class OARecord():
    "class to hold information for 1 OA record to be inserted"
    def __init__(self):
        self.housenum=""
        self.street=""
        self.city=""
        self.locality=""
        self.country=""
        self.osmid=""
        #self.lon=""
        #self.lat=""
        self.wkt=""
        pass
    def attrs(self):
        vec={}
        vec["housenum"]=self.housenum
        vec["street"]=self.street
        vec["city"]=self.city
        vec["locality"]=self.locality
        vec["country"]=self.country
        vec["osmid"]=self.osmid
        #vec["lon"]=self.lon
        #vec["lat"]=self.lat
        vec["wkt"]=self.wkt
        return vec
