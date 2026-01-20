// ---------- helpers ----------
const $ = (id) => document.getElementById(id);

const formatINR = (v) => {
  if (!isFinite(v)) return "₹0";
  return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

const formatPct = (v) => (isFinite(v) ? v.toFixed(2) + " %" : "–");

// ---------- global inputs ----------
function getGlobalInputs() {
  const P = parseFloat($("globalPrincipal").value) || 0;
  const r = (parseFloat($("globalRate").value) || 0) / 100;
  const t = parseFloat($("globalYears").value) || 0;
  const n = parseInt($("compoundFreq").value, 10) || 1;
  return { P, r, t, n };
}

// ---------- Interest Master ----------
function updateInterestMaster() {
  const { P, r, t, n } = getGlobalInputs();

  const si = P * r * t;
  const siTotal = P + si;

  const ciTotal = P * Math.pow(1 + r / n, n * t);
  const ci = ciTotal - P;

  $("siAmount").textContent = formatINR(si);
  $("siTotal").textContent = "Total Value: " + formatINR(siTotal);

  $("ciAmount").textContent = formatINR(ci);
  $("ciTotal").textContent = "Total Value: " + formatINR(ciTotal);

  renderInterestChart(P, r, t, n);
}

function renderInterestChart(P, r, t, n) {
  const container = $("interestChart");
  container.innerHTML = "";
  const years = Math.max(1, Math.min(20, Math.round(t || 1)));
  $("chartYearsLabel").textContent = years + " years";

  let maxValue = P;
  const rows = [];

  for (let year = 1; year <= years; year++) {
    const siTotal = P * (1 + r * year);
    const ciTotal = P * Math.pow(1 + r / n, n * year);
    rows.push({ year, siTotal, ciTotal });
    maxValue = Math.max(maxValue, siTotal, ciTotal);
  }

  rows.forEach((row) => {
    const col = document.createElement("div");
    col.className = "chart-column";

    const bars = document.createElement("div");
    bars.className = "chart-bars";

    const ciHeight = (row.ciTotal / maxValue) * 100;
    const siHeight = (row.siTotal / maxValue) * 100;

    const ciBar = document.createElement("div");
    ciBar.className = "chart-bar";
    ciBar.style.background = "#22c55e";
    ciBar.style.height = Math.max(6, ciHeight) + "%";

    const siBar = document.createElement("div");
    siBar.className = "chart-bar";
    siBar.style.background = "#38bdf8";
    siBar.style.height = Math.max(3, siHeight) + "%";

    bars.appendChild(ciBar);
    bars.appendChild(siBar);

    const lbl = document.createElement("div");
    lbl.textContent = row.year;
    lbl.style.fontSize = "0.65rem";
    lbl.style.color = "#9ca3af";

    col.appendChild(bars);
    col.appendChild(lbl);
    container.appendChild(col);
  });
}

// ---------- Wealth Multiplier ----------
function updateMultiplierTable() {
  const { r } = getGlobalInputs();
  const body = $("multiplierBody");
  body.innerHTML = "";

  const multipliers = [2, 5, 10, 100];

  multipliers.forEach((M) => {
    const tr = document.createElement("tr");

    const tdM = document.createElement("td");
    tdM.textContent = M + "x";

    const tdApprox = document.createElement("td");
    let approx = NaN;
    if (r > 0) {
      approx = (72 / (r * 100)) * (Math.log(M) / Math.log(2));
    }
    tdApprox.textContent = isFinite(approx)
      ? approx.toFixed(1) + " yrs"
      : "–";

    const tdExact = document.createElement("td");
    const exact = r > 0 ? Math.log(M) / Math.log(1 + r) : NaN;
    tdExact.textContent = isFinite(exact)
      ? exact.toFixed(2) + " yrs"
      : "–";

    tr.appendChild(tdM);
    tr.appendChild(tdApprox);
    tr.appendChild(tdExact);
    body.appendChild(tr);
  });
}

// ---------- Banking ratios ----------
function updateBankingRatios() {
  const loans = parseFloat($("cdLoans").value) || 0;
  const deposits = parseFloat($("cdDeposits").value) || 0;
  const cd = deposits > 0 ? (loans / deposits) * 100 : NaN;
  $("cdResult").textContent = "CD Ratio: " + formatPct(cd);

  const grossNPA = parseFloat($("grossNPA").value) || 0;
  const grossAdv = parseFloat($("grossAdvances").value) || 0;
  const gnpa = grossAdv > 0 ? (grossNPA / grossAdv) * 100 : NaN;
  $("gnpaResult").textContent = "Gross NPA Ratio: " + formatPct(gnpa);

  const nii = parseFloat($("netInterestIncome").value) || 0;
  const earningAssets = parseFloat($("earningAssets").value) || 0;
  const nim = earningAssets > 0 ? (nii / earningAssets) * 100 : NaN;
  $("nimResult").textContent = "NIM: " + formatPct(nim);
}

// ---------- Stock ratios ----------
function updateStockRatios() {
  const price = parseFloat($("pricePerShare").value) || 0;
  const eps = parseFloat($("eps").value) || 0;
  const book = parseFloat($("bookValue").value) || 0;
  const netIncome = parseFloat($("netIncome").value) || 0;
  const shEquity = parseFloat($("shareholdersEquity").value) || 0;
  const ebit = parseFloat($("ebit").value) || 0;
  const capitalEmployed = parseFloat($("capitalEmployed").value) || 0;
  const totalDebt = parseFloat($("totalDebt").value) || 0;
  const equity = parseFloat($("equity").value) || 0;

  const pe = eps > 0 ? price / eps : NaN;
  $("peResult").textContent = isFinite(pe)
    ? "P/E: " + pe.toFixed(2) + "x"
    : "P/E: –";

  const pb = book > 0 ? price / book : NaN;
  $("pbResult").textContent = isFinite(pb)
    ? "P/B: " + pb.toFixed(2) + "x"
    : "P/B: –";

  const roe = shEquity > 0 ? (netIncome / shEquity) * 100 : NaN;
  $("roeResult").textContent = "ROE: " + formatPct(roe);

  const roce = capitalEmployed > 0 ? (ebit / capitalEmployed) * 100 : NaN;
  $("roceResult").textContent = "ROCE: " + formatPct(roce);

  const dte = equity > 0 ? totalDebt / equity : NaN;
  $("dteResult").textContent = isFinite(dte)
    ? "Debt/Equity: " + dte.toFixed(2) + "x"
    : "Debt/Equity: –";
}

// ---------- SIP vs Lumpsum ----------
function updateSipLumpsum() {
  const sipAmt = parseFloat($("sipAmount").value) || 0;
  const lumpAmt = parseFloat($("lumpAmount").value) || 0;
  const r = (parseFloat($("sipRate").value) || 0) / 100;
  const years = parseFloat($("sipYears").value) || 0;

  const n = years * 12;
  const monthlyRate = r / 12;

  let sipFV = 0;
  if (monthlyRate > 0 && n > 0) {
    sipFV =
      sipAmt *
      ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) *
      (1 + monthlyRate);
  }

  const lumpFV = lumpAmt * Math.pow(1 + r, years);

  const sipInvested = sipAmt * n;
  const lumpInvested = lumpAmt;

  $("sipFV").textContent = formatINR(sipFV);
  $("sipInvested").textContent = "Total Invested: " + formatINR(sipInvested);

  $("lumpFV").textContent = formatINR(lumpFV);
  $("lumpInvested").textContent =
    "Total Invested: " + formatINR(lumpInvested);

  let winner = "Both strategies are equal.";
  const diff = Math.abs(sipFV - lumpFV);

  if (sipFV > lumpFV) {
    winner = "The winner is SIP by " + formatINR(diff) + ".";
  } else if (lumpFV > sipFV) {
    winner = "The winner is Lumpsum by " + formatINR(diff) + ".";
  }

  $("winnerText").textContent = winner;
}

