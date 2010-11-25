from sqlalchemy import Column, Table, types
from sqlalchemy.orm import mapper

from mapfish.sqlalchemygeom import Geometry
from mapfish.sqlalchemygeom import GeometryTableMixIn

from openaddresses.model.meta import metadata, engine

qaoa_table = Table(
    'qaoa', metadata,
    Column('geom', Geometry(4326)),
    autoload=True, autoload_with=engine)

class Qaoa(GeometryTableMixIn):
    # for GeometryTableMixIn to do its job the __table__ property
    # must be set here
    __table__ = qaoa_table

    def format(self):
        #return {'google_dist': self.google_dist,'google_zip': self.google_zip,'google_addr': self.google_addr, 'google_city': self.google_city}
        #return {'google_dist': self.google_dist,'google_zip': self.google_zip,'google_addr': self.google_addr, 'google_city': self.google_city, 'id': self.id, 'oid': self.oid}
        return {'id': self.id,'type': self.type,'date': self.date}

mapper(Qaoa, qaoa_table)
