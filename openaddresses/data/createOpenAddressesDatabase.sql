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
    DATAORIGIN VARCHAR(128),
    TIME_CREATED timestamp DEFAULT current_timestamp,
    TIME_UPDATED timestamp,
    REFERENCE VARCHAR(32) DEFAULT 'http://www.openaddresses.org',
    CONSTRAINT con_reference CHECK (REFERENCE = 'http://www.openaddresses.org')
);

SELECT AddGeometryColumn('address', 'geom', 4326, 'POINT', 2);

CREATE INDEX idx_address_geom
  ON address
  USING gist
  (geom);

GRANT ALL ON TABLE ADDRESS TO "www-data";

# LOAD SAMPLE DATA

INSERT INTO "address" (geom) VALUES ('0101000020E61000003F8BA548BE721A4089CD6CFC2E424740');
