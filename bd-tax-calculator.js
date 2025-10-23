import { ToolBase } from './ToolBase.js';

/**
 * Bangladesh Income Tax Calculator
 * Assessment Year 2025-26 (Income Year 2024-25)
 * Based on NBR (National Board of Revenue) tax rules
 */

// Tax Data for AY 2025-26
const TAX_DATA = {
    assessmentYear: '2025-26',
    incomeYear: '2024-25',

    // Tax slabs (progressive rates)
    slabs: [
        { min: 0,       max: 350000,  rate: 0 },   // Tax-free
        { min: 350001,  max: 700000,  rate: 10 },  // 10%
        { min: 700001,  max: 1200000, rate: 15 },  // 15%
        { min: 1200001, max: 3000000, rate: 20 },  // 20%
        { min: 3000001, max: Infinity, rate: 25 }  // 25%
    ],

    // Tax-free thresholds by category
    thresholds: {
        general: 350000,
        female: 400000,
        senior: 400000,          // 65+ years
        disabled: 475000,
        'freedom-fighter': 500000
    },

    // Minimum tax by region (only applicable if income exceeds threshold)
    minimumTax: {
        dhaka: 5000,
        chittagong: 5000,
        'other-city': 4000,
        'non-city': 3000
    },

    // Consolidated salary exemption (Income Tax Act 2023, Section 33)
    salaryExemption: {
        maxAmount: 500000,       // Increased from 450k in Finance Ordinance 2025
        percentage: 1/3          // One-third of gross salary
    },

    // Investment rebate rules
    investmentRebate: {
        rebateRate: 0.15,               // 15% of investment
        maxInvestmentPercent: 0.20,     // Max 20% of taxable income
        maxRebatePercent: 0.03,         // Max rebate = 3% of taxable income
        absoluteCap: 1000000            // BDT 10 lakh maximum rebate
    }
};

class BDTaxCalculator extends ToolBase {
    constructor() {
        super();
        this.selectedCategory = 'general';
        this.init();
    }

    initializeElements() {
        this.elements = {
            // Category buttons
            categoryButtons: document.querySelectorAll('[data-category]'),

            // Input fields
            region: document.getElementById('region'),
            salaryIncome: document.getElementById('salary-income'),
            businessIncome: document.getElementById('business-income'),
            otherIncome: document.getElementById('other-income'),
            investmentAmount: document.getElementById('investment-amount'),

            // Calculate button
            calculateBtn: document.getElementById('calculate-btn'),

            // Results section
            resultsSection: document.getElementById('results-section'),
            totalIncomeDisplay: document.getElementById('total-income-display'),
            taxableIncomeDisplay: document.getElementById('taxable-income-display'),
            taxBeforeRebateDisplay: document.getElementById('tax-before-rebate-display'),
            finalTaxDisplay: document.getElementById('final-tax-display'),
            breakdownDetails: document.getElementById('breakdown-details'),
            investmentRecommendation: document.getElementById('investment-recommendation'),
            recommendationText: document.getElementById('recommendation-text')
        };
    }

