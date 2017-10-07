set -x
export MONGO_URL=mongodb://localhost:3001/meteor
export MONGO_OPLOG_URL=mongodb://localhost:3001/local
export CBY_SETTINGS='./private/development/settings.json';
export CBY_PORT=4000

case $1 in
*) meteor --port $CBY_PORT --settings $CBY_SETTINGS;; # default run meteor in "normal" mode
esac