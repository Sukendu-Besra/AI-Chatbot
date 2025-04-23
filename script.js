// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Particles.js Configuration
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#ffffff' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: { enable: true, mode: 'grab' },
            onclick: { enable: true, mode: 'push' },
            resize: true
        }
    },
    retina_detect: true
});

// Scroll Animations
document.querySelectorAll('.feature-card').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.2
    });
});

// Chatbot Functionality
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotWindow = document.getElementById('chatbot-window');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-message');
const messagesContainer = document.getElementById('chatbot-messages');

// Store conversation history
let conversationHistory = [];

// Toggle Chatbot Window
chatbotToggle.addEventListener('click', () => {
    chatbotWindow.classList.toggle('hidden');
    chatbotWindow.classList.toggle('show');
});

// Send Message Function
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';

    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('chatbot-message', 'bot-message', 'loading');
    loadingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        // Add message to conversation history
        conversationHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Call Gemini API
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCvlLw8wj3632vW3CggOMh5hMaFZFf2fdY', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: conversationHistory,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Remove loading indicator
        messagesContainer.removeChild(loadingDiv);

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const botResponse = data.candidates[0].content.parts[0].text;
            
            // Add bot response to conversation history
            conversationHistory.push({
                role: 'model',
                parts: [{ text: botResponse }]
            });
            
            // Add bot response to chat
            addMessage(botResponse, 'bot');
        } else {
            throw new Error('Invalid response format from API');
        }
    } catch (error) {
        console.error('Error:', error);
        // Remove loading indicator
        messagesContainer.removeChild(loadingDiv);
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

// Add Message to Chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chatbot-message', `${sender}-message`);
    
    // Format message with proper styling
    if (sender === 'user') {
        messageDiv.style.marginLeft = 'auto';
        messageDiv.style.backgroundColor = '#3b82f6';
        messageDiv.style.color = 'white';
    } else {
        messageDiv.style.backgroundColor = '#f3f4f6';
        messageDiv.style.color = '#1f2937';
    }
    
    messageDiv.style.padding = '0.75rem 1rem';
    messageDiv.style.borderRadius = '1rem';
    messageDiv.style.maxWidth = '80%';
    messageDiv.style.marginBottom = '0.5rem';
    messageDiv.style.wordBreak = 'break-word';
    
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initial Bot Message
addMessage('Hello! I\'m your Team Manager Assistant. How can I help you today?', 'bot');

// Smooth Scrolling for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
}); 