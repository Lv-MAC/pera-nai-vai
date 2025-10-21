# Pera nai Vai - Development Guide

Complete guide for building new tools using the modular component system.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Component Library](#component-library)
3. [HTML Templates](#html-templates)
4. [JavaScript Base Class](#javascript-base-class)
5. [Step-by-Step Tool Creation](#step-by-step-tool-creation)
6. [Common Patterns](#common-patterns)
7. [Best Practices](#best-practices)

---

## Quick Start

### 1. Choose Your Layout

We have two main templates:

- **Split Layout** (`tool-template-split.html`) - Two-column design with input panel on left, output on right
  - Use for: Converters, generators, image tools
  - Examples: QR Generator, Email Extractor, Invoice Generator

- **Single Layout** (`tool-template-single.html`) - Single column centered design
  - Use for: Calculators, simple utilities, form-based tools
  - Examples: Financial Calculators, Tax Calculator

### 2. File Structure

For a new tool called "my-tool":
```
pera-nai-vai/
├── my-tool.html          # Copy from templates/
├── my-tool.js            # Your tool logic
├── tools.css             # Already exists (global styles)
├── components.css        # Already exists (component library)
├── theme.js              # Already exists (theme management)
└── wardrobe-menu.js      # Already exists (navigation)
```

### 3. Basic Workflow

1. **Copy template** from `templates/` folder
2. **Replace placeholders** (marked with `[BRACKETS]`)
3. **Create JavaScript file** extending `ToolBase`
4. **Add to index.html** in the tools grid
5. **Test and deploy**

---

## Component Library

The `components.css` file provides pre-built, mobile-responsive components. Just add the class names!

### Layout Containers

```html
<!-- Two-column split layout -->
<div class="tool-container-split">
    <div class="panel-input"><!-- Left panel --></div>
    <div class="panel-output"><!-- Right panel --></div>
</div>

<!-- Single column centered -->
<div class="tool-container-single">
    <div class="panel-section"><!-- Content --></div>
</div>

<!-- Flexible multi-section -->
<div class="tool-container-flex">
    <div class="panel-section"><!-- Section 1 --></div>
    <div class="panel-section"><!-- Section 2 --></div>
</div>
```

**Automatically responsive!** No extra CSS needed.

---

### Tab System

```html
<div class="tabs-container">
    <button class="tab-button active" data-tab="tab1">Tab 1</button>
    <button class="tab-button" data-tab="tab2">Tab 2</button>
</div>

<div class="tab-content active" id="tab1-content">
    <!-- Tab 1 content -->
</div>

<div class="tab-content" id="tab2-content">
    <!-- Tab 2 content -->
</div>
```

**JavaScript (using ToolBase):**
```javascript
initializeElements() {
    // Your elements
}

attachEventListeners() {
    this.initializeTabs(); // Automatic tab switching!
}
```

---

### Input Components

```html
<!-- Standard input group -->
<div class="input-group">
    <label class="input-label" for="my-input">Label Text</label>
    <input type="text" id="my-input" class="input-field" placeholder="Enter text">
    <span class="input-helper">Optional helper text</span>
</div>

<!-- Textarea -->
<div class="input-group">
    <label class="input-label" for="my-textarea">Description</label>
    <textarea id="my-textarea" class="input-field" placeholder="Enter description"></textarea>
</div>

<!-- Color picker -->
<div class="color-input-group">
    <div class="color-input-wrapper">
        <input type="color" id="fg-color" class="color-input" value="#000000">
        <label for="fg-color">Foreground</label>
    </div>
    <div class="color-input-wrapper">
        <input type="color" id="bg-color" class="color-input" value="#FFFFFF">
        <label for="bg-color">Background</label>
    </div>
</div>

<!-- Slider -->
<div class="slider-group">
    <label class="input-label">Size</label>
    <input type="range" class="slider" id="size-slider" min="0" max="100" value="50">
    <div class="slider-display">
        <span>0</span>
        <span id="slider-value">50</span>
        <span>100</span>
    </div>
</div>
```

**Features:**
- Auto 16px font-size on mobile (prevents iOS zoom)
- Full width and responsive
- Consistent styling across all tools

---

### Button Components

```html
<!-- Primary action button -->
<button class="btn-primary" id="generate-btn">Generate</button>

<!-- Secondary button -->
<button class="btn-secondary">Cancel</button>

<!-- Download button with icon -->
<button class="btn-download">
    <svg width="20" height="20"><!-- Icon --></svg>
    Download PNG
</button>

<!-- Small toggle button -->
<button class="btn-small active" data-level="M">Medium</button>
```

**Features:**
- Minimum 48px height (touch-friendly)
- Hover effects built-in
- Active states for toggles

---

### Display Components

```html
<!-- Output display area -->
<div class="display-area">
    <div class="display-placeholder">
        <svg width="64" height="64"><!-- Icon --></svg>
        <p>Your result will appear here</p>
    </div>
</div>

<!-- Stats grid -->
<div class="stats-grid">
    <div class="stat-item">
        <div class="stat-value" id="total">0</div>
        <div class="stat-label">Total Items</div>
    </div>
    <div class="stat-item">
        <div class="stat-value" id="unique">0</div>
        <div class="stat-label">Unique Items</div>
    </div>
</div>

<!-- Item list -->
<div class="item-list">
    <div class="list-item">
        <span class="list-item-text">Item text</span>
        <button class="list-item-action btn-small">Copy</button>
    </div>
</div>

<!-- Card grid -->
<div class="card-grid">
    <div class="card">
        <!-- Card content -->
    </div>
</div>
```

---

### Options Panel

```html
<div class="options-panel">
    <h3 class="options-title">
        <svg width="20" height="20"><!-- Icon --></svg>
        Customization Options
    </h3>

    <!-- Your options here -->
</div>
```

---

### Features Section

```html
<section class="features-section">
    <h2>Key Features</h2>
    <div class="features-grid">
        <div class="feature">
            <svg width="32" height="32"><!-- Icon --></svg>
            <h3>Feature Title</h3>
            <p>Feature description explaining the benefit.</p>
        </div>
        <!-- More features -->
    </div>
</section>
```

**Auto-responsive:** 4 columns → 2 columns → 1 column

---

### Utility Classes

```html
<!-- Spacing -->
<div class="mb-1">Margin bottom 0.5rem</div>
<div class="mb-2">Margin bottom 1rem</div>
<div class="mb-3">Margin bottom 1.5rem</div>
<div class="mb-4">Margin bottom 2rem</div>

<div class="mt-1">Margin top 0.5rem</div>
<div class="mt-2">Margin top 1rem</div>
<!-- etc... -->

<!-- Visibility -->
<div class="hidden">Hidden element</div>

<!-- Layout -->
<div class="flex">Flexbox</div>
<div class="flex-center">Centered flex</div>
<div class="gap-1">Gap 0.5rem</div>
<div class="gap-2">Gap 1rem</div>

<!-- Text -->
<div class="text-center">Centered text</div>
```

---

## HTML Templates

### Template Placeholders

Replace these placeholders when copying a template:

| Placeholder | Example | Description |
|------------|---------|-------------|
| `[TOOL_NAME]` | `Text Counter` | Short tool name |
| `[TOOL_DESCRIPTION]` | `Count words, characters, and lines in your text` | Short meta description (150 chars) |
| `[TOOL_DESCRIPTION_LONG]` | `Analyze your text with detailed word count, character count, and reading time estimates. Perfect for writers, students, and content creators.` | Full description shown on page |
| `[TAB_1_NAME]` | `Text Input` | Tab label |
| `[INPUT_LABEL]` | `Enter Your Text` | Input field label |
| `[PLACEHOLDER]` | `Paste or type text here...` | Input placeholder |
| `[HELPER_TEXT]` | `Supports plain text and formatted documents` | Helper text below input |
| `[ACTION_BUTTON_TEXT]` | `Analyze Text` | Primary button text |
| `[PLACEHOLDER_TEXT]` | `Your analysis will appear here` | Placeholder in output area |
| `[OPTIONS_TITLE]` | `Display Options` | Options panel heading |
| `[FEATURE_1_TITLE]` | `Real-time Analysis` | Feature title |
| `[FEATURE_1_DESCRIPTION]` | `Get instant word and character counts as you type` | Feature description |
| `[TOOL_SCRIPT]` | `text-counter` | Your JS filename (without .js) |

### Example: Converting Template to Real Tool

**Before (Template):**
```html
<title>[TOOL_NAME] | Pera nai Vai</title>
<meta name="description" content="[TOOL_DESCRIPTION]">
```

**After (Text Counter):**
```html
<title>Text Counter | Pera nai Vai</title>
<meta name="description" content="Count words, characters, and lines in your text">
```

---

## JavaScript Base Class

### ToolBase Features

The `ToolBase` class provides common functionality:

#### 1. Automatic Theme Management

```javascript
import { ToolBase } from './ToolBase.js';

class MyTool extends ToolBase {
    constructor() {
        super();
        this.init(); // Automatically sets up theme toggle
    }
}
```

**No theme code needed!** It's automatic.

---

#### 2. Element Management

```javascript
initializeElements() {
    this.elements = {
        input: document.getElementById('my-input'),
        output: document.getElementById('my-output'),
        button: document.getElementById('my-button')
    };
}

attachEventListeners() {
    this.elements.button.addEventListener('click', () => this.process());
}
```

---

#### 3. Helper Methods

**Visibility:**
```javascript
this.show('#download-options');        // Show element
this.hide('.display-placeholder');     // Hide element
this.toggle('#advanced-settings');     // Toggle visibility
```

**Downloads:**
```javascript
// Download canvas as PNG
this.downloadCanvas(canvas, 'qrcode.png');

// Download blob
const blob = new Blob([data], { type: 'text/csv' });
this.downloadBlob(blob, 'data.csv');
```

**Clipboard:**
```javascript
const success = await this.copyToClipboard('Text to copy');
if (success) {
    this.showSuccess('Copied to clipboard!');
}
```

**Validation:**
```javascript
if (!this.validateRequired({
    'Email': emailInput,
    'Name': nameInput
})) {
    return; // Shows error and stops execution
}
```

**Tabs:**
```javascript
attachEventListeners() {
    this.initializeTabs(); // Auto-setup tab switching

    // Or manually:
    this.switchTab('wifi');
}
```

**Other Utilities:**
```javascript
this.formatNumber(1234567);           // "1,234,567"
this.generateId('item');              // "item-1234567890-abc123"
this.scrollToElement('#results');     // Smooth scroll
this.debounce(func, 300);            // Debounce function
```

---

### Complete ToolBase Example

```javascript
import { ToolBase } from './ToolBase.js';

class TextCounter extends ToolBase {
    constructor() {
        super();
        this.init();
    }

    initializeElements() {
        this.elements = {
            textInput: document.getElementById('text-input'),
            analyzeBtn: document.getElementById('analyze-btn'),
            wordCount: document.getElementById('word-count'),
            charCount: document.getElementById('char-count'),
            results: document.getElementById('results')
        };
    }

    attachEventListeners() {
        this.elements.analyzeBtn.addEventListener('click', () => this.analyze());

        // Real-time counting
        const debouncedAnalyze = this.debounce(() => this.analyze(), 300);
        this.elements.textInput.addEventListener('input', debouncedAnalyze);
    }

    analyze() {
        const text = this.elements.textInput.value;

        if (!this.validateRequired({ 'Text': text })) {
            return;
        }

        const words = text.trim().split(/\s+/).length;
        const chars = text.length;

        this.elements.wordCount.textContent = this.formatNumber(words);
        this.elements.charCount.textContent = this.formatNumber(chars);

        this.show(this.elements.results);
        this.scrollToElement(this.elements.results);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new TextCounter();
});
```

---

## Step-by-Step Tool Creation

### Example: Building a "Text Case Converter"

#### Step 1: Copy Template

```bash
cp templates/tool-template-split.html text-case-converter.html
```

#### Step 2: Replace Placeholders in HTML

```html
<title>Text Case Converter | Pera nai Vai</title>
<meta name="description" content="Convert text to uppercase, lowercase, title case, and more">

<div class="page-header">
    <h1>Text Case Converter</h1>
    <p>Convert your text between different cases: UPPERCASE, lowercase, Title Case, and more.</p>
</div>

<div class="tool-container-split">
    <div class="panel-input">
        <div class="input-group">
            <label class="input-label" for="text-input">Enter Your Text</label>
            <textarea id="text-input" class="input-field" placeholder="Type or paste your text here..."></textarea>
        </div>

        <div class="input-group">
            <label class="input-label">Conversion Type</label>
            <button class="btn-small active" data-case="upper">UPPERCASE</button>
            <button class="btn-small" data-case="lower">lowercase</button>
            <button class="btn-small" data-case="title">Title Case</button>
            <button class="btn-small" data-case="sentence">Sentence case</button>
        </div>

        <button class="btn-primary" id="convert-btn">Convert Text</button>
    </div>

    <div class="panel-output">
        <div class="display-area" id="output-area">
            <p class="text-center">Your converted text will appear here</p>
        </div>

        <div class="download-options hidden" id="download-options">
            <button class="btn-download" id="copy-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                Copy to Clipboard
            </button>
        </div>
    </div>
</div>

<script type="module" src="text-case-converter.js"></script>
<script type="module" src="theme.js"></script>
<script type="module" src="wardrobe-menu.js"></script>
```

#### Step 3: Create JavaScript File

`text-case-converter.js`:

```javascript
import { ToolBase } from './ToolBase.js';

class TextCaseConverter extends ToolBase {
    constructor() {
        super();
        this.currentCase = 'upper';
        this.init();
    }

    initializeElements() {
        this.elements = {
            textInput: document.getElementById('text-input'),
            convertBtn: document.getElementById('convert-btn'),
            caseButtons: document.querySelectorAll('[data-case]'),
            outputArea: document.getElementById('output-area'),
            downloadOptions: document.getElementById('download-options'),
            copyBtn: document.getElementById('copy-btn')
        };
    }

    attachEventListeners() {
        this.elements.convertBtn.addEventListener('click', () => this.convert());
        this.elements.copyBtn.addEventListener('click', () => this.copyResult());

        this.elements.caseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectCase(e.target));
        });
    }

    selectCase(button) {
        this.elements.caseButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.currentCase = button.dataset.case;
    }

    convert() {
        const text = this.elements.textInput.value;

        if (!this.validateRequired({ 'Text': text })) {
            return;
        }

        let result;

        switch (this.currentCase) {
            case 'upper':
                result = text.toUpperCase();
                break;
            case 'lower':
                result = text.toLowerCase();
                break;
            case 'title':
                result = text.replace(/\w\S*/g, (txt) => {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
                break;
            case 'sentence':
                result = text.toLowerCase().replace(/(^\w|\.\s+\w)/g, (letter) => {
                    return letter.toUpperCase();
                });
                break;
            default:
                result = text;
        }

        this.displayResult(result);
    }

    displayResult(result) {
        this.elements.outputArea.innerHTML = `<p>${result}</p>`;
        this.resultText = result;
        this.show(this.elements.downloadOptions);
        this.scrollToElement(this.elements.outputArea);
    }

    async copyResult() {
        const success = await this.copyToClipboard(this.resultText);
        if (success) {
            this.elements.copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                this.elements.copyBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Copy to Clipboard
                `;
            }, 2000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TextCaseConverter();
});
```

#### Step 4: Add to index.html

In `index.html`, add to the tools grid:

```html
<a href="text-case-converter.html" class="tool-link" data-category="text">
    <div class="tool-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z"/>
        </svg>
    </div>
    <h3>Text Case Converter</h3>
    <p>Convert text between uppercase, lowercase, and title case</p>
</a>
```

#### Step 5: Test

1. Open in browser
2. Test all conversion types
3. Test copy functionality
4. Test on mobile (responsive check)
5. Test dark mode

---

## Common Patterns

### Pattern 1: Input → Process → Display

**HTML:**
```html
<div class="panel-input">
    <div class="input-group">
        <input id="input" class="input-field">
    </div>
    <button class="btn-primary" id="process-btn">Process</button>
</div>

<div class="panel-output">
    <div id="output" class="hidden"></div>
</div>
```

**JavaScript:**
```javascript
process() {
    const input = this.elements.input.value;
    if (!this.validateRequired({ 'Input': input })) return;

    const result = this.doSomething(input);
    this.elements.output.textContent = result;
    this.show(this.elements.output);
}
```

---

### Pattern 2: Upload → Process → Download

**HTML:**
```html
<input type="file" id="file-input" class="input-field">
<button class="btn-primary" id="process-btn">Process File</button>
<button class="btn-download hidden" id="download-btn">Download Result</button>
```

**JavaScript:**
```javascript
async processFile() {
    const file = this.elements.fileInput.files[0];
    if (!file) {
        this.showError('Please select a file');
        return;
    }

    const result = await this.processFileData(file);
    this.processedData = result;
    this.show(this.elements.downloadBtn);
}

downloadResult() {
    const blob = new Blob([this.processedData], { type: 'text/plain' });
    this.downloadBlob(blob, 'result.txt');
}
```

---

### Pattern 3: Real-time Processing

**JavaScript:**
```javascript
attachEventListeners() {
    const debouncedProcess = this.debounce(() => this.process(), 300);
    this.elements.input.addEventListener('input', debouncedProcess);
}
```

---

### Pattern 4: Multi-step Form

**HTML:**
```html
<div class="tabs-container">
    <button class="tab-button active" data-tab="step1">Step 1</button>
    <button class="tab-button" data-tab="step2">Step 2</button>
    <button class="tab-button" data-tab="step3">Step 3</button>
</div>

<div class="tab-content active" id="step1-content">
    <!-- Step 1 inputs -->
    <button class="btn-primary" id="next1">Next</button>
</div>

<div class="tab-content" id="step2-content">
    <!-- Step 2 inputs -->
    <button class="btn-secondary" id="back1">Back</button>
    <button class="btn-primary" id="next2">Next</button>
</div>
```

**JavaScript:**
```javascript
initializeElements() {
    this.elements = {
        next1: document.getElementById('next1'),
        next2: document.getElementById('next2'),
        back1: document.getElementById('back1')
    };
}

attachEventListeners() {
    this.initializeTabs();
    this.elements.next1.addEventListener('click', () => this.switchTab('step2'));
    this.elements.back1.addEventListener('click', () => this.switchTab('step1'));
    this.elements.next2.addEventListener('click', () => this.switchTab('step3'));
}
```

---

## Best Practices

### 1. Mobile-First Development

✅ **DO:**
- Use provided component classes (automatic responsiveness)
- Test on actual mobile devices (especially Sony Xperia 21:9)
- Use 16px minimum font-size on inputs
- Make buttons min 48px height

❌ **DON'T:**
- Add custom breakpoints unless absolutely necessary
- Use `overflow-x: scroll` (use `overflow-x: hidden`)
- Forget to test in both portrait and landscape

---

### 2. Theme Support

✅ **DO:**
- Use CSS variables (`var(--primary-color)`)
- Test both light and dark modes
- Let ToolBase handle theme toggle

❌ **DON'T:**
- Hardcode colors
- Create custom theme toggle code

**CSS Variables Available:**
```css
--bg-color
--card-bg
--text-primary
--text-secondary
--border-color
--primary-color
--primary-hover
--shadow
--hover-bg
```

---

### 3. Validation and Error Handling

✅ **DO:**
```javascript
if (!this.validateRequired({ 'Email': email, 'Name': name })) {
    return; // Automatically shows error
}

try {
    const result = riskyOperation();
} catch (error) {
    this.showError(`Failed to process: ${error.message}`);
}
```

❌ **DON'T:**
```javascript
// No validation
const result = riskyOperation(input); // Crashes if input is invalid

// No error handling
fetch(url).then(r => r.json()); // No catch
```

---

### 4. Performance

✅ **DO:**
- Debounce real-time processing
- Use event delegation for dynamic elements
- Clean up event listeners in `destroy()`

```javascript
// Good
const debouncedSearch = this.debounce(() => this.search(), 300);
input.addEventListener('input', debouncedSearch);

// Event delegation
list.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        this.deleteItem(e.target.dataset.id);
    }
});
```

❌ **DON'T:**
```javascript
// Bad - triggers on every keystroke
input.addEventListener('input', () => this.heavyProcess());

