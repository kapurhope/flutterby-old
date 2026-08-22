/**
 * PowerQuest — 8th-grade energy mix mini-sim
 * Simple teaching model (not a real grid).
 */

const BUDGET = 100;
const RELIABILITY_GOAL = 85;
const EMISSIONS_GOAL = 100;
const BASE_DEMAND = 100;

const SOURCES = [
  {
    id: "gas",
    name: "Gas plants",
    help: "Steady power, but adds CO₂.",
    max: 80,
    step: 10,
    costPer: 1.0,
    powerPer: 1.0,
    co2Per: 1.4,
    firm: true,
  },
  {
    id: "wind",
    name: "Wind turbines",
    help: "Clean, but weak on low-wind days.",
    max: 80,
    step: 10,
    costPer: 1.1,
    powerPer: 0.75,
    co2Per: 0.05,
    firm: false,
  },
  {
    id: "solar",
    name: "Solar panels",
    help: "Clean daytime power.",
    max: 60,
    step: 10,
    costPer: 1.0,
    powerPer: 0.65,
    co2Per: 0.05,
    firm: false,
  },
  {
    id: "battery",
    name: "Batteries",
    help: "Stores clean power for when wind/sun dip.",
    max: 40,
    step: 10,
    costPer: 1.4,
    powerPer: 0.9,
    co2Per: 0.1,
    firm: true,
  },
  {
    id: "efficiency",
    name: "Save energy",
    help: "Insulation & LEDs — city needs less power.",
    max: 30,
    step: 5,
    costPer: 1.2,
    powerPer: 0,
    co2Per: 0,
    firm: true,
    isEfficiency: true,
  },
];

const EVENTS = {
  none: {
    label: "Normal year",
    desc: "A typical year. Demand and wind are average.",
    demandMult: 1,
    windMult: 1,
  },
  heat: {
    label: "Heat wave",
    desc: "Everyone blasts A/C. Demand jumps 20%.",
    demandMult: 1.2,
    windMult: 1,
  },
  wind: {
    label: "Low wind",
    desc: "Wind turbines make only half their usual power.",
    demandMult: 1,
    windMult: 0.5,
  },
};

const PRESETS = {
  efficiency: { gas: 40, wind: 20, solar: 10, battery: 0, efficiency: 25 },
  wind: { gas: 20, wind: 50, solar: 10, battery: 30, efficiency: 5 },
  balanced: { gas: 30, wind: 30, solar: 20, battery: 20, efficiency: 10 },
  reset: { gas: 0, wind: 0, solar: 0, battery: 0, efficiency: 0 },
};

const state = {
  levels: { gas: 30, wind: 20, solar: 10, battery: 10, efficiency: 10 },
  event: "none",
  runs: [],
};

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function simulate(levels, eventKey) {
  const event = EVENTS[eventKey];
  let spent = 0;
  let co2 = 0;
  let firmPower = 0;
  let variablePower = 0;

  for (const src of SOURCES) {
    const level = levels[src.id] || 0;
    spent += level * src.costPer;

    if (src.isEfficiency) continue;

    co2 += level * src.co2Per;
    let power = level * src.powerPer;
    if (src.id === "wind") power *= event.windMult;

    if (src.firm) firmPower += power;
    else variablePower += power;
  }

  const demand = BASE_DEMAND * event.demandMult * (1 - (levels.efficiency || 0) / 100);
  const supply = firmPower + variablePower;
  const reliability = demand <= 0 ? 100 : clamp(Math.round((supply / demand) * 100), 0, 120);
  const spentRounded = Math.round(spent);
  const co2Rounded = Math.round(co2);
  const left = BUDGET - spentRounded;

  return {
    reliability,
    emissions: co2Rounded,
    spent: spentRounded,
    left,
    demand: Math.round(demand),
    supply: Math.round(supply),
    passReliability: reliability >= RELIABILITY_GOAL,
    passEmissions: co2Rounded <= EMISSIONS_GOAL,
    passBudget: spentRounded <= BUDGET,
    eventKey,
    eventLabel: event.label,
  };
}

function whyMessage(result) {
  const hits = [
    result.passReliability && "lights-on",
    result.passEmissions && "clean-air",
    result.passBudget && "budget",
  ].filter(Boolean);

  if (hits.length === 3) {
    return "Nice — you hit all three goals for this event.";
  }

  const misses = [];
  if (!result.passReliability) {
    misses.push(
      result.eventKey === "heat"
        ? "the heat wave pushed demand higher than your supply"
        : "you don’t have enough power for demand"
    );
  }
  if (!result.passEmissions) misses.push("CO₂ is over the clean-air limit");
  if (!result.passBudget) misses.push("you spent more than $100");

  return "Trade-off: " + misses.join("; ") + ".";
}

function renderLevers() {
  const root = document.getElementById("levers");
  root.innerHTML = "";

  for (const src of SOURCES) {
    const value = state.levels[src.id];
    const el = document.createElement("div");
    el.className = "lever";
    el.innerHTML = `
      <div class="lever-top">
        <span class="lever-name">${src.name}</span>
        <span class="lever-meta"><strong>${value}</strong> · $${(value * src.costPer).toFixed(0)}</span>
      </div>
      <p class="lever-help">${src.help}</p>
      <input
        type="range"
        min="0"
        max="${src.max}"
        step="${src.step}"
        value="${value}"
        data-id="${src.id}"
        aria-label="${src.name}"
      />
    `;
    root.appendChild(el);
  }

  root.querySelectorAll("input[type=range]").forEach((input) => {
    input.addEventListener("input", () => {
      state.levels[input.dataset.id] = Number(input.value);
      update();
    });
  });
}

