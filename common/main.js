const { app, BrowserWindow, Menu, dialog, ipcMain, clipboard, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const child = require('child_process').execFile;
const childShell = require('child_process').exec;
const childExecSync = require("child_process").execSync;
const sqlite3 = require(`sqlite3`).verbose();
// const sqlite3 = require(`../${process.platform}/node_modules/sqlite3`).verbose();

//const { Log } = require("./SupportClasses.js");

//const userDir = app.getPath('userData');
//const dbPath = path.join(userDir, 'mydb.sqlite');

var db_files = [];
console.log(process.platform);
if (process.platform == 'linux') {
  db_files = ["/home/ray/FileSearcherV3.db",];
} else if (process.platform == 'win32') {
  db_files = ["C:\\Users\\hrag\\dbs\\FileSearcherV3.db","C:\\Users\\hrag\\dbs\\FileSearcherV3_Sync.db","C:\\Users\\hrag\\dbs\\FileSearcherV302.db",];
} else if (process.platform == 'darwin') {
  db_files = null;
}
console.log(db_files);
//console.log(__dirname)
dragIcon =  path.join('.', 'images', 'drag-and-drop.png')
console.log(dragIcon)

// function pingReturn() {
//   return 'pong2';
// }
// function handleSetTitle (event, title) {
//   const webContents = event.sender
//   const win = BrowserWindow.fromWebContents(webContents)
//   win.setTitle(title)
// }
// async function handleFileOpen () {
//   const { canceled, filePaths } = await dialog.showOpenDialog()
//   if (canceled) {

//   } else {
//     return filePaths[0]
//   }
// }

function db_char(input_str) {
	return input_str.replace("'","''").toLowerCase()
}

function filename_filter_format(filename_filter) {
	let sql = '';
	if (filename_filter!='') {
		if (filename_filter.slice(-1)=='$') {
			sql += `and fs.filename_search glob '*${db_char(filename_filter.slice(0,-1))}'\n`
		} else if (filename_filter.slice(0)=='^') {
			sql += `and fs.filename_search glob '${db_char(filename_filter.slice(1))}*'\n`
		} else if (filename_filter.includes('.')) { // auto end if . in string as usually searching by extension
			let file_extension = filename_filter.split('.').pop();
			sql += `and fs.filename_search glob '*${db_char(filename_filter)}'\n`
			sql += `and fs.filename_ext = '${db_char(file_extension)}'\n`
		} else {
			sql += `and fs.filename_search glob '*${db_char(filename_filter)}*'\n`
    }
  }
  return sql
}

function path_filter_format(path_filter) {
	let sql = ''
	if (path_filter!='') {
		if (path_filter.slice(-1)=='$') {
			sql+=`and fs.path_search glob '*${db_char(path_filter.slice(0,-1))}'\n`
		} else if (path_filter.slice(0)=='^') {
			sql+=`and fs.path_search glob '${db_char(path_filter.slice(1))}*'\n`
    } else {
			sql+=`and fs.path_search glob '*${db_char(path_filter)}*'\n`
    }
  }
  return sql
}

//https://stackoverflow.com/questions/65851796/how-do-i-make-a-database-call-from-an-electron-front-end
//https://www.sqlitetutorial.net/sqlite-nodejs/connect/
async function search_db (event, filename_filter, contents_filter, path_filter, row_limit) {
  const webContents = event.sender
  //const win = BrowserWindow.fromWebContents(webContents)

	if (filename_filter+contents_filter+path_filter=='') {
		return;
  }

  let sql_attach = '';
  let sqlInsertTemp = ``;
  let sql = ``;

  if (contents_filter!='') {
    sqlInsertTemp = 'INSERT INTO idtmp (sourceDb, rid, modified_localtime)\n'
  }

  for (let iad=0; iad < db_files.length; iad++) {
    let attached_db = db_files[iad]
    console.log(attached_db);
		let attached_db_fn = '';
    if (iad>0) {
      attached_db_fn = `[${path.basename(attached_db)}].`
      sql+="UNION\n"
      if (contents_filter!='') {
        sqlInsertTemp+="UNION\n"
      }
    }
    console.log(attached_db_fn);
    if (contents_filter=='') {
      sql += `
      select f.filename,fs.modified_localtime as modified,size,f.path,f.archive_path,fld.name,NULL as snip
      from ${attached_db_fn}fsearch fs
      join ${attached_db_fn}f on f.rid=fs.frid
      join ${attached_db_fn}fld on fld.rowid=f.fld_rowid
      where 1=1
      `
    } else if (contents_filter.slice(0,3)=='...') {
      // full FTS5 syntax per https://www.sqlite.org/fts5.html
      console.log("full FTS5 syntax per https://www.sqlite.org/fts5.html")
      sqlInsertTemp += `
      SELECT '${attached_db_fn}', f.rid,fs.modified_localtime
      from ${attached_db_fn}fi
      join ${attached_db_fn}f on f.rid=fi.ROWID
      join ${attached_db_fn}fsearch fs on fs.frid=f.rid
      where fi MATCH 'contents:${contents_filter.slice(3)}'
      `
      sql += `
      select f.filename,idtmp.modified_localtime as modified,size,f.path,f.archive_path,fld.name,snippet(fi,0,'[',']','...',7) as snip
      from idtmp
      join ${attached_db_fn}fi on fi.ROWID=idtmp.rid
      join ${attached_db_fn}f on f.rid=fi.ROWID
      join ${attached_db_fn}fld on fld.rowid=f.fld_rowid
      where fi MATCH 'contents:${contents_filter.slice(3)}'
      and idtmp.sourceDb='${attached_db_fn}'
      `
    } else {
      sqlInsertTemp += `
      SELECT '${attached_db_fn}', f.rid,fs.modified_localtime
      from ${attached_db_fn}fi
      join ${attached_db_fn}f on f.rid=fi.ROWID
      join ${attached_db_fn}fsearch fs on fs.frid=f.rid
      where fi MATCH 'contents:("${contents_filter}")'
      `
      sql += `
      select f.filename,idtmp.modified_localtime as modified,size,f.path,f.archive_path,fld.name,snippet(fi,0,'[',']','...',7) as snip
      from idtmp
      join ${attached_db_fn}fi on fi.ROWID=idtmp.rid
      join ${attached_db_fn}f on f.rid=fi.ROWID
      join ${attached_db_fn}fld on fld.rowid=f.fld_rowid
      where fi MATCH 'contents:("${contents_filter}")'
      and idtmp.sourceDb='${attached_db_fn}'
      `
    }
    if (contents_filter=='') {
      sql += filename_filter_format(filename_filter);
      sql += path_filter_format(path_filter);
    } else {
      sqlInsertTemp += filename_filter_format(filename_filter);
      sqlInsertTemp += path_filter_format(path_filter);
    }
  }  

  if (contents_filter=='') {
    sql+="order by fs.modified_localtime desc\n"
    sql+=`limit ${row_limit}\n`
  } else {
    sqlInsertTemp+="order by fs.modified_localtime desc\n"
    sqlInsertTemp+=`limit ${row_limit}\n`
    sql+="order by idtmp.modified_localtime desc\n"
  }

  console.log(sqlInsertTemp);
  console.log(sql);

  let db_file = db_files[0];
  console.log(db_file);

  let db = new sqlite3.Database(db_file, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      return console.error(err.message);
    }
    //console.log('Connected to SQlite database.');
  });

  
  db.serialize(() => {
    for (let iad=1; iad < db_files.length; iad++) {
      let attached_db = db_files[iad];
      let attached_db_fn = path.basename(attached_db);
      let sql_attach = "ATTACH DATABASE '" + attached_db.replace('\\','\\\\') + "' AS [" + attached_db_fn + "]";
      console.log(sql_attach);
      db.run(sql_attach);
    }
    if (sqlInsertTemp!='') {
      db.run(`CREATE TEMP TABLE IF NOT EXISTS idtmp (sourceDb TEXT, rid INT, modified_localtime INT);`);
      db.run(`DELETE FROM idtmp;`);
      db.run(sqlInsertTemp);
    }
  
    db.all(sql, (err, ldt) => {
      if (err) {
        console.error(err.message);
      }
      webContents.send('update-dt', ldt);
    });
  });

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });

}

