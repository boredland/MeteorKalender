#!/bin/bash
if [ $1 == master ]
then
mupx deploy --config=.deploy/mupx_production.json
result=$?
fi

if [ $1 == test ]
then
mupx deploy --config=.deploy/mupx_test.json
result=$?
fi

exit $result