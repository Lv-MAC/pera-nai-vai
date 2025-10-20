// JPEG Compressor JavaScript
class JPEGCompressor {
    constructor() {
        this.files = [];
        this.compressedFiles = [];
        this.currentQuality = 75;

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Main elements
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.controlsPanel = document.getElementById('controls-panel');
        this.previewContainer = document.getElementById('preview-container');
        this.batchList = document.getElementById('batch-list');
        this.batchItems = document.getElementById('batch-items');

        // Controls
        this.qualitySlider = document.getElementById('quality-slider');
        this.qualityValue = document.getElementById('quality-value');
        this.compressBtn = document.getElementById('compress-btn');
        this.downloadAllBtn = document.getElementById('download-all-btn');
        this.clearAllBtn = document.getElementById('clear-all');

        // Preview elements
        this.originalPreview = document.getElementById('original-preview');
        this.compressedPreview = document.getElementById('compressed-preview');
        this.originalSize = document.getElementById('original-size');
        this.compressedSize = document.getElementById('compressed-size');
        this.compressionStats = document.getElementById('compression-stats');
    }

    attachEventListeners() {
        // Upload area events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));

        // File input change
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Quality slider
        this.qualitySlider.addEventListener('input', this.updateQuality.bind(this));

        // Buttons
        this.compressBtn.addEventListener('click', this.compressImages.bind(this));
        this.downloadAllBtn.addEventListener('click', this.downloadAll.bind(this));
        this.clearAllBtn.addEventListener('click', this.clearAll.bind(this));

        // Theme toggle
        this.initTheme();
    }

    initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');

        // Check for saved theme preference
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

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type === 'image/jpeg' || file.type === 'image/jpg'
        );

        if (files.length > 0) {
            this.addFiles(files);
        }
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.addFiles(files);
    }

    addFiles(files) {
        this.files = [...this.files, ...files];
        this.updateBatchList();
        this.showControls();

        // Show preview of first file
        if (this.files.length > 0) {
            this.showPreview(this.files[0]);
        }
    }

    updateBatchList() {
        if (this.files.length === 0) {
            this.batchList.classList.remove('active');
            return;
        }

        this.batchList.classList.add('active');
        this.batchItems.innerHTML = '';

        this.files.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'batch-item';
            item.innerHTML = `
                <span class="batch-item-name">${file.name}</span>
                <span class="batch-item-size">${this.formatFileSize(file.size)}</span>
                <span class="batch-item-status status-pending" data-index="${index}">Pending</span>
            `;
            this.batchItems.appendChild(item);
        });
    }

    showControls() {
        this.controlsPanel.classList.add('active');
    }

    updateQuality(e) {
        this.currentQuality = e.target.value;
        this.qualityValue.textContent = `${this.currentQuality}%`;
    }

    async showPreview(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            this.originalPreview.src = e.target.result;
            this.originalSize.textContent = this.formatFileSize(file.size);
            this.previewContainer.classList.add('active');
        };

        reader.readAsDataURL(file);
    }

    async compressImages() {
        this.compressBtn.disabled = true;
        this.compressedFiles = [];
        const totalFiles = this.files.length;

        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            const statusElement = document.querySelector(`.batch-item-status[data-index="${i}"]`);

            // Update button text with progress
            this.compressBtn.textContent = `Processing ${i + 1} of ${totalFiles}...`;

            if (statusElement) {
                statusElement.className = 'batch-item-status status-processing';
                statusElement.textContent = 'Processing';
            }

            try {
                const compressedFile = await this.compressImage(file);
                this.compressedFiles.push(compressedFile);

                if (statusElement) {
                    statusElement.className = 'batch-item-status status-complete';
                    const reduction = Math.round((1 - compressedFile.blob.size / file.size) * 100);
                    statusElement.textContent = `-${reduction}%`;
                }

                // Update preview for first file
                if (i === 0) {
                    this.updateCompressedPreview(compressedFile);
                }
            } catch (error) {
                console.error('Error compressing image:', error);
                if (statusElement) {
                    statusElement.className = 'batch-item-status status-error';
                    statusElement.textContent = 'Error';
                }
            }
        }

        this.compressBtn.disabled = false;
        this.compressBtn.textContent = 'Compress Images';
        this.downloadAllBtn.style.display = 'block';
    }

    compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Set canvas dimensions to image dimensions
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Draw image on canvas
                    ctx.drawImage(img, 0, 0, img.width, img.height);

                    // Convert to blob with specified quality
                    canvas.toBlob(
                        (blob) => {
                            resolve({
                                blob: blob,
                                dataUrl: URL.createObjectURL(blob),
                                name: this.getCompressedFileName(file.name),
                                originalSize: file.size,
                                compressedSize: blob.size
                            });
                        },
                        'image/jpeg',
                        this.currentQuality / 100
                    );
                };

                img.onerror = reject;
                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    updateCompressedPreview(compressedFile) {
        this.compressedPreview.src = compressedFile.dataUrl;
        this.compressedSize.textContent = this.formatFileSize(compressedFile.compressedSize);

        const reduction = Math.round((1 - compressedFile.compressedSize / compressedFile.originalSize) * 100);
        const saved = this.formatFileSize(compressedFile.originalSize - compressedFile.compressedSize);

        this.compressionStats.textContent = `${reduction}% smaller (saved ${saved})`;
        this.compressionStats.style.display = 'block';
    }

    getCompressedFileName(originalName) {
        const nameParts = originalName.split('.');
        const extension = nameParts.pop();
        const baseName = nameParts.join('.');
        return `${baseName}_compressed_${this.currentQuality}.${extension}`;
    }

    downloadAll() {
        this.compressedFiles.forEach(file => {
            this.downloadFile(file);
        });
    }

    downloadFile(compressedFile) {
        const a = document.createElement('a');
        a.href = compressedFile.dataUrl;
        a.download = compressedFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    clearAll() {
        this.files = [];
        this.compressedFiles = [];
        this.fileInput.value = '';

        this.batchList.classList.remove('active');
        this.controlsPanel.classList.remove('active');
        this.previewContainer.classList.remove('active');
        this.downloadAllBtn.style.display = 'none';

        this.batchItems.innerHTML = '';
        this.compressionStats.style.display = 'none';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JPEGCompressor();
});