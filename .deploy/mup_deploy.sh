#!/bin/bash
if [ $1 == master ]
then
cd .deploy/production
ls ././../node_modules/
././../node_modules/mup
././../node_modules/ deploy
exit $?
fi
if [ $1 == test ]
then
cd .deploy/test
../node_modules/mup deploy
exit $?
fi