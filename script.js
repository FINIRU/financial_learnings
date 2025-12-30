// ---------- UTILITIES ----------
const byId = (id) => document.getElementById(id);

const formatINR = (value) => {
  if (!isFinite(value)) return "₹0";
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

const formatPercent = (value) => {
  if (!isFinite(value)) return "–";
  return value.toFixed(2) + " %";
};

// ---------- GLOBAL INPUT HANDLER ----------
function getGlobalInputs() {
  const P = parseFloat(byId("globalPrincipal").value) || 0;
  const r = (parseFloat(byId("globalRate").value) || 0) / 100;
  const t = parseFloat(byId("globalYears").value) || 0;
  const n = parseInt(byId("compoundFreq").value, 10) || 1;
  return { P, r, t, n };
}

function handleGlobalChange() {
  updateInterestMaster();
  updateMultiplierTable();
}

// ---------- INTEREST MASTER ----------
function updateInterestMaster() {
  const { P, r, t, n } = getGlobalInputs();

  const simpleInterest = P * r * t;
  const simpleTotal = P + simpleInterest;

  const compoundTotal = P * Math.pow(1 + r / n, n * t);
  const compoundInterest = compoundTotal - P;

  byId("siAmount").textContent = formatINR(simpleInterest);
  byId("siTotal").textContent = "Total Value: " + formatINR(simpleTotal);

  byId("ciAmount").textContent = formatINR(compoundInterest);
  byId("ciTotal").textContent = "Total Value: " + formatINR(compoundTotal);

  renderInterestChart(P, r, t, n);
}

function renderInterestChart(P, r, t, n) {
  const container = byId("interestChart");
  container.innerHTML = "";
  const years = Math.max(1, Math.min(20, Math.round(t)));
  byId("chartYearsLabel").textContent = years + " years";

  let maxValue = P;
  const data = [];

  for (let year = 1; year <= years; year++) {
    const siTotal = P * (1 + r * year);
    const ciTotal = P * Math.pow(1 + r / n, n * year);
    data.push({ year, siTotal, ciTotal });
    maxValue = Math.max(maxValue, siTotal, ciTotal);
  }

  data.forEach((row) => {
    const barWrapper = document.createElement("div");
    barWrapper.className =
      "flex-1 flex flex-col items-center justify-end gap-0.5 text-[10px] text-slate-500";

    const column = document.createElement("div");
    column.className = "flex flex-col justify-end gap-0.5 w-full";

    const ciHeight = (row.ciTotal / maxValue) * 100;
    const siHeight = (row.siTotal / maxValue) * 100;

    const ciBar = document.createElement("div");
    ciBar.className =
      "chart-bar bg-emerald-400/80 transition-all duration-300";
    ciBar.style.height = Math.max(6, ciHeight) + "%";

    const siBar = document.createElement("div");
    siBar.className = "chart-bar bg-sky-400/80 transition-all duration-300";
    siBar.style.height = Math.max(4, siHeight) + "%";

    column.appendChild(ciBar);
    column.appendChild(siBar);
    barWrapper.appendChild(column);

    const label = document.createElement("div");
    label.textContent = row.year;
    barWrapper.appendChild(label);

    container.appendChild(barWrapper);
  });
}

// ---------- WEALTH MULTIPLIER ----------
function updateMultiplierTable() {
  const { r } = getGlobalInputs();
  const body = byId("multiplierBody");
  body.innerHTML = "";

  const multipliers = [2, 5, 10, 100];

  multipliers.forEach((M) => {
    const row = document.createElement("tr");
    row.className = "bg-slate-900/70 border border-slate-800/80 rounded-xl";

    const mCell = document.createElement("td");
    mCell.className = "px-3 py-2 text-xs";
    mCell.textContent = M + "x";

    const approxCell = document.createElement("td");
    approxCell.className = "px-3 py-2 text-xs text-slate-300";
    const approx =
      r > 0 ? (Math.log(M) / Math.log(2)) * (72 / (r * 100)) : NaN;
    approxCell.textContent = isFinite(approx)
      ? approx.toFixed(1) + " yrs (Rule of 72)"
      : "–";

    const exactCell = document.createElement("td");
    exactCell.className = "px-3 py-2 text-xs text-emerald-300";
    const exact = r > 0 ? Math.log(M) / Math.log(1 + r) : NaN;
    exactCell.textContent = isFinite(exact)
      ? exact.toFixed(2) + " yrs"
      : "–";

    row.appendChild(mCell);
    row.appendChild(approxCell);
    row.appendChild(exactCell);
    body.appendChild(row);
  });
}

// ---------- BANKING RATIOS ----------
function updateBankingRatios() {
  const loans = parseFloat(byId("cdLoans").value) || 0;
  const deposits = parseFloat(byId("cdDeposits").value) || 0;
  const cd = deposits > 0 ? (loans / deposits) * 100 : NaN;
  byId("cdResult").textContent =
    "CD Ratio: " + (isFinite(cd) ? formatPercent(cd) : "–");

  const grossNPA = parseFloat(byId("grossNPA").value) || 0;
  const grossAdv = parseFloat(byId("grossAdvances").value) || 0;
  const gnpa = grossAdv > 0 ? (grossNPA / grossAdv) * 100 : NaN;
  byId("gnpaResult").textContent =
    "Gross NPA Ratio: " + (isFinite(gnpa) ? formatPercent(gnpa) : "–");

  const nii = parseFloat(byId("netInterestIncome").value) || 0;
  const earningAssets = parseFloat(byId("earningAssets").value) || 0;
  const nim = earningAssets > 0 ? (nii / earningAssets) * 100 : NaN;
  byId("nimResult").textContent =
    "NIM: " + (isFinite(nim) ? formatPercent(nim) : "–");
}

// ---------- STOCK RATIOS ----------
function updateStockRatios() {
  const price = parseFloat(byId("pricePerShare").value) || 0;
  const eps = parseFloat(byId("eps").value) || 0;
  const pe = eps > 0 ? price / eps : NaN;
  byId("peResult").textContent = isFinite(pe)
    ? "P/E: " + pe.toFixed(2) + "x"
    : "P/E: –";

  const book = parseFloat(byId("bookValue").value) || 0;
  const pb = book > 0 ? price / book : NaN;
  byId("pbResult").textContent = isFinite(pb)
    ? "P/B: " + pb.toFixed(2) + "x"
    : "P/B: –";

  const netIncome = parseFloat(byId("netIncome").value) || 0;
  const shEquity = parseFloat(byId("shareholdersEquity").value) || 0;
  const roe = shEquity > 0 ? (netIncome / shEquity) * 100 : NaN;
  byId("roeResult").textContent =
    "ROE: " + (isFinite(roe) ? formatPercent(roe) : "–");

  const ebit = parseFloat(byId("ebit").value) || 0;
  const capEmployed = parseFloat(byId("capitalEmployed").value) || 0;
  const roce = capEmployed > 0 ? (ebit / capEmployed) * 100 : NaN;
  byId("roceResult").textContent =
    "ROCE: " + (isFinite(roce) ? formatPercent(roce) : "–");

  const totalDebt = parseFloat(byId("totalDebt").value) || 0;
  const equity = parseFloat(byId("equity").value) || 0;
  const dte = equity > 0 ? totalDebt / equity : NaN;
  byId("dteResult").textContent = isFinite(dte)
    ? "Debt/Equity: " + dte.toFixed(2) + "x"
    : "Debt/Equity: –";
}

// ---------- SIP VS LUMPSUM ----------
function updateSipLumpsum() {
  const sipAmt = parseFloat(byId("sipAmount").value) || 0;
  const lumpAmt = parseFloat(byId("lumpAmount").value) || 0;
  const r = (parseFloat(byId("sipRate").value) || 0) / 100;
  const years = parseFloat(byId("sipYears").value) || 0;

  const n = years * 12;
  const monthlyRate = r / 12;

  let sipFV = 0;
  if (monthlyRate > 0 && n > 0) {
    sipFV = sipAmt * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
  }

  const lumpFV = lumpAmt * Math.pow(1 + r, years);

  const sipInvested = sipAmt * n;
  const lumpInvested = lumpAmt;

  byId("sipFV").textContent = formatINR(sipFV);
  byId("sipInvested").textContent = "Total Invested: " + formatINR(sipInvested);

  byId("lumpFV").textContent = formatINR(lumpFV);
  byId("lumpInvested").textContent = "Total Invested: " + formatINR(lumpInvested);

  let winner = "Both are equal";
  let diff = Math.abs(sipFV - lumpFV);

  if (sipFV > lumpFV) {
    winner = "SIP strategy wins by " + formatINR(diff);
  } else if (lumpFV > sipFV) {
    winner = "Lumpsum strategy wins by " + formatINR(diff);
  }

  byId("winnerText").textContent = "The winner is: " + winner;
}

// ---------- RETIREMENT GOAL TRACKER ----------
function updateRetirement() {
  const currentAge = parseFloat(byId("currentAge").value) || 0;
  const retireAge = parseFloat(byId("retireAge").value) || 0;
  const years = Math.max(0, retireAge - currentAge);
  const monthlyExp = parseFloat(byId("currentExpenses").value) || 0;
  const infl = (parseFloat(byId("inflationRate").value) || 0) / 100;

  const inflatedMonthly = monthlyExp * Math.pow(1 + infl, years);
  const annualAtRetire = inflatedMonthly * 12;
  const corpus = annualAtRetire * 25;

  const assumedReturn = 0.12;
  const n = years * 12;
  const monthlyReturn = assumedReturn / 12;

  let monthlySaving = 0;
  if (monthlyReturn > 0 && n > 0) {
    monthlySaving =
      corpus / (((Math.pow(1 + monthlyReturn, n) - 1) / monthlyReturn) * (1 + monthlyReturn));
  }

  byId("retireExpense").textContent = formatINR(inflatedMonthly);
  byId("retireCorpus").textContent = formatINR(corpus);
  byId("retireMonthlySave").textContent = formatINR(monthlySaving);

  const progress =
    retireAge > currentAge
      ? ((currentAge - 18) / (retireAge - 18)) * 100
      : 0;
  byId("roadmapProgress").style.width =
    Math.min(100, Math.max(0, progress)) + "%";

  byId("roadmapLabelLeft").textContent = "Current Age: " + currentAge;
  byId("roadmapLabelRight").textContent = "Retirement Age: " + retireAge;
}

// ---------- TABS ----------
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");

      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("hidden", panel.id !== target);
      });

      tabButtons.forEach((b) => b.classList.remove("tab-active"));
      btn.classList.add("tab-active");
    });
  });
}

