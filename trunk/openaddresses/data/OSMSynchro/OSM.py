from Base import Base
import urllib2
import tempfile
import pyosm
import os
from threading import Thread
import threading,time
class OSM(Base):
    "class to interact with OSM using the XAPI"
    def __init__(self,XAPIurl="",bbox="",maxSize=1):
        Base.__init__(self)
        self.url=XAPIurl
        self.bbox=bbox
        self.maxSize=float(maxSize)
        self.requests=[]
        if len(bbox)>0:
            self.bboxes=self.__getBBoxes()
            for bboxParam in self.bboxes:
                self.requests.append("%s*[addr:housenumber]%s" % (self.url,bboxParam))
        else:
            bboxParam=""
            self.requests.append("%s*[addr:housenumber]%s" % (self.url,bboxParam))
        pass
    """splits the given bbox into smaller ones, according to the given maxSize"""
    def __getBBoxes(self):
        bboxes=[]
        corners=self.bbox.replace("\"","").split(",")
        xMin=float(corners[0])
        yMin=float(corners[1])
        xMax=float(corners[2])
        yMax=float(corners[3])
        xSize=xMax-xMin
        ySize=yMax-yMin
        x=xMin
        while x < xMax:
            prevx=x
            #in central europe there are so many points that we
            #have to subdivide the bboxes 
            if x >= 0 and x < 20 :
                ms = self.maxSize / 10
            else:
                ms = self.maxSize
            x=x+ms
            if x > xMax:
                x=xMax
            y=yMin
            while y < yMax:
                #in central europe there are so many points that we
                #have to subdivide the bboxes 
                if x >= 0 and x < 20 and y >= 40 and y < 60:
                    ms = self.maxSize / 10
                else:
                    ms = self.maxSize
                prevy=y
                y=y+ms
                if y > yMax:
                    y=yMax
                bboxes.append("[bbox=%s,%s,%s,%s]" % (prevx,prevy,x,y))
        #print bboxes
        return bboxes
    """does the actual download, can be called in a separate thread to get parallel
       downloads"""
    def __download(self,req,i):
        self.logger.info("request: %s" % req)
        trial=1
        ok=False
        name=req.split("=")[1].replace(",","_").replace(".0","")[:-1]
        #return
        while (trial < 30 and ok == False):  
            trial+=1
            try:
                response=urllib2.urlopen(req)
                path=self.basepath.split(".")[0]+name+"."+self.basepath.split(".")[1]
                self.logger.info("downloading to temp file %s" % name)
                f = open(path,'wb')
                f.write(response.read())
                f.flush()
                f.close()
                self.paths.append(path)
                ok=True
                #self.logger.info("done %s" % name)
            except:
                self.logger.error("problem with %s. trying again: trial %s of 30" % (name,trial))
            pass
        #self.logger.info("finished download %s after trial number %s" % (name,trial-1))
        pass
    """returns a list of files that have been downloaded containing the OSM data
       of the given bbox, split into several files (maxSize parameter)"""
    def getDelta(self,date):
        self.logger.info("connecting to %s" % self.url)
        #can be called using response.read()
        self.basepath=os.path.join(tempfile.gettempdir(),"temp.osm")
        self.paths=[]
        i=0
        for req in self.requests:
            while threading.active_count()>20:
                #time.sleep(1)
                pass
            t=Thread(target=self.__download,args=(req,i))
            t.start()
            i+=1
        #wait until all downloads are finished
        while threading.active_count()>1:
            pass
        #raise Exception("debug")
        return self.paths
        return None
