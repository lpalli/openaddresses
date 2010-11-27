#  ****************************************************************
#  Create database c2cpc84
#  ****************************************************************
sudo su postgres
/usr/lib/postgresql/8.4/bin/psql -p 5433
/usr/lib/postgresql/8.4/bin/psql -p 5433 -d openaddresses

/usr/lib/postgresql/8.4/bin/createdb -p 5433 openaddresses
/usr/lib/postgresql/8.4/bin/createlang plpgsql -p 5433 openaddresses
/usr/lib/postgresql/8.4/bin/psql -d openaddresses -p 5433 -f /usr/share/postgresql/8.4/contrib/postgis-1.5/postgis.sql
/usr/lib/postgresql/8.4/bin/psql -d openaddresses -p 5433 -f /usr/share/postgresql/8.4/contrib/postgis-1.5/spatial_ref_sys.sql

#  ****************************************************************
#  Create database geolin01
#  ****************************************************************
CREATE DATABASE openaddresses TEMPLATE=template_gis;

\q
sudo su postgres
/usr/lib/postgresql/8.4/bin/createuser -p 5433 -U postgres -P "www-data"
createuser -U postgres -P "www-data"

#  ****************************************************************
#  Create Schema
#  ****************************************************************

CREATE TABLE ADDRESS (
    ID SERIAL PRIMARY KEY,
    OSMID VARCHAR(128),
    HOUSENUMBER VARCHAR(8),
    HOUSENAME VARCHAR(64),
    STREET VARCHAR(128),
    POSTCODE VARCHAR(8),
    REGION VARCHAR(128),
    CITY VARCHAR(128),
    COUNTRY VARCHAR(2),
    CREATED_BY VARCHAR(128),
    IPADDRESS VARCHAR(64),
    TIME_CREATED timestamp DEFAULT current_timestamp,
    TIME_UPDATED timestamp,
    QUALITY VARCHAR(128),
    REFERENCE VARCHAR(32) DEFAULT 'http://www.openaddresses.org',
    CONSTRAINT con_reference CHECK (REFERENCE = 'http://www.openaddresses.org')
);

SELECT AddGeometryColumn('address', 'geom', 4326, 'POINT', 2);

CREATE INDEX idx_address_geom
  ON address
  USING gist
  (geom);

GRANT ALL ON TABLE ADDRESS TO "www-data";
GRANT ALL ON TABLE geography_columns TO "www-data";
GRANT ALL ON TABLE geometry_columns TO "www-data";
GRANT ALL ON TABLE spatial_ref_sys  TO "www-data";

GRANT ALL ON SEQUENCE address_id_seq TO "www-data";

DROP TABLE ADDRESS_ARCHIVE cascade;

CREATE TABLE ADDRESS_ARCHIVE (
    ID INTEGER,
    OSMID VARCHAR(128),
    HOUSENUMBER VARCHAR(8),
    HOUSENAME VARCHAR(64),
    STREET VARCHAR(128),
    POSTCODE VARCHAR(8),
    REGION VARCHAR(128),
    CITY VARCHAR(128),
    COUNTRY VARCHAR(2),
    CREATED_BY VARCHAR(128),
    IPADDRESS VARCHAR(64),
    TIME_CREATED timestamp,
    TIME_UPDATED timestamp,
    QUALITY VARCHAR(128),
    REFERENCE VARCHAR(32),
    ARCHIVE_DATE timestamp,
    ARCHIVE_TYPE VARCHAR(64)
);

SELECT AddGeometryColumn('address_archive', 'geom', 4326, 'POINT', 2);

GRANT ALL ON TABLE ADDRESS_ARCHIVE TO "www-data";

DROP FUNCTION update_address() cascade;

CREATE FUNCTION update_address() RETURNS OPAQUE AS '
  BEGIN
     INSERT INTO ADDRESS_ARCHIVE
	(ID,
    OSMID,
    HOUSENUMBER,
    HOUSENAME,
    STREET,
    POSTCODE,
    REGION,
    CITY,
    COUNTRY,
    CREATED_BY,
    IPADDRESS,
    TIME_CREATED,
    TIME_UPDATED,
    QUALITY,
    REFERENCE,
    GEOM,
    ARCHIVE_DATE,
    ARCHIVE_TYPE
	)
        VALUES
       (
         OLD.ID,
         OLD.OSMID,
         OLD.HOUSENUMBER,
         OLD.HOUSENAME,
         OLD.STREET,
         OLD.POSTCODE,
         OLD.REGION,
         OLD.CITY,
         OLD.COUNTRY,
         OLD.CREATED_BY,
         OLD.IPADDRESS,
         OLD.TIME_CREATED,
         OLD.TIME_UPDATED,
         OLD.QUALITY,
         OLD.REFERENCE,
         OLD.GEOM,
         NOW(),
         TG_OP
       );
   RETURN NULL;

  END;

