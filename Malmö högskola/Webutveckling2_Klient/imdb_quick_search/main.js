"use strict";

const API_KEY = '5e65d4a0&s';

//functions to init page
submitFormListener();
showFavouriteMoviesListener();
favouriteMoviesHamburgerListener();
favouriteMoviesIconListener();

navbarListeners();
function navbarListeners() {
	let	dbToggleContainer = document.getElementById("db-toggle-container");
	dbToggleContainer.addEventListener("click", function (event) {
		let dbContent = document.getElementById("db-content");
		//dbContent.classList.toggle("hide");

		let sidebar = document.getElementById("favourite-movies-container");
		sidebar.classList.toggle("hide");
	});
}

let show = "show";
handleSidebarLoadingAnimation(show);

/*TODO: make press escape will escape modals */

function submitFormListener() {
	let form = document.getElementById("search-form");
	let searchBox = document.getElementById("search-box");

	form.addEventListener("submit", function(event) {

		// clear resultContainer to prevent stacking of results/response messages
		let resultContainerList = document.getElementsByClassName("result-container");

		for (let i = 0; i < resultContainerList.length; i++) {
			resultContainerList[i].querySelectorAll('*').forEach(n => n.remove());
		}

		// in this case the user didnt enter any text in the search box
		if (searchBox.value.length === 0){
			searchBox.focus();

			// generate p saying to enter some text
			let p = document.createElement("p");
			p.appendChild(document.createTextNode("Please type something first."));
			resultContainerList[0].appendChild(p);

			event.preventDefault();
		} else {
			// in this case the search has gone through
			// making api call

			// this code shows the loading animation div
			let loadingResults = document.getElementById("loading-results");
			loadingResults.style.display = "inline-block";

			//pass whatever the user entered into the search box as a query to the apiHandler
			let queryText = form.elements.query.value;
			apiHandlerByTitle(encodeURI(queryText));

			event.preventDefault();
		}
	});
}

function apiHandlerByTitle(queryText) {
	//this function queries the omdbAPI by title

	//define api request variables
	const omdbAPI = new XMLHttpRequest();
	const omdbURL = `https://www.omdbapi.com/?&apikey=${API_KEY}&s=${queryText}`;

	//adding listener to request
	omdbAPI.addEventListener("load", function() {
		//saving result
		let result = JSON.parse(this.responseText);

		if (result.Response == "False"){
			//in this case the search was unsuccessful
			displayResult(result);
		} else if (result.Response == "True"){
			/*
			in this case the search was successful
			we iterate through all the results
			in-order to fetch a movie based on imdbid
			which contains more information than based on title
			such as actors, cast, poster, awards
			*/

			//this code passes the result for the endlessScrolling function
			window.addEventListener("scroll",function () {
				handleEndlessScroll(queryText);
			});

			result.Search.forEach(function (entry){
				apiHandlerByImdbID(entry.imdbID);
			});
		}
	});

	//executing api request
	omdbAPI.open("get", omdbURL, true);
	omdbAPI.send();

}
function apiHandlerByImdbID(imdbID) {
	//this function queries the omdbAPI by imdbID

	//define api request variables
	const omdbAPI = new XMLHttpRequest();
	const omdbURL = `https://www.omdbapi.com/?&apikey=${API_KEY}&s=&i=${imdbID}`;

	//adding listener to request
	omdbAPI.addEventListener("load", function() {
		//saving result
		let result = JSON.parse(this.responseText);
		displayResult(result);
	});

	//executing api request
	omdbAPI.open("get", omdbURL, true);
	omdbAPI.send();
}

