#!/usr/bin/env bash
/usr/local/bin/meteor build ./.app/ --server https://meteorkalender.herokuapp.com:443 && mv ./.app/android/release-unsigned.apk ./.app/android/release-unsigned_dev.apk
/usr/local/bin/meteor build ./.app/ --server https://test.meteorkalender.freeddns.org:443 && mv ./.app/android/release-unsigned.apk ./.app/android/release-unsigned_test.apk
/usr/local/bin/meteor build ./.app/ --server https://meteorkalender.freeddns.org:443 && mv ./.app/android/release-unsigned.apk ./.app/android/release-unsigned_prod.apk