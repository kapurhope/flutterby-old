/**
 * FlockQuest — Protect the Flock
 * 5th–8th grade conservation trade-off mini-sim
 */

const BUDGET = 100;
const NEST_GOAL = 75;
const BASE_NEST = 20;

const CONFLICT_RANK = { Low: 1, Medium: 2, High: 3 };

const ACTIONS = [
  {
    id: "shrubs",
    name: "Plant native shrubs",
    help: "More cover and insects for nesting.",
    cost: 40,
    nest: 22,
    conflict: "Low",
  },
  {
    id: "boxes",
    name: "Add nest boxes",
    help: "Safe spots to raise chicks.",
    cost: 25,
    nest: 14,
    conflict: "Low",
  },
  {
    id: "pesticide",
    name: "Reduce pesticides",
    help: "More insects for chicks to eat.",
    cost: 30,
    nest: 19,
    conflict: "Medium",
  },
  {
    id: "trail",
    name: "Close trail in nesting season",
    help: "Quiet habitat — some hikers get upset.",
    cost: 18,
    nest: 24,
    conflict: "High",
  },
  {
    id: "cats",
    name: "Cats-indoors campaign",
    help: "Fewer surprise predators near nests.",
    cost: 22,
    nest: 10,
    conflict: "Medium",
  },
  {
    id: "surveys",
    name: "Better bird surveys",
    help: "Fixes bad data so you don’t protect the wrong place.",
    cost: 28,
    nest: 4,
    conflict: "Low",
    fightsBias: true,
  },
];

const EVENTS = {
  none: {
    label: "Calm season",
    desc: "A typical nesting season. No big surprises.",
    nestDelta: 0,
    requireSurveys: false,
  },
  heat: {
    label: "Heat wave",
    desc: "Hot days stress chicks. Nest success drops 18 unless you have strong habitat cover (shrubs).",
    nestDelta: -18,
    shrubSoftening: 8,
    requireSurveys: false,
  },
  freeze: {
    label: "Late freeze",
    desc: "A cold snap hits early nests. Nest success drops 12.",
    nestDelta: -12,
    requireSurveys: false,
  },
  bias: {
    label: "Bad survey data",
    desc: "Your map was biased toward one park. Lose 15 nest points unless you funded better surveys.",
    nestDelta: -15,
    requireSurveys: true,
  },
};

const PRESETS = {
  // Under nest goal (Low conflict only)
  habitat: { shrubs: true, boxes: true, pesticide: false, trail: false, cats: false, surveys: false },
  // Cheaper mix, still short on nests
  people: { shrubs: false, boxes: true, pesticide: true, trail: false, cats: true, surveys: false },
  // Narrow full pass in a calm season (Medium conflict, $5 left)
  balanced: { shrubs: true, boxes: true, pesticide: true, trail: false, cats: false, surveys: false },
  clear: { shrubs: false, boxes: false, pesticide: false, trail: false, cats: false, surveys: false },
};

const state = {
  selected: { ...PRESETS.balanced },
  event: "none",
  runs: [],
};

function worstConflict(levels) {
  let worst = "Low";
  for (const action of ACTIONS) {
    if (!levels[action.id]) continue;
    if (CONFLICT_RANK[action.conflict] > CONFLICT_RANK[worst]) {
      worst = action.conflict;
    }
  }
  return worst;
}

function simulate(levels, eventKey) {
  const event = EVENTS[eventKey];
  let spent = 0;
  let nest = BASE_NEST;
  const chosen = [];

  for (const action of ACTIONS) {
    if (!levels[action.id]) continue;
    spent += action.cost;
    nest += action.nest;
    chosen.push(action.name);
  }

  let eventHit = event.nestDelta;
  if (eventKey === "heat" && levels.shrubs) {
    eventHit += event.shrubSoftening || 0;
  }
  if (event.requireSurveys && levels.surveys) {
    eventHit = 0;
  }
  nest += eventHit;

  nest = Math.max(0, Math.min(100, Math.round(nest)));
  const conflict = chosen.length ? worstConflict(levels) : "Low";
  const left = BUDGET - spent;

  return {
    nest,
    conflict,
    spent,
    left,
    chosen,
    eventKey,
    eventLabel: event.label,
    passNest: nest >= NEST_GOAL,
    passConflict: CONFLICT_RANK[conflict] <= CONFLICT_RANK.Medium,
    passBudget: spent <= BUDGET,
  };
}