// ---------- Retirement ----------
function updateRetirement() {
  const currentAge = parseFloat($("currentAge").value) || 0;
  const retireAge = parseFloat($("retireAge").value) || 0;
  const monthlyExp = parseFloat($("currentExpenses").value) || 0;
  const infl = (parseFloat($("inflationRate").value) || 0) / 100;

  const years = Math.max(0, retireAge - currentAge);

  const inflatedMonthly = monthlyExp * Math.pow(1 + infl, years);
  const annualAtRetire = inflatedMonthly * 12;
  const corpus = annualAtRetire * 25;

  const assumedReturn = 0.12;
  const n = years * 12;
  const monthlyReturn = assumedReturn / 12;
  let monthlySaving = 0;

  if (monthlyReturn > 0 && n > 0) {
    monthlySaving =
      corpus /
      (((Math.pow(1 + monthlyReturn, n) - 1) / monthlyReturn) *
        (1 + monthlyReturn));
  }

  $("retireExpense").textContent = formatINR(inflatedMonthly);
  $("retireCorpus").textContent = formatINR(corpus);
  $("retireMonthlySave").textContent = formatINR(monthlySaving);

  $("roadmapLabelLeft").textContent = "Current Age: " + currentAge;
  $("roadmapLabelRight").textContent = "Retirement Age: " + retireAge;

  const progress =
    retireAge > 18 ? ((currentAge - 18) / (retireAge - 18)) * 100 : 0;
  $("roadmapProgress").style.width =
    Math.min(100, Math.max(0, progress)) + "%";
}

