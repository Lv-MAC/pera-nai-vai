document.addEventListener('DOMContentLoaded', () => {
    // --- Tab Handling ---
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs and content
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activate the clicked tab and its content
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // --- EMI Calculator ---
    const emiCalculateBtn = document.getElementById('emi-calculate-btn');
    emiCalculateBtn.addEventListener('click', () => {
        const principal = parseFloat(document.getElementById('emi-principal').value);
        const annualRate = parseFloat(document.getElementById('emi-rate').value);
        const tenureYears = parseFloat(document.getElementById('emi-tenure').value);

        if (principal > 0 && annualRate > 0 && tenureYears > 0) {
            const monthlyRate = annualRate / 12 / 100;
            const tenureMonths = tenureYears * 12;
            
            const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
            
            document.getElementById('emi-result').textContent = emi.toFixed(2);
        } else {
            document.getElementById('emi-result').textContent = '0';
        }
    });

    // --- DPS Calculator ---
    const dpsCalculateBtn = document.getElementById('dps-calculate-btn');
    dpsCalculateBtn.addEventListener('click', () => {
        const installment = parseFloat(document.getElementById('dps-installment').value);
        const annualRate = parseFloat(document.getElementById('dps-rate').value);
        const tenureYears = parseFloat(document.getElementById('dps-tenure').value);

        if (installment > 0 && annualRate > 0 && tenureYears > 0) {
            const monthlyRate = annualRate / 12 / 100;
            const tenureMonths = tenureYears * 12;

            // Formula for Future Value of an Annuity
            const maturity = installment * ((Math.pow(1 + monthlyRate, tenureMonths) - 1) / monthlyRate);

            document.getElementById('dps-result').textContent = maturity.toFixed(2);
        } else {
            document.getElementById('dps-result').textContent = '0';
        }
    });

    // --- FDR Calculator ---
    const fdrCalculateBtn = document.getElementById('fdr-calculate-btn');
    fdrCalculateBtn.addEventListener('click', () => {
        const principal = parseFloat(document.getElementById('fdr-principal').value);
        const annualRate = parseFloat(document.getElementById('fdr-rate').value);
        const tenureYears = parseFloat(document.getElementById('fdr-tenure').value);

        if (principal > 0 && annualRate > 0 && tenureYears > 0) {
            // Assuming interest is compounded annually for simplicity in this basic calculator
            const maturity = principal * Math.pow((1 + annualRate / 100), tenureYears);

            document.getElementById('fdr-result').textContent = maturity.toFixed(2);
        } else {
            document.getElementById('fdr-result').textContent = '0';
        }
    });
});
