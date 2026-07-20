"use strict";

var STORE_PER_SPEAKER = "standup.perSpeaker";
var STORE_ITEMS = "standup.items";
var WARNING_SECONDS = 60;

var el = {
  app: document.getElementById("app"),
  time: document.getElementById("time"),
  status: document.getElementById("status"),
  fill: document.getElementById("fill"),
  speaker: document.getElementById("speaker"),
  pause: document.getElementById("pause"),
  next: document.getElementById("next"),
  perSpeaker: document.getElementById("per-speaker"),
  addForm: document.getElementById("add-form"),
  itemInput: document.getElementById("item-input"),
  items: document.getElementById("items")
};

// --- state ---
var perSpeaker = loadPerSpeaker();  // seconds allotted per speaker
var remaining = perSpeaker;         // seconds left; negative once over time
var running = false;
var endTime = 0;                    // Date.now() ms when remaining hits 0, while running
var speakerNum = 1;
var ticker = null;

// --- persistence ---
function loadPerSpeaker() {
  var raw = parseInt(localStorage.getItem(STORE_PER_SPEAKER), 10);
  return raw > 0 ? raw : 120;
}
function loadItems() {
  try {
    var parsed = JSON.parse(localStorage.getItem(STORE_ITEMS));
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}
function saveItems(items) {
  localStorage.setItem(STORE_ITEMS, JSON.stringify(items));
}

// --- formatting ---
function pad(n) { return n < 10 ? "0" + n : "" + n; }

function formatClock(secs) {
  var over = secs < 0;
  var abs = Math.abs(secs);
  var m = Math.floor(abs / 60);
  var s = abs % 60;
  return (over ? "+" : "") + pad(m) + ":" + pad(s);
}

function formatStatus(secs) {
  if (secs > 0) {
    return loose(secs) + " remaining";
  }
  if (secs === 0) {
    return "Time's up";
  }
  return loose(-secs) + " over";
}

function loose(secs) {
  if (secs < 60) return secs + "s";
  return Math.floor(secs / 60) + ":" + pad(secs % 60);
}

// --- render ---
function stateFor(secs) {
  if (secs <= 0) return "over";
  if (secs <= WARNING_SECONDS) return "warning";
  return "normal";
}

function render() {
  el.time.textContent = formatClock(remaining);
  el.status.textContent = formatStatus(remaining);
  el.speaker.textContent = "Speaker " + speakerNum;
  el.app.dataset.state = stateFor(remaining);
  el.pause.textContent = running ? "Pause" : (remaining < perSpeaker || remaining <= 0 ? "Resume" : "Start");

  var pct = Math.max(0, Math.min(1, remaining / perSpeaker)) * 100;
  el.fill.style.width = remaining <= 0 ? "100%" : pct + "%";
}

// --- timer control ---
function tick() {
  remaining = Math.round((endTime - Date.now()) / 1000);
  render();
}

function startTicker() {
  endTime = Date.now() + remaining * 1000;
  ticker = setInterval(tick, 250);
}

function stopTicker() {
  clearInterval(ticker);
  ticker = null;
}

function resume() {
  if (running) return;
  running = true;
  startTicker();
  render();
}

function pause() {
  if (!running) return;
  remaining = Math.round((endTime - Date.now()) / 1000);
  running = false;
  stopTicker();
  render();
}

function togglePause() {
  if (running) pause();
  else resume();
}

function nextSpeaker() {
  speakerNum += 1;
  remaining = perSpeaker;
  if (running) {
    stopTicker();
    startTicker();
  }
  render();
}

// --- items ---
function renderItems() {
  var items = loadItems();
  el.items.textContent = "";
  items.forEach(function (text, i) {
    var li = document.createElement("li");

    var span = document.createElement("span");
    span.className = "item-text";
    span.textContent = text;

    var remove = document.createElement("button");
    remove.className = "item-remove";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Remove item");
    remove.addEventListener("click", function () {
      var current = loadItems();
      current.splice(i, 1);
      saveItems(current);
      renderItems();
    });

    li.appendChild(span);
    li.appendChild(remove);
    el.items.appendChild(li);
  });
}

// --- wiring ---
el.pause.addEventListener("click", togglePause);
el.next.addEventListener("click", nextSpeaker);

el.perSpeaker.addEventListener("change", function () {
  var v = parseInt(el.perSpeaker.value, 10);
  if (!(v > 0)) {
    el.perSpeaker.value = perSpeaker;
    return;
  }
  perSpeaker = v;
  localStorage.setItem(STORE_PER_SPEAKER, String(v));
  if (!running) {
    remaining = perSpeaker;
    render();
  }
});

el.addForm.addEventListener("submit", function (e) {
  e.preventDefault();
  var text = el.itemInput.value.trim();
  if (!text) return;
  var items = loadItems();
  items.push(text);
  saveItems(items);
  el.itemInput.value = "";
  renderItems();
});

document.addEventListener("keydown", function (e) {
  if (e.code !== "Space") return;
  var t = e.target;
  if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "BUTTON")) return;
  e.preventDefault();
  nextSpeaker();
});

// --- init ---
el.perSpeaker.value = perSpeaker;
renderItems();
render();
