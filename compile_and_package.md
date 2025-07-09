# How to compile and package

**npx**

Running Electron ad-hoc

If you're in a pinch and would prefer to not use npm install in your local project, you can also run Electron ad-hoc using the npx command runner bundled with npm:

npx electron .

The above command will run the current working directory with Electron. Note that any dependencies in your app will not be installed.

**Electron Forge**

```
cd C:\Users\hrag\Sync\Programming\github\FileSearcherGUIV4
npm init electron-app@latest filesearcherv4 -- --template=webpack

cd filesearcherv4
edit package.json, set "main": "common/main.js",
npm run make
```

Current issue:
Error: Cannot find module 'sqlite3'
https://github.com/electron/forge/issues/575
