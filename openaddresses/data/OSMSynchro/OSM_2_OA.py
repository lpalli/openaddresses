import logging,os,tempfile
from ConfigParser import ConfigParser
from OA import OA
from OSM import OSM
from OARecord import OARecord
from OSMDelta_2_AddressRowConverter import OSMDelta_2_AddressRowConverter

class OSM_2_OA:
    """main class to synchronize data from OSM to OA
       does the orchestration"""
    def __init__(self):
        config = ConfigParser()
        config.read("OSM_2_OA.cfg")        
        self.__createLogger()
        pgString="postgres://"
        pgString+="%s:%s" % (config.get("OA","user"),config.get("OA","pwd"))
        pgString+="@%s:%s" % (config.get("OA","dbServer"),config.get("OA","port"))
        pgString+="/%s" % (config.get("OA","database"))
        sqlFile=os.path.join(os.getcwd(),"OSM_2_OA.sql")
        self.oa = OA(pgString,sqlFile)
        self.osm = OSM(config.get("OSM","XAPI"),config.get("OSM","bbox"),config.get("OSM","maxSize"))
    def __createLogger(self):
        logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s | %(name)-13s | %(levelname)-6s | %(message)s',
                    filename=os.path.join(os.getcwd() ,self.__class__.__name__)+".log"
                    )
        console = logging.StreamHandler()
        console.setLevel(logging.INFO)
        # set a format which is simpler for console use
        formatter = logging.Formatter('%(asctime)s | %(name)-13s | %(levelname)-6s | %(message)s')
        # tell the handler to use this format
        console.setFormatter(formatter)
        # add the handler to the root logger
        logging.getLogger('').addHandler(console)
        self.logger=logging.getLogger(self.__class__.__name__)
        self.logger.info("Started")
    def execute(self):
        dateOfLastSynchro=self.oa.getDateOfLastUpdate()
        deltas=self.osm.getDelta(dateOfLastSynchro)
        ##debug
        #deltas=[]
        #for f in os.listdir(tempfile.gettempdir()):
        #    if f.find(".osm")>-1:
        #        deltas.append(os.path.join(tempfile.gettempdir(),f))
        for delta in deltas:
            converter = OSMDelta_2_AddressRowConverter(delta)
            rows=converter.convert()
            self.oa.insert(rows)
        pass
############### when called from outside ###############
osm_2_oa=OSM_2_OA()
osm_2_oa.execute()
