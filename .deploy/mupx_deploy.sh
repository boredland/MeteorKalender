#!/bin/sh

echo "## this is an echo from the script mupx_deploy.sh with the parameter " $1
npm install -g mupx
mupx deploy --config=.deploy/mupx_production.json
mupx setup --config=.deploy/mupx_test.json
mupx deploy --config=.deploy/mupx_test.json