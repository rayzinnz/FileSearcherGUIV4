//window.addEventListener("load", init);

window.onload = function() {
	console.log('Hello, Console!')
	document.getElementById('filename').addEventListener("keypress", handleKeyPress);
};

function handleKeyPress(e){
    if (e.key === "Enter") {
		console.log('you pressed enter')
		console.log(document.getElementById('filename').innerText)
    }
};



