set -x

case $1 in
*) meteor --port $CBY_PORT --settings $CBY_SETTINGS;; # default run meteor in "normal" mode
esac