function displayResult(result) {
	//hiding the loading div
	let loadingResults = document.getElementById("loading-results");
	loadingResults.style.display = "none";

	//this code will make the sidebar retract itself
	//if mobile user
	if (/Mobi|Android/i.test(navigator.userAgent) && document.getElementById("input-hamburger").checked) {
		document.getElementById("input-hamburger").checked = false;
	}

	let resultContainerList = document.getElementsByClassName("result-container");
	let resultContainer = resultContainerList[0];

	//in this case something went wrong with the search
	//this is communicated through p outputting string result.Error
	if (result.Response == "False"){
		let resultString = String(result.Error);

		if (resultString == "Too many results."){
			resultString += " Try to be more specific."
		} else if (resultString == "Movie not found!"){
			resultString += " Did you misspell something?";
		}

		//generate p with resultString
		let p = document.createElement("p");
		p.appendChild(document.createTextNode(resultString));
		resultContainer.appendChild(p);

	} else if (result.Response == "True"){
		if (result.Search == null){
			//in this case a single movie is passed, through apiHandlerByImdbID
			//instead of a list of results, through apiHandlerByTitle
			//checking for null is not a sustainable way of checking if single movie or list
			//TODO: implement a more accurate condition

			//I'm quite certain this case never fires  because i redesigned apicalls
			//nvm, it does fire
			//does the else-case never fire?

			generateMovieCard(result);
		} else {
			//in this case the search came through and is a list of movies
			//we display result properties

			//executed for every item in array: Result.Search
			result.Search.forEach(function(entry) {
				generateMovieCard(entry);
			});

			alert("If this appears, the else case DID fire.");

		}
	}

}
function handleSidebarLoadingAnimation(hideShow){
	// there are currently two issues with this function
	// first:
	//	something is displaying the title-and-list-container
	//	before this fun has a chance to display them
	//	at an appreciate time (meaning, when the animation will hide)
	//	therefore, it's showing both the loading anim and the container at the same time
	//  need to locate whats (programmatically?) setting the container to display

	// second:
	//	the sidebar content is displayed upon page load
	//  just after that, this fun is called, and hides them
	//  so it shows --> hides bcus of this fun --> shows, when db finished loading
	// let loadingSidebar = document.getElementById("loading-sidebar");
	//
	// let firebaseAuthContainer = document.getElementById("firebase-auth-container");
	// let titleAndListContainer =  document.getElementById("title-and-list-container");
	// let favouriteMovieContentContainer = document.getElementById('favourite-movies-content-container');
	// let hr = favouriteMovieContentContainer.querySelectorAll('hr');
	//
	// if (hideShow === "show"){
	// 	console.log("show");
	//
	// 	firebaseAuthContainer.style.display = "none";
	// 	titleAndListContainer.style.display = "none";
	// 	hr.forEach(function (n) {
	// 		n.style.display = "none";
	// 	});
	// 	loadingSidebar.style.display = "block";
	//
	// } else if (hideShow === "hide"){
	//
	// 	console.log("hide");
	// 	loadingSidebar.style.display = "none";
	//
	// 	firebaseAuthContainer.style.display = "unset";
	// 	titleAndListContainer.style.display = "unset";
	// 	hr.forEach(function (n) {
	// 		n.style.display = "unset";
	// 	});
	// }
}

