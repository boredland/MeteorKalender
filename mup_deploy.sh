#!/bin/sh

echo "## this is an echo from the script mup_deploy.sh"
npm install -g mup ssh2
mup setup
mup deploy