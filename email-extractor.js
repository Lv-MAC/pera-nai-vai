// Email Extractor JavaScript

class EmailExtractor {
    constructor() {
        this.emails = [];
        this.uniqueEmails = new Set();
        this.currentMethod = 'text';
        this.sortOrder = 'asc';

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Input elements
        this.methodBtns = document.querySelectorAll('.method-btn');
        this.textInput = document.getElementById('text-input');
        this.textInputArea = document.getElementById('text-input-area');
        this.fileUploadArea = document.getElementById('file-upload-area');
        this.fileInput = document.getElementById('file-input');
        this.loadSampleBtn = document.getElementById('load-sample');
        this.extractBtn = document.getElementById('extract-btn');

        // Output elements
        this.totalEmailsEl = document.getElementById('total-emails');
        this.uniqueEmailsEl = document.getElementById('unique-emails');
        this.totalDomainsEl = document.getElementById('total-domains');
        this.duplicatesEl = document.getElementById('duplicates');
        this.emailsList = document.getElementById('emails-list');
        this.domainsBreakdown = document.getElementById('domains-breakdown');
        this.domainsList = document.getElementById('domains-list');

        // Filter and sort
        this.filterInput = document.getElementById('filter-input');
        this.sortBtn = document.getElementById('sort-btn');

        // Export buttons
        this.copyAllBtn = document.getElementById('copy-all-btn');
        this.downloadTxtBtn = document.getElementById('download-txt-btn');
        this.downloadCsvBtn = document.getElementById('download-csv-btn');
        this.downloadJsonBtn = document.getElementById('download-json-btn');
    }

