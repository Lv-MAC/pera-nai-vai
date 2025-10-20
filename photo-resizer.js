document.addEventListener('DOMContentLoaded', () => {
    const PRESETS = {
        custom: { width: 300, height: 300, maxSizeKB: 100 },
        passport: { width: 1063, height: 1299, maxSizeKB: 300 },
        epassport: { width: 591, height: 709, maxSizeKB: 300 },
        nid: { width: 1014, height: 639, maxSizeKB: 500 },
        visa: { width: 827, height: 1063, maxSizeKB: 300 },
        govtjob: { width: 300, height: 300, maxSizeKB: 100 },
        du: { width: 450, height: 600, maxSizeKB: 200 },
        nu: { width: 120, height: 150, maxSizeKB: 50 },
        bou: { width: 300, height: 300, maxSizeKB: 100 },
    };
    const SIGNATURE_PRESET = { width: 300, height: 80, maxSizeKB: 60 };

    function setupResizer(type) {
        const uploadArea = document.getElementById(`${type}-upload-area`);
        const fileInput = document.getElementById(`${type}-input`);
        const processingGrid = document.getElementById(`${type}-processing-grid`);
        const originalPreview = document.getElementById(`${type}-original-preview`);
        const originalInfo = document.getElementById(`${type}-original-info`);
        const outputCanvas = document.getElementById(`${type}-output-canvas`);
        const outputInfo = document.getElementById(`${type}-output-info`);
        const downloadBtn = document.getElementById(`${type}-download-btn`);
        const qualitySlider = document.getElementById(`${type}-quality-slider`);
        const presetSelect = document.getElementById(`${type}-preset-select`);
        const resetBtn = document.getElementById(`${type}-reset-btn`);

        let originalImageFile = null;

        function resetUI() {
            fileInput.value = null;
            originalImageFile = null;
            uploadArea.classList.remove('hidden');
            processingGrid.classList.remove('active');
        }

        function processImage() {
            if (!originalImageFile) return;
            const preset = (type === 'photo') ? PRESETS[presetSelect.value] : SIGNATURE_PRESET;
            const quality = parseFloat(qualitySlider.value);
            const targetWidth = preset.width;
            const targetHeight = preset.height;
            outputCanvas.width = targetWidth;
            outputCanvas.height = targetHeight;
            const ctx = outputCanvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
            const hRatio = targetWidth / originalPreview.naturalWidth;
            const vRatio = targetHeight / originalPreview.naturalHeight;
            const ratio = Math.min(hRatio, vRatio);
            const centerShift_x = (targetWidth - originalPreview.naturalWidth * ratio) / 2;
            const centerShift_y = (targetHeight - originalPreview.naturalHeight * ratio) / 2;
            ctx.drawImage(originalPreview, 0, 0, originalPreview.naturalWidth, originalPreview.naturalHeight, centerShift_x, centerShift_y, originalPreview.naturalWidth * ratio, originalPreview.naturalHeight * ratio);
            outputCanvas.toBlob((blob) => {
                const sizeKB = (blob.size / 1024).toFixed(2);
                const sizeOK = preset.maxSizeKB ? sizeKB <= preset.maxSizeKB : true;
                outputInfo.textContent = `${targetWidth}x${targetHeight}px - ${sizeKB} KB`;
                outputInfo.style.color = sizeOK ? 'var(--success-color)' : 'var(--error-color)';
            }, 'image/jpeg', quality);
        }

        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                originalImageFile = file;
                const reader = new FileReader();
                reader.onload = (event) => {
                    originalPreview.src = event.target.result;
                    originalPreview.onload = () => {
                        originalInfo.textContent = `${originalPreview.naturalWidth}x${originalPreview.naturalHeight}px - ${(file.size / 1024).toFixed(2)} KB`;
                        uploadArea.classList.add('hidden');
                        processingGrid.classList.add('active');
                        processImage();
                    };
                };
                reader.readAsDataURL(file);
            }
        });

        downloadBtn.addEventListener('click', () => {
            const quality = parseFloat(qualitySlider.value);
            const link = document.createElement('a');
            link.download = `${type}_${Date.now()}.jpg`;
            link.href = outputCanvas.toDataURL('image/jpeg', quality);
            link.click();
        });

        if (resetBtn) resetBtn.addEventListener('click', resetUI);
        if (presetSelect) presetSelect.addEventListener('change', processImage);
        if (qualitySlider) qualitySlider.addEventListener('input', processImage);
    }

    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(clickedTab => {
        clickedTab.addEventListener('click', () => {
            tabs.forEach(tab => tab.classList.remove('active'));
            clickedTab.classList.add('active');

            tabContents.forEach(content => {
                if (content.id === clickedTab.dataset.tab) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });

    setupResizer('photo');
    setupResizer('signature');
});