// Bad - listener for each item
items.forEach(item => {
    item.addEventListener('click', () => this.delete(item.id));
});
```

---

### 5. Accessibility

✅ **DO:**
- Use semantic HTML (`<button>`, `<label>`, etc.)
- Include `aria-label` for icon-only buttons
- Ensure keyboard navigation works

```html
<button class="btn-download" aria-label="Download as PNG">
    <svg><!-- Icon --></svg>
</button>

<label class="input-label" for="email-input">Email Address</label>
<input type="email" id="email-input" class="input-field">
```

---

### 6. Code Organization

✅ **DO:**
```javascript
class MyTool extends ToolBase {
    constructor() {
        super();
        this.config = {
            maxSize: 1000,
            defaultColor: '#000'
        };
        this.init();
    }

    // Public methods
    process() { }
    download() { }

    // Private methods (use # or _ prefix)
    _validateInput() { }
    _formatOutput() { }
}
```

---

### 7. SEO and Metadata

✅ **DO:**
- Write descriptive titles and meta descriptions
- Include relevant keywords
- Add features section

```html
<title>PDF Compressor - Reduce PDF File Size | Pera nai Vai</title>
<meta name="description" content="Free online PDF compressor. Reduce PDF file size while maintaining quality. Fast, secure, and works in your browser.">
```

---

### 8. Privacy and Security

✅ **DO:**
- Process everything in browser (no server uploads)
- Mention "Privacy-friendly" in description
- Use FileReader API for file processing

```javascript
const reader = new FileReader();
reader.onload = (e) => {
    const data = e.target.result;
    // Process locally
};
reader.readAsText(file);
```

---

## Testing Checklist

Before deploying a new tool:

- [ ] Works on desktop (Chrome, Firefox, Safari)
- [ ] Works on mobile (iOS Safari, Android Chrome)
- [ ] Works on ultra-narrow devices (21:9 aspect ratio)
- [ ] Dark mode works correctly
- [ ] All inputs have validation
- [ ] Error messages are user-friendly
- [ ] Download/copy functions work
- [ ] No horizontal scroll on mobile
- [ ] Buttons are at least 48px height
- [ ] Tool appears in wardrobe menu
- [ ] Tool listed in index.html
- [ ] SEO meta tags filled out
- [ ] Features section included (if applicable)
- [ ] GitHub footer link present

---

## Need Help?

### Component Reference

- **Layout:** `components.css` lines 1-50
- **Inputs:** `components.css` lines 150-250
- **Buttons:** `components.css` lines 250-350
- **Display:** `components.css` lines 400-500

### JavaScript Reference

- **ToolBase:** `ToolBase.js`
- **Examples:** `qr-generator.js`, `email-extractor.js`

### Templates

- **Split Layout:** `templates/tool-template-split.html`
- **Single Layout:** `templates/tool-template-single.html`

---

**Happy Building! 🚀**
