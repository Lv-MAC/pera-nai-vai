// QR Code Generator with real QR code generation using qrcode.js

class QRCodeGenerator {
    constructor() {
        this.currentSize = 300;
        this.errorCorrectionLevel = 'M';
        this.fgColor = '#000000';
        this.bgColor = '#FFFFFF';
        this.qrcode = null;

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');

        // Input elements
        this.textInput = document.getElementById('text-input');
        this.wifiSSID = document.getElementById('wifi-ssid');
        this.wifiPassword = document.getElementById('wifi-password');
        this.wifiSecurity = document.getElementById('wifi-security');
        this.wifiHidden = document.getElementById('wifi-hidden');
        this.emailAddress = document.getElementById('email-address');
        this.emailSubject = document.getElementById('email-subject');
        this.emailBody = document.getElementById('email-body');
        this.phoneNumber = document.getElementById('phone-number');
        this.smsNumber = document.getElementById('sms-number');
        this.smsMessage = document.getElementById('sms-message');

        // Customization elements
        this.sizeSlider = document.getElementById('size-slider');
        this.sizeValue = document.getElementById('size-value');
        this.fgColorInput = document.getElementById('fg-color');
        this.bgColorInput = document.getElementById('bg-color');
        this.errorLevelBtns = document.querySelectorAll('.error-level-btn');

        // Action elements
        this.generateBtn = document.getElementById('generate-btn');
        this.downloadPngBtn = document.getElementById('download-png');
        this.downloadSvgBtn = document.getElementById('download-svg');
        this.qrDisplay = document.getElementById('qr-display');
        this.downloadOptions = document.getElementById('download-options');
    }

    attachEventListeners() {
        // Tab switching
        this.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Size slider
        this.sizeSlider.addEventListener('input', (e) => {
            this.currentSize = e.target.value;
            this.sizeValue.textContent = `${this.currentSize}px`;
        });

        // Color inputs
        this.fgColorInput.addEventListener('change', (e) => {
            this.fgColor = e.target.value;
        });

        this.bgColorInput.addEventListener('change', (e) => {
            this.bgColor = e.target.value;
        });

        // Error correction level
        this.errorLevelBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.errorLevelBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.errorCorrectionLevel = e.target.dataset.level;
            });
        });

        // Generate button
        this.generateBtn.addEventListener('click', () => this.generateQRCode());

        // Download buttons
        this.downloadPngBtn.addEventListener('click', () => this.downloadPNG());
        this.downloadSvgBtn.addEventListener('click', () => this.downloadSVG());

        // Theme toggle
        this.initTheme();
    }

    initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');

        const currentTheme = localStorage.getItem('theme') || 'light';
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');

            if (isDark) {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
                localStorage.setItem('theme', 'dark');
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
                localStorage.setItem('theme', 'light');
            }
        });
    }

    switchTab(tabName) {
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }

    getCurrentTabData() {
        const activeTab = document.querySelector('.tab-button.active').dataset.tab;

        switch(activeTab) {
            case 'text':
                return this.textInput.value || '';

            case 'wifi':
                const ssid = this.wifiSSID.value;
                const password = this.wifiPassword.value;
                const security = this.wifiSecurity.value;
                const hidden = this.wifiHidden.checked ? 'true' : 'false';

                if (!ssid) return '';

                // WiFi QR code format: WIFI:T:WPA;S:mynetwork;P:mypass;H:false;;
                return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;

            case 'email':
                const email = this.emailAddress.value;
                if (!email) return '';

                const subject = this.emailSubject.value;
                const body = this.emailBody.value;
                let mailto = `mailto:${email}`;

                const params = [];
                if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
                if (body) params.push(`body=${encodeURIComponent(body)}`);

                if (params.length > 0) {
                    mailto += '?' + params.join('&');
                }

                return mailto;

            case 'phone':
                const phone = this.phoneNumber.value;
                return phone ? `tel:${phone}` : '';

            case 'sms':
                const smsNum = this.smsNumber.value;
                if (!smsNum) return '';

                const smsMsg = this.smsMessage.value;
                // SMS format: sms:number?body=message or smsto:number:message
                return smsMsg ? `sms:${smsNum}?body=${encodeURIComponent(smsMsg)}` : `sms:${smsNum}`;

            default:
                return '';
        }
    }

    generateQRCode() {
        const data = this.getCurrentTabData();

        if (!data) {
            alert('Please enter some data to generate a QR code');
            return;
        }

        // Hide placeholder
        const placeholder = document.querySelector('.qr-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        // Clear previous QR code if exists
        const existingQR = document.getElementById('qr-output');
        if (existingQR) {
            existingQR.remove();
        }

        // Hide canvas (we'll use the qrcode.js library's output)
        const canvas = document.getElementById('qr-canvas');
        if (canvas) {
            canvas.style.display = 'none';
        }

        // Create container for QR code
        const qrContainer = document.createElement('div');
        qrContainer.id = 'qr-output';
        qrContainer.style.display = 'flex';
        qrContainer.style.justifyContent = 'center';
        qrContainer.style.alignItems = 'center';
        this.qrDisplay.appendChild(qrContainer);

        // Map error correction levels
        const correctionLevelMap = {
            'L': QRCode.CorrectLevel.L,
            'M': QRCode.CorrectLevel.M,
            'Q': QRCode.CorrectLevel.Q,
            'H': QRCode.CorrectLevel.H
        };

        // Generate QR code using qrcode.js
        this.qrcode = new QRCode(qrContainer, {
            text: data,
            width: this.currentSize,
            height: this.currentSize,
            colorDark: this.fgColor,
            colorLight: this.bgColor,
            correctLevel: correctionLevelMap[this.errorCorrectionLevel]
        });

        // Show download options
        this.downloadOptions.style.display = 'flex';

        // Scroll to QR code
        qrContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    downloadPNG() {
        if (!this.qrcode) {
            alert('Please generate a QR code first');
            return;
        }

        // Get the generated canvas or image from qrcode.js
        const qrOutput = document.querySelector('#qr-output img') || document.querySelector('#qr-output canvas');

        if (!qrOutput) {
            alert('QR code not found');
            return;
        }

        if (qrOutput.tagName === 'IMG') {
            // If it's an image, create a link to download it
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = qrOutput.src;
            link.click();
        } else if (qrOutput.tagName === 'CANVAS') {
            // If it's a canvas, convert to data URL
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = qrOutput.toDataURL('image/png');
            link.click();
        }
    }

    downloadSVG() {
        if (!this.qrcode) {
            alert('Please generate a QR code first');
            return;
        }

        // Get the QR code data
        const qrOutput = document.querySelector('#qr-output img') || document.querySelector('#qr-output canvas');

        if (!qrOutput) {
            alert('QR code not found');
            return;
        }

        // Create SVG with embedded image
        const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${this.currentSize}" height="${this.currentSize}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect width="${this.currentSize}" height="${this.currentSize}" fill="${this.bgColor}"/>
    <image x="0" y="0" width="${this.currentSize}" height="${this.currentSize}" xlink:href="${qrOutput.src || qrOutput.toDataURL('image/png')}"/>
</svg>`;

        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.download = 'qrcode.svg';
        link.href = url;
        link.click();

        URL.revokeObjectURL(url);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QRCodeGenerator();
});