// ---------- TOOLTIP LOGIC ----------
const tooltipContent = {
  "global-rate":
    "Global Rate: Annual nominal interest rate used across multiple tools. Example: 12% means ₹100 becomes ₹112 in 1 year (before compounding).",
  "global-tenure":
    "Tenure: Investment duration in years. Longer tenure amplifies the power of compounding.",
  "comp-frequency":
    "Compounding Frequency: How often interest is added to principal. Monthly compounding grows faster than annual compounding.",
  "log-years":
    "Logarithmic Years: Exact math for time to multiply money using t = ln(M)/ln(1+r). Captures non-linear compounding effects.",
  "cd-ratio":
    "CD Ratio: Loans / Deposits. If a bank has ₹70 loans and ₹100 deposits, CD = 70%. Too high can indicate aggressive lending.",
  gnpa:
    "Gross NPA Ratio: Gross NPAs / Gross Advances. Shows the share of bad loans in total loans for a bank.",
  nim:
    "NIM: Net Interest Income / Average Earning Assets. Indicates how profitable a bank’s lending operations are.",
  pe:
    "P/E Ratio: Price / Earnings per share. If P/E = 20, you pay ₹20 today for ₹1 of annual profit.",
  pb:
    "P/B Ratio: Price / Book Value per share. Values above 1 mean market values the business above its accounting book value.",
  roe:
    "ROE: Net Income / Shareholders’ Equity. Measures how efficiently equity capital is used to generate profit.",
  roce:
    "ROCE: EBIT / Capital Employed. Evaluates how well all long-term capital (debt + equity) is generating operating profits.",
  dte:
    "Debt-to-Equity: Total Debt / Equity. If D/E = 1, every ₹1 of equity is matched by ₹1 of debt.",
  sip:
    "SIP: Investing a fixed amount every month. Like planting a seed every month; ideal for rupee-cost averaging.",
  lumpsum:
    "Lumpsum: Investing one large amount at once. Like planting the whole forest in a single shot; benefits more if markets are undervalued.",
  "expected-return":
    "Expected Return: Assumed annual growth rate of your investments, usually based on historical equity or debt returns.",
  expenses:
    "Current Monthly Expenses: Your present lifestyle spending. This is projected into the future using inflation.",
  inflation:
    "Inflation: Annual increase in prices. At 6% inflation, costs roughly double in about 12 years (Rule of 72)."
};

function setupTooltips() {
  const tooltip = byId("tooltip");

  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest(".info-btn");
    if (!btn) {
      tooltip.classList.add("hidden");
      return;
    }

    const key = btn.getAttribute("data-info");
    const content = tooltipContent[key] || "No description available.";
    tooltip.textContent = content;
    tooltip.classList.remove("hidden");

    const rect = btn.getBoundingClientRect();
    const top = rect.bottom + 8;
    const left = Math.min(window.innerWidth - 280, rect.left);

    tooltip.style.top = top + "px";
    tooltip.style.left = left + "px";
  });
}

// ---------- INITIALIZATION ----------
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupTooltips();
  handleGlobalChange();
  updateBankingRatios();
  updateStockRatios();
  updateSipLumpsum();
  updateRetirement();
});
