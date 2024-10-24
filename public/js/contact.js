document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form form');
    const contactSubmit = document.getElementById('contact-btn');

    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            message: document.getElementById('message').value.trim()
        };
        
        if (!formData.name || !formData.email || !formData.message) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(formData.email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        contactSubmit.innerText = "Sending...";
        contactSubmit.disabled = true;
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                contactSubmit.innerText = "Send Message";
                contactSubmit.disabled = false;
                throw new Error('Failed to send message');
            }
            
            await response.json();
            contactSubmit.innerText = "Send Message";
            contactSubmit.disabled = false;
            showMessage('Message sent successfully! ', 'success');
            contactForm.reset();
            
        } catch (error) {
            contactSubmit.innerText = "Send Message";
            contactSubmit.disabled = false;
            console.error('Error:', error);
            showMessage('Failed to send message. Please try again later.', 'error');
        }
    });
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        
        // Remove existing message
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Insert message before form
        contactForm.insertAdjacentElement('beforebegin', messageDiv);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
});