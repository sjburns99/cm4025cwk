function runCalc() {
	var hours = 20;
	var jobType = "Junior";
	var hrRate;
	switch(jobType) {
		case "Junior": 
			hrRate = 10; 
			break;
		case "Standard": 
			hrRate = 20; 
			break;
		case "Senior": 
			hrRate = 30; 
			break;
		default: 
			hrRate = 0;
	}
  
	var modifier = getRandomInt(5, 15) / 10;
		
	if (getRandomInt(0, 1) == 0) {
		hours *= modifier;
	}
	else {
		hrRate *= modifier;
	}
	
	var costPer = hours * hrRate;
	return costPer;
}

function getRandomInt(min, max) {
	//https://www.w3schools.com/js/js_random.asp
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function checkPasswordMatch(pass1, pass2) {
	if(pass1 != pass2) {
		return false
	}
	else {
		return true
	}
}

function replaceUsernameText(string) {
	usernameText = document.getElementById("usernameText");
	usernameText.innerHTML = string;
}

module.exports = {
	checkPasswordMatch,
	runCalc,
	replaceUsernameText
}