' LANGUAGE 'plpgsql';

DROP FUNCTION delete_address() cascade;

CREATE FUNCTION delete_address() RETURNS OPAQUE AS '
  BEGIN
     INSERT INTO ADDRESS_ARCHIVE
	(ID,
    OSMID,
    HOUSENUMBER,
    HOUSENAME,
    STREET,
    POSTCODE,
    REGION,
    CITY,
    COUNTRY,
    CREATED_BY,
    IPADDRESS,
    TIME_CREATED,
    TIME_UPDATED,
    QUALITY,
    REFERENCE,
    GEOM,
    ARCHIVE_DATE,
    ARCHIVE_TYPE
	)
        VALUES
       (
         OLD.ID,
         OLD.OSMID,
         OLD.HOUSENUMBER,
         OLD.HOUSENAME,
         OLD.STREET,
         OLD.POSTCODE,
         OLD.REGION,
         OLD.CITY,
         OLD.COUNTRY,
         OLD.CREATED_BY,
         OLD.IPADDRESS,
         OLD.TIME_CREATED,
         OLD.TIME_UPDATED,
         OLD.QUALITY,
         OLD.REFERENCE,
         OLD.GEOM,
         NOW(),
         TG_OP
       );
   RETURN NULL;

  END;

' LANGUAGE 'plpgsql';

GRANT ALL ON FUNCTION update_address() TO "www-data";
GRANT ALL ON FUNCTION delete_address() TO "www-data";


DROP TRIGGER delete_address on address cascade;

CREATE TRIGGER delete_address
    AFTER DELETE ON address
    FOR EACH ROW
    EXECUTE PROCEDURE delete_address();

DROP TRIGGER update_address on address cascade;

CREATE TRIGGER update_address
    AFTER UPDATE ON address
    FOR EACH ROW
    EXECUTE PROCEDURE update_address();

#  ****************************************************************
#  Add Full text search
#  ****************************************************************
#  http://code18.blogspot.com/2009/06/full-text-search-postgresql.html

ALTER TABLE address ADD COLUMN tsvector_street tsvector;

UPDATE address
SET tsvector_street = to_tsvector('english', coalesce(street,'')); 

CREATE INDEX tsvector_street_idx ON address USING gin(tsvector_street);

CREATE INDEX tsvector_street_idx1 ON address USING gin(to_tsvector('english', coalesce(street,'')));

explain SELECT distinct street
FROM address
WHERE geom && 'BOX(6.61879551 46.51187241, 6.62879551 46.52187241)'::box2d
  AND
ST_Distance(geom, ST_GeomFromText('POINT(6.62379551 46.51687241)', 4326)) < 0.005
  AND 
tsvector_street @@ to_tsquery('chem:* & d:* & f:*')
  limit 15;
 
ALTER TABLE address ADD COLUMN tsvector_street_housenumber_city tsvector; 
 
UPDATE address
SET tsvector_street_housenumber_city = to_tsvector('english', coalesce(street,'') || ' ' || coalesce(housenumber,'') || ' ' || coalesce(city,'')); 

CREATE INDEX tsvector_street_housenumber_city_idx ON address USING gin(tsvector_street_housenumber_city);

CREATE INDEX tsvector_street_housenumber_city_idx1 ON address USING gin(to_tsvector('english', coalesce(street,'') || ' ' || coalesce(housenumber,'') || ' ' || coalesce(city,''))); 

explain SELECT street, city, housenumber FROM address WHERE tsvector_street_housenumber_city @@ to_tsquery('english', 'chem:* & du:* & lau:* & 28') LIMIT 5;

explain SELECT street, city, housenumber FROM address WHERE to_tsvector('english', coalesce(street,'') || ' ' || coalesce(housenumber,'') || ' ' || coalesce(city,'')) @@ to_tsquery('chem:* & du:* & lau:* & 28') LIMIT 5;

CREATE TRIGGER tsvector_street_update BEFORE INSERT OR UPDATE
ON address FOR EACH ROW EXECUTE PROCEDURE
tsvector_update_trigger(tsvector_street, 'pg_catalog.english', street);

CREATE TRIGGER tsvector_street_housenumber_city_update BEFORE INSERT OR UPDATE
ON address FOR EACH ROW EXECUTE PROCEDURE
tsvector_update_trigger(tsvector_street_housenumber_city, 'pg_catalog.english', street, city, housenumber);

create index address_postcode on address USING btree(postcode);
create index address_created_by on address USING btree(created_by);
create index address_country on address USING btree(country);
create index address_city on address USING btree(city);
create index address_house_number on address USING btree(housenumber);
create index address_time_created on address(date(time_created));
create index address_time_updated on address(date(time_updated));
create index address_time_created_1 on address(extract(year from time_created)); 
create index address_time_created_2 on address(extract(week from time_created));
create index address_time_created_3 on address(extract(day from time_created));