function setBadge(el, pass) {
  el.textContent = pass ? "Pass" : "Not yet";
}

function update() {
  const result = simulate(state.levels, state.event);

  document.getElementById("goalReliability").textContent = result.reliability + "%";
  document.getElementById("goalEmissions").textContent = String(result.emissions);
  document.getElementById("goalBudget").textContent =
    result.left >= 0 ? "$" + result.left + " left" : "$" + Math.abs(result.left) + " over";

  const gRel = document.querySelector('[data-goal="reliability"]');
  const gEm = document.querySelector('[data-goal="emissions"]');
  const gBud = document.querySelector('[data-goal="budget"]');

  gRel.classList.toggle("is-pass", result.passReliability);
  gRel.classList.toggle("is-fail", !result.passReliability);
  gEm.classList.toggle("is-pass", result.passEmissions);
  gEm.classList.toggle("is-fail", !result.passEmissions);
  gBud.classList.toggle("is-pass", result.passBudget);
  gBud.classList.toggle("is-fail", !result.passBudget);

  setBadge(document.getElementById("badgeReliability"), result.passReliability);
  setBadge(document.getElementById("badgeEmissions"), result.passEmissions);
  setBadge(document.getElementById("badgeBudget"), result.passBudget);

  document.getElementById("statReliability").textContent = result.reliability + "%";
  document.getElementById("statEmissions").textContent = String(result.emissions);
  document.getElementById("statSpent").textContent = "$" + result.spent;
  document.getElementById("statLeft").textContent =
    result.left >= 0 ? "$" + result.left : "-$" + Math.abs(result.left);

  document.getElementById("whyLine").textContent = whyMessage(result);
  document.getElementById("eventDesc").textContent = EVENTS[state.event].desc;

  const meter = document.getElementById("meterFill");
  const width = clamp(result.reliability, 0, 100);
  meter.style.width = width + "%";
  meter.classList.toggle("is-low", result.reliability < RELIABILITY_GOAL);

  // Refresh lever meta amounts without rebuilding focus
  document.querySelectorAll("#levers input[type=range]").forEach((input) => {
    const src = SOURCES.find((s) => s.id === input.dataset.id);
    const value = state.levels[src.id];
    input.value = String(value);
    const meta = input.parentElement.querySelector(".lever-meta");
    meta.innerHTML = `<strong>${value}</strong> · $${(value * src.costPer).toFixed(0)}`;
  });

  return result;
}

function applyPreset(name) {
  const preset = PRESETS[name];
  if (!preset) return;
  state.levels = { ...preset };
  document.querySelectorAll(".preset").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.preset === name && name !== "reset");
  });
  update();
}

function setEvent(key) {
  state.event = key;
  document.querySelectorAll(".event-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.event === key);
  });
  update();
}

function mixSummary(levels) {
  return SOURCES.filter((s) => (levels[s.id] || 0) > 0)
    .map((s) => `${s.name.split(" ")[0]} ${levels[s.id]}`)
    .join(", ");
}

function renderHistory() {
  const grid = document.getElementById("historyGrid");
  const empty = document.getElementById("historyEmpty");
  const clearBtn = document.getElementById("clearHistory");

  grid.querySelectorAll(".history-card").forEach((n) => n.remove());

  if (state.runs.length === 0) {
    empty.hidden = false;
    clearBtn.hidden = true;
    return;
  }

  empty.hidden = true;
  clearBtn.hidden = false;

  state.runs.forEach((run, i) => {
    const passCount = [run.passReliability, run.passEmissions, run.passBudget].filter(Boolean)
      .length;
    const card = document.createElement("article");
    card.className = "history-card";
    card.innerHTML = `
      <h4>Run ${i + 1}: ${escapeHtml(run.name)}</h4>
      <ul>
        <li>Reliability: <strong>${run.reliability}%</strong></li>
        <li>CO₂: <strong>${run.emissions}</strong></li>
        <li>Spent: <strong>$${run.spent}</strong> ($${run.left} left)</li>
        <li>Event: ${escapeHtml(run.eventLabel)}</li>
        <li>Mix: ${escapeHtml(run.mix)}</li>
      </ul>
      <p class="passes">${passCount}/3 goals passed</p>
    `;
    grid.appendChild(card);
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function saveRun() {
  if (state.runs.length >= 2) {
    state.runs.shift();
  }

  const result = simulate(state.levels, state.event);
  const input = document.getElementById("runName");
  const name =
    input.value.trim() ||
    (state.runs.length === 0 ? "Strategy A" : "Strategy B");

  state.runs.push({
    name,
    mix: mixSummary(state.levels),
    ...result,
  });

  input.value = "";
  input.placeholder = state.runs.length === 1 ? "e.g. Strategy B" : "e.g. Wind + batteries";
  renderHistory();
}

function init() {
  renderLevers();
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
