#!/bin/bash
if [ $1 == master ]
then
mupx setup --config .deploy/mup_production.js
mup deploy --config .deploy/mup_production.js
exit $?
fi

if [ $1 == test ]
then
mupx setup --config=.deploy/mup_test.js
mup deploy --config .deploy/mup_test.js
exit $?
fi