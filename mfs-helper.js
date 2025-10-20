document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const FEES = {
        bKash: {
            cashOut: 0.0185, // 1.85%
            sendMoney: 5,    // 5 Taka flat fee
            name: 'bKash'
        },
        nagad: {
            cashOut: 0.0125, // 1.25% (App rate)
            sendMoney: 0,    // Free
            name: 'Nagad'
        },
        rocket: {
            cashOut: 0.0180, // 1.80%
            sendMoney: 0,    // Free
            name: 'Rocket'
        }
    };

    // --- ELEMENTS ---
    const amountInput = document.getElementById('amount-input');
    const calcModeRadios = document.querySelectorAll('input[name="calc-mode"]');
    const cashOutResultsContainer = document.getElementById('cash-out-results');
    const sendMoneyResultsContainer = document.getElementById('send-money-results');
    const faqItems = document.querySelectorAll('.faq-question');

    // --- FUNCTIONS ---

    /**
     * Calculates all fees and updates the UI
     */
    function calculateAndDisplay() {
        const amount = parseFloat(amountInput.value) || 0;
        const mode = document.querySelector('input[name="calc-mode"]:checked').value;

        if (amount === 0) {
            clearResults();
            return;
        }

        // Calculate for each transaction type
        const cashOutCalcs = calculateAllProviders(amount, mode, 'cashOut');
        const sendMoneyCalcs = calculateAllProviders(amount, mode, 'sendMoney');

        // Display results
        displayResults(cashOutCalcs, cashOutResultsContainer);
        displayResults(sendMoneyCalcs, sendMoneyResultsContainer);
    }

    /**
     * Calculates fees for all MFS providers for a given transaction type
     * @param {number} amount - The input amount
     * @param {string} mode - 'send' or 'receive'
     * @param {string} type - 'cashOut' or 'sendMoney'
     * @returns {Array} - An array of calculated result objects
     */
    function calculateAllProviders(amount, mode, type) {
        return Object.keys(FEES).map(key => {
            const provider = FEES[key];
            const feeRule = provider[type];
            let initialAmount, fee, finalAmount;

            if (mode === 'send') {
                initialAmount = amount;
                if (type === 'cashOut') {
                    fee = initialAmount * feeRule;
                    finalAmount = initialAmount - fee;
                } else { // sendMoney
                    fee = feeRule; // Flat fee
                    finalAmount = initialAmount;
                }
            } else { // receive
                finalAmount = amount;
                if (type === 'cashOut') {
                    // Formula for reverse cash-out: Initial = Final / (1 - Rate)
                    initialAmount = finalAmount / (1 - feeRule);
                    fee = initialAmount - finalAmount;
                } else { // sendMoney
                    fee = feeRule;
                    initialAmount = finalAmount; // For Send Money, the amount is the same
                }
            }

            return {
                name: provider.name,
                totalCost: (type === 'cashOut') ? fee : (initialAmount + fee),
                fee,
                initialAmount,
                finalAmount
            };
        });
    }

    /**
     * Renders the result cards in the specified container
     * @param {Array} results - Array of calculated result objects
     * @param {HTMLElement} container - The container to render into
     */
    function displayResults(results, container) {
        container.innerHTML = container.querySelector('h3').outerHTML; // Keep title, clear content

        // Find the minimum cost
        const minCost = Math.min(...results.map(r => r.totalCost));

        results.forEach(res => {
            const isCheapest = res.totalCost === minCost && minCost > 0;
            const card = document.createElement('div');
            card.className = `result-card ${isCheapest ? 'cheapest' : ''}`;

            card.innerHTML = `
                <div class="result-header">${res.name}</div>
                <div class="result-details">
                    <span>Fee: ${res.fee.toFixed(2)} Taka</span>
                    <span>You need to have: ${res.initialAmount.toFixed(2)} Taka</span>
                    <span class="final-amount">Final Amount: ${res.finalAmount.toFixed(2)} Taka</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    /**
     * Clears the results containers
     */
    function clearResults() {
        cashOutResultsContainer.innerHTML = cashOutResultsContainer.querySelector('h3').outerHTML;
        sendMoneyResultsContainer.innerHTML = sendMoneyResultsContainer.querySelector('h3').outerHTML;
    }

    // --- EVENT LISTENERS ---
    amountInput.addEventListener('input', calculateAndDisplay);
    calcModeRadios.forEach(radio => radio.addEventListener('change', calculateAndDisplay));

    // FAQ Accordion
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const answer = item.nextElementSibling;
            const isVisible = answer.style.display === 'block';
            // Close all others
            document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
            document.querySelectorAll('.faq-question span').forEach(s => s.textContent = '+');
            // Toggle current
            if (!isVisible) {
                answer.style.display = 'block';
                item.querySelector('span').textContent = '-';
            }
        });
    });
});
