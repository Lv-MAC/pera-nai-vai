document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const toolCards = document.querySelectorAll('.tool-card');

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedCategory = btn.dataset.category;

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter tool cards
            toolCards.forEach(card => {
                if (selectedCategory === 'all' || card.dataset.category === selectedCategory) {
                    card.style.display = 'flex';
                    // Add fade-in animation
                    card.style.animation = 'fadeIn 0.3s ease';
                } else {
                    card.style.display = 'none';
                }
            });

            // Scroll to tools section smoothly
            const toolsSection = document.querySelector('.tools-grid-container');
            if (toolsSection && selectedCategory !== 'all') {
                setTimeout(() => {
                    toolsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });
});

// Add CSS animation for fade-in effect
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
