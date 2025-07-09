const { contextBridge, ipcRenderer } = require('electron')

// contextBridge.exposeInMainWorld('versions', {
//   node: () => process.versions.node,
//   chrome: () => process.versions.chrome,
//   electron: () => process.versions.electron,
//   ping: () => ipcRenderer.invoke('ping'),
//   // we can also expose variables, not just functions
// })

contextBridge.exposeInMainWorld('electronAPI', {
	// setTitle: (title) => ipcRenderer.send('set-title', title),
	// openFile: () => ipcRenderer.invoke('dialog:openFile'),
	// handleCounter: (callback) => ipcRenderer.on('update-counter', callback),
  startDragFileName: (selectedRow) => {
    ipcRenderer.send('ondragstart', selectedRow)
  },  
  eventPassback: (eventName, selectedRow) => ipcRenderer.send('eventPassback', eventName, selectedRow),
})

contextBridge.exposeInMainWorld('dbAPI', {
  //runSearch: (filename_filter, contents_filter, path_filter) => ipcRenderer.invoke('runSearch', filename_filter, contents_filter, path_filter),
  runSearch: (filename_filter, contents_filter, path_filter, row_limit) => ipcRenderer.send('runSearch', filename_filter, contents_filter, path_filter, row_limit),
  handleRows: (callback) => ipcRenderer.on('update-dt', callback),
})