function generateMovieCard(apiCallResult) {

	/*
	this function takes the result of a imdbID query
	which was returned from API call to the OMDb API
	then generates a movie card
	*/

	// With endless scrolling, multiple resultContainers can exist simultaneously
	// However, it's always the last resultContainer which is intended to be filled with movieCards
	let resultContainerList = document.getElementsByClassName("result-container");
	let resultContainer = resultContainerList[resultContainerList.length - 1];
	//list index starts at 0, but length starts at 1. therefore -1

	let movieContainer = document.createElement('div');
	movieContainer.classList.add('movie-container');
	//movieContainer.style.zIndex = "-1"; //this fixes the movie card being infront of sidebar menu //not needed
	resultContainer.appendChild(movieContainer);

	//adding hyperlink, the movie's imdb-page, to movie poster
	let a = document.createElement("a");
	let url = "https://www.imdb.com/title/" + apiCallResult.imdbID + "/";
	a.href = url;
	movieContainer.appendChild(a);

	let img = document.createElement('img');

	//setting poster src, if poster exists
	if (apiCallResult.Poster == "N/A"){
		img.src = "https://www.sunnxt.com/images/placeholders/placeholder_vertical.gif";
	} else {
		img.src = apiCallResult.Poster;
	}
	//using this to avoid modal box when clicking the movie poster
	//TODO: change to class
	img.id = "movie-poster-anchor";

	a.appendChild(img);

	let text = document.createElement('div');
	text.classList.add("text");
	movieContainer.appendChild(text);

	let titleYear = document.createElement("span");
	titleYear.classList.add("title-year");
	titleYear.appendChild(document.createTextNode(apiCallResult.Title + " (" + String(apiCallResult.Year) + ")"));
	text.appendChild(titleYear);

	let actors = document.createElement("span");
	actors.classList.add("actors");
	actors.appendChild(document.createTextNode(apiCallResult.Actors));
	text.appendChild(actors);

	if (apiCallResult.Awards == "N/A"){
		apiCallResult.Awards = "No awards.";
	} else if (apiCallResult.Awards.length > 25){
		if (screen && screen.width < 1300) {
			apiCallResult.Awards = "Has won awards or nominations."
		}
		//not enough space to show all awards
		//TODO: change to dropdown on touch (jquery?)
		//https://coderwall.com/p/3uwgga/make-css-dropdown-menus-work-on-touch-devices
	}

	let awards = document.createElement("span");
	awards.classList.add("awards");
	awards.appendChild(document.createTextNode(apiCallResult.Awards));
	text.appendChild(awards);

	let ratingContainer = document.createElement('div');
	ratingContainer.classList.add("rating-container");
	movieContainer.appendChild(ratingContainer);

	let ratingDiv = document.createElement('div');
	ratingDiv.classList.add("rating");
	ratingContainer.appendChild(ratingDiv);

	if (apiCallResult.imdbRating == "N/A"){
		ratingDiv.style.display = "none";
	} else {
		ratingDiv.innerHTML = '<i class="fa fa-star" aria-hidden="true"></i>';
		let ratingScore = document.createElement("span");
		ratingScore.classList.add("rating-score");
		ratingScore.appendChild(document.createTextNode(apiCallResult.imdbRating));
		ratingDiv.appendChild(ratingScore);
	}

	let ratingMax = document.createElement("span");
	ratingMax.classList.add("rating-max");
	ratingMax.appendChild(document.createTextNode("/10"));
	ratingDiv.appendChild(ratingMax);

	let saveToFavourites = document.createElement("span");
	saveToFavourites.classList.add("save-to-favorites");
	let saveIcon = document.createElement('i');
	saveIcon.innerHTML = '<i class="fas fa-save" aria-hidden="true"></i>';

	saveToFavourites.appendChild(saveIcon);
	movieContainer.appendChild(saveToFavourites);

	saveToFavourites.addEventListener("click", function (){
		showAddToFavouritesModalBox(apiCallResult);
	});

	// movieContainer.addEventListener("click", function (event){
	// 	if (event.target.id == "movie-poster-anchor"){
	// 		//do nothing
	// 		//since we just want to avoid showing modalbox in this case
	// 	} else {
	// 		showAddToFavouritesModalBox(apiCallResult);
	// 	}
	// });


	//resultChildrenCounter.set = 5;
	//console.log(Math.random() + " and " + resultChildrenCounter.get);

	/*
	console.log(Math.random() + " and " + resultChildrenCounter.children);
	//is it setting counter to 0 every time i call it?

	let intVar = 5;
	let something = {
		x : 10,
		y : function() {
			x = 15;
			console.log(`från inuti ${x}`);
		}
	};
	something.y;
		console.log(`från utanför XXXX ${something.x}`);
	*/


	//TODO: wip
	//what I want to do is make sure the height of the sidebar menu matches the page height
	//this is one of the times where page height is changed
	//which means i can use tihs to test:
	//the page height get increased by each movie card
	//then match height of sidebar to parent (#container)
	//do this for each card. but doesn't work atm.
	//might be because sidebar div is absolute, so the background-color doesn't render where there is no content

	let favouriteMovieContainer = document.getElementById('favourite-movies-container')
	favouriteMovieContainer.style.height = favouriteMovieContainer.parentNode.offsetHeight+"px";

	/*
	when I wrote this function I initially had some really awkward design
	it was my first usage of async functions
	i tried to explain (to myself) async functions and promises through comments here and there
	leaving all comments below
	*/

	//handling sync is quite awkward at the moment
	//first usage of promise and async
	//found some fetch magic online
	//will try to document for my own sake

	//im running the async fun fetchMoreMovieInfo (a thenable promise)
	//which returns a rating after the request comes through
	//when the fetch has been resolved it moves to .then
	//.then has a callback (function, object) attached to it
	//generateNodes creates the appropriate nodes
	//the items are displayed and task is complete

	//this method generates the design for each movie card
	//rating, title, actors, etc

	/*
	this comment below from a different (async) function, where I made another apicall by imdbID
	i also used this result, so in effect i had two results from two api calls that could've been done with one
	*/

	//this is an async function (A promise, right?)
	//allowing us to use await
	//await forces the compiler to wait for the given task to be completed before proceeding
	//(only stops locally, not the entire program)
	//when the fetch as been resolved, the compiler tries to declare an object and give it the return value of res.json();
	//it then returns the imdbRating and the program proceeds as normally

}

