// class Car {
// 	constructor(name, year) {
// 	this.name = name;
// 	this.year = year;
// 	}
// }

class DateExt {
	static standardFormatLocal(inDateTime) {
		var d = inDateTime
		var dateStringLocal = "" + d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
		return dateStringLocal;
	}
	
	static standardFormatUTC(inDateTime) {
		var d = inDateTime
		var dateStringUTC = "" + d.getUTCFullYear() + "-" + ("0"+(d.getUTCMonth()+1)).slice(-2) + "-" + ("0" + d.getUTCDate()).slice(-2) + " " + ("0" + d.getUTCHours()).slice(-2) + ":" + ("0" + d.getUTCMinutes()).slice(-2) + ":" + ("0" + d.getUTCSeconds()).slice(-2);
		return dateStringUTC;
	}
}

class Log {
	static append (txt) {
		var currentDate = new Date();
		console.log(`${DateExt.standardFormatLocal(currentDate)}: ${txt}`);
	}
}

//module.exports = Log;