// ---------- Metals / Stocks / FX scenarios ----------
const metalsScenarios = {
  crisis: {
    name: "Crisis / Risk-off",
    base: { gold: 0.8, silver: 0.6, equity: 0.2 },
    description:
      "In crises, investors typically sell equities and move into safe havens like gold. Silver often follows gold but with more volatility. [web:4][web:6][web:7][web:10][web:13]"
  },
  normal: {
    name: "Normal Growth",
    base: { gold: 0.4, silver: 0.5, equity: 0.7 },
    description:
      "In stable growth with low volatility, equities usually lead, while gold and silver act as diversifiers with lower correlation. [web:4][web:7]"
  },
  inflation: {
    name: "High Inflation / Negative Real Rates",
    base: { gold: 0.9, silver: 0.85, equity: 0.5 },
    description:
      "When inflation is high and real yields are low, gold and silver tend to benefit as stores of value, while equities face mixed impact. [web:5][web:7][web:10][web:13]"
  },
  liquidity: {
    name: "Liquidity Boom / Everything Rally",
    base: { gold: 0.7, silver: 0.9, equity: 0.9 },
    description:
      "Under aggressive liquidity and QE, both precious metals and equities can rally together, breaking the classic inverse pattern. [web:9][web:12]"
  },
  industrial: {
    name: "Industrial / Commodity Upswing",
    base: { gold: 0.5, silver: 0.85, equity: 0.8 },
    description:
      "With strong industrial demand, silver and cyclical equities often outperform, while gold plays a secondary but supportive role. [web:7][web:10][web:13]"
  }
};

function applyFxAdjustment(baseImpact, fxMove) {
  let adj = baseImpact;
  if (fxMove === "inrWeak") {
    adj += 0.1;
  } else if (fxMove === "inrStrong") {
    adj -= 0.1;
  }
  return Math.max(0, Math.min(1, adj));
}

function applyRiskAdjustment(impact, asset, riskLevel) {
  let adj = impact;
  if (riskLevel === "high") {
    if (asset === "gold" || asset === "silver") adj += 0.1;
    if (asset === "equity") adj -= 0.15;
  } else if (riskLevel === "low") {
    if (asset === "gold") adj -= 0.1;
    if (asset === "equity") adj += 0.1;
  }
  return Math.max(0, Math.min(1, adj));
}

