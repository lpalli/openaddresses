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

GRANT ALL ON SEQUENCE address_id_seq TO "www-data";

-- LOAD SAMPLE DATA

INSERT INTO "address" (geom) VALUES ('0101000020E61000003F8BA548BE721A4089CD6CFC2E424740');

-- Import data

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
   FROM "OpenAddresses");

-- Full text search
-- http://code18.blogspot.com/2009/06/full-text-search-postgresql.html

ALTER TABLE address ADD COLUMN tsvector_street tsvector;

UPDATE address
SET tsvector_street = to_tsvector('english', coalesce(street,'')); 

CREATE INDEX tsvector_street_idx ON address
USING gin(tsvector_street); 

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

CREATE INDEX tsvector_street_housenumber_city_idx ON address
USING gin(tsvector_street_housenumber_city); 

explain SELECT street, city, housenumber
FROM address
WHERE tsvector_street_housenumber_city @@ to_tsquery('chem:* & du:* & lau:* & 28:*') LIMIT 5;

CREATE TRIGGER tsvector_street_update BEFORE INSERT OR UPDATE
ON address FOR EACH ROW EXECUTE PROCEDURE
tsvector_update_trigger(tsvector_street, 'pg_catalog.english', street);

CREATE TRIGGER tsvector_street_housenumber_city_update BEFORE INSERT OR UPDATE
ON address FOR EACH ROW EXECUTE PROCEDURE
tsvector_update_trigger(tsvector_street_housenumber_city, 'pg_catalog.english', street, city, housenumber);


