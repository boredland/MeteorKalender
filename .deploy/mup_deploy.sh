#!/bin/bash
if [ $1 == master ]
then
cd .deploy/production
DEBUG=* mup deploy
exit $?
fi
if [ $1 == test ]
then
cd .deploy/test
DEBUG=* mup deploy
exit $?
fi