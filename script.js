/**
 * Quant-Core Analytics Engine
 * Features: Logarithmic Wealth Prediction, Inflation Adjustment, Ratio Analysis
 */

let myChart;

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            updateDashboard();
        });
    });
    // Initial Calculation
    updateDashboard();
});

function updateDashboard() {
    calculateSipVsLump();
    calculateMultipliers();
    calculateRetirement();
    calculateRatios();
}

function calculateSipVsLump() {
    const P = parseFloat(document.getElementById('globalP').value) || 0;
    const R = (parseFloat(document.getElementById('globalR').value) || 0) / 100;
    const T = parseFloat(document.getElementById('globalT').value) || 0;

    const r_monthly = R / 12;
    const n_months = T * 12;

    // SIP Formula: P * [((1+r)^n - 1) / r] * (1+r)
    const fvSip = r_monthly > 0 ? P * ((Math.pow(1 + r_monthly, n_months) - 1) / r_monthly) * (1 + r_monthly) : P * n_months;
    
    // Lumpsum Formula: P * (1+r)^n
    const fvLump = P * Math.pow(1 + R, T);

    const winner = fvLump > fvSip ? "Lumpsum" : "SIP";
    const diff = Math.abs(fvLump - fvSip);
    
    document.getElementById('battleResult').innerText = `Winning Strategy: ${winner} (Advantage: ₹${diff.toLocaleString(undefined, {maximumFractionDigits: 0})})`;

    renderChart(fvSip, fvLump);
}

function calculateMultipliers() {
    const R = (parseFloat(document.getElementById('globalR').value) || 0) / 100;
    const P = parseFloat(document.getElementById('globalP').value) || 0;
    const multipliers = [2, 5, 10, 100];
    const tbody = document.getElementById('multiplierTable');
    
    let html = "";
    multipliers.forEach(m => {
        // Log math: t = ln(multiplier) / ln(1 + r)
        let years = R > 0 ? (Math.log(m) / Math.log(1 + R)).toFixed(1) : "∞";
        html += `<tr>
            <td>${m}x Factor</td>
            <td>${years} Years</td>
            <td>₹${(P * m).toLocaleString()}</td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

function calculateRetirement() {
    const currAge = parseInt(document.getElementById('currAge').value) || 0;
    const retAge = parseInt(document.getElementById('retAge').value) || 0;
    const monthlyExp = parseFloat(document.getElementById('currExp').value) || 0;
    const yearsToRetire = retAge - currAge;
    const inflation = 0.06; // Fixed 6% inflation assumption

    if (yearsToRetire > 0) {
        const inflatedExp = monthlyExp * Math.pow(1 + inflation, yearsToRetire);
        const corpusNeeded = (inflatedExp * 12) * 25; // 4% Rule (25x annual expenses)
        
        // Compound interest formula for required monthly savings (Goal Seek)
        const r_save = 0.12 / 12; // Assuming 12% return for accumulation phase
        const n_save = yearsToRetire * 12;
        const reqSave = corpusNeeded / (((Math.pow(1 + r_save, n_save) - 1) / r_save) * (1 + r_save));

        document.getElementById('inflatedExp').innerText = `₹${Math.round(inflatedExp).toLocaleString()}`;
        document.getElementById('targetCorpus').innerText = `₹${(corpusNeeded / 10000000).toFixed(2)} Cr`;
        document.getElementById('reqSaving').innerText = `₹${Math.round(reqSave).toLocaleString()}`;
    }
}

function calculateRatios() {
    // P/E Ratio
    const price = parseFloat(document.getElementById('stockPrice').value) || 0;
    const eps = parseFloat(document.getElementById('stockEPS').value) || 0;
    document.getElementById('peResult').innerText = eps !== 0 ? (price / eps).toFixed(2) : "0.00";

    // Debt to Equity
    const debt = parseFloat(document.getElementById('totalDebt').value) || 0;
    const equity = parseFloat(document.getElementById('totalEquity').value) || 0;
    document.getElementById('deResult').innerText = equity !== 0 ? (debt / equity).toFixed(2) : "0.00";

    // Banking CD Ratio
    const loans = parseFloat(document.getElementById('totalLoans').value) || 0;
    const deposits = parseFloat(document.getElementById('totalDeposits').value) || 0;
    document.getElementById('cdResult').innerText = deposits !== 0 ? ((loans / deposits) * 100).toFixed(1) + "%" : "0%";
}

function renderChart(sipVal, lumpVal) {
    const ctx = document.getElementById('siplumpChart').getContext('2d');
    
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['SIP Future Value', 'Lumpsum Future Value'],
            datasets: [{
                data: [sipVal, lumpVal],
                backgroundColor: ['#00d2ff', '#00ff88'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
                x: { ticks: { color: '#888' } }
            }
        }
    });
}
