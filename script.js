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
    "Inflation is the rate at which prices rise. At 6%, prices roughly double in about 12 years (Rule of 72)."
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
  const idsGlobal = ["globalPrincipal", "globalRate", "globalYears", "compoundFreq"];
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

  ["cdLoans", "cdDeposits", "grossNPA", "grossAdvances", "netInterestIncome", "earningAssets"].forEach(
    (id) => {
      $(id).addEventListener("input", updateBankingRatios);
    }
  );

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
});
