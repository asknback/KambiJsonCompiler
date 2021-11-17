// Keep track of arrys for each event group
let aSports = [];
let aCountries = [];
let aLeagues = [];

// Set term keys to use in URL to fetch league
let choosenSport = 'football/';
let choosenCountry = 'england/';
let choosenLeague = 'premier_league/';

// Setup the markup we work with
const sport_wrapper = document.getElementById('sport_wrapper');
const sport_drop = document.getElementById('sport_drop');
const country_wrapper = document.getElementById('country_wrapper');
const country_drop = document.getElementById('country_drop');
const league_wrapper = document.getElementById('league_wrapper');
const league_drop = document.getElementById('league_drop');
const createJson_wrapper = document.getElementById('createJson_wrapper');
const cancel_button = document.getElementById('cancel_button');
const createJson_button = document.getElementById('createJson_button');


// INIT 
function initJsonCreator() {
	let requestURL = 'https://api.aws.kambicdn.com/offering/v2018/kambi/group.json?lang=en_GB&market=GB&client_id=2&ncid=1633773102364';
	let request = new XMLHttpRequest();
	request.open('GET', requestURL);
	request.responseType = 'text';
	request.send();

	request.onload = function() {
		const groupData = request.response;
		const groupJson = JSON.parse(groupData);
		aSports = groupJson.group.groups;
		createSportsDrop();
	}
}

initJsonCreator();
	
// SPORT
function createSportsDrop() {

	hideWrapper([country_wrapper, league_wrapper, createJson_wrapper]);
	clearDropbox(sport_drop);

	sport_drop.onchange = function(){
		let id = this.value;
		let index = aSports.findIndex(function(item, i){ 
		return parseInt(item.id) === parseInt(id);
		});
		aCountries = aSports[index].groups;
		choosenSport = aSports[index].termKey + "/";
		createCountryDrop();
	}

	let optionPlaceholder = document.createElement("option");
	optionPlaceholder.value = "";
	optionPlaceholder.text = "Event group 1:";
	optionPlaceholder.setAttribute("selected","");
	optionPlaceholder.setAttribute("hidden",""); 
	optionPlaceholder.setAttribute("disabled","");
	sport_drop.appendChild(optionPlaceholder);

	for (const val of aSports) {
		let option = document.createElement("option");
		option.value = val.id;
		option.text = val.name;
		sport_drop.appendChild(option);
	}
}

// COUNTRY
function createCountryDrop() {

	country_wrapper.style.display = 'inline-block';
	hideWrapper([league_wrapper, createJson_wrapper]);
	clearDropbox(country_drop);

	country_drop.onchange = function(){
		let id = this.value;
		let index = aCountries.findIndex(function(item, i){ 
		return parseInt(item.id) === parseInt(id);
		});
		aLeagues = aCountries[index].groups;
		choosenCountry = aCountries[index].termKey + "/";
		choosenLeague = "all/";

		if (aLeagues === undefined) {  //Check if this has children or is a "league"
		fetchEventsJson(); //If this is a league
		} else {
		createLeagueDrop(); //If this is a country
		}
	}

	let optionPlaceholder = document.createElement("option");
	optionPlaceholder.value = "";
	optionPlaceholder.text = "Event group 2:";
	optionPlaceholder.setAttribute("selected","");
	optionPlaceholder.setAttribute("hidden",""); 
	optionPlaceholder.setAttribute("disabled","");
	country_drop.appendChild(optionPlaceholder);

	for (const val of aCountries) {
		let option = document.createElement("option");
		option.value = val.id;
		option.text = val.name;
		country_drop.appendChild(option);
	}
}

