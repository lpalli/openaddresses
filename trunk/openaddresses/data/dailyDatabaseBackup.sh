#!/bin/bash 
BACKUP_DIR="/home/admin/backup"
PGUSER="postgres"
time=`date '+%d'-'%m'`
/usr/lib/postgresql/8.4/bin/pg_dump -U $PGUSER -p 5432 openaddresses | gzip > $BACKUP_DIR/backup-$time.gz 
/usr/lib/postgresql/8.4/bin/pg_dump -U $PGUSER -p 5432 -t address openaddresses | gzip > $BACKUP_DIR/backup-address_$time.gz
