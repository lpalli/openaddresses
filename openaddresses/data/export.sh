#!/bin/sh
pg_dump openaddresses -f openaddresses.sql
gzip openaddresses.sql