// LEAGUE
function createLeagueDrop() {

	league_wrapper.style.display = 'inline-block';
	hideWrapper([createJson_wrapper]);
	clearDropbox(league_drop);

	league_drop.onchange = function(){
		let id = this.value;
		let index = aLeagues.findIndex(function(item, i){ 
		return parseInt(item.id) === parseInt(id);
		});
		choosenLeague = aLeagues[index].termKey + "/";
		console.log(choosenLeague);
		fetchEventsJson();
	}

	let optionPlaceholder = document.createElement("option");
	optionPlaceholder.value = "";
	optionPlaceholder.text = "Event group 3:";
	optionPlaceholder.setAttribute("selected","");
	optionPlaceholder.setAttribute("hidden",""); 
	optionPlaceholder.setAttribute("disabled","");
	league_drop.appendChild(optionPlaceholder);

	for (const val of aLeagues) {
		let option = document.createElement("option");
		option.value = val.id;
		option.text = val.name;
		league_drop.appendChild(option);
	}
}


function fetchEventsJson() {
	let newUrl = 'https://api.aws.kambicdn.com/offering/v2018/kambi/listView/' + choosenSport + choosenCountry + choosenLeague + 'all/matches.json?lang=en_GB&market=GB&client_id=2&channel_id=1&ncid=1633683214026&useCombined=true&useCombinedLive=true'
	// console.log(newUrl)
	let requestURL = newUrl;
	let request = new XMLHttpRequest();
	request.open('GET', requestURL);
	request.responseType = 'text';
	request.send();

	request.onload = function() {
		const kambiData = request.response;
		const kambiJson = JSON.parse(kambiData);
		console.log(kambiJson.events)
		setupJson(kambiJson);
	}
}


function setupJson(jsonObj) {
	const eventsJson = jsonObj.events;

	let newJson = {};
	let events = [];

	newJson = events;

	for(let i = 0; i < eventsJson.length; i++) {
		const event = {};
		event.homeName = eventsJson[i].event.homeName;
		event.awayName = eventsJson[i].event.awayName;
		
		for(let j = 0; j < eventsJson[i].betOffers.length; j++) {
			const boName = eventsJson[i].betOffers[j].betOfferType.englishName.replace(/\W/g, '');

			// event[boName + '_Betoffer_Type'] = eventsJson[i].betOffers[j].betOfferType.englishName;
			for(let k = 0; k < eventsJson[i].betOffers[j].outcomes.length; k++) {
				event[boName + '__Label--' + k] = eventsJson[i].betOffers[j].outcomes[k].englishLabel;
				if (eventsJson[i].betOffers[j].outcomes[k].line !== undefined) {
				event[boName + '__Line--' + k] = formatDecimalOdds(eventsJson[i].betOffers[j].outcomes[k].line);
				}
				event[boName + '__Odds--' + k] = formatDecimalOdds(eventsJson[i].betOffers[j].outcomes[k].odds);
				event[boName + '__AmOdds--' + k] = eventsJson[i].betOffers[j].outcomes[k].oddsAmerican;
			}
		}
		events.push(event);
	}

	createJson_wrapper.style.display = 'block';
	createJson_button.onclick = function() {
		exportEventsToJsonFile(events);
	};
	cancel_button.onclick = () => { 
		cancelPlugin();
	};
}


function exportEventsToJsonFile(jsonData) {
	let dataStr = JSON.stringify(jsonData);
	let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

	let name = choosenSport.replace(/\W/g, '') + "_" + choosenCountry.replace(/\W/g, '') + "_" + choosenLeague.replace(/\W/g, '');
	let exportFileDefaultName = name + '.json';

	let linkElement = document.createElement('a');
	linkElement.setAttribute('href', dataUri);
	linkElement.setAttribute('download', exportFileDefaultName);
	linkElement.click();

	console.log("JSON data is saved.");
}


// // // // // // 
// HELPER FUNCTIONS
// // // // // // 

// Format decimal odds since they are listed as 1000
function formatDecimalOdds(odds) {
	let updatedOdds = odds/1000;
	return Number.parseFloat(updatedOdds).toFixed(2);
}

// Hide wrappers we don't want to use yet
function hideWrapper(array) {
	for (const element of array) {
		element.style.display = 'none';
	}
}

// Clear dropbox before we populate with new data
function clearDropbox(drop) {
	drop.removeAttribute('disabled');
	while (drop.options.length > 0) {                
		drop.remove(0);
	}
}

function cancelPlugin() {
	parent.postMessage({ pluginMessage: { 'type': 'cancel' } }, '*')
}