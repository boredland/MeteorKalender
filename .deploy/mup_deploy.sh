#!/bin/bash
if [ $1 == master ]
then
cd .deploy/production
MUP_RESULT=$(mup deploy | tail -n1)
echo $MUP_RESULT
curl -X POST --data-urlencode 'payload={"channel": "#info_002_cd_mup_prod", "username": "Meteor-UP", "text": "Sucessfully deployed <https://meteorkalender.freeddns.org|#'$TRAVIS_BUILD_NUMBER'>. Result: '$MUP_RESULT'"}' https://hooks.slack.com/services/$Webhook_Production
fi

if [ $1 == test ]
then
cd .deploy/test
MUP_RESULT=$(mup deploy | tail -n1)
echo $MUP_RESULT
curl -X POST --data-urlencode 'payload={"channel": "#info_002_cd_mup_prod", "username": "Meteor-UP", "text": "Sucessfully deployed <https://test.meteorkalender.freeddns.org|#'$TRAVIS_BUILD_NUMBER'>. Result: '$MUP_RESULT'"}' https://hooks.slack.com/services/$Webhook_Test
fi