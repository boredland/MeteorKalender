#!/bin/bash
if [ $1 == master ]
then
cd .deploy/production
node_modules/mup deploy
exit $?
fi
if [ $1 == test ]
then
cd .deploy/test
mup deploy
exit $?
fi