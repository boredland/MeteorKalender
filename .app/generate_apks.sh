#!/usr/bin/env bash
## this does work on my computer.
echo "Set Android Home and path for platform tools"
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
echo "Build dev-apk"
## keytool -genkey -alias dateyourprof -keyalg RSA -keysize 2048 -validity 10000
/usr/local/bin/meteor build . --server https://meteorkalender.herokuapp.com:443
echo $1 | jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 ./android/release-unsigned.apk dateyourprof
mv ./android/release-unsigned.apk ./android/dateyourprof_dev.apk

echo "Build test-apk"
/usr/local/bin/meteor build . --server https://test.meteorkalender.freeddns.org:443
echo $1 | jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 ./android/release-unsigned.apk dateyourprof
mv ./android/release-unsigned.apk ./android/dateyourprof_test.apk

echo "Build prod-apk"
/usr/local/bin/meteor build . --server https://meteorkalender.freeddns.org:443
echo $1 | jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 ./android/release-unsigned.apk dateyourprof
mv ./android/release-unsigned.apk ./android/dateyourprof_prod.apk