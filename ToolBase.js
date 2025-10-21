/**
 * ToolBase - Base class for all Pera nai Vai tools
 * Provides common functionality like theme management and element initialization
 */

export class ToolBase {
    constructor() {
        this.elements = {};
        this.initialized = false;
    }

    /**
     * Initialize the tool - call this in your constructor
     */
    init() {
        if (this.initialized) return;

        this.initializeElements();
        this.attachEventListeners();
        this.initTheme();
        this.initialized = true;
    }

    /**
     * Override this method to initialize DOM elements
     * Store elements in this.elements for easy access
     *
     * Example:
     * initializeElements() {
     *     this.elements = {
     *         input: document.getElementById('my-input'),
     *         output: document.getElementById('my-output'),
     *         button: document.getElementById('my-button')
     *     };
     * }
     */
    initializeElements() {
        // Override in child class
    }

    /**
     * Override this method to attach event listeners
     *
     * Example:
     * attachEventListeners() {
     *     this.elements.button.addEventListener('click', () => this.handleAction());
     * }
     */
    attachEventListeners() {
        // Override in child class
    }

    /**
     * Initialize theme toggle functionality
     * This is automatically handled by the base class
     */
    initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');

        // Load saved theme
        const currentTheme = localStorage.getItem('theme') || 'light';
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        }

        // Theme toggle handler
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');

            if (isDark) {
                if (sunIcon) sunIcon.style.display = 'none';
                if (moonIcon) moonIcon.style.display = 'block';
                localStorage.setItem('theme', 'dark');
            } else {
                if (sunIcon) sunIcon.style.display = 'block';
                if (moonIcon) moonIcon.style.display = 'none';
                localStorage.setItem('theme', 'light');
            }
        });
    }

    /**
     * Helper: Switch between tabs
     * @param {string} tabName - Name of the tab to activate
     * @param {string} containerSelector - Optional selector for tab container
     */
    switchTab(tabName, containerSelector = '') {
        const prefix = containerSelector ? `${containerSelector} ` : '';

        const tabButtons = document.querySelectorAll(`${prefix}.tab-button`);
        const tabContents = document.querySelectorAll(`${prefix}.tab-content`);

        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        tabContents.forEach(content => {
            const contentId = `${tabName}-content`;
            content.classList.toggle('active', content.id === contentId);
        });
    }

    /**
     * Helper: Initialize tab switching for a container
     * @param {string} containerSelector - Optional selector for tab container
     */
    initializeTabs(containerSelector = '') {
        const prefix = containerSelector ? `${containerSelector} ` : '';
        const tabButtons = document.querySelectorAll(`${prefix}.tab-button`);

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName, containerSelector);
            });
        });
    }

    /**
     * Helper: Show element by removing 'hidden' class
     * @param {HTMLElement|string} element - Element or selector
     */
    show(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) el.classList.remove('hidden');
    }

    /**
     * Helper: Hide element by adding 'hidden' class
     * @param {HTMLElement|string} element - Element or selector
     */
    hide(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) el.classList.add('hidden');
    }

    /**
     * Helper: Toggle element visibility
     * @param {HTMLElement|string} element - Element or selector
     */
    toggle(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) el.classList.toggle('hidden');
    }

    /**
     * Helper: Download file from blob
     * @param {Blob} blob - File blob
     * @param {string} filename - Filename with extension
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * Helper: Download canvas as image
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {string} filename - Filename (default: 'download.png')
     * @param {string} format - Image format (default: 'image/png')
     */
    downloadCanvas(canvas, filename = 'download.png', format = 'image/png') {
        canvas.toBlob((blob) => {
            if (!blob) {
                this.showError('Failed to generate image. Please try again.');
                return;
            }
            this.downloadBlob(blob, filename);
        }, format);
    }

    /**
     * Helper: Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} - Success status
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    }

    /**
     * Helper: Show success message (implement your own UI)
     * @param {string} message - Success message
     */
    showSuccess(message) {
        console.log('✓', message);
        // Override this to show custom success UI
    }

    /**
     * Helper: Show error message (implement your own UI)
     * @param {string} message - Error message
     */
    showError(message) {
        console.error('✗', message);
        alert(message); // Default implementation
        // Override this to show custom error UI
    }

    /**
     * Helper: Validate required fields
     * @param {Object} fields - Object with field names and values
     * @returns {boolean} - All fields are valid
     */
    validateRequired(fields) {
        for (const [name, value] of Object.entries(fields)) {
            if (!value || value.toString().trim() === '') {
                this.showError(`${name} is required`);
                return false;
            }
        }
        return true;
    }

    /**
     * Helper: Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, delay = 300) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Helper: Format number with commas
     * @param {number} num - Number to format
     * @returns {string} - Formatted number
     */
    formatNumber(num) {
        return num.toLocaleString();
    }

    /**
     * Helper: Generate random ID
     * @param {string} prefix - Optional prefix
     * @returns {string} - Random ID
     */
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Helper: Scroll element into view smoothly
     * @param {HTMLElement|string} element - Element or selector
     */
    scrollToElement(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Helper: Check if element is visible in viewport
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} - Is visible
     */
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Cleanup method - override to clean up resources
     */
    destroy() {
        // Override in child class if needed
    }
}

/**
 * Example usage:
 *
 * import { ToolBase } from './ToolBase.js';
 *
 * class MyTool extends ToolBase {
 *     constructor() {
 *         super();
 *         this.init();
 *     }
 *
 *     initializeElements() {
 *         this.elements = {
 *             input: document.getElementById('my-input'),
 *             button: document.getElementById('my-button'),
 *             output: document.getElementById('output')
 *         };
 *     }
 *
 *     attachEventListeners() {
 *         this.elements.button.addEventListener('click', () => this.process());
 *         this.initializeTabs(); // If using tabs
 *     }
 *
 *     process() {
 *         const input = this.elements.input.value;
 *         if (!this.validateRequired({ 'Input': input })) return;
 *
 *         // Process logic here
 *         this.elements.output.textContent = `Result: ${input}`;
 *         this.show(this.elements.output);
 *     }
 * }
 *
 * // Initialize when DOM is loaded
 * document.addEventListener('DOMContentLoaded', () => {
 *     new MyTool();
 * });
 */
