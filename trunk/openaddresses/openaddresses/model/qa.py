from sqlalchemy import Column, Table, types
from sqlalchemy.orm import mapper
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()

from openaddresses.model.meta import metadata, engine

class Qaoa(Base):
    __tablename__ = 'qaoa'
    __table_args__ = {
      'autoload': True,
      'autoload_with': engine
      }