//showing the modal box for saving movies
function showAddToFavouritesModalBox(entryFromAJAX) {
	let span = document.getElementsByClassName("close")[0];
	let cancel = document.getElementById("cancel");
	let save = document.getElementById("save");
	let modal = document.getElementById("modal-box")

	modal.style.display = "block";

	span.onclick = function() {
		modal.style.display = "none";
	}
	cancel.onclick = function (){
		modal.style.display = "none";
	}
	window.onclick = function(event){
		if (event.target == modal){
			modal.style.display = "none";
		}
	}
	save.onclick = function (){
		modal.style.display = "none";
		saveMovieToFavourite(entryFromAJAX);
	}

}

function showAlreadyAddedModalBox() {
	//all of these vars have terrible names

	let okay = document.getElementById("okay");
	let alreadyAdded = document.getElementById("modal-box-already-added");
	let close = alreadyAdded.getElementsByClassName("close")[0];

	alreadyAdded.style.display = "unset";

	close.onclick = function() {
		alreadyAdded.style.display = "none";
	}
	window.onclick = function(event){
		if (event.target == alreadyAdded){
			alreadyAdded.style.display = "none";
		}
	}
	okay.onclick = function (){
		alreadyAdded.style.display = "none";
	}
}

function saveMovieToFavourite(entryFromAJAX) {
	//TODO: update to work with firebase db, see below
	//if statement of hamburger pulse needs updating
	//and add(pulse-grey-anim)

	checkIfMovieAlreadyInFavourites(entryFromAJAX).then(function (boolean) {
		if (boolean){
			showAlreadyAddedModalBox();
		} else {
			let favouriteMoviesUL = document.getElementById("favourite-movies-list");

			if (!document.getElementById("input-hamburger").checked && favouriteMoviesUL.childElementCount == 0){
				document.getElementById("slice1").classList.add("pulse-grey-animation");
				document.getElementById("slice2").classList.add("pulse-grey-animation");
				document.getElementById("slice3").classList.add("pulse-grey-animation");
			}

			if (document.getElementById("input-hamburger").checked){
				//favouriteMoviesUL.lastElementChild.classList.add("pulse-grey-animation");
			}

			let statusOfList = "notEmpty";
			handlePlaceholderSpan(statusOfList);

			pushFavouriteMovie(entryFromAJAX);
			readFavouriteMoviesList().then(snapshot => populateFavouriteMoviesList(snapshot));
		}

	});

}

function populateFavouriteMoviesList(snapshot) {
	// this function populates the favmovieslist in the sidebar
	// it takes a snapshot of the current user's branch that was passed from readFavouriteMoviesList() in dataAccessLayer.js
	// it then creates the html elements

	let favouriteMoviesUL = document.getElementById("favourite-movies-list");
	favouriteMoviesUL.querySelectorAll('*').forEach(n => n.remove());

	snapshot.forEach(function (snapshot){

		let movieObj = snapshot.val();

		let li = document.createElement("li");
		li.id = 'favourite-movie-li';
		favouriteMoviesUL.appendChild(li);

		let a = document.createElement("a");
		let url = "https://www.imdb.com/title/" + snapshot.key + "/";
		a.href = url;
		a.classList.add("favourite-movie-anchor");
		li.appendChild(a);

		a.appendChild(document.createTextNode(
			movieObj.title + " (" + movieObj.year + ")"
		));

		//this span displays rating-star and rating
		let ratingSpan = document.createElement("span");
		ratingSpan.innerHTML = "<i class=\"fa fa-star\" aria-hidden=\"true\"></i>";
		ratingSpan.appendChild(document.createTextNode(" " + movieObj.rating));
		ratingSpan.classList.add("favourites-list-rating-span");

		a.appendChild(ratingSpan);

		let deleteSpan = document.createElement("span");
		deleteSpan.innerHTML = "<i class=\"fas fa-trash\"></i>";
		deleteSpan.classList.add("delete-span");
		//TODO: add this span next to the entire list item, instead of inside the list item?
		//to avoid it jumping rows when no space left

		if (deleteSpan.style.display != "none"){
			deleteSpan.style.display = "none";
		}

		deleteSpan.addEventListener("click", function (event){
			deleteMovie(snapshot.key, event);
		});

		li.appendChild(deleteSpan);

	});
}