create index address_archive_archive_type on address_archive(archive_type);

#  ****************************************************************
#  Add QA support
#  ****************************************************************

CREATE SEQUENCE qaOA_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;

ALTER SEQUENCE qaOA_seq OWNER TO postgres;

CREATE TABLE qaOA
(
  id bigint,
  bing_dist double precision,
  bing_addr boolean,
  bing_zip boolean,
  bing_city boolean,
  google_dist double precision,
  google_addr boolean,
  google_zip boolean,
  google_city boolean,
  yahoo_dist double precision,
  yahoo_addr boolean,
  yahoo_zip boolean,
  yahoo_city boolean,
  bing_precision boolean,
  google_precision boolean,
  yahoo_precision boolean,
  type character(10),
  date character(20),
  CONSTRAINT pk_qaoa PRIMARY KEY (id)
)
WITH (OIDS=FALSE);

ALTER TABLE qaOA OWNER TO postgres;

CREATE OR REPLACE FUNCTION hj_add_qaOA()
RETURNS trigger AS
$BODY$
  BEGIN
     INSERT INTO qaoa
       (id)
        VALUES
       (
         NEW.id
       );
   RETURN NULL;
  END;
$BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;

ALTER FUNCTION hj_add_qaOA() OWNER TO postgres;

CREATE TRIGGER f_add_qaOA
  AFTER INSERT
  ON address
  FOR EACH ROW
  EXECUTE PROCEDURE hj_add_qaOA();

GRANT ALL ON TABLE qaoa TO "www-data";
GRANT ALL ON TABLE qaoa TO postgres;
GRANT ALL ON FUNCTION hj_add_qaoa() TO "www-data";
GRANT ALL ON TABLE qaoa_seq TO "www-data";

#  ****************************************************************
#  Import data
#  ****************************************************************

INSERT INTO address (
   housenumber,
   housename,
   street,
   postcode,
   city,
   country,
   created_by,
   ipaddress,
   time_created,
   reference,
   quality,
   osmid,
   geom) (SELECT
      housenum,
      housename,
      street,
      postcode,
      city,
      country,
      created_by,
      ipaddress,
      time_creat,
      'http://www.openaddresses.org',
      'Digitized',
      osmid,
      ST_SetSRID(ST_GeometryN(geom,1),4326)
   FROM "OpenAddresses" where created_by = 'OSM');

INSERT INTO address (
   housenumber,
   housename,
   street,
   postcode,
   city,
   country,
   created_by,
   ipaddress,
   time_created,
   reference,
   quality,
   osmid,
   geom) (SELECT
      housenum,
      housename,
      street,
      postcode,
      city,
      country,
      created_by,
      ipaddress,
      time_creat,
      'http://www.openaddresses.org',
      'Donated',
      osmid,
      ST_SetSRID(ST_GeometryN(geom,1),4326)
   FROM "OpenAddresses" where created_by in ('pr_rueba','pr_Kogler','Stadt Villach'));

update address set quality='Donated' where created_by in ('Stadt Villach');
update address set quality='GPS' where created_by in ('pr_rueba','pr_Kogler');

