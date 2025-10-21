document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const invoiceNumberInput = document.getElementById('invoice-number');
    const invoiceDateInput = document.getElementById('invoice-date');
    const invoiceDueDateInput = document.getElementById('invoice-due-date');
    const yourCompanyNameInput = document.getElementById('your-company-name');
    const yourAddressInput = document.getElementById('your-address');
    const yourPhoneInput = document.getElementById('your-phone');
    const yourEmailInput = document.getElementById('your-email');
    const logoUploadInput = document.getElementById('logo-upload');
    const clientCompanyNameInput = document.getElementById('client-company-name');
    const clientAddressInput = document.getElementById('client-address');
    const notesInput = document.getElementById('notes');
    const itemList = document.getElementById('item-list');
    const addItemBtn = document.getElementById('add-item-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const invoicePreviewArea = document.getElementById('invoice-preview-area');

    let logoDataUrl = '';
    let updateTimeout = null;

    // --- Helper Functions ---
    function formatCurrency(amount) {
        return `৳${parseFloat(amount).toFixed(2)}`;
    }

    // Debounced update for better performance
    function debouncedUpdate() {
        if (updateTimeout) clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => updatePreview(), 150);
    }

    function updatePreview() {
        let itemsHtml = '';
        let subtotal = 0;

        itemList.querySelectorAll('.item-row').forEach(row => {
            const description = row.querySelector('.description-field').value;
            const quantity = parseFloat(row.querySelector('.quantity-field').value) || 0;
            const price = parseFloat(row.querySelector('.price-field').value) || 0;
            const total = quantity * price;
            subtotal += total;

            itemsHtml += `
                <tr>
                    <td>${description}</td>
                    <td>${quantity}</td>
                    <td>${formatCurrency(price)}</td>
                    <td class="total-col">${formatCurrency(total)}</td>
                </tr>
            `;
        });

        const grandTotal = subtotal; // For simplicity, no tax/discount in MVP

        invoicePreviewArea.innerHTML = `
            <div class="invoice-header-preview">
                <div>
                    ${logoDataUrl ? `<img src="${logoDataUrl}" class="invoice-logo-preview" alt="Company Logo">` : ''}
                    <p style="font-weight: bold; margin-top: 10px;">${yourCompanyNameInput.value}</p>
                    <p>${yourAddressInput.value}</p>
                    <p>${yourPhoneInput.value}</p>
                    <p>${yourEmailInput.value}</p>
                </div>
                <div class="invoice-details-preview">
                    <h1 class="invoice-title-preview">INVOICE</h1>
                    <p><b>Invoice #:</b> ${invoiceNumberInput.value}</p>
                    <p><b>Date:</b> ${invoiceDateInput.value}</p>
                    <p><b>Due Date:</b> ${invoiceDueDateInput.value}</p>
                </div>
            </div>

            <div class="invoice-address-section">
                <div>
                    <p style="font-weight: bold;">Bill To:</p>
                    <p>${clientCompanyNameInput.value}</p>
                    <p>${clientAddressInput.value}</p>
                </div>
            </div>

            <table class="invoice-table-preview">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div class="totals-section">
                <div class="totals-row">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(subtotal)}</span>
                </div>
                <div class="totals-row grand-total">
                    <span>GRAND TOTAL:</span>
                    <span>${formatCurrency(grandTotal)}</span>
                </div>
            </div>

            <div class="invoice-notes-preview">
                <p style="font-weight: bold;">Notes/Terms:</p>
                <p>${notesInput.value.replace(/\n/g, '<br>')}</p>
            </div>
        `;
    }

    function addRow() {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <input type="text" class="description-field" placeholder="Description">
            <input type="number" class="quantity-field" value="1" min="0">
            <input type="number" class="price-field" value="0.00" min="0" step="0.01">
            <input type="text" class="total-field" value="0.00" readonly>
            <button class="remove-item-btn" title="Delete item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
            </button>
        `;
        itemList.appendChild(row);
        addEventListenersToRow(row);
        updatePreview();
    }

    function addEventListenersToRow(row) {
        const qtyInput = row.querySelector('.quantity-field');
        const priceInput = row.querySelector('.price-field');
        const totalField = row.querySelector('.total-field');
        const removeBtn = row.querySelector('.remove-item-btn');

        const calculateRowTotal = () => {
            const quantity = parseFloat(qtyInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            totalField.value = (quantity * price).toFixed(2);
            debouncedUpdate();
        };

        qtyInput.addEventListener('input', calculateRowTotal);
        priceInput.addEventListener('input', calculateRowTotal);
        row.querySelector('.description-field').addEventListener('input', debouncedUpdate);

        removeBtn.addEventListener('click', () => {
            const itemCount = itemList.querySelectorAll('.item-row').length;

            // Prevent deletion if only 1 item remains
            if (itemCount <= 1) {
                alert('You must have at least one item in the invoice.');
                return;
            }

            row.remove();
            updatePreview();
        });
    }

    // --- Event Listeners ---
    const inputFields = document.querySelectorAll('.input-field, .input-textarea');
    inputFields.forEach(field => field.addEventListener('input', debouncedUpdate));

    addItemBtn.addEventListener('click', addRow);

    logoUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                logoDataUrl = event.target.result;
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });

    downloadPdfBtn.addEventListener('click', async () => {
        downloadPdfBtn.textContent = 'Generating PDF...';
        downloadPdfBtn.disabled = true;

        // Temporarily hide scrollbars for cleaner PDF generation
        invoicePreviewArea.style.overflow = 'hidden';

        const canvas = await html2canvas(invoicePreviewArea, {
            scale: 2, // Increase scale for better quality
            useCORS: true, // Required if images are from different origin
            logging: false,
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jspdf.jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('invoice.pdf');

        invoicePreviewArea.style.overflow = 'auto'; // Restore scrollbars
        downloadPdfBtn.textContent = 'Download PDF';
        downloadPdfBtn.disabled = false;
    });

    // --- Initial Setup ---
    invoiceDateInput.valueAsDate = new Date(); // Set current date
    addRow(); // Add first item row
    updatePreview(); // Initial preview render
});