function whyMessage(result) {
  const misses = [];
  if (!result.passNest) misses.push("nest success is under " + NEST_GOAL);
  if (!result.passConflict) misses.push("neighbors are at High conflict");
  if (!result.passBudget) misses.push("you went over $100");

  if (!misses.length) {
    return "Nice — you hit all three goals for this event.";
  }
  return "Trade-off: " + misses.join("; ") + ".";
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderActions() {
  const root = document.getElementById("actions");
  root.innerHTML = "";

  for (const action of ACTIONS) {
    const row = document.createElement("label");
    row.className = "action";
    row.innerHTML = `
      <input type="checkbox" data-id="${action.id}" ${state.selected[action.id] ? "checked" : ""} />
      <span>
        <span class="action-name">${action.name}</span>
        <p class="action-help">${action.help} · Nest +${action.nest} · Conflict ${action.conflict}</p>
      </span>
      <span class="action-cost">$${action.cost}</span>
    `;
    root.appendChild(row);
  }

  root.querySelectorAll("input[type=checkbox]").forEach((input) => {
    input.addEventListener("change", () => {
      state.selected[input.dataset.id] = input.checked;
      document.querySelectorAll(".preset").forEach((b) => b.classList.remove("is-active"));
      update();
    });
  });
}

function setBadge(el, pass) {
  el.textContent = pass ? "Pass" : "Not yet";
}

function update() {
  const result = simulate(state.selected, state.event);

  document.getElementById("goalNest").textContent = String(result.nest);
  document.getElementById("goalConflict").textContent = result.conflict;
  document.getElementById("goalBudget").textContent =
    result.left >= 0 ? "$" + result.left + " left" : "$" + Math.abs(result.left) + " over";

  const gNest = document.querySelector('[data-goal="nest"]');
  const gCon = document.querySelector('[data-goal="conflict"]');
  const gBud = document.querySelector('[data-goal="budget"]');

  gNest.classList.toggle("is-pass", result.passNest);
  gNest.classList.toggle("is-fail", !result.passNest);
  gCon.classList.toggle("is-pass", result.passConflict);
  gCon.classList.toggle("is-fail", !result.passConflict);
  gBud.classList.toggle("is-pass", result.passBudget);
  gBud.classList.toggle("is-fail", !result.passBudget);

  setBadge(document.getElementById("badgeNest"), result.passNest);
  setBadge(document.getElementById("badgeConflict"), result.passConflict);
  setBadge(document.getElementById("badgeBudget"), result.passBudget);

  document.getElementById("statNest").textContent = String(result.nest);
  document.getElementById("statConflict").textContent = result.conflict;
  document.getElementById("statSpent").textContent = "$" + result.spent;
  document.getElementById("statLeft").textContent =
    result.left >= 0 ? "$" + result.left : "-$" + Math.abs(result.left);

  document.getElementById("whyLine").textContent = whyMessage(result);
  document.getElementById("eventDesc").textContent = EVENTS[state.event].desc;

  const meter = document.getElementById("meterFill");
  meter.style.width = Math.min(100, result.nest) + "%";
  meter.classList.toggle("is-low", result.nest < NEST_GOAL);

  return result;
}

function applyPreset(name) {
  state.selected = { ...PRESETS[name] };
  document.querySelectorAll(".preset").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.preset === name && name !== "clear");
  });
  renderActions();
  update();
}

function setEvent(key) {
  state.event = key;
  document.querySelectorAll(".event-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.event === key);
  });
  update();
}

function renderHistory() {
  const grid = document.getElementById("historyGrid");
  const empty = document.getElementById("historyEmpty");
  const clearBtn = document.getElementById("clearHistory");

  grid.querySelectorAll(".history-card").forEach((n) => n.remove());

  if (!state.runs.length) {
    empty.hidden = false;
    clearBtn.hidden = true;
    return;
  }

  empty.hidden = true;
  clearBtn.hidden = false;

  state.runs.forEach((run, i) => {
    const passCount = [run.passNest, run.passConflict, run.passBudget].filter(Boolean).length;
    const card = document.createElement("article");
    card.className = "history-card";
    card.innerHTML = `
      <h4>Run ${i + 1}: ${escapeHtml(run.name)}</h4>
      <ul>
        <li>Nest success: <strong>${run.nest}</strong></li>
        <li>Neighbor conflict: <strong>${run.conflict}</strong></li>
        <li>Spent: <strong>$${run.spent}</strong> ($${run.left} left)</li>
        <li>Event: ${escapeHtml(run.eventLabel)}</li>
        <li>Actions: ${escapeHtml(run.chosen.join(", ") || "none")}</li>
      </ul>
      <p class="passes">${passCount}/3 goals passed</p>
    `;
    grid.appendChild(card);
  });
}

function saveRun() {
  if (state.runs.length >= 2) state.runs.shift();

  const result = simulate(state.selected, state.event);
  const input = document.getElementById("runName");
  const name = input.value.trim() || (state.runs.length === 0 ? "Strategy A" : "Strategy B");

  state.runs.push({ name, ...result });
  input.value = "";
  input.placeholder = state.runs.length === 1 ? "e.g. Strategy B" : "e.g. Habitat first";
  renderHistory();
}

function init() {
  renderActions();
  setEvent("none");
  update();
  renderHistory();

  document.querySelectorAll(".preset").forEach((btn) => {
    btn.addEventListener("click", () => applyPreset(btn.dataset.preset));
  });
  document.querySelectorAll(".event-btn").forEach((btn) => {
    btn.addEventListener("click", () => setEvent(btn.dataset.event));
  });
  document.getElementById("saveRun").addEventListener("click", saveRun);
  document.getElementById("clearHistory").addEventListener("click", () => {
    state.runs = [];
    renderHistory();
  });
}

init();
