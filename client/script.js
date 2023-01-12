import bot from "./assets/bot.jpeg";
import user from "./assets/user.jpg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;


let storedName = localStorage.getItem("name");
let yourName
console.log(storedName)
if (storedName !== 'null' || !storedName || storedName === null) {
  yourName = localStorage.getItem("name")
} else {
  yourName = window.prompt("Whats your name ?")
  localStorage.setItem("name", yourName);
  console.log(yourName)
}

// Load the bot message
function loader(element) {
  element.textContent = ''
  let loadingLetters = ["L", "o", "a", "d", "i", "n", "g", ".", ".", "."]

  let numbers = 0
  loadInterval = setInterval(() => {
    numbers += 1
      // Update the text content of the loading indicator
      element.textContent += loadingLetters[numbers-1];

      // If the loading indicator has reached three dots, reset it
      if (element.textContent === 'Loading...') {
        element.textContent = '';
        numbers = 0
      }
  }, 300);
}

// Bot typing Text...
function typeText(element, text) {
  element.innerHTML = text
}

// Generate unique id for bot message
function generateUniqueId() {
	const timeStamp = Date.now();
	const randomNumber = Math.random();
	const hexadecimalString = randomNumber.toString(16);

	return `id-${timeStamp}-${hexadecimalString}`;
}

// Lines in chat based if is or not the bot message
function chatStripe(isAi, value, uniqueId) {
  console.log(yourName);
  if (yourName == undefined) {
    yourName = "User"
    yourName = window.prompt("Whats your name ?")
    localStorage.setItem("name", yourName);
  }
	return `
      <div class="wrapper ${isAi && "ai"}">
          <div class="chat">
              <div class="profile">
                  <img 
              src="${isAi ? bot : user}"
              alt="${isAi ? "bot" : "user"}"
              />
              </div>
                <p style="color:white; font-size: 20px; font-weight: 600">${isAi ? "Pedro IA" : yourName}</p>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `;
}

let waitingResults = 0;
// Handle the message sent
const handleSubmit = async (e) => {
	e.preventDefault();
  if (waitingResults === 1) {
    return
  }
  waitingResults = 1;

	const data = new FormData(form);

	// user's chatstripe
	chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

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

    console.log({parsedData})

		typeText(messageDiv, parsedData);

    waitingResults = 0;
	} else {
		const err = await response.text();

		messageDiv.innerHTML = "Something went wrong";
		alert(err);

    waitingResults = 0;
	}
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
	if (e.keyCode === 13 && !(e.shiftKey)) {
		handleSubmit(e);
	}
});