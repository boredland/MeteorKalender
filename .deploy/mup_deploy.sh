#!/bin/bash
slack_it (){
curl -X POST --data-urlencode 'payload={"channel": "'$channel'", "username": "Meteor-UP", "text": "'$RESULT_MESSAGE'"}' https://hooks.slack.com/services/$webhook_key
}

check_sucess () {
if [[ $MUP_RESULT == *"Verifying Deployment: SUCCESS"* ]]
then
  RESULT_MESSAGE="Sucessfully deployed <'$DESTINATION_URL'|#'$TRAVIS_BUILD_NUMBER'>.";
else
  RESULT_MESSAGE="Deployment for #'$TRAVIS_BUILD_NUMBER' failed. Reverted back to previous version on '$DESTINATION_URL'"
fi
}

deploy () {
MUP_RESULT=$(mup deploy | tail -n1)
echo $MUP_RESULT
check_sucess
slack_it
}

if [ $1 == master ]
then
cd .deploy/production
channel="#info_002_cd_mup_prod"
DESTINATION_URL="https://test.meteorkalender.freeddns.org"
webhook_key=$Webhook_Test
deploy
fi

if [ $1 == test ]
then
cd .deploy/test
channel="#info_002_cd_mup_test"
DESTINATION_URL="https://meteorkalender.freeddns.org"
webhook_key=$Webhook_Test
deploy
fi