async function eventPassback (event, eventName, selectedRow) {
  //const webContents = event.sender
  //const win = BrowserWindow.fromWebContents(webContents)

  console.log(eventName);
  console.log(selectedRow);
  if (eventName=='OpenFolder') {
    //console.log(selectedRow.get('Path'));
    let filepath = path.join(selectedRow.get('Path'), selectedRow.get('Filename'));
		if (process.platform == 'win32') {
			let args = ["/select,",filepath]
      child("explorer.exe", args, function(err, data) {
          //console.log(err)
          //console.log(data.toString());
      });

    } else {
			//#subprocess.call(('xdg-open', path))
			//#nautilus --select path/to/file/or/directory
			let cmd = `dbus-send --session --type=method_call    --dest="org.freedesktop.FileManager1"     "/org/freedesktop/FileManager1"     "org.freedesktop.FileManager1.ShowItems" array:string:"file://${filepath}"     string:""`
      console.log(cmd)
			//subprocess.call(cmd, shell=True)
      childShell(cmd, function(err, data) {
      // console.log(err)
      // console.log(data.toString());
      });
    }
  } else if (eventName == "CopyFilename") {
    clipboard.clear();
    clipboard.writeText(selectedRow.get('Filename'));
  } else if (eventName == "CopyFullPath") {
    let filepath = path.join(selectedRow.get('Path'), selectedRow.get('Filename'));
    clipboard.clear();
    clipboard.writeText(filepath);
  } else if (eventName == "CopyTFSPath") {
    let folderpath = selectedRow.get('Path');
		if (folderpath.toLowerCase().startsWith("c:\\tfs")) {
			// #C:\tfs\FGS\ELIMS-FGS  $/FGS/ELIMS-FGS
			folderpath = folderpath.replaceAll("\\","/");
			folderpath = '$' + folderpath.slice(6)
      clipboard.clear();
      clipboard.writeText(folderpath);
    }
  } else if (eventName == "OpenFile") {
    let filename = selectedRow.get('Filename')
    //if a zipped archive, try open the file inside the zip
    let file_extension = path.extname(filename)
    let filepath = path.join(selectedRow.get('Path'), filename);
    let archivePath = selectedRow.get('Archive Path')
    if (archivePath!='' && file_extension=='.7z' && process.platform == 'win32') {
      //TODO extract also for linux
      //extract single file to tmp
      let archivePathArr = archivePath.split(':')
      console.log(archivePath)
      console.log(archivePathArr)
      archiveItem = archivePathArr[2]
      console.log(archiveItem)
      archiveItemFilename = path.basename(archiveItem)
      console.log(archiveItemFilename)
      //7z e -o%temp% -pa4 -y C:\Users\hrag\DUMP\ConsumablesAppDebugging\ConsumablesAppDebugging_20230720.7z ConsumablesOrders_20230720_010406282_R29Z_81e5bf13d280452c944466f5d288f047.sql
      let cmd = `7z e -o%temp% -pa4 -y ${filepath} ${archiveItemFilename}`
      console.log(cmd)
      let childReturn = childExecSync(cmd);
      filepath = `${app.getPath("temp")}\\${archiveItemFilename}`
      console.log(filepath)
      console.log(fs.existsSync(filepath))
    } else {

    }
    if (process.platform == 'win32') {
      shell.openPath(filepath);
    } else {
      let args = [filepath]
      child("xdg-open", args, function(err, data) {
          //console.log(err)
          //console.log(data.toString());
      });
    }
  }
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  //Log.append(`test`);

  // const menu = Menu.buildFromTemplate([
  //   {
  //     label: app.name,
  //     submenu: [
  //       {
  //         click: () => win.webContents.send('update-counter', 1),
  //         label: 'Increment'
  //       },
  //       {
  //         click: () => win.webContents.send('update-counter', -1),
  //         label: 'Decrement'
  //       }
  //     ]
  //   }

  // ])
  // Menu.setApplicationMenu(menu)

  Menu.setApplicationMenu(null)
  
  //ipcMain.handle('runSearch', search_db)
  ipcMain.on('runSearch', search_db)
  ipcMain.on('eventPassback', eventPassback)

  // ipcMain.handle('ping', pingReturn)
  // ipcMain.on('set-title', handleSetTitle)


  ipcMain.on('ondragstart', (event, selectedRow) => {
    let filepath = path.join(selectedRow.get('Path'), selectedRow.get('Filename'));
    event.sender.startDrag({
      file: filepath,
      icon: dragIcon,
    })
  })

  win.loadFile('common/index.html')
}

app.whenReady().then(() => {
  // ipcMain.handle('dialog:openFile', handleFileOpen)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
  
  //BrowserWindow.getFocusedWindow().webContents.openDevTools();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
