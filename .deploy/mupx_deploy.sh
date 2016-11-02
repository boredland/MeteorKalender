#!/bin/sh

echo "## this is an echo from the script mupx_deploy.sh with the parameter " $1
npm install -g mupx
#mupx --config=mupx-production.json setup
pwd
mupx deploy --config=.deploy/mupx_production.json