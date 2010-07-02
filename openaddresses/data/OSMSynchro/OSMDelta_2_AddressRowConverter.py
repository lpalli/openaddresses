from Base import Base
import pyosm
from OARecord import OARecord
import os
from shapely.geometry import *
class OSMDelta_2_AddressRowConverter(Base):
    """ class that converts nodes, ways and relations loaded from OSM
        to OpenAddress Records"""
    def __init__(self,delta):
        Base.__init__(self)
        self.delta=delta
        self.rows=[]
        pass
    def convert(self):
        self.logger.info("Converting %s" % self.delta) 
        osm=pyosm.OSMXMLFile(self.delta)
        for node in osm.nodes.values():
            rec = OARecord()
            rec.osmid=node.id
            try:
                pt = asPoint([float(node.lon), float(node.lat)])
                rec.wkt=pt.wkt
            except:
                continue
            hasTag=False
            if len(node.tags)>0:
                continue
            if "addr:housenumber" in node.tags:
                rec.housenum=node.tags["addr:housenumber"].encode('utf-8','ignore')
                hasTag=True
            if "addr:street" in node.tags:
                try:
                    rec.street=node.tags["addr:street"].encode('utf-8','ignore')
                    hasTag=True
                except:
                    print node.tags
                    self.logger.error("error")
                    raise Exception("ERROR GETTING STREETNAME")
            if "addr:city" in node.tags:
                rec.city=node.tags["addr:city"].encode('utf-8','ignore')
                hasTag=True
            if "addr:country" in node.tags:
                rec.country=node.tags["addr:country"].encode('utf-8','ignore')
                hasTag=True
            if hasTag:
                self.rows.append(rec)
        for way in osm.ways.values():
            rec = OARecord()
            rec.osmid=way.id
#            rec.lon=way.lon
#            rec.lat=way.lat
            ##use shapely to create polygon and get centroid
            coords=[]
            for node in way.nodes:
                coord=[]
                try:
                    coord.append(float(node.lon))
                    coord.append(float(node.lat))
                    coords.append(coord)
                except:
                    continue
            if len(coords)>3:
                pg = asPolygon(coords)
                pt = pg.centroid
            elif len(coords)>1:
                pl = asLineString(coords)
                pt = pl.centroid
            elif len (coords)==1:
                pt=asPoint(coords)
            else:
                continue
            rec.wkt=pt.wkt
            hasTag=False
           
            if "addr:housenumber" in way.tags:
                rec.housenum=way.tags["addr:housenumber"].encode('UTF-8','ignore')
                hasTag=True
            if "addr:street" in way.tags:
                try:
                    rec.street=way.tags["addr:street"].encode('utf-8','ignore')
                    hasTag=True
                except:
                    print way.tags
                    self.logger.error("error")
                    raise Exception("ERROR GETTING STREETNAME")
            if "addr:city" in way.tags:
                rec.city=way.tags["addr:city"].encode('UTF-8','ignore')
                hasTag=True
            if "addr:country" in way.tags:
                rec.country=way.tags["addr:country"].encode('UTF-8','ignore')
                hasTag=True
            if hasTag:
                self.rows.append(rec)
        #TODO
        os.remove(self.delta)
        return self.rows
