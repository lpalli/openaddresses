from Base import Base
import os,sys
class OA(Base):
    """class to interact with the OpenAddress Database
       generates SQL File for the insert statements of all the OA objects"""
    def __init__(self,pgString="",f=""):
        Base.__init__(self)
        self.pgString=pgString
        if os.path.exists(f):
            os.remove(f)
        self.f=open(f,'w')
        self.osmids={}
        #self.__connect()
        #self.logger.info("creating new file")
        pass
    """connect to the DB. Probably not needed as we generate an SQL file"""
    def __connect(self):
        self.logger.info("connecting to %s" % self.pgString)
        try:
            pass
        except:
            raise Exception("no connection")
        #TODO
        pass
    """function that gets the last date of update for incremental load using changesets"""
    def getDateOfLastUpdate(self):
        #TODO
        pass
    """method to insert a whole collection of rows"""
    def insert(self,rows=[]):
        for row in rows:
            self.__insert(row)
    """internal method to insert one row"""
    def __insert(self,row):
        #self.logger.info(row.attrs())
        #TODO
        attrs=row.attrs()
        ## !! THIS BECOMES TOO MEMORY INTENSE !! NOT SURE
        if attrs["osmid"] in self.osmids:
            self.logger.warn("dup: %s" % str(attrs["osmid"]))
            return
        else:
            self.osmids[attrs["osmid"]]=attrs
        for key in attrs:
            if isinstance(attrs[key],str):
                attrs[key]=attrs[key].replace("'","\\'")
        #print attrs.values()
        try:
            self.f.write("""insert into address(city,housenum,osmid,locality,country,street,geom) 
            values('%s','%s',%s,'%s','%s','%s',ST_GeomFromText('%s',4326));\n""" % tuple(attrs.values()))
            self.f.flush()
        except:
            print attrs
            raise Exception("error printing")
        pass
