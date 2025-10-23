// Color Palette Extractor from Images

class ColorPaletteExtractor {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentImage = null;
        this.extractedColors = [];
        this.selectedColor = null;
        this.colorLocationMap = new Map(); // Store pixel locations for each color
        this.heatmapScale = 1; // Store scale factor for heatmap

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Upload elements
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.imagePreview = document.getElementById('image-preview');
        this.sampleBtns = document.querySelectorAll('[data-sample]');

        // Control elements
        this.colorCountInput = document.getElementById('color-count');
        this.extractBtn = document.getElementById('extract-btn');

        // Results elements
        this.resultsSection = document.getElementById('results-section');
        this.paletteGrid = document.getElementById('palette-grid');
        this.variationsGrid = document.getElementById('variations-grid');
        this.harmoniesContent = document.getElementById('harmonies-content');

        // Export buttons
        this.copyCssBtn = document.getElementById('copy-css-btn');
        this.copyHexBtn = document.getElementById('copy-hex-btn');
        this.downloadJsonBtn = document.getElementById('download-json-btn');
        this.downloadScssBtn = document.getElementById('download-scss-btn');
        this.downloadAseBtn = document.getElementById('download-ase-btn');
        this.saveImageBtn = document.getElementById('save-image-btn');

        // Copy indicator
        this.copyIndicator = document.getElementById('copy-indicator');

        // Heatmap elements
        this.referenceCanvas = document.getElementById('reference-canvas');
        this.heatmapCanvas = document.getElementById('heatmap-canvas');
        this.heatmapOverlay = document.getElementById('heatmap-overlay');
        this.heatmapInfo = document.getElementById('heatmap-info');
        this.selectedColorPreview = document.getElementById('selected-color-preview');
        this.selectedColorName = document.getElementById('selected-color-name');
        this.selectedColorHex = document.getElementById('selected-color-hex');
        this.selectedColorCoverage = document.getElementById('selected-color-coverage');