    attachEventListeners() {
        // Method switching
        this.methodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMethod(e.target.dataset.method));
        });

        // File upload
        this.fileUploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileUploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.fileUploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.fileUploadArea.addEventListener('drop', this.handleDrop.bind(this));
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Sample text
        this.loadSampleBtn.addEventListener('click', () => this.loadSampleText());

        // Extract button
        this.extractBtn.addEventListener('click', () => this.extractEmails());

        // Filter and sort
        this.filterInput.addEventListener('input', () => this.filterEmails());
        this.sortBtn.addEventListener('click', () => this.toggleSort());

        // Export buttons
        this.copyAllBtn.addEventListener('click', () => this.copyAll());
        this.downloadTxtBtn.addEventListener('click', () => this.downloadTXT());
        this.downloadCsvBtn.addEventListener('click', () => this.downloadCSV());
        this.downloadJsonBtn.addEventListener('click', () => this.downloadJSON());

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

    switchMethod(method) {
        this.currentMethod = method;
        this.methodBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.method === method);
        });

        if (method === 'text') {
            this.textInputArea.style.display = 'block';
            this.fileUploadArea.classList.remove('active');
        } else {
            this.textInputArea.style.display = 'none';
            this.fileUploadArea.classList.add('active');
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        this.fileUploadArea.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.fileUploadArea.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.fileUploadArea.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    async processFile(file) {
        // File size validation - 10MB limit
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

        if (file.size > MAX_FILE_SIZE) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            alert(`File size (${fileSizeMB}MB) exceeds the 10MB limit. Please choose a smaller file.`);
            this.fileInput.value = ''; // Clear the file input
            return;
        }

        // Show loading state
        this.extractBtn.classList.add('loading');
        this.extractBtn.querySelector('span').textContent = 'Processing file...';

        try {
            let content = '';

            // Check file type
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                // Parse PDF
                content = await this.parsePDF(file);
            } else {
                // Parse as text
                content = await this.readTextFile(file);
            }

            this.textInput.value = content;
            // Switch to text view to show the content
            this.switchMethod('text');

            // Extract emails after loading
            this.extractEmails();
        } catch (error) {
            console.error('Error processing file:', error);
            alert('Error reading file. Please try again or paste the text manually.');
        } finally {
            // Reset button state
            this.extractBtn.classList.remove('loading');
            this.extractBtn.querySelector('span').textContent = 'Extract Email Addresses';
        }
    }

    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read text file'));

            reader.readAsText(file);
        });
    }

    async parsePDF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const typedArray = new Uint8Array(e.target.result);
                    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

                    let fullText = '';

                    // Extract text from all pages
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n';
                    }

                    resolve(fullText);
                } catch (error) {
                    reject(new Error('Failed to parse PDF: ' + error.message));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read PDF file'));
            reader.readAsArrayBuffer(file);
        });
    }

    loadSampleText() {
        const sampleText = `Dear Team,

Please find below the contact information for our key stakeholders:

John Doe - CEO
Email: john.doe@techcorp.com
Phone: +1-555-0100

Jane Smith - CTO
Contact: jane.smith@techcorp.com or j.smith@personal-email.net
Alternative: jane_smith_2024@gmail.com

Marketing Department:
- marketing@techcorp.com
- social.media@techcorp.com
- pr.team@techcorp.com

Support Team:
support@techcorp.com (Primary)
help@techcorp.com (Secondary)
tickets@support.techcorp.com (Ticketing System)

International Offices:
UK Office: uk.office@techcorp.co.uk
Germany: de.office@techcorp.de
Japan: jp.office@techcorp.jp

Duplicate test - john.doe@techcorp.com appears again here.

For partnerships, contact: partnerships@techcorp.com
Investor relations: investors@techcorp.com

Some invalid emails to test filtering:
not.an.email
@invalid.com
someone@
test@.com

Best regards,
HR Team
hr@techcorp.com
human.resources@techcorp.com`;

        this.textInput.value = sampleText;
    }

    extractEmails() {
        const text = this.textInput.value;

        if (!text.trim()) {
            alert('Please enter some text or upload a file');
            return;
        }

        // Enhanced email regex pattern
        // This pattern matches most common email formats
        const emailRegex = /\b[A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9][A-Za-z0-9.-]*\.[A-Z|a-z]{2,}\b/g;

        // Extract all emails
        const matches = text.match(emailRegex);

        if (matches) {
            this.emails = matches.map(email => email.toLowerCase());
            this.uniqueEmails = new Set(this.emails);
            this.displayResults();
            this.enableExportButtons();
        } else {
            this.emails = [];
            this.uniqueEmails = new Set();
            this.displayNoResults();
            this.disableExportButtons();
        }

        this.updateStatistics();
    }

    displayResults() {
        const uniqueArray = Array.from(this.uniqueEmails).sort();

        let html = '';
        uniqueArray.forEach(email => {
            html += `
                <div class="email-item">
                    <span class="email-text">${email}</span>
                    <button class="copy-btn" onclick="navigator.clipboard.writeText('${email}')">Copy</button>
                </div>
            `;
        });

        this.emailsList.innerHTML = html;
        this.displayDomainBreakdown();
    }

    displayNoResults() {
        this.emailsList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <p>No valid email addresses found</p>
            </div>
        `;
        this.domainsBreakdown.style.display = 'none';
    }

    displayDomainBreakdown() {
        const domainCount = {};

        Array.from(this.uniqueEmails).forEach(email => {
            const domain = email.split('@')[1];
            domainCount[domain] = (domainCount[domain] || 0) + 1;
        });

        const sortedDomains = Object.entries(domainCount)
            .sort((a, b) => b[1] - a[1]);

        if (sortedDomains.length > 0) {
            let html = '';
            sortedDomains.forEach(([domain, count]) => {
                html += `
                    <div class="domain-item">
                        <span class="domain-name">${domain}</span>
                        <span class="domain-count">${count}</span>
                    </div>
                `;
            });

            this.domainsList.innerHTML = html;
            this.domainsBreakdown.style.display = 'block';
        } else {
            this.domainsBreakdown.style.display = 'none';
        }
    }

    updateStatistics() {
        const totalEmails = this.emails.length;
        const uniqueCount = this.uniqueEmails.size;
        const duplicates = totalEmails - uniqueCount;

        // Count unique domains
        const domains = new Set();
        Array.from(this.uniqueEmails).forEach(email => {
            const domain = email.split('@')[1];
            if (domain) domains.add(domain);
        });

        this.totalEmailsEl.textContent = totalEmails;
        this.uniqueEmailsEl.textContent = uniqueCount;
        this.totalDomainsEl.textContent = domains.size;
        this.duplicatesEl.textContent = duplicates;
    }

    filterEmails() {
        const filterText = this.filterInput.value.toLowerCase();
        const emailItems = this.emailsList.querySelectorAll('.email-item');

        emailItems.forEach(item => {
            const email = item.querySelector('.email-text').textContent;
            if (email.includes(filterText)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    toggleSort() {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';

        const uniqueArray = Array.from(this.uniqueEmails);
        if (this.sortOrder === 'asc') {
            uniqueArray.sort();
            this.sortBtn.innerHTML = '<span>Sort A-Z</span>';
        } else {
            uniqueArray.sort().reverse();
            this.sortBtn.innerHTML = '<span>Sort Z-A</span>';
        }

        let html = '';
        uniqueArray.forEach(email => {
            html += `
                <div class="email-item">
                    <span class="email-text">${email}</span>
                    <button class="copy-btn" onclick="navigator.clipboard.writeText('${email}')">Copy</button>
                </div>
            `;
        });

        this.emailsList.innerHTML = html;
    }

    copyAll() {
        const emails = Array.from(this.uniqueEmails).join('\n');
        navigator.clipboard.writeText(emails).then(() => {
            // Change button text temporarily
            const originalText = this.copyAllBtn.innerHTML;
            this.copyAllBtn.innerHTML = '✓ Copied!';
            setTimeout(() => {
                this.copyAllBtn.innerHTML = originalText;
            }, 2000);
        });
    }

    downloadTXT() {
        const emails = Array.from(this.uniqueEmails).join('\n');
        const blob = new Blob([emails], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted_emails.txt';
        a.click();

        URL.revokeObjectURL(url);
    }

    downloadCSV() {
        let csv = 'Email,Domain\n';
        Array.from(this.uniqueEmails).forEach(email => {
            const domain = email.split('@')[1] || '';
            csv += `"${email}","${domain}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted_emails.csv';
        a.click();

        URL.revokeObjectURL(url);
    }

    downloadJSON() {
        const emailData = Array.from(this.uniqueEmails).map(email => {
            const [localPart, domain] = email.split('@');
            return {
                email: email,
                localPart: localPart,
                domain: domain || ''
            };
        });

        const json = JSON.stringify(emailData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted_emails.json';
        a.click();

        URL.revokeObjectURL(url);
    }

    enableExportButtons() {
        this.copyAllBtn.disabled = false;
        this.downloadTxtBtn.disabled = false;
        this.downloadCsvBtn.disabled = false;
        this.downloadJsonBtn.disabled = false;
    }

    disableExportButtons() {
        this.copyAllBtn.disabled = true;
        this.downloadTxtBtn.disabled = true;
        this.downloadCsvBtn.disabled = true;
        this.downloadJsonBtn.disabled = true;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmailExtractor();
});