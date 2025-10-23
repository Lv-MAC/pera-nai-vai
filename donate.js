// Donate Modal Functionality
document.addEventListener('DOMContentLoaded', () => {
    const donateBtn = document.getElementById('donate-btn');
    const donateModal = document.getElementById('donate-modal');
    const closeModalBtn = document.getElementById('close-donate-modal');
    const copyNumberBtn = document.getElementById('copy-number-btn');
    const donateNumber = document.getElementById('donate-number');

    // Open modal
    donateBtn.addEventListener('click', () => {
        donateModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });

    // Close modal
    closeModalBtn.addEventListener('click', () => {
        donateModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close modal when clicking outside
    donateModal.addEventListener('click', (e) => {
        if (e.target === donateModal) {
            donateModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && donateModal.classList.contains('active')) {
            donateModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Copy number functionality
    copyNumberBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(donateNumber.value);

            // Change button text temporarily
            const originalHTML = copyNumberBtn.innerHTML;
            copyNumberBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Copied!
            `;
            copyNumberBtn.style.background = '#4CAF50';

            setTimeout(() => {
                copyNumberBtn.innerHTML = originalHTML;
                copyNumberBtn.style.background = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy number. Please copy manually.');
        }
    });
});
