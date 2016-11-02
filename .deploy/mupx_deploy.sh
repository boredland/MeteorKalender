#!/bin/bash
if [ $1 == master ]
then
mupx setup --config=.deploy/mupx_production.json
DEBUG=* mupx deploy --config=.deploy/mupx_production.json
exit $?
fi

if [ $1 == test ]
then
mupx setup --config=.deploy/mupx_test.json
mupx deploy --config=.deploy/mupx_test.json
exit $?
fi