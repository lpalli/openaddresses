from sqlalchemy import Column, Table, types
from sqlalchemy.orm import mapper

from mapfish.sqlalchemygeom import Geometry
from mapfish.sqlalchemygeom import GeometryTableMixIn

from openaddresses.model.meta import metadata, engine

points_table = Table(
    'points', metadata,
    Column('the_geom', Geometry(4326)),
    autoload=True, autoload_with=engine)

class Point(GeometryTableMixIn):
    # for GeometryTableMixIn to do its job the __table__ property
    # must be set here
    __table__ = points_table

mapper(Point, points_table)