    attachEventListeners() {
        // Category selection
        this.elements.categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectCategory(e.target));
        });

        // Calculate button
        this.elements.calculateBtn.addEventListener('click', () => this.calculateTax());

        // Real-time calculation on input change
        const inputs = [
            this.elements.salaryIncome,
            this.elements.businessIncome,
            this.elements.otherIncome,
            this.elements.investmentAmount
        ];

        inputs.forEach(input => {
            input.addEventListener('input', this.debounce(() => {
                // Optional: Auto-calculate on input change
                // this.calculateTax();
            }, 500));
        });
    }

    selectCategory(button) {
        this.elements.categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.selectedCategory = button.dataset.category;
    }

    calculateTax() {
        // Get input values
        const salaryIncome = parseFloat(this.elements.salaryIncome.value) || 0;
        const businessIncome = parseFloat(this.elements.businessIncome.value) || 0;
        const otherIncome = parseFloat(this.elements.otherIncome.value) || 0;
        const investmentAmount = parseFloat(this.elements.investmentAmount.value) || 0;
        const region = this.elements.region.value;

        // Validate that at least some income is entered
        if (salaryIncome === 0 && businessIncome === 0 && otherIncome === 0) {
            this.showError('Please enter at least one income source');
            return;
        }

        // Step 1: Calculate gross income
        const grossIncome = {
            salary: salaryIncome,
            business: businessIncome,
            other: otherIncome
        };
        const totalGrossIncome = salaryIncome + businessIncome + otherIncome;

        // Step 2: Calculate salary exemption (consolidated as per Income Tax Act 2023)
        const salaryExemption = this.calculateSalaryExemption(salaryIncome);

        // Step 3: Calculate total income (after salary exemption)
        const totalIncome = totalGrossIncome - salaryExemption;

        // Step 4: Get tax-free threshold based on category
        const taxFreeThreshold = TAX_DATA.thresholds[this.selectedCategory];

        // Step 5: Calculate taxable income
        const taxableIncome = Math.max(0, totalIncome - taxFreeThreshold);

        // Step 6: Calculate tax using progressive slabs
        const taxBeforeRebate = this.calculateTaxBySlabs(taxableIncome);

        // Step 7: Calculate investment rebate
        const rebateDetails = this.calculateInvestmentRebate(taxableIncome, investmentAmount);

        // Step 8: Calculate tax after rebate
        const taxAfterRebate = Math.max(0, taxBeforeRebate - rebateDetails.rebate);

        // Step 9: Apply minimum tax
        const minimumTax = TAX_DATA.minimumTax[region];
        const finalTax = taxableIncome > 0 ? Math.max(taxAfterRebate, minimumTax) : 0;

        // Step 10: Calculate effective tax rate
        const effectiveTaxRate = totalGrossIncome > 0 ? (finalTax / totalGrossIncome) * 100 : 0;

        // Display results
        this.displayResults({
            grossIncome,
            totalGrossIncome,
            salaryExemption,
            totalIncome,
            taxFreeThreshold,
            taxableIncome,
            taxBeforeRebate,
            rebateDetails,
            taxAfterRebate,
            minimumTax,
            finalTax,
            effectiveTaxRate,
            investmentAmount
        });
    }

    calculateSalaryExemption(salaryIncome) {
        if (salaryIncome === 0) return 0;

        const { maxAmount, percentage } = TAX_DATA.salaryExemption;
        return Math.min(maxAmount, salaryIncome * percentage);
    }

    calculateTaxBySlabs(taxableIncome) {
        let tax = 0;
        let remainingIncome = taxableIncome;

        for (const slab of TAX_DATA.slabs) {
            if (remainingIncome <= 0) break;

            const slabWidth = slab.max - slab.min;
            const taxableInBracket = Math.min(remainingIncome, slabWidth);

            tax += (taxableInBracket * slab.rate) / 100;
            remainingIncome -= taxableInBracket;
        }

        return Math.round(tax);
    }

    calculateInvestmentRebate(taxableIncome, investmentAmount) {
        if (investmentAmount === 0 || taxableIncome === 0) {
            return {
                rebate: 0,
                maxAllowedInvestment: 0,
                maxPossibleRebate: 0,
                utilizationPercent: 0
            };
        }

        const { rebateRate, maxInvestmentPercent, maxRebatePercent, absoluteCap } = TAX_DATA.investmentRebate;

        // Calculate maximum allowed investment (20% of taxable income)
        const maxAllowedInvestment = taxableIncome * maxInvestmentPercent;

        // Calculate maximum possible rebate (3% of taxable income)
        const maxPossibleRebate = taxableIncome * maxRebatePercent;

        // Calculate actual rebate (minimum of three limits)
        const rebateFromInvestment = investmentAmount * rebateRate;
        const rebate = Math.min(
            maxPossibleRebate,
            rebateFromInvestment,
            absoluteCap
        );

        // Calculate how much of max rebate is being utilized
        const utilizationPercent = maxPossibleRebate > 0 ? (rebate / maxPossibleRebate) * 100 : 0;

        return {
            rebate: Math.round(rebate),
            maxAllowedInvestment: Math.round(maxAllowedInvestment),
            maxPossibleRebate: Math.round(maxPossibleRebate),
            utilizationPercent: Math.round(utilizationPercent),
            effectiveInvestment: Math.min(investmentAmount, maxAllowedInvestment)
        };
    }

    displayResults(data) {
        // Show results section
        this.show(this.elements.resultsSection);

        // Update summary stats
        this.elements.totalIncomeDisplay.textContent = this.formatCurrency(data.totalIncome);
        this.elements.taxableIncomeDisplay.textContent = this.formatCurrency(data.taxableIncome);
        this.elements.taxBeforeRebateDisplay.textContent = this.formatCurrency(data.taxBeforeRebate);
        this.elements.finalTaxDisplay.textContent = this.formatCurrency(data.finalTax);

        // Generate detailed breakdown
        this.elements.breakdownDetails.innerHTML = this.generateBreakdown(data);

        // Show investment recommendation if applicable
        this.showInvestmentRecommendation(data);

        // Scroll to results
        this.scrollToElement(this.elements.resultsSection);
    }

    generateBreakdown(data) {
        const categoryName = this.selectedCategory.charAt(0).toUpperCase() + this.selectedCategory.slice(1).replace('-', ' ');

        let html = '<div style="line-height: 2;">';

        // Income breakdown
        html += '<h4 style="margin: 0 0 1rem 0; color: var(--primary-color);">Income Calculation</h4>';
        html += `<div style="display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; margin-bottom: 1rem;">`;

        if (data.grossIncome.salary > 0) {
            html += `<div>Gross Salary Income:</div><div style="text-align: right; font-weight: 500;">${this.formatCurrency(data.grossIncome.salary)}</div>`;
            html += `<div style="padding-left: 1rem; color: var(--text-secondary);">Less: Salary Exemption (1/3 or max ৳500,000):</div><div style="text-align: right; color: var(--text-secondary);">(${this.formatCurrency(data.salaryExemption)})</div>`;
        }

        if (data.grossIncome.business > 0) {
            html += `<div>Business/Professional Income:</div><div style="text-align: right; font-weight: 500;">${this.formatCurrency(data.grossIncome.business)}</div>`;
        }

        if (data.grossIncome.other > 0) {
            html += `<div>Other Income:</div><div style="text-align: right; font-weight: 500;">${this.formatCurrency(data.grossIncome.other)}</div>`;
        }

        html += `<div style="border-top: 2px solid var(--border-color); padding-top: 0.5rem; font-weight: 600;">Total Income:</div><div style="border-top: 2px solid var(--border-color); padding-top: 0.5rem; text-align: right; font-weight: 600;">${this.formatCurrency(data.totalIncome)}</div>`;
        html += `<div style="color: var(--text-secondary);">Less: Tax-Free Threshold (${categoryName}):</div><div style="text-align: right; color: var(--text-secondary);">(${this.formatCurrency(data.taxFreeThreshold)})</div>`;
        html += `<div style="border-top: 2px solid var(--primary-color); padding-top: 0.5rem; font-weight: 700; color: var(--primary-color);">Taxable Income:</div><div style="border-top: 2px solid var(--primary-color); padding-top: 0.5rem; text-align: right; font-weight: 700; color: var(--primary-color);">${this.formatCurrency(data.taxableIncome)}</div>`;
        html += `</div>`;

        // Tax calculation by slabs
        if (data.taxableIncome > 0) {
            html += '<h4 style="margin: 1.5rem 0 1rem 0; color: var(--primary-color);">Tax Calculation (Progressive Slabs)</h4>';
            html += `<div style="display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; margin-bottom: 1rem;">`;
            html += this.generateSlabBreakdown(data.taxableIncome);
            html += `<div style="border-top: 2px solid var(--border-color); padding-top: 0.5rem; font-weight: 600;">Tax Before Rebate:</div><div style="border-top: 2px solid var(--border-color); padding-top: 0.5rem; text-align: right; font-weight: 600;">${this.formatCurrency(data.taxBeforeRebate)}</div>`;
            html += `</div>`;
        }

        // Investment rebate
        if (data.investmentAmount > 0) {
            html += '<h4 style="margin: 1.5rem 0 1rem 0; color: var(--primary-color);">Investment Tax Rebate</h4>';
            html += `<div style="display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; margin-bottom: 1rem;">`;
            html += `<div>Investment Amount:</div><div style="text-align: right;">${this.formatCurrency(data.investmentAmount)}</div>`;
            html += `<div style="color: var(--text-secondary); font-size: 0.9rem;">Max Allowed (20% of taxable income):</div><div style="text-align: right; color: var(--text-secondary); font-size: 0.9rem;">${this.formatCurrency(data.rebateDetails.maxAllowedInvestment)}</div>`;
            html += `<div style="color: var(--text-secondary); font-size: 0.9rem;">Rebate (15% of investment):</div><div style="text-align: right; color: var(--text-secondary); font-size: 0.9rem;">${this.formatCurrency(data.rebateDetails.rebate)}</div>`;
            html += `<div style="color: var(--text-secondary); font-size: 0.9rem;">Max Rebate (3% of taxable income):</div><div style="text-align: right; color: var(--text-secondary); font-size: 0.9rem;">${this.formatCurrency(data.rebateDetails.maxPossibleRebate)}</div>`;
            html += `<div style="font-weight: 600; color: green;">Final Rebate Applied:</div><div style="text-align: right; font-weight: 600; color: green;">(${this.formatCurrency(data.rebateDetails.rebate)})</div>`;
            html += `</div>`;
        }

        // Final tax
        html += '<h4 style="margin: 1.5rem 0 1rem 0; color: var(--primary-color);">Final Tax Calculation</h4>';
        html += `<div style="display: grid; grid-template-columns: 1fr auto; gap: 0.5rem;">`;
        if (data.rebateDetails.rebate > 0) {
            html += `<div>Tax After Rebate:</div><div style="text-align: right;">${this.formatCurrency(data.taxAfterRebate)}</div>`;
        }
        html += `<div>Minimum Tax (Regional):</div><div style="text-align: right;">${this.formatCurrency(data.minimumTax)}</div>`;
        html += `<div style="border-top: 3px solid var(--primary-color); padding-top: 0.5rem; font-weight: 700; font-size: 1.2rem; color: var(--primary-color);">Total Tax Payable:</div><div style="border-top: 3px solid var(--primary-color); padding-top: 0.5rem; text-align: right; font-weight: 700; font-size: 1.2rem; color: var(--primary-color);">${this.formatCurrency(data.finalTax)}</div>`;
        html += `<div style="color: var(--text-secondary); font-size: 0.9rem;">Effective Tax Rate:</div><div style="text-align: right; color: var(--text-secondary); font-size: 0.9rem;">${data.effectiveTaxRate.toFixed(2)}%</div>`;
        html += `</div>`;

        html += '</div>';
        return html;
    }

    generateSlabBreakdown(taxableIncome) {
        let html = '';
        let remainingIncome = taxableIncome;

        for (const slab of TAX_DATA.slabs) {
            if (remainingIncome <= 0) break;

            const slabWidth = slab.max - slab.min;
            const taxableInBracket = Math.min(remainingIncome, slabWidth);
            const taxInBracket = (taxableInBracket * slab.rate) / 100;

            if (taxableInBracket > 0) {
                const slabLabel = slab.max === Infinity
                    ? `Above ৳${this.formatNumber(slab.min)}`
                    : `৳${this.formatNumber(slab.min)} - ৳${this.formatNumber(slab.max)}`;

                html += `<div style="color: var(--text-secondary); font-size: 0.9rem;">${slabLabel} @ ${slab.rate}%:</div>`;
                html += `<div style="text-align: right; color: var(--text-secondary); font-size: 0.9rem;">${this.formatCurrency(Math.round(taxInBracket))}</div>`;
            }

            remainingIncome -= taxableInBracket;
        }

        return html;
    }

    showInvestmentRecommendation(data) {
        if (data.taxableIncome === 0) {
            this.hide(this.elements.investmentRecommendation);
            return;
        }

        const { rebateDetails, taxableIncome, investmentAmount } = data;

        // If no investment or can invest more for better rebate
        if (investmentAmount === 0) {
            const optimalInvestment = Math.min(
                rebateDetails.maxAllowedInvestment,
                (rebateDetails.maxPossibleRebate / 0.15) // Investment needed to get max rebate
            );

            this.elements.recommendationText.innerHTML =
                `You can invest up to <strong>৳${this.formatNumber(Math.round(optimalInvestment))}</strong> to get a tax rebate of up to <strong>৳${this.formatNumber(rebateDetails.maxPossibleRebate)}</strong>. ` +
                `This includes investments in life insurance, DPS, provident fund, stock market, and savings certificates.`;
            this.show(this.elements.investmentRecommendation);
        } else if (rebateDetails.utilizationPercent < 100) {
            const additionalInvestmentNeeded = Math.min(
                rebateDetails.maxAllowedInvestment - investmentAmount,
                ((rebateDetails.maxPossibleRebate - rebateDetails.rebate) / 0.15)
            );

            if (additionalInvestmentNeeded > 100) {
                this.elements.recommendationText.innerHTML =
                    `You're utilizing ${rebateDetails.utilizationPercent}% of your maximum rebate potential. ` +
                    `Invest an additional <strong>৳${this.formatNumber(Math.round(additionalInvestmentNeeded))}</strong> to maximize your tax savings (additional rebate: <strong>৳${this.formatNumber(Math.round(additionalInvestmentNeeded * 0.15))}</strong>).`;
                this.show(this.elements.investmentRecommendation);
            } else {
                this.hide(this.elements.investmentRecommendation);
            }
        } else {
            this.hide(this.elements.investmentRecommendation);
        }
    }

    formatCurrency(amount) {
        return '৳' + this.formatNumber(Math.round(amount));
    }

    showError(message) {
        alert(message);
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BDTaxCalculator();
});
