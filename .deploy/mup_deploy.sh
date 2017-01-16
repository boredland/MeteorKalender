#!/bin/bash
slack_it (){
curl -X POST --data-urlencode 'payload={"channel": "'"$channel"'", "username": "Meteor-UP", "text": "'"$RESULT_MESSAGE"'"}' https://hooks.slack.com/services/$webhook_key
}

check_sucess () {
if [[ $MUP_RESULT == *"Verifying Deployment: SUCCESS"* ]]
then
  echo "Deployment successful."
  RESULT_MESSAGE="Sucessfully deployed <"$DESTINATION_URL"|#"$TRAVIS_BUILD_NUMBER"> for <https://github.com/boredland/MeteorKalender/commit/$TRAVIS_COMMIT|"$TRAVIS_COMMIT">."
  slack_it
  RETURNCODE=0
else
  echo "Deployment failed."
  RESULT_MESSAGE="Deployment for #"$TRAVIS_BUILD_NUMBER" failed. Reverted back to previous version on "$DESTINATION_URL""
  slack_it
  RETURNCODE=1
fi
}

deploy () {
mup reconfig
MUP_RESULT=$(mup deploy)
echo $MUP_RESULT
MUP_RESULT=$(echo $MUP_RESULT | tail -n1)
check_sucess
}

if [ $1 == master ]
then
cd .deploy/production
channel="#info_002_cd_mup_prod"
DESTINATION_URL="https://meteorkalender.freeddns.org"
webhook_key=$Webhook_Prod
deploy
fi

if [ $1 == test ]
then
cd .deploy/test
channel="#info_002_cd_mup_test"
DESTINATION_URL="https://test.meteorkalender.freeddns.org"
webhook_key=$Webhook_Test
deploy
fi

exit $RETURNCODE