function favouriteMoviesHamburgerListener() {
	// whenever the user opens the sidebar menu with favourite movies
	// this will update list with values from db
	// necessary to call every time because -->
	// --> user could've added favourites while closed
	let inputHamburgerCheckbox = document.getElementById("input-hamburger");

	inputHamburgerCheckbox.addEventListener( 'change', function() {
		if (this.checked) {
			if (getFirebaseAuth().currentUser != null){
				readFavouriteMoviesList().then(snapshot => populateFavouriteMoviesList(snapshot));
			}
		}
	});
}

function handlePlaceholderSpan(statusOfList) {
	// this fun takes a string that indicates whether the favlist is empty, !empty, or unknown
	// in the case of empty || !empty, hide/show divs etc
	// in the case of unknown, fun will do check and then hide/shows divs etc

	// first this fun just checked everytime (Read from db)
	// and then hide/show divs etc
	// but in this way, in some conditions, when we already now if empty or !empty, it will faster

	let favouriteMoviesUL = document.getElementById("favourite-movies-list");
	let placeholderSpan = document.getElementById("empty-list-placeholder");
	let showListButton = document.getElementById("show-favourite-movies");
	let editFavouriteMoviesIcon = document.getElementById("edit-favourite-movies-icon");

	if (statusOfList === "empty"){
		placeholderSpan.style.display = "block";
		showListButton.style.display = "none";
		favouriteMoviesUL.style.display = "none";
		editFavouriteMoviesIcon.style.display = "none";

	} else if (statusOfList === "notEmpty"){
		placeholderSpan.style.display = "none";
		showListButton.style.display = "inline-block";
		favouriteMoviesUL.style.display = "unset";
		editFavouriteMoviesIcon.style.display = "unset";

	} else if (statusOfList === "unknown"){
		// unknown if list is empty or not
		// perform check and act accordingly

		readFavouriteMoviesList().then(function (snapshot){
			if (!snapshot.hasChildren()){
				placeholderSpan.style.display = "block";
				showListButton.style.display = "none";
				favouriteMoviesUL.style.display = "none";
				editFavouriteMoviesIcon.style.display = "none";
			} else {
				placeholderSpan.style.display = "none";
				showListButton.style.display = "inline-block";
				favouriteMoviesUL.style.display = "unset";
				editFavouriteMoviesIcon.style.display = "unset";

			}
		});
	}

}

function favouriteMoviesIconListener() {
	let editFavouriteMovies = document.getElementById("edit-favourite-movies-icon");
	editFavouriteMovies.addEventListener("click", editOrConfirmStateChange);

	//following code was educational but can be replaced with one line
	//therefore doing so, but leaving code here, in comments

	//this code forces the 'edit' icon on page reload
	//the sessionStorage will expire on each page reload

	// editFavouriteMovies.classList.remove("confirm-favourite-movies");
	// sessionStorage.setItem("notEditing", "true");

	//localStorage does NOT expire on page reload

	// window.onload = function() {
	// 	let notEditing = localStorage.getItem('notEditing');
	// 	if (notEditing === 'true'){
	// 		editFavouriteMovies.classList.remove("confirm-favourite-movies");
	// 		}
	// 	}
	// }

	//this code forces the 'edit' icon on page reload
	editFavouriteMovies.classList.remove("confirm-favourite-movies");

}