        if (this.referenceCanvas) {
            this.referenceCtx = this.referenceCanvas.getContext('2d');
        }
        if (this.heatmapCanvas && this.heatmapOverlay) {
            this.heatmapCtx = this.heatmapCanvas.getContext('2d');
            this.overlayCtx = this.heatmapOverlay.getContext('2d');
        }
    }

    attachEventListeners() {
        // Upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Sample images
        this.sampleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadSampleImage(e.target.dataset.sample);
            });
        });

        // Extract button
        this.extractBtn.addEventListener('click', () => this.extractColors());

        // Export buttons
        this.copyCssBtn.addEventListener('click', () => this.copyAsCSS());
        this.copyHexBtn.addEventListener('click', () => this.copyHexValues());
        this.downloadJsonBtn.addEventListener('click', () => this.downloadJSON());
        this.downloadScssBtn.addEventListener('click', () => this.downloadSCSS());
        this.downloadAseBtn.addEventListener('click', () => this.downloadASE());
        this.saveImageBtn.addEventListener('click', () => this.saveAsImage());

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

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            this.loadImage(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            this.loadImage(files[0]);
        }
    }

    loadImage(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                this.displayImage(img);
                this.extractBtn.disabled = false;
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }

    loadSampleImage(sampleName) {
        // Create sample images using Canvas API
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 400;
        canvas.height = 300;

        // Generate sample gradient based on name
        let gradient;
        switch(sampleName) {
            case 'sunset':
                gradient = ctx.createLinearGradient(0, 0, 400, 300);
                gradient.addColorStop(0, '#FF6B6B');
                gradient.addColorStop(0.3, '#FFE66D');
                gradient.addColorStop(0.7, '#4ECDC4');
                gradient.addColorStop(1, '#95E77E');
                break;
            case 'ocean':
                gradient = ctx.createLinearGradient(0, 0, 400, 300);
                gradient.addColorStop(0, '#0077BE');
                gradient.addColorStop(0.5, '#4ECDC4');
                gradient.addColorStop(1, '#A8DADC');
                break;
            case 'forest':
                gradient = ctx.createLinearGradient(0, 0, 400, 300);
                gradient.addColorStop(0, '#2D5016');
                gradient.addColorStop(0.3, '#73AB84');
                gradient.addColorStop(0.7, '#99D19C');
                gradient.addColorStop(1, '#ADE25D');
                break;
            case 'city':
                gradient = ctx.createLinearGradient(0, 0, 400, 300);
                gradient.addColorStop(0, '#2C3E50');
                gradient.addColorStop(0.3, '#34495E');
                gradient.addColorStop(0.7, '#7F8C8D');
                gradient.addColorStop(1, '#BDC3C7');
                break;
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 300);

        // Add some texture
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
            ctx.beginPath();
            ctx.arc(Math.random() * 400, Math.random() * 300, Math.random() * 50, 0, Math.PI * 2);
            ctx.fill();
        }

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            img.onload = () => {
                this.currentImage = img;
                this.displayImage(img);
                this.extractBtn.disabled = false;
                URL.revokeObjectURL(url);
            };
            img.src = url;
        });
    }

    displayImage(img) {
        this.imagePreview.src = img.src;
        this.imagePreview.classList.add('active');
        this.uploadArea.classList.add('has-image');
    }

    extractColors() {
        if (!this.currentImage) return;

        // Disable button and show loading state
        this.extractBtn.disabled = true;
        this.extractBtn.textContent = 'Extracting Colors...';

        // Use setTimeout to allow UI to update
        setTimeout(() => {
            const colorCount = parseInt(this.colorCountInput.value);

            // Draw image to canvas
            this.canvas.width = this.currentImage.width;
            this.canvas.height = this.currentImage.height;
            this.ctx.drawImage(this.currentImage, 0, 0);

            // Get image data
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const pixels = imageData.data;

        // Simple color extraction algorithm (quantization) with location tracking
        const colorMap = {};
        const colorLocations = new Map(); // Track pixel locations for each color
        const sampleRate = Math.max(1, Math.floor(pixels.length / 40000)); // Sample pixels
        const width = this.canvas.width;
        const height = this.canvas.height;

        for (let i = 0; i < pixels.length; i += sampleRate * 4) {
            const r = Math.round(pixels[i] / 32) * 32;
            const g = Math.round(pixels[i + 1] / 32) * 32;
            const b = Math.round(pixels[i + 2] / 32) * 32;

            const key = `${r},${g},${b}`;
            colorMap[key] = (colorMap[key] || 0) + 1;

            // Store pixel location (convert linear index to x, y coordinates)
            const pixelIndex = i / 4;
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);

            if (!colorLocations.has(key)) {
                colorLocations.set(key, []);
            }
            colorLocations.get(key).push({ x, y });
        }

        // Sort colors by frequency
        const sortedColors = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, colorCount)
            .map(([color, count]) => {
                const [r, g, b] = color.split(',').map(Number);
                const hex = this.rgbToHex(r, g, b);
                return {
                    rgb: { r, g, b },
                    hex: hex,
                    hsl: this.rgbToHsl(r, g, b),
                    percentage: (count / (pixels.length / 4 / sampleRate) * 100).toFixed(1),
                    name: this.getColorName(r, g, b),
                    locations: colorLocations.get(color) || []
                };
            });

        // Store color locations for heatmap
        this.colorLocationMap = colorLocations;

            this.extractedColors = sortedColors;
            this.displayPalette();
            this.displayHarmonies();
            this.initializeHeatmap();
            this.resultsSection.classList.add('active');

            // Re-enable button and show success state
            this.extractBtn.disabled = false;
            this.extractBtn.textContent = 'Extract Colors';

            // Show success indicator
            this.showSuccessIndicator(`${sortedColors.length} colors extracted successfully!`);
        }, 100);
    }

    displayPalette() {
        this.paletteGrid.innerHTML = '';

        this.extractedColors.forEach((color, index) => {
            const card = document.createElement('div');
            card.className = 'color-card';
            card.innerHTML = `
                <div class="color-preview" style="background-color: ${color.hex};">
                    <span class="color-percentage">${color.percentage}%</span>
                </div>
                <div class="color-info">
                    <div class="color-name">${color.name}</div>
                    <div class="color-values">
                        <div class="color-value" onclick="navigator.clipboard.writeText('${color.hex}')">
                            <span class="value-label">HEX</span>
                            <span class="value-text">${color.hex}</span>
                        </div>
                        <div class="color-value" onclick="navigator.clipboard.writeText('rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})')">
                            <span class="value-label">RGB</span>
                            <span class="value-text">${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}</span>
                        </div>
                        <div class="color-value" onclick="navigator.clipboard.writeText('hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)')">
                            <span class="value-label">HSL</span>
                            <span class="value-text">${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%</span>
                        </div>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                this.selectedColor = color;
                this.displayVariations(color);
                this.displayColorHeatmap(color);
                this.showCopyIndicator();
            });

            this.paletteGrid.appendChild(card);
        });
    }

    displayVariations(color) {
        this.variationsGrid.innerHTML = '';

        // Generate variations
        const variations = [
            { label: '-90%', factor: 0.1 },
            { label: '-70%', factor: 0.3 },
            { label: '-50%', factor: 0.5 },
            { label: '-30%', factor: 0.7 },
            { label: 'Base', factor: 1 },
            { label: '+30%', factor: 1.3 },
            { label: '+50%', factor: 1.5 },
            { label: '+70%', factor: 1.7 },
            { label: '+90%', factor: 1.9 }
        ];

        variations.forEach(variation => {
            const variedColor = this.adjustBrightness(color.rgb, variation.factor);
            const swatch = document.createElement('div');
            swatch.className = 'variation-swatch';
            swatch.style.backgroundColor = variedColor;
            swatch.innerHTML = `<span class="variation-label">${variation.label}</span>`;
            swatch.onclick = () => {
                navigator.clipboard.writeText(variedColor);
                this.showCopyIndicator();
            };
            this.variationsGrid.appendChild(swatch);
        });
    }

    displayHarmonies() {
        if (this.extractedColors.length === 0) return;

        const primaryColor = this.extractedColors[0];
        const harmonies = {
            'Complementary': this.getComplementary(primaryColor.hsl),
            'Triadic': this.getTriadic(primaryColor.hsl),
            'Analogous': this.getAnalogous(primaryColor.hsl),
            'Split Complementary': this.getSplitComplementary(primaryColor.hsl)
        };

        this.harmoniesContent.innerHTML = '';

        Object.entries(harmonies).forEach(([name, colors]) => {
            const group = document.createElement('div');
            group.className = 'harmony-group';
            group.innerHTML = `
                <div class="harmony-title">${name}</div>
                <div class="harmony-colors">
                    ${colors.map(color => `
                        <div class="harmony-color-item">
                            <div class="harmony-swatch"
                                 style="background-color: ${color}"
                                 onclick="navigator.clipboard.writeText('${color}');
                                 const indicator = document.getElementById('copy-indicator');
                                 indicator.textContent = 'Copied ${color}';
                                 indicator.classList.add('show');
                                 setTimeout(() => indicator.classList.remove('show'), 2000);"
                                 title="Click to copy ${color}">
                            </div>
                            <div class="harmony-hex">${color}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            this.harmoniesContent.appendChild(group);
        });
    }

    // Color conversion utilities
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    adjustBrightness(rgb, factor) {
        const r = Math.min(255, Math.floor(rgb.r * factor));
        const g = Math.min(255, Math.floor(rgb.g * factor));
        const b = Math.min(255, Math.floor(rgb.b * factor));
        return this.rgbToHex(r, g, b);
    }

    getColorName(r, g, b) {
        // Simple color naming based on hue
        const hsl = this.rgbToHsl(r, g, b);
        const h = hsl.h;
        const s = hsl.s;
        const l = hsl.l;

        if (l < 10) return 'Black';
        if (l > 90 && s < 10) return 'White';
        if (s < 10) return 'Gray';

        if (h < 15 || h >= 345) return 'Red';
        if (h < 45) return 'Orange';
        if (h < 75) return 'Yellow';
        if (h < 150) return 'Green';
        if (h < 200) return 'Cyan';
        if (h < 260) return 'Blue';
        if (h < 290) return 'Purple';
        if (h < 345) return 'Magenta';
    }

    // Color harmony functions
    getComplementary(hsl) {
        const comp = { ...hsl };
        comp.h = (comp.h + 180) % 360;
        const rgb = this.hslToRgb(comp.h, comp.s, comp.l);
        return [
            this.rgbToHex(this.hslToRgb(hsl.h, hsl.s, hsl.l).r, this.hslToRgb(hsl.h, hsl.s, hsl.l).g, this.hslToRgb(hsl.h, hsl.s, hsl.l).b),
            this.rgbToHex(rgb.r, rgb.g, rgb.b)
        ];
    }

    getTriadic(hsl) {
        const colors = [];
        for (let i = 0; i < 3; i++) {
            const h = (hsl.h + i * 120) % 360;
            const rgb = this.hslToRgb(h, hsl.s, hsl.l);
            colors.push(this.rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        return colors;
    }

    getAnalogous(hsl) {
        const colors = [];
        for (let i = -30; i <= 30; i += 30) {
            const h = (hsl.h + i + 360) % 360;
            const rgb = this.hslToRgb(h, hsl.s, hsl.l);
            colors.push(this.rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        return colors;
    }

    getSplitComplementary(hsl) {
        const colors = [];
        const angles = [0, 150, 210];
        angles.forEach(angle => {
            const h = (hsl.h + angle) % 360;
            const rgb = this.hslToRgb(h, hsl.s, hsl.l);
            colors.push(this.rgbToHex(rgb.r, rgb.g, rgb.b));
        });
        return colors;
    }

    // Heatmap functions
    initializeHeatmap() {
        if (!this.heatmapCanvas || !this.referenceCanvas || !this.currentImage) {
            return;
        }

        // Set canvas dimensions to match the image (max width for display)
        const maxWidth = 600;
        this.heatmapScale = Math.min(1, maxWidth / this.currentImage.width);

        const displayWidth = this.currentImage.width * this.heatmapScale;
        const displayHeight = this.currentImage.height * this.heatmapScale;

        // Set reference canvas (left side - original image)
        this.referenceCanvas.width = displayWidth;
        this.referenceCanvas.height = displayHeight;
        this.referenceCtx.drawImage(
            this.currentImage,
            0, 0,
            displayWidth,
            displayHeight
        );

        // Set heatmap canvas (right side - will show color highlights)
        this.heatmapCanvas.width = displayWidth;
        this.heatmapCanvas.height = displayHeight;
        this.heatmapCtx.drawImage(
            this.currentImage,
            0, 0,
            displayWidth,
            displayHeight
        );

        // Set overlay canvas dimensions to match
        this.heatmapOverlay.width = displayWidth;
        this.heatmapOverlay.height = displayHeight;
    }

    displayColorHeatmap(color) {
        if (!this.overlayCtx || !color.locations || color.locations.length === 0) {
            return;
        }

        // Clear previous overlay
        this.overlayCtx.clearRect(0, 0, this.heatmapOverlay.width, this.heatmapOverlay.height);

        // Calculate scale factor between extraction canvas and display canvas
        const scaleX = this.heatmapCanvas.width / this.canvas.width;
        const scaleY = this.heatmapCanvas.height / this.canvas.height;

        // Draw semi-transparent overlay to darken non-selected areas
        this.overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.overlayCtx.fillRect(0, 0, this.heatmapOverlay.width, this.heatmapOverlay.height);

        // Set blend mode to clear selected color areas
        this.overlayCtx.globalCompositeOperation = 'destination-out';
        this.overlayCtx.fillStyle = 'rgba(255, 255, 255, 1)';

        // Highlight the selected color pixels with glow effect
        const brushSize = Math.max(3, Math.floor(5 * scaleX));

        color.locations.forEach(location => {
            const x = location.x * scaleX;
            const y = location.y * scaleY;

            this.overlayCtx.beginPath();
            this.overlayCtx.arc(x, y, brushSize, 0, Math.PI * 2);
            this.overlayCtx.fill();
        });

        // Reset composite operation
        this.overlayCtx.globalCompositeOperation = 'source-over';

        // Add a subtle highlight border around the color regions
        this.overlayCtx.strokeStyle = color.hex;
        this.overlayCtx.lineWidth = 2;
        this.overlayCtx.globalAlpha = 0.5;

        color.locations.forEach(location => {
            const x = location.x * scaleX;
            const y = location.y * scaleY;

            this.overlayCtx.beginPath();
            this.overlayCtx.arc(x, y, brushSize + 1, 0, Math.PI * 2);
            this.overlayCtx.stroke();
        });

        this.overlayCtx.globalAlpha = 1;

        // Update legend
        this.heatmapInfo.classList.remove('hidden');
        this.selectedColorPreview.style.backgroundColor = color.hex;
        this.selectedColorName.textContent = color.name;
        this.selectedColorHex.textContent = color.hex;
        this.selectedColorCoverage.textContent = color.percentage + '%';
    }

    // Export functions
    showCopyIndicator() {
        this.copyIndicator.classList.add('show');
        this.copyIndicator.textContent = 'Copied to clipboard!';
        setTimeout(() => {
            this.copyIndicator.classList.remove('show');
        }, 2000);
    }

    showSuccessIndicator(message) {
        this.copyIndicator.classList.add('show');
        this.copyIndicator.textContent = message;
        setTimeout(() => {
            this.copyIndicator.classList.remove('show');
        }, 3000);
    }

    copyAsCSS() {
        const css = this.extractedColors.map((color, i) =>
            `--color-${i + 1}: ${color.hex};`
        ).join('\n');

        navigator.clipboard.writeText(css);
        this.showCopyIndicator();
    }

    copyHexValues() {
        const hexValues = this.extractedColors.map(color => color.hex).join('\n');
        navigator.clipboard.writeText(hexValues);
        this.showCopyIndicator();
    }

    downloadJSON() {
        const data = {
            colors: this.extractedColors,
            extracted: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'color-palette.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    downloadSCSS() {
        const scss = this.extractedColors.map((color, i) =>
            `$color-${i + 1}: ${color.hex};`
        ).join('\n');

        const blob = new Blob([scss], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'color-palette.scss';
        a.click();
        URL.revokeObjectURL(url);
    }

    downloadASE() {
        // Simplified ASE format (Adobe Swatch Exchange)
        // This is a basic implementation for demonstration
        alert('ASE export is a simplified version for demonstration. For production use, implement full ASE binary format.');
    }

    saveAsImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const swatchSize = 100;
        canvas.width = swatchSize * this.extractedColors.length;
        canvas.height = swatchSize + 40;

        // Draw color swatches
        this.extractedColors.forEach((color, i) => {
            ctx.fillStyle = color.hex;
            ctx.fillRect(i * swatchSize, 0, swatchSize, swatchSize);

            // Add hex value
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(i * swatchSize, swatchSize, swatchSize, 40);
            ctx.fillStyle = '#000000';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(color.hex, i * swatchSize + swatchSize / 2, swatchSize + 25);
        });

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'color-palette.png';
            a.click();
            URL.revokeObjectURL(url);
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ColorPaletteExtractor();
});