function updateMetalsScenario() {
  const scenarioKey = $("scenarioSelect").value;
  const fxMove = $("fxMoveSelect").value;
  const riskLevel = $("riskSelect").value;

  const scenario = metalsScenarios[scenarioKey];
  if (!scenario) return;

  let g = scenario.base.gold;
  let s = scenario.base.silver;
  let e = scenario.base.equity;

  g = applyFxAdjustment(g, fxMove);
  s = applyFxAdjustment(s, fxMove);

  g = applyRiskAdjustment(g, "gold", riskLevel);
  s = applyRiskAdjustment(s, "silver", riskLevel);
  e = applyRiskAdjustment(e, "equity", riskLevel);

  const toWidth = (x) => `${20 + x * 80}%`;

  $("goldImpactBar").style.width = toWidth(g);
  $("silverImpactBar").style.width = toWidth(s);
  $("equityImpactBar").style.width = toWidth(e);

  $("goldImpactText").textContent =
    g >= 0.7
      ? "Gold: Strong positive bias (safe-haven / inflation hedge)."
      : g >= 0.4
      ? "Gold: Moderate role as diversifier and hedge."
      : "Gold: Lower expected participation; equities preferred.";

  $("silverImpactText").textContent =
    s >= 0.7
      ? "Silver: High-beta behaviour; can swing more than gold."
      : s >= 0.4
      ? "Silver: Mixed industrial + monetary participation."
      : "Silver: Likely muted; industrial and monetary drivers subdued.";

  $("equityImpactText").textContent =
    e >= 0.7
      ? "Equities: Risk-on environment; growth assets favoured."
      : e >= 0.4
      ? "Equities: Balanced risk–reward, watch macro and earnings."
      : "Equities: Risk-off tone; drawdown or defensive positioning likely.";

  $("scenarioDescription").textContent = scenario.description;

  let fxText = "";
  if (fxMove === "flat") {
    fxText =
      "With a broadly stable INR, local gold and silver largely move with global prices and scenario dynamics.";
  } else if (fxMove === "inrWeak") {
    fxText =
      "A weaker INR (USD up) amplifies gold and silver moves in rupee terms, while imported inflation can pressure equities.";
  } else if (fxMove === "inrStrong") {
    fxText =
      "A stronger INR (USD down) can mute global gold/silver gains locally and support imports and some equity sectors.";
  }
  $("fxDescription").textContent = fxText;

  renderMetalsMiniChart(g, s, e);
}

function renderMetalsMiniChart(gImpact, sImpact, eImpact) {
  const container = $("metalsChart");
  if (!container) return;
  container.innerHTML = "";

  const steps = 5;
  const buildPath = (impact) => {
    const base = 1;
    const drift = (impact - 0.5) * 0.5;
    const arr = [];
    let val = base;
    for (let i = 0; i < steps; i++) {
      val = val * (1 + drift / steps);
      arr.push(val);
    }
    const max = Math.max(...arr);
    return arr.map((v) => v / max);
  };

  const goldPath = buildPath(gImpact);
  const silverPath = buildPath(sImpact);
  const equityPath = buildPath(eImpact);

  for (let i = 0; i < steps; i++) {
    const col = document.createElement("div");
    col.className = "metals-column";

    const stack = document.createElement("div");
    stack.className = "metals-stack";

    const goldSeg = document.createElement("div");
    goldSeg.className = "metals-line";
    goldSeg.style.background = "#facc15";
    goldSeg.style.height = `${20 + goldPath[i] * 80}%`;

    const silverSeg = document.createElement("div");
    silverSeg.className = "metals-line";
    silverSeg.style.background = "#e5e7eb";
    silverSeg.style.height = `${15 + silverPath[i] * 70}%`;

    const equitySeg = document.createElement("div");
    equitySeg.className = "metals-line";
    equitySeg.style.background = "#22c55e";
    equitySeg.style.height = `${15 + equityPath[i] * 75}%`;

    stack.appendChild(goldSeg);
    stack.appendChild(silverSeg);
    stack.appendChild(equitySeg);

    col.appendChild(stack);
    container.appendChild(col);
  }
}

// ---------- Tabs ----------
function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");

      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      panels.forEach((p) => {
        p.classList.toggle("active", p.id === target);
      });
    });
  });
}

// ---------- Nav / scroll ----------
function setupNav() {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      const target = link.getAttribute("data-scroll");
      if (!target) return;
      const el = document.querySelector(target);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const offset = window.scrollY + rect.top - 70;
      window.scrollTo({ top: offset, behavior: "smooth" });

      const mobile = $("navMobile");
      if (mobile && !mobile.classList.contains("hidden")) {
        mobile.classList.add("hidden");
      }
    });
  });

  const toggle = $("navToggle");
  const mobile = $("navMobile");
  if (toggle && mobile) {
    toggle.addEventListener("click", () => {
      mobile.classList.toggle("hidden");
    });
  }
}