function editOrConfirmStateChange() {
	//this fun changes whether the user is currently editing their favouriteMovieList -->
	// --> or if they already confirmed edits
	//we toggle a class that changes the icon to "check"
	//when the icon is pressed, it'll display or hide the trashcan icon

	let editFavouriteMovies = document.getElementById("edit-favourite-movies-icon");
	editFavouriteMovies.classList.toggle("confirm-favourite-movies");

	let favouriteMoviesUL = document.getElementById("favourite-movies-list");
	let deleteSpanList = favouriteMoviesUL.getElementsByClassName("delete-span");
	for (let i = 0; i < deleteSpanList.length; i++) {
		if (deleteSpanList[i].style.display == "none"){
			deleteSpanList[i].style.display = "unset";
		} else {
			deleteSpanList[i].style.display = "none";
			readFavouriteMoviesList().then(snapshot => populateFavouriteMoviesList(snapshot));
		}
	}

}

function deleteMovie(imdbID, event) {
	//this fun calls fun in dal.js, which deletes movie from db
	//it then simply hides the li that was clicked
	//this is faster than repopulating
	//and if we repopulate, it'll reset the trashcan state (hide vs show)

	//in future, can implement a successfull/failure check in dal
	//and then return true/false to deletemovie, and call deleteFromFav.then

	deleteFromFavouriteMovies(imdbID);
	event.target.parentNode.parentNode.style.display = "none";

	checkIfUserBranchHasChildren().then(function (hasChildren){
		if (!hasChildren){
			editOrConfirmStateChange();

			let statusOfList = "unknown";
			handlePlaceholderSpan(statusOfList);
		}
	})

}

function showFavouriteMoviesListener() {
	//this function allows us to resolve the promise given by readFavMovList in dal
	//and pass the snapshot to displayFavMovies

	let showFavouriteMoviesBtn = document.getElementById("show-favourite-movies");
	showFavouriteMoviesBtn.addEventListener("click", function (){

		// this code shows the loading animation div
		let loadingResults = document.getElementById("loading-results");
		loadingResults.style.display = "inline-block";

		readFavouriteMoviesList().then(snapshot => displayFavouriteMovies(snapshot));
	});
}

function displayFavouriteMovies(snapshot) {
	//this fun takes the movies that the user saved to favourites -->
	// --> and displays them in the main result container

	//this clears whatever result is previously displayed
	let resultContainer = document.getElementById('result-container');
	resultContainer.innerHTML = "";

	//this generates a list of movies in the main result container, based on imdbID
	snapshot.forEach(function (snapshot) {
		let key = snapshot.key;
		apiHandlerByImdbID(key);
	});

}

function authStateChanged(firebaseUser) {
	//this fun is called when the fireBase user changes state (sign in or out)
	//a fun in DAL is called at that point
	//that fun calls this fun and passes either the firebaseUser
	//the firebaseUser has properties on SIGN IN
	//the firebaseUser is null on LOG OFF

	let firebaseUISignupContainer = document.getElementById("firebaseui-signup-container");
	let authStatus = document.getElementById("auth-status");
	let authWelcome = document.getElementById('auth-welcome');
	let authName = document.getElementById("auth-name");
	let signOutContainer =  document.getElementById('sign-out-container');
	let titleAndListContainer =  document.getElementById("title-and-list-container");
	let favouriteMovieContentContainer = document.getElementById('favourite-movies-content-container');
	let hr = favouriteMovieContentContainer.querySelectorAll('hr');

	if (firebaseUser){
		firebaseUISignupContainer.style.display = "none";
		signOutContainer.onclick = firebaseSignOut;
		signOutContainer.style.display = "unset";
		titleAndListContainer.style.display = "unset";

		if (firebaseUser.displayName == null){
			authWelcome.innerHTML = 'Welcome, ';
			authName.innerHTML = 'Guest';
		} else{
			authWelcome.innerHTML = 'Welcome, ';
			authName.innerHTML = firebaseUser.displayName;
		}
		authStatus.style.display = "unset";

		hr.forEach(function (n) {
			n.style.display = "unset";
		});

	} else {
		firebaseUISignupContainer.style.display = "unset";
		authStatus.style.display = "none";
		signOutContainer.style.display = "none";
		titleAndListContainer.style.display = "none";

		hr.forEach(function (n) {
			n.style.display = "none";
		});
	}
}

