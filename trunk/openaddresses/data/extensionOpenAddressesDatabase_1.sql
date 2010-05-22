#  ****************************************************************
#  Schema Extension 1
#  ****************************************************************
# Goal: add three new attributes
# externalid
# status
# locality

ALTER TABLE address ADD COLUMN externalid character varying(128);
ALTER TABLE address ADD COLUMN status character varying(128);
ALTER TABLE address ADD COLUMN locality character varying(128);

ALTER TABLE address_archive ADD COLUMN externalid character varying(128);
ALTER TABLE address_archive ADD COLUMN status character varying(128);
ALTER TABLE address_archive ADD COLUMN locality character varying(128);

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
    ARCHIVE_TYPE,
    STATUS,
    EXTERNALID,
    LOCALITY
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
         TG_OP,
         OLD.STATUS,
         OLD.EXTERNALID,
         OLD.LOCALITY
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
    ARCHIVE_TYPE,
    STATUS,
    EXTERNALID,
    LOCALITY
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
         TG_OP,
         OLD.STATUS,
         OLD.EXTERNALID,
         OLD.LOCALITY
       );
   RETURN NULL;

  END;

' LANGUAGE 'plpgsql';

GRANT ALL ON FUNCTION update_address() TO "www-data";
GRANT ALL ON FUNCTION delete_address() TO "www-data";

CREATE TRIGGER delete_address
    AFTER DELETE ON address
    FOR EACH ROW
    EXECUTE PROCEDURE delete_address();

CREATE TRIGGER update_address
    AFTER UPDATE ON address
    FOR EACH ROW
    EXECUTE PROCEDURE update_address();