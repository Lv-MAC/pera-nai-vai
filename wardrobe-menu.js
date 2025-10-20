document.addEventListener('DOMContentLoaded', () => {
    const burgerMenu = document.getElementById('burger-menu');
    const wardrobeOverlay = document.getElementById('wardrobe-overlay');
    const wardrobeCloseBtn = document.getElementById('wardrobe-close-btn');
    const filtersContainer = document.querySelector('.wardrobe-filters');
    const gridContainer = document.getElementById('wardrobe-grid');

    const tools = [
        { name: 'Invoice & Bill Generator', href: 'invoice-generator.html', category: 'finance', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' },
        { name: 'Tweet to Image', href: 'tweet-to-image.html', category: 'image', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
        { name: 'JPEG Compressor', href: 'jpeg-compressor.html', category: 'image', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' },
        { name: 'Photo & Signature Resizer', href: 'photo-resizer.html', category: 'image', icon: 'M4 4h7L9 2H4c-1.1 0-2 .9-2 2v5l2-2V4zm16 0h-5l2-2h3c1.1 0 2 .9 2 2v5l-2-2V4zM4 20h7l-2 2H4c-1.1 0-2-.9-2-2v-5l2 2v3zm16 0h-5l2 2h3c1.1 0 2-.9 2-2v-5l-2 2v3z' },
        { name: 'Color Palette Generator', href: 'color-palette.html', category: 'image', icon: 'M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z' },
        { name: 'MFS Helper', href: 'mfs-helper.html', category: 'finance', icon: 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.1.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z' },
        { name: 'Financial Calculators', href: 'financial-calculators.html', category: 'finance', icon: 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z' },
        { name: 'Land Unit Converter', href: 'land-converter.html', category: 'utility', icon: 'M21 3H3v18h18V3zm-2 16H5V5h14v14zM7 15h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM7 7h2v2H7V7zm4 0h2v2h-2V7z' },
        { name: 'QR Code Generator', href: 'qr-generator.html', category: 'utility', icon: 'M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 0h-2v2h2v-2zm2 0v2h2v-2h-2zm-2 2h-2v2h2v2h-2v-2h-2v2h-2v-2h2v-2h2v-2h2v2zm2-2v-2h2v2h-2zm0 4h2v2h-2v-2z' },
        { name: 'Email Extractor', href: 'email-extractor.html', category: 'text', icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' },
        { name: 'Bangla Converter', href: 'bangla-converter.html', category: 'text', icon: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z' },
    ];

    const categories = ['All', 'Image', 'Finance', 'Utility', 'Text'];

    // --- Populate Menu --- 
    function populateMenu() {
        if (!filtersContainer || !gridContainer) return;

        // Populate Filters
        categories.forEach(cat => {
            const tag = document.createElement('button');
            tag.className = 'filter-tag';
            tag.textContent = cat;
            tag.dataset.category = cat.toLowerCase();
            if (cat === 'All') tag.classList.add('active');
            filtersContainer.appendChild(tag);
        });

        // Populate Grid
        tools.forEach(tool => {
            const card = document.createElement('a');
            card.href = tool.href;
            card.className = 'tool-card';
            card.dataset.category = tool.category;
            card.innerHTML = `
                <div class="tool-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="${tool.icon}"/></svg>
                </div>
                <h3>${tool.name}</h3>
            `;
            gridContainer.appendChild(card);
        });
    }

    // --- Event Listeners ---
    if (burgerMenu && wardrobeOverlay && wardrobeCloseBtn) {
        burgerMenu.addEventListener('click', () => wardrobeOverlay.classList.add('active'));
        wardrobeCloseBtn.addEventListener('click', () => wardrobeOverlay.classList.remove('active'));
        wardrobeOverlay.addEventListener('click', (e) => {
            if (e.target === wardrobeOverlay) wardrobeOverlay.classList.remove('active');
        });
    }

    // Filtering Logic
    if (filtersContainer) {
        filtersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-tag')) {
                const selectedCategory = e.target.dataset.category;

                // Update active tag
                filtersContainer.querySelectorAll('.filter-tag').forEach(tag => tag.classList.remove('active'));
                e.target.classList.add('active');

                // Filter grid items
                gridContainer.querySelectorAll('.tool-card').forEach(card => {
                    if (selectedCategory === 'all' || card.dataset.category === selectedCategory) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
        });
    }

    // --- Initial Call ---
    populateMenu();
});