/**********************
	ENDLESS SCROLLING
 *********************/

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

let currentPage = 1;
//TODO: create function for resetting the resultcontainers
// reset this counter

let handleEndlessScroll = debounce(function(queryText) {
	// What this code does:
	// Determine if

	/*
	issue: im checking if collectoin of all elements with class "movie-container" === 10
	if have >1 page, it will always true
	but if the newly loaded page has <10 it should be false
	therefore, need to look at the page (loaded set of moviecontainers)
	which comes out to the last resultContainer,
	because ill stack them, for every new page

	genereateResultContainer
	Look at last RC
	do logic
	 */

	let resultContainerList = document.getElementsByClassName("result-container");
	let resultContainer = resultContainerList[resultContainerList.length - 1];

	let movieContainerList = resultContainer.getElementsByClassName("movie-container");

	console.log(movieContainerList.length);

	// every page from the AJAX call holds max 10 movies
	// therefore, as long as the length is evenly divisible by 10,
	// there are further pages to load
	// this check evaluates to true if evenly divisible by 10
	if (movieContainerList.length % 10 === 0) {

		// -1 because index starts at 0, length start at 1
		let lastMovie = movieContainerList[movieContainerList.length - 1];

		if ((window.scrollY + window.innerHeight) > (lastMovie.offsetTop +  lastMovie.offsetHeight)) {
			currentPage++;
			requestNewPage(queryText);
		}
	}
}, 500);

function requestNewPage(queryText) {
	// this code will fetch result from AJAX call based on currentPage

	//define api request variables
	const omdbAPI = new XMLHttpRequest();
	const omdbURL = `https://www.omdbapi.com/?&apikey=${API_KEY}&s=${queryText}&page=${currentPage}`;

	//adding listener to request
	omdbAPI.addEventListener("load", function() {

		//saving result
		let result = JSON.parse(this.responseText);

		result.Search.forEach(function (entry){
			apiHandlerByImdbID(entry.imdbID);
		});

	});

	//executing api request
	omdbAPI.open("get", omdbURL, true);
	omdbAPI.send();

}


/********************************************************************
 beneath this point shall all
 'unwanted-but-possibly-useful-down-the-line' lines of code
 be kept
 ********************************************************************/

function toggleHideFavouriteMovies() {
	//TODO: delete if fav-movies sidebar is working as intended
	// //trying to make it so the sidebar doesn't cover container div, even when not clicked
	// let inputToggleFavouriteMovies = document.getElementById("input-hamburger");
	// let favouriteMoviesContainer = document.getElementById("favourite-movies-container");
	//
	// if (inputToggleFavouriteMovies.checked){
	// 	favouriteMoviesContainer.style.zIndex = "95";
	// } else {
	// 	document.getElementById("container").style.zIndex = "5";
	// 	favouriteMoviesContainer.style.zIndex = "1";
	// 	// i think it odesnt work bcus body is covering input
	// }
	//
	// document.getElementById("slice1").style.zIndex = "-5";
	// document.getElementById("slice2").style.zIndex = "-5";
	// document.getElementById("slice3").style.zIndex = "-5";
	//
	// inputToggleFavouriteMovies.style.zIndex = "15010";

	// if (inputToggleFavouriteMovies.checked){
	// 	document.getElementById('favourite-movies-container').style.display = "block";
	// 	document.getElementById("search-box").style.backgroundColor = "blue";
	// } else {
	// 	document.getElementById('favourite-movies-container').style.display = "none";
	// 	document.getElementById("search-box").style.backgroundColor = "white";
	// }
	//if i can make the span and input be positioned outside out of the div
	//i can hide the container of fav movs on click
	//and use the flexbox pattern

}

/*leaving some notes from programming diary

Event-driven languages, and callbacks
Imdb ratings lookup tool
16/06/2020

Bumped into an issue when creating my imdb rating lookup tool. 
Javascript is apparently an event-driven language, which means the compiler doesn't wait for responses when executing code, but instead continues with the next operation.
This can be tricky, when you want to wait for a function to finish executing, for example in-order to update a variable value. 
In my case my return statement returns the initial variable declaration, 0, instead of the updated value. 
Because the value, updated by an event listener, has been updated after the return statement is executed.
*/