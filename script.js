let interestChart, sipChart;

function switchTab(id, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}

function recalc() {
  const P = +document.getElementById("P").value;
  const R = +document.getElementById("R").value / 100;
  const T = +document.getElementById("T").value;

  document.getElementById("si").innerText = "₹" + (P * (1 + R * T)).toFixed(0);
  document.getElementById("ci").innerText = "₹" + (P * Math.pow(1 + R, T)).toFixed(0);

  // Chart
  const years = [], siArr = [], ciArr = [];
  for (let i = 0; i <= T; i++) {
    years.push(i);
    siArr.push(P * (1 + R * i));
    ciArr.push(P * Math.pow(1 + R, i));
  }

  if (interestChart) interestChart.destroy();
  interestChart = new Chart(document.getElementById("interestChart"), {
    type: "line",
    data: {
      labels: years,
      datasets: [
        { label: "Simple", data: siArr, borderColor: "#38bdf8" },
        { label: "Compound", data: ciArr, borderColor: "#22c55e" }
      ]
    }
  });

  // Stocks
  const price = +document.getElementById("price").value;
  const eps = +document.getElementById("eps").value;
  document.getElementById("pe").innerText = eps ? (price / eps).toFixed(2) : "—";

  // Banking
  const loans = +document.getElementById("loans").value;
  const deposits = +document.getElementById("deposits").value;
  document.getElementById("cdr").innerText = deposits ? (loans / deposits).toFixed(2) : "—";

  // SIP vs Lumpsum
  const sip = +document.getElementById("sipAmount").value;
  const lump = +document.getElementById("lumpAmount").value;
  const r = R / 12;
  const n = T * 12;

  if (sip) {
    const sipValue = sip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    document.getElementById("sipFV").innerText = "₹" + sipValue.toFixed(0);
  }

  if (lump) {
    document.getElementById("lumpFV").innerText =
      "₹" + (lump * Math.pow(1 + r, n)).toFixed(0);
  }
}

document.querySelectorAll("input").forEach(i => i.addEventListener("input", recalc));
recalc();
