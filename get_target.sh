#!/usr/bin/env bash
## this does work on my computer.
if [$1 == "master"]; then
echo "https://meteorkalender.freeddns.org:443"
else if [$1 == test]; then
echo "https://test.meteorkalender.freeddns.org:443"
else echo "https://meteorkalender.herokuapp.com:443";fi
fi