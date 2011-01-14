from sqlalchemy import Column, Table, types
from sqlalchemy.orm import mapper
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()

from openaddresses.model.meta import metadata, engine

class Qmaddresses(Base):
    __tablename__ = 'qm_addresses'
    __table_args__ = {
      'autoload': True,
      'autoload_with': engine
      }
