#!/bin/bash 
BACKUP_DIR="/home/admin/backup"
PGUSER="postgres"
time=`date '+%d'-'%m'`
/usr/lib/postgresql/8.4/bin/pg_dump -U $PGUSER openaddresses | gzip > $BACKUP_DIR/backup-$time.gz 
