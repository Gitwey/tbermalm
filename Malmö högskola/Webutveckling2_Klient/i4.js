/* Tarek Bermalm - AK6336. */
"use strict";

let form = document.getElementById("search-form");
form.addEventListener("submit", function(event) {
	removeallChildNodes(document.getElementById("items"));

	let target = event.target || event.srcElement;
	
	let queryText = form.elements.query.value;
	apiHandler(encodeURI(queryText));

	event.preventDefault();
		
});

function apiHandler(title) {
	var omdbAPI = new XMLHttpRequest();
	var omdbURL = "https://www.omdbapi.com/?&apikey=5e65d4a0&s=" + title + "&type=movie";

	omdbAPI.addEventListener("load", function() {
	    var result = JSON.parse(this.responseText);
	    console.log(result);

	    if (result.Response == "False"){
	    	document.getElementById("items").style.listStyle = "none";
	    	addListItem(result.Error);
	    } else if (result.Response == "True") {
	    	document.getElementById("items").style.listStyle = "disc";
	    	result.Search.forEach(function(entry) {
  				addListItem(entry.Title + " (" + String(entry.Year) + ")", entry.imdbID);
			});

			sortListByRating(result);
	    }
	});

	omdbAPI.open("get", omdbURL, true);
	omdbAPI.send();
}

function addListItem(string, imdbID) {
    let a = document.createElement('a');  
    let link = document.createTextNode(string);
    a.appendChild(link);

    let url = "https://www.imdb.com/title/" + imdbID + "/";
    a.href = url;

	let li = document.createElement("li");
	li.appendChild(a);

	let ul = document.getElementById("items");
	ul.appendChild(li);
}

function removeallChildNodes(parent) {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}

}
function screen_resize() {
       	var h = parseInt(window.innerHeight);
        var w = parseInt(window.innerWidth);

        var divs = document.getElementsByTagName("div");   // order: first, second, third
		divs[2].parentNode.insertBefore(divs[2], divs[0]); // order: third, first, second
		divs[2].parentNode.insertBefore(divs[2], divs[1]); // order: third, second, first


        if(w < 600 && h < 800) {
        	console.log("mer än 600x800");
        	console.log(h, w);
        }
}


function sortListByRating(resultList) {
//For each li;
// Get imdbid
// Api call for imdbid //returns a movie
// Get imdbrating for movie
// Parseint(imdbrating
// Let rating //Save in variable?
 
//Compare rating with something
//Sort resultList according to this

//need to read and understand sorting
//then use imdbRating for sorting

	resultList.Search.forEach(function(entry) {
  		let omdbAPI = new XMLHttpRequest();
		let omdbURL = "https://www.omdbapi.com/?&apikey=5e65d4a0&s=&i=" + entry.imdbID;

		omdbAPI.addEventListener("load", function() {
			let result = JSON.parse(this.responseText);
			let imdbRating = parseInt(result.imdbRating);
			console.log(imdbRating);
		});
		omdbAPI.open("get", omdbURL, true);
		omdbAPI.send();
	});
	
}
