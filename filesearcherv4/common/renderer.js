//const path = require('path')
//const sqlite3 = this.require('sqlite3').verbose();
//var db = new sqlite3.Database('mydb.db');


// const func = async () => {
// 	const response = await window.versions.ping()
// 	Log.append(response) // prints out 'pong'
// }

function highlight(e) {
	//Log.append('function highlight(e) {')
	let tblData = document.getElementById("tblData");
	let selected = tblData.getElementsByClassName('selected');
    if (selected[0]) selected[0].className = '';
    e.target.parentNode.className = 'selected';
}

async function tblDoubleClick(e) {
	//Log.append("tblDoubleClick")
	let eventName = 'OpenFile'
	let tblData = document.getElementById("tblData");
	let selected = tblData.getElementsByClassName('selected');
	let statusBar = document.getElementById("lblLoading")

	if (selected.length>0 && eventName!='') {
		let headerRow = tblData.rows[0];
		let selectedRow = selected[0]; //[object HTMLTableRowElement]
		// let selectedRowIndex = selectedRow.rowIndex;
		// let headerRowIndex = 0;
		let selectedRowMap = new Map();
		for (let icell = 0; icell < headerRow.cells.length; icell++) {
			selectedRowMap.set(headerRow.cells[icell].innerHTML, selectedRow.cells[icell].innerHTML);
		}
		statusBar.innerHTML=`double click ${selectedRowMap.get('Filename')}`;
		//Log.append(selectedRowMap);
		await window.electronAPI.eventPassback(eventName, selectedRowMap);
	} else {
		statusBar.innerHTML=`double click nothing`;
	}
}

// function fnselect(){
//     Log.append($("tr.selected td:first" ).html());
// }

async function windowKeyUp (event) {
	let eventName = ''
	let tblData = document.getElementById("tblData");
	let selected = tblData.getElementsByClassName('selected');
	let statusBar = document.getElementById("lblLoading")

	if (event.ctrlKey && !event.altKey && !event.shiftKey) {
		// Log.append(`You pressed ${event.key}`);
		if (event.key == "c") {
			//open folder
			eventName = "CopyFilename"
		} else if (event.key == "f") {
			//open folder
			eventName = "OpenFolder"
		} else if (event.key == "o") {
			//open file
			eventName = "OpenFile"
		} else if (event.key == "p") {
			//copy path
			eventName = "CopyFullPath"
		} else if (event.key == "t") {
			//copy tfs path
			eventName = "CopyTFSPath"
		}
	}
	if (selected.length>0 && eventName!='') {
		let headerRow = tblData.rows[0];
		let selectedRow = selected[0]; //[object HTMLTableRowElement]
		// let selectedRowIndex = selectedRow.rowIndex;
		// let headerRowIndex = 0;
		let selectedRowMap = new Map();
		for (let icell = 0; icell < headerRow.cells.length; icell++) {
			selectedRowMap.set(headerRow.cells[icell].innerHTML, selectedRow.cells[icell].innerHTML);
		}
		statusBar.innerHTML=`event ${eventName} on ${selectedRowMap.get('Filename')}`;
		//Log.append(selectedRowMap);
		await window.electronAPI.eventPassback(eventName, selectedRowMap);
	}
}

window.addEventListener('keyup', windowKeyUp, true)

//document.getElementById("tblData").onclick = highlight;
document.getElementById('tblData').addEventListener("click", highlight);
document.getElementById('tblData').addEventListener("dblclick", tblDoubleClick);
//document.getElementById('tblData').addEventListener('keyup', tblKeyPress)
//document.getElementById('tst').addEventListener("click", fnselect);

document.getElementById('filename').addEventListener("keypress", txtKeyPress);
document.getElementById('contents').addEventListener("keypress", txtKeyPress);
document.getElementById('path').addEventListener("keypress", txtKeyPress);
document.getElementById('row_limit').addEventListener("keypress", txtKeyPress);

// window.onload = function() {
// 	document.getElementById('filename').addEventListener("keypress", handleKeyPress);
// 	Log.append("loaded");
// 	//Log.append(db_files);
// 	//func();
// 	//Log.append(window.electronAPI);
// };

var loadingSeconds = 0;
var incrementLoadingSecondsId = 0;
async function incrementLoadingSeconds() {
    loadingSeconds += 1;
    document.getElementById("lblLoading").innerHTML="loading... " + loadingSeconds + " seconds";
}

async function txtKeyPress(e){
    if (e.key === "Enter") {
		document.getElementById("lblLoading").innerHTML="loading... 0 seconds";
		loadingSeconds = 0;
		incrementLoadingSecondsId = setInterval(incrementLoadingSeconds, 1000);
		
		let tblData = document.getElementById("tblData");
		while(tblData.rows.length > 1) {
			tblData.deleteRow(1);
			}
		const filename_filter = document.getElementById('filename').value;
		const contents_filter = document.getElementById('contents').value;
		const path_filter = document.getElementById('path').value;
		const row_limit = document.getElementById('row_limit').value;
		await window.dbAPI.runSearch(filename_filter, contents_filter, path_filter, row_limit);
    }
};

document.getElementById('tblData').ondragstart = (event) => {
	event.preventDefault()
	let tblData = document.getElementById("tblData");
	let selected = tblData.getElementsByClassName('selected');

	if (selected.length>0) {
		let headerRow = tblData.rows[0];
		let selectedRow = selected[0]; //[object HTMLTableRowElement]
		// let selectedRowIndex = selectedRow.rowIndex;
		// let headerRowIndex = 0;
		let selectedRowMap = new Map();
		for (let icell = 0; icell < headerRow.cells.length; icell++) {
			selectedRowMap.set(headerRow.cells[icell].innerHTML, selectedRow.cells[icell].innerHTML);
		}
		window.electronAPI.startDragFileName(selectedRowMap)
	}
  }

// const counter = document.getElementById('counter')

window.dbAPI.handleRows((event, value) => {
	// Log.append("window.dbAPI.handleRows");
	let tblData = document.getElementById("tblData");
	let newRow;
	let newCell;
	let newText;

	let iRow = 0;
	for (let dataRow of value) {
		newRow = tblData.insertRow();
		iRow += 1;
		newCell = newRow.insertCell();
		newText = document.createTextNode(`${iRow}`);
		newCell.appendChild(newText);
		for(let propertyName in dataRow) {
			// Log.append(`${propertyName}: ${dataRow[propertyName]}`)
			newCell = newRow.insertCell();
			newText = document.createTextNode(`${dataRow[propertyName]}`);
			newCell.appendChild(newText);
		}
		//break;
	}
	clearInterval(incrementLoadingSecondsId);
	document.getElementById("lblLoading").innerHTML=" ";
	// const oldValue = Number(counter.innerText)
	// const newValue = oldValue + value
	//counter.innerText = "test1"
	// event.sender.send('counter-value', newValue)
})

// window.electronAPI.handleCounter((event, value) => {
// 	Log.append("counter.innerText: " + counter.innerText);
// 	const oldValue = Number(counter.innerText)
// 	const newValue = oldValue + value
// 	counter.innerText = newValue
// 	event.sender.send('counter-value', newValue)
// })

