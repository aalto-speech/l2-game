#!/bin/sh
echo "Pulling new version at `date`" > last_deploy.txt
git pull
touch uwsgi.ini
