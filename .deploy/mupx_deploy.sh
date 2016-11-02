#!/bin/sh

echo "## this is an echo from the script mupx_deploy.sh with the parameter " $1
npm install -g mupx
ls -l
ls -l .deploy
if [ $1 == master ];then mupx deploy --config=.deploy/mupx_production.json;fi
if [ $1 == test ];then mupx deploy --config=.deploy/mupx_test.json;fi