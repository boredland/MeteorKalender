#!/usr/bin/env bash
if [ $1 == master ]
then
result=`mupx deploy --config=mupx_production.json`
fi

if [ $1 == test ]
then
result=`mupx deploy --config=mupx_test.json`
fi

if [ $result == 0 ]
then
exit $1
else exit 1
fi