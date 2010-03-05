DEPLOYMENT
==========

Start in this directory:

   python deploy.py config/myConfig.cfg

INSTALLATION
============

Install virtual environment with MapFish according to www.mapfish.org

Checkout code from SVN

   svn co TODO

Create database according to data/createOpenAddressesDatabase.sql

Create configuration file in config/

Configure Apache to include apache/wsgi.conf

Complete /usr/local/proj/epsg file with

   <900913> +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs

Deploy the projet (see DEPLOYMENT section)

