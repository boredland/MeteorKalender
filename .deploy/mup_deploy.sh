#!/bin/bash
if [ $1 == master ]
then
cd .deploy/production
MUP_OUTPUT=$(mup deploy 2>&1)
curl -X POST --data-urlencode 'payload={"channel": "#info_002_cd_mup_prod", "username": "Meteor-UP", "text": "Sucessfully deployed <https://meteorkalender.freeddns.org|#'$TRAVIS_BUILD_NUMBER'>. Log: '$MUP_OUTPUT'"}' https://hooks.slack.com/services/$Webhook_Production
fi

if [ $1 == test ]
then
cd .deploy/test
MUP_OUTPUT=$(mup deploy 2>&1)
curl -X POST --data-urlencode 'payload={"channel": "#info_002_cd_mup_prod", "username": "Meteor-UP", "text": "Sucessfully deployed <https://test.meteorkalender.freeddns.org|#'$TRAVIS_BUILD_NUMBER'>. Log: '$MUP_OUTPUT'"}' https://hooks.slack.com/services/$Webhook_Test
fi