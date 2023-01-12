import bot from "./assets/bot.jpeg";
import user from "./assets/user.jpg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

let storedName = localStorage.getItem("name");
let yourName;
if (storedName !== "null" && storedName !== null) {
	yourName = localStorage.getItem("name");
} else {
	yourName = window.prompt("Whats your name ?");
  if (yourName === "") {
    yourName = "User";
  }
	localStorage.setItem("name", yourName);
}

let storedProfile = localStorage.getItem("profile");
let yourProfile;
console.log(storedProfile);
if (storedProfile !== "null" && storedProfile !== null) {
	yourProfile = localStorage.getItem("profile");
} else {
	yourProfile = "/assets/user.svg";
}

let storedMessages = localStorage.getItem("messages");
let yourMessages;
if (storedMessages !== "null" && storedMessages !== null) {
  yourMessages = localStorage.getItem("messages");
} else {
  yourMessages = 0;
}

let userName = document.getElementById('yourUsername')
userName.innerHTML = yourName;
let messagesCount = document.getElementById('messagesCount')
let messageCountNumber = parseInt(yourMessages);
messagesCount.innerHTML = yourMessages



// Load the bot message
function loader(element) {
	element.textContent = "";
	let loadingLetters = ["L", "o", "a", "d", "i", "n", "g", ".", ".", "."];

	let numbers = 0;
	loadInterval = setInterval(() => {
		numbers += 1;
		// Update the text content of the loading indicator
		element.textContent += loadingLetters[numbers - 1];

		// If the loading indicator has reached three dots, reset it
		if (element.textContent === "Loading...") {
			element.textContent = "";
			numbers = 0;
		}
	}, 150);
}

// Bot typing Text...
function typeText(element, text) {
	element.innerHTML = text;
}

// Generate unique id for bot message
function generateUniqueId() {
	const timeStamp = Date.now();
	const randomNumber = Math.random();
	const hexadecimalString = randomNumber.toString(16);

	return `id-${timeStamp}-${hexadecimalString}`;
}
let repeatMessage;
// Lines in chat based if is or not the bot message
function chatStripe(isAi, value, uniqueId) {
	if (yourName == undefined) {
		yourName = "User";
	}
	repeatMessage = "";
	if (user) {
		repeatMessage = value;
	}
	console.log(yourProfile);
	return `
      <div style="border-radius: 20px; margin-top: 5px; width: 80%" class="wrapper ${isAi ? "ai" : "user"}">
          <div class="chat">
              <div class="profile">
                  <img 
              src="${isAi ? bot : yourProfile}"
              alt="${isAi ? "bot" : "user"}"
              />
              </div>
                <p style="color:white; font-size: 20px; font-weight: 600">${isAi ? "Pedro IA:" : yourName + ":"}</p>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `;
}

let waitingResults = 0;
// Handle the message sent
const handleSubmit = async (e) => {
	e.preventDefault();
  messageCountNumber += 1;
  messagesCount.innerHTML = messageCountNumber;
  localStorage.setItem("messages", messageCountNumber)
	if (waitingResults === 1) {
		return;
	}
	waitingResults = 1;

	const data = new FormData(form);

	// user's chatstripe
	chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

	console.log(repeatMessage);

	form.reset();

	// bot's chatstripe
	const uniqueId = generateUniqueId();
	chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

	chatContainer.scrollTop = chatContainer.scrollHeight;

	const messageDiv = document.getElementById(uniqueId);

	loader(messageDiv);

	// fetch data from server -> bot's response

	const response = await fetch("https://pedro-ai.onrender.com/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt: data.get("prompt"),
		}),
	});

	clearInterval(loadInterval);
	messageDiv.innerHTML = "";

	if (response.ok) {
		const data = await response.json();
		const parsedData = data.bot.trim();

		console.log({ parsedData });

		typeText(messageDiv, parsedData);

		waitingResults = 0;
	} else {
		const err = await response.text();

		messageDiv.innerHTML = "Something went wrong";
		//alert(err);
		document.getElementById("placeIWrite").innerHTML = repeatMessage;

		waitingResults = 0;
	}
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
	if (e.keyCode === 13 && !e.shiftKey) {
		handleSubmit(e);
	}
});

const profilePicture = document.getElementById("profile_picture");
if (yourProfile) {
	profilePicture.src = yourProfile;
}

// Add a check to make sure the URL is valid
profilePicture.addEventListener("click", function () {
	// Prompt the user for a new background image URL
	var newBackgroundImageURL = prompt("Please enter a new background image URL:");

	// Check if the URL is valid
	if (newBackgroundImageURL && newBackgroundImageURL.match(/^https?:\/\/.*\.(jpg|png|gif)$/)) {
		// Set the background image of the body element to the new URL
		profilePicture.src = newBackgroundImageURL;
		localStorage.setItem("profile", profilePicture.src);
    yourProfile = localStorage.getItem("profile");
	} else {
		alert("Please enter a valid image URL"); // Alert user if invalid URL is entered
	}
});

const showedUserName = document.getElementById("yourUsername");
  showedUserName.addEventListener('click', function() {
    let newName = localStorage.setItem("name", prompt("Whats your username ?"))
    yourName = localStorage.getItem("name");
    userName.innerHTML = localStorage.getItem("name");
  })
