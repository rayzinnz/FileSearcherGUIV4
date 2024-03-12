# FileSearcherGUIV4
FileSearcher GUI V4 based on electron

# How to install
download or clone source

## run these commands
set NODE_TLS_REJECT_UNAUTHORIZED=0
npm config set strict-ssl false
npm config set registry http://registry.npmjs.org/

*different paths per OS, reason is because I run this on many machines from a synced folder, and syncing clashes if installed in the same place*
*in windows*
npm install electron --save-dev --prefix ./win32
npm install sqlite3 --prefix ./win32
*in linux*
npm install electron --save-dev --prefix ./linux
npm install sqlite3 --prefix ./linux
*in mac*
npm install electron --save-dev --prefix ./darwin
npm install sqlite3 --prefix ./darwin

## code change required
set the db_files variable in main.js to be the paths to the db files.

## goto the local path, and type
npm run start

### or from another path
npm start --prefix %path_to_source%

### or to run from somewhere without a cmd window showing
powershell "start npm -Args \"start --prefix %path_to_source%" -WindowStyle Hidden"

