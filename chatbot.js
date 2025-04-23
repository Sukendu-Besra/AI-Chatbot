// Chatbot Functionality
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-message');
const messagesContainer = document.getElementById('chatbot-messages');

// API Configuration
const API_KEY = 'AIzaSyAJHSIntPrvBEQYLAydM8g_sF52_5D2Ga8';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Store conversation history
let conversationHistory = [];

// System prompt for the assistant
const systemPrompt = `You are Team Manager Assistant, an AI-powered productivity companion. Your role is to help users with:
1. Task management and organization
2. Team collaboration tips
3. Productivity strategies
4. Platform features and usage

Always be helpful, professional, and concise in your responses. If you don't know something, be honest about it.`;

// Format text with markdown-like syntax
function formatText(text) {
    // Convert markdown-like syntax to HTML
    let formattedText = text
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // Inline code
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Lists
        .replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>')
        // Headers
        .replace(/^#\s+(.*)$/gm, '<h3>$1</h3>')
        // Links
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
        // Line breaks
        .replace(/\n/g, '<br>');

    // Wrap lists in ul tags
    if (formattedText.includes('<li>')) {
        formattedText = '<ul>' + formattedText + '</ul>';
    }

    return formattedText;
}

// Add Message to Chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chatbot-message', `${sender}-message`);
    
    // Create message content container
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    // Add timestamp
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timeDiv = document.createElement('div');
    timeDiv.classList.add('message-time');
    timeDiv.textContent = timestamp;
    
    // Format message with proper styling
    if (sender === 'user') {
        messageDiv.style.marginLeft = 'auto';
        messageDiv.style.backgroundColor = '#3b82f6';
        messageDiv.style.color = 'white';
        contentDiv.style.color = 'white';
    } else {
        messageDiv.style.backgroundColor = '#f3f4f6';
        messageDiv.style.color = '#1f2937';
        contentDiv.style.color = '#1f2937';
    }
    
    // Apply message styling
    messageDiv.style.padding = '0.75rem 1rem';
    messageDiv.style.borderRadius = '1rem';
    messageDiv.style.maxWidth = '80%';
    messageDiv.style.marginBottom = '0.5rem';
    messageDiv.style.wordBreak = 'break-word';
    messageDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    
    // Add message content
    contentDiv.innerHTML = formatText(text);
    
    // Add styling for formatted content
    contentDiv.querySelectorAll('strong').forEach(el => {
        el.style.fontWeight = 'bold';
    });
    
    contentDiv.querySelectorAll('em').forEach(el => {
        el.style.fontStyle = 'italic';
    });
    
    contentDiv.querySelectorAll('code').forEach(el => {
        el.style.backgroundColor = '#e5e7eb';
        el.style.padding = '0.2rem 0.4rem';
        el.style.borderRadius = '0.25rem';
        el.style.fontFamily = 'monospace';
    });
    
    contentDiv.querySelectorAll('pre').forEach(el => {
        el.style.backgroundColor = '#e5e7eb';
        el.style.padding = '0.5rem';
        el.style.borderRadius = '0.25rem';
        el.style.overflowX = 'auto';
        el.style.margin = '0.5rem 0';
    });
    
    contentDiv.querySelectorAll('ul').forEach(el => {
        el.style.paddingLeft = '1.5rem';
        el.style.margin = '0.5rem 0';
    });
    
    contentDiv.querySelectorAll('li').forEach(el => {
        el.style.marginBottom = '0.25rem';
    });
    
    contentDiv.querySelectorAll('h3').forEach(el => {
        el.style.fontSize = '1.1rem';
        el.style.fontWeight = 'bold';
        el.style.margin = '0.5rem 0';
    });
    
    contentDiv.querySelectorAll('a').forEach(el => {
        el.style.color = sender === 'user' ? '#ffffff' : '#3b82f6';
        el.style.textDecoration = 'underline';
    });
    
    // Add content and timestamp to message
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('chatbot-message', 'bot-message', 'typing-indicator');
    typingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return typingDiv;
}

// Remove typing indicator
function removeTypingIndicator(typingDiv) {
    if (typingDiv && typingDiv.parentNode) {
        typingDiv.parentNode.removeChild(typingDiv);
    }
}

// Test API Key
async function testApiKey() {
    try {
        console.log('Testing API key...');
        const testResponse = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Hello, are you working?"
                    }]
                }]
            })
        });
        
        console.log('Test response status:', testResponse.status);
        const testData = await testResponse.json();
        console.log('API Test Response:', testData);
        return testResponse.ok;
    } catch (error) {
        console.error('API Test Error:', error);
        return false;
    }
}

// Send Message Function
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';

    // Show typing indicator
    const typingDiv = showTypingIndicator();

    try {
        // First test if API key is working
        const isApiWorking = await testApiKey();
        if (!isApiWorking) {
            throw new Error('API key is not working. Please check the console for details.');
        }

        // Prepare the API request exactly as in the cURL command
        const requestBody = {
            contents: [{
                parts: [{
                    text: message
                }]
            }]
        };

        console.log('Sending request to:', API_URL);
        console.log('Request body:', requestBody);

        // Call Gemini API with exact same format as cURL
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        // Remove typing indicator
        removeTypingIndicator(typingDiv);

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const botResponse = data.candidates[0].content.parts[0].text;
            addMessage(botResponse, 'bot');
        } else {
            console.error('Invalid response format:', data);
            throw new Error('Invalid response format from API');
        }
    } catch (error) {
        console.error('Error:', error);
        // Remove typing indicator
        removeTypingIndicator(typingDiv);
        addMessage('Sorry, I encountered an error. Please check the console for details.', 'bot');
    }
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Focus input on page load
window.addEventListener('load', () => {
    userInput.focus();
    // Test API key on load
    testApiKey();
}); 