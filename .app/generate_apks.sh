#!/usr/bin/env bash
## this does work on my computer.
echo "Set Android Home and path for platform tools"
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
echo "Build dev-apk"
/usr/local/bin/meteor build ./.app/ --server https://meteorkalender.herokuapp.com:443 && mv ./.app/android/release-unsigned.apk ./.app/android/release-unsigned_dev.apk
echo "Build test-apk"
/usr/local/bin/meteor build ./.app/ --server https://test.meteorkalender.freeddns.org:443 && mv ./.app/android/release-unsigned.apk ./.app/android/release-unsigned_test.apk
echo "Build prod-apk"
/usr/local/bin/meteor build ./.app/ --server https://meteorkalender.freeddns.org:443 && mv ./.app/android/release-unsigned.apk ./.app/android/release-unsigned_prod.apk