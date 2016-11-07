#!/bin/bash
if [ $1 == master ]
then
cd .deploy/production
mup reconfig
mup deploy
exit $?
fi
if [ $1 == test ]
then
cd .deploy/test
mup deploy
exit $?
fi