document.addEventListener('DOMContentLoaded', () => {
    // Conversion rates based on Square Feet (Sq. Ft.)
    const CONVERSIONS = {
        ACRE_TO_SQFT: 43560,
        BIGHA_TO_SQFT: 14400,
        KATHA_TO_SQFT: 720,
        SHOTOK_TO_SQFT: 435.6,
    };

    // Get all input elements
    const inputs = {
        acre: document.getElementById('acre'),
        bigha: document.getElementById('bigha'),
        katha: document.getElementById('katha'),
        shotok: document.getElementById('shotok'),
        sqft: document.getElementById('sqft'),
    };

    const resetBtn = document.getElementById('reset-btn');

    // Flag to prevent infinite loops during updates
    let isUpdating = false;

    // Function to update all fields based on a single input
    function updateValues(sourceUnit, sourceValue) {
        if (isUpdating) return;
        isUpdating = true;

        const value = parseFloat(sourceValue);

        // If input is empty or not a number, clear all fields
        if (isNaN(value) || value === 0) {
            clearAllInputs();
            isUpdating = false;
            return;
        }

        let baseSqft = 0;

        // 1. Convert the source unit to the base unit (Square Feet)
        switch (sourceUnit) {
            case 'acre':
                baseSqft = value * CONVERSIONS.ACRE_TO_SQFT;
                break;
            case 'bigha':
                baseSqft = value * CONVERSIONS.BIGHA_TO_SQFT;
                break;
            case 'katha':
                baseSqft = value * CONVERSIONS.KATHA_TO_SQFT;
                break;
            case 'shotok':
                baseSqft = value * CONVERSIONS.SHOTOK_TO_SQFT;
                break;
            case 'sqft':
                baseSqft = value;
                break;
        }

        // 2. Calculate all other units from the base Square Feet
        const calculatedValues = {
            acre: baseSqft / CONVERSIONS.ACRE_TO_SQFT,
            bigha: baseSqft / CONVERSIONS.BIGHA_TO_SQFT,
            katha: baseSqft / CONVERSIONS.KATHA_TO_SQFT,
            shotok: baseSqft / CONVERSIONS.SHOTOK_TO_SQFT,
            sqft: baseSqft,
        };

        // 3. Update the input fields with the new values
        for (const unit in inputs) {
            if (unit !== sourceUnit) {
                // Format to a reasonable number of decimal places
                inputs[unit].value = parseFloat(calculatedValues[unit].toFixed(4));
            }
        }

        isUpdating = false;
    }

    // Function to clear all input fields
    function clearAllInputs() {
        for (const unit in inputs) {
            inputs[unit].value = '';
        }
    }

    // Add event listeners to all input fields
    for (const unit in inputs) {
        inputs[unit].addEventListener('input', (e) => {
            updateValues(unit, e.target.value);
        });
    }

    // Add event listener for the reset button
    resetBtn.addEventListener('click', clearAllInputs);
});
