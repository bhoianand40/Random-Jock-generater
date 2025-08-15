function getJoke() {
  const modal = document.getElementById("modal");
  const jokeText = document.getElementById("jokeText");
  const category = document.getElementById("category").value || "Any";

  modal.classList.add("show");

  fetch(`https://v2.jokeapi.dev/joke/${category}?safe-mode`)
    .then(res => res.json())
    .then(data => {
      let joke = "";
      if (data.type === "single") {
        joke = data.joke;
      } else {
        joke = `${data.setup} 😅 ${data.delivery}`;
      }

      // Ensure joke is visible and animate typing
      jokeText.classList.remove("typing");
      void jokeText.offsetWidth; // restart animation
      jokeText.textContent = joke;
      jokeText.style.opacity = 1; // ensure it's visible
      jokeText.classList.add("typing");

      addToHistory(joke);
      if (isVoiceOn()) speakJoke(joke);
    })
    .catch(() => {
      jokeText.textContent = "Oops! Failed to load a joke 😢";
      jokeText.style.opacity = 1;
    })
    .finally(() => {
      setTimeout(() => {
        modal.classList.remove("show");
      }, 800);
    });
}

function copyJoke() {
  const joke = document.getElementById("jokeText").textContent;
  navigator.clipboard.writeText(joke).then(() => alert("📋 Joke copied!"));
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function toggleVoice() {
  const voiceState = document.getElementById("voiceState");
  voiceState.textContent = voiceState.textContent === "ON" ? "OFF" : "ON";
}

function isVoiceOn() {
  return document.getElementById("voiceState").textContent === "ON";
}

function speakJoke(text) {
  const lang = document.getElementById("language").value;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "en" ? "en-US" : lang; // basic mapping
  speechSynthesis.speak(utterance);
}

function addToHistory(joke) {
  const ul = document.getElementById("historyList");
  const li = document.createElement("li");
  li.textContent = joke;
  ul.prepend(li);
  if (ul.children.length > 10) ul.removeChild(ul.lastChild); // limit to last 10 jokes
}

function translateJoke() {
  const lang = document.getElementById("language").value;
  const joke = document.getElementById("jokeText").textContent;
  if (lang === "en") {
    alert("Joke is already in English!");
    return;
  }

  fetch("https://libretranslate.de/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: joke,
      source: "en",
      target: lang,
      format: "text"
    })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("jokeText").textContent = data.translatedText;
      if (isVoiceOn()) speakJoke(data.translatedText);
    })
    .catch(() => alert("🌐 Translation failed."));
}
