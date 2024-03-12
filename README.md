# FileSearcherGUIV4
FileSearcher GUI V4 based on electron

# How to install
download or clone source

## run these commands
set NODE_TLS_REJECT_UNAUTHORIZED=0
npm config set strict-ssl false
npm config set registry http://registry.npmjs.org/
npm install electron --save-dev
npm install sqlite3

## code change required
set the db_files variable in main.js to be the paths to the db files.

## goto the local path, and type
npm run start

### or from another path
npm start --prefix %path_to_source%

### or to run from somewhere without a cmd window showing
powershell "start npm -Args \"start --prefix %path_to_source%" -WindowStyle Hidden"