// ---------- Tooltips ----------
const tooltipContent = {
  "global-rate":
    "Global annual interest rate used across calculators. Example: 11% means ₹100 grows to ₹111 in one year before compounding.",
  "global-tenure":
    "Investment duration in years. Longer tenure dramatically boosts compounding impact.",
  "comp-frequency":
    "Number of times interest is added to principal each year. Higher frequency → slightly higher effective return.",
  "cd-ratio":
    "CD Ratio = Loans / Deposits. If loans are ₹70 and deposits are ₹100, CD ratio is 70%. Too high can signal aggressive lending.",
  gnpa:
    "Gross NPA Ratio = Gross NPAs / Gross Advances. Indicates share of bad loans in total loans.",
  nim:
    "NIM = Net Interest Income / Avg Earning Assets. Higher NIM usually means better core lending profitability.",
  pe:
    "P/E tells how much you pay for ₹1 of profit. Example: P/E = 20 means paying ₹20 for ₹1 of annual earnings.",
  pb:
    "P/B compares market price with book value. Above 1 means the market values the company above its accounting net worth.",
  "roe-roce-dte":
    "ROE = Net Income / Equity; ROCE = EBIT / Capital Employed; Debt/Equity = Total Debt / Equity. Together they show return and leverage.",
  sip:
    "SIP: Like planting a seed every month. Works well for building habits and averaging out market volatility.",
  lumpsum:
    "Lumpsum: Like planting an entire forest at once. Works best when valuations are attractive and you can stay invested.",
  "expected-return":
    "Expected annualized return used for projections. Equity often assumed 10–15% long term; debt much lower.",
  expenses:
    "Current monthly lifestyle cost. This is projected into the future using inflation to calculate retirement needs.",
  inflation:
    "Inflation is the rate at which prices rise. At 6%, prices roughly double in about 12 years (Rule of 72).",
  scenario:
    "Predefined macro scenarios combining behaviour of gold, silver, and equities under different regimes like crisis, inflation and liquidity.",
  fx:
    "Currency move vs USD. A weaker INR (USD up) usually boosts rupee gold/silver prices, while a stronger INR can mute global gains.",
  risk:
    "Risk sentiment. High fear tends to benefit safe havens (gold) and hurt equities, while low fear favours risk assets."
};

function setupTooltips() {
  const tooltip = $("tooltip");

  document.body.addEventListener("click", (e) => {
    const icon = e.target.closest(".help-icon");
    if (!icon) {
      tooltip.classList.add("hidden");
      return;
    }

    const key = icon.getAttribute("data-help");
    const text =
      tooltipContent[key] || "No explanation available for this field.";

    tooltip.textContent = text;
    tooltip.classList.remove("hidden");

    const rect = icon.getBoundingClientRect();
    const top = rect.bottom + 8;
    const left = Math.min(window.innerWidth - 280, rect.left);

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  });
}

// ---------- Events wiring ----------
function wireInputs() {
  const idsGlobal = [
    "globalPrincipal",
    "globalRate",
    "globalYears",
    "compoundFreq"
  ];
  idsGlobal.forEach((id) => {
    const el = $(id);
    el.addEventListener("input", () => {
      updateInterestMaster();
      updateMultiplierTable();
    });
    el.addEventListener("change", () => {
      updateInterestMaster();
      updateMultiplierTable();
    });
  });

  [
    "cdLoans",
    "cdDeposits",
    "grossNPA",
    "grossAdvances",
    "netInterestIncome",
    "earningAssets"
  ].forEach((id) => {
    $(id).addEventListener("input", updateBankingRatios);
  });

  [
    "pricePerShare",
    "eps",
    "bookValue",
    "netIncome",
    "shareholdersEquity",
    "ebit",
    "capitalEmployed",
    "totalDebt",
    "equity"
  ].forEach((id) => {
    $(id).addEventListener("input", updateStockRatios);
  });

  ["sipAmount", "lumpAmount", "sipRate", "sipYears"].forEach((id) => {
    $(id).addEventListener("input", updateSipLumpsum);
  });

  ["currentAge", "retireAge", "currentExpenses", "inflationRate"].forEach(
    (id) => {
      $(id).addEventListener("input", updateRetirement);
    }
  );

  // Metals / FX scenario selectors
  ["scenarioSelect", "fxMoveSelect", "riskSelect"].forEach((id) => {
    const el = $(id);
    if (el) {
      el.addEventListener("change", updateMetalsScenario);
    }
  });
}

// ---------- init ----------
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupNav();
  setupTooltips();
  wireInputs();

  updateInterestMaster();
  updateMultiplierTable();
  updateBankingRatios();
  updateStockRatios();
  updateSipLumpsum();
  updateRetirement();
  updateMetalsScenario();
});