select count(1) FROM "OpenAddresses" where created_by not in ('pr_rueba','pr_Kogler','Stadt Villach', 'SO!GIS', 'zugis', 'OSM', 'Morges' and osmid is null;

select created_by, count(1) counter FROM "OpenAddresses" where created_by not in ('pr_rueba','pr_Kogler','Stadt Villach', 'SO!GIS', 'zugis', 'OSM', 'Morges') and osmid is null
group by created_by
order by counter desc;

INSERT INTO address (
   housenumber,
   housename,
   street,
   postcode,
   city,
   country,
   created_by,
   ipaddress,
   time_created,
   reference,
   quality,
   osmid,
   geom) (SELECT
      housenum,
      housename,
      street,
      postcode,
      city,
      country,
      created_by,
      ipaddress,
      time_creat,
      'http://www.openaddresses.org',
      'Donated',
      osmid,
      ST_SetSRID(ST_GeometryN(geom,1),4326)
   FROM "OpenAddresses" where created_by not in ('pr_rueba','pr_Kogler','Stadt Villach', 'SO!GIS', 'zugis', 'OSM', 'Morges') and osmid is null);

select count(1) counter FROM "OpenAddresses" where created_by not in ('pr_rueba','pr_Kogler','Stadt Villach', 'SO!GIS', 'zugis', 'OSM', 'Morges') and osmid is null;

#  ****************************************************************
#  IMPORT PROCEDURE FROM CSV FILE
#  ****************************************************************
# On Windows: convert to UTF-8:
# C:\Sandbox\openadresses\trunk\openaddresses\data>"C:\Program Files\GnuWin32\bin\iconv.exe" -f windows-1252 -t UTF-8 oa_ch.csv > oa_ch_utf8.csv

drop table importtmp cascade;

create table importtmp (attr1 VARCHAR(255),
attr2 VARCHAR(255),
attr3 VARCHAR(255),
attr4 VARCHAR(255),
attr5 VARCHAR(255),
attr6 VARCHAR(255),
attr7 VARCHAR(255),
attr8 VARCHAR(255),
attr9 VARCHAR(255),
attr10 VARCHAR(255),
attr11 VARCHAR(255),
attr12 VARCHAR(255));

COPY importtmp FROM '/home/admin/openaddresses/trunk/openaddresses/data/oa_ch_utf8.csv' WITH DELIMITER ';' CSV HEADER;

street;housenr;housename;postalcode;city;username;origin;8long;lat;date;quality;country

INSERT INTO address (
   street,
   housenumber,
   housename,
   postcode,
   city,
   created_by,
   time_created,
   quality,
   country,
   geom) (select attr1 street,
   attr2 housenumber,
   attr3 housename,
   attr4 postcode,
   attr5 city,
   attr6 created_by,
   to_timestamp(attr10,'YYYYMMDD') time_created,
   CASE WHEN attr11='GPS' THEN 'GPS'
              WHEN attr11='donated' THEN 'Donated'
              ELSE 'Donated' END quality,
   CASE WHEN attr12='Switzerland' THEN 'CH' ELSE 'CH' END country,
   GeomFromEWKT('SRID=4326;POINT(' || attr8 || ' ' || attr9 || ')') geom
from importtmp);

delete from address where country = '<\x1A';
delete from address where country = 'R\x1A';
delete from address where country = '69';
delete from address where country = '23';
delete from address where country = '+4';
delete from address where country = '36';


select count(1) from address where city ilike '%\x1A%';
update address set city = replace(city,'\x1A','') where city ilike '%\x1A%';
select count(1) from address where postcode ilike '%\x1A%';
update address set postcode = replace(postcode,'\x1A','') where postcode ilike '%\x1A%';
select count(1) from address where housename ilike '%\x1A%';
update address set housename = replace(housename,'\x1A','') where housename ilike '%\x1A%';
select count(1) from address where housenumber ilike '%\x1A%';
update address set housenumber = replace(housenumber,'\x1A','') where housenumber ilike '%\x1A%';
select count(1) from address where street ilike '%\x1A%';
update address set street = replace(street,'\x1A','') where street ilike '%\x1A%';

# FOR THE RECORD, but no migration has been done
# Migrate from 8.3 to 8.4:
# /usr/lib/postgresql/8.4/bin/pg_dump -C -f openaddresses.backup -p 5432 openaddresses
# /usr/lib/postgresql/8.4/bin/pg_restore -C -f openaddresses.backup -p 5433
# /usr/lib/postgresql/8.4/bin/psql -d openaddresses -p 5433


#  ****************************************************************
#  DATA CHECK
#  ****************************************************************

select count(1) from address where country is null;

select country.iso2, country.name_iso, address.street from country, address where
ST_Contains(country.the_geom, address.geom) = 't' limit 1;

update address set country = (select country.iso2 from country where
ST_Contains(country.the_geom, address.geom) = 't') where country is null;

# Switzerland specific

update address set country = 'CH' where id in (
select address.id from country, address where country.the_geom && address.geom and country.name_iso = 'SWITZERLAND' and address.country not like 'CH');

select count(1) from country, address where country.the_geom && address.geom and country.name_iso = 'SWITZERLAND' and address.country not like 'CH';

select count(1) from country, address where country.the_geom && address.geom and country.name_iso = 'SWITZERLAND';

select time_created::date, count(1) from address where country = 'CH' group by time_created::date order by time_created::date desc;

select time_created::date, count(1) from address group by time_created::date order by time_created::date desc;

BEGIN;
CREATE TEMP TABLE creationstat AS select time_created::date, count(1) from address group by time_created::date order by time_created::date desc;
COPY creationstat TO '/home/admin/openaddresses/trunk/openaddresses/uploads/creationstat.csv' WITH DELIMITER ',';
ROLLBACK;

#  ****************************************************************
#  STATISTICS
#  ****************************************************************

select created_by, count(1) counter from  address where time_created::date = now()::date group by created_by order by counter desc;

select created_by, count(1) counter from  address where time_updated::date = now()::date group by created_by order by counter desc;

select count(1) counter from  address where extract(week from time_created) = extract(week from now()) and extract(year from time_created) = extract (year from now());

select distinct created_by from  address where extract(week from time_created) = extract(week from now()) and extract(year from time_created) = extract (year from now());







