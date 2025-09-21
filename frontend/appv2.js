// IT Support Chatbot Application
class ITSupportChatbot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.chatForm = document.getElementById('chatForm');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        // Analytics elements
        this.totalQueriesEl = document.getElementById('totalQueries');
        this.avgConfidenceEl = document.getElementById('avgConfidence');
        this.escalationRateEl = document.getElementById('escalationRate');
        this.intentHistoryEl = document.getElementById('intentHistory');
        
        // Demo settings
        this.showConfidenceEl = document.getElementById('show-confidence');
        this.showIntentEl = document.getElementById('show-intent');
        this.typingDelayEl = document.getElementById('typing-delay');
        
        // Chat state
        this.currentIntent = null;
        this.conversationStep = 0;
        this.userContext = {};
        this.sessionData = {
            totalQueries: 0,
            confidenceScores: [],
            escalations: 0,
            intents: []
        };
        
        // Bot configuration
        this.botData = {
            name: "IT Support Assistant",
            welcomeMessage: "👋 Hi! I'm your IT Support Assistant. I can help you with password resets, WiFi issues, email problems, and more. How can I assist you today?",
            quickActions: [
                {text: "🔐 Reset Password", intent: "PasswordReset"},
                {text: "📶 WiFi Issues", intent: "WiFiTroubleshooting"}, 
                {text: "📧 Email Problems", intent: "EmailAccess"},
                {text: "🙋 Speak to Agent", intent: "EscalateToHuman"}
            ],
            responseTemplates: {
                PasswordReset: {
                    steps: [
                        "I can help you reset your password. What's your username or employee ID?",
                        "Thanks! Now I need your email address for verification.",
                        "Perfect! I've found your account. Here are the password reset steps:\n\n1. Go to company.com/login\n2. Click 'Forgot Password'\n3. Enter your username: {username}\n4. Check your email: {email}\n5. Follow the reset link\n\nYou should receive the email within 5 minutes. Need anything else?"
                    ]
                },
                WiFiTroubleshooting: {
                    steps: [
                        "I'll help you troubleshoot your WiFi connection. What type of device are you using?",
                        "Are you seeing any specific error messages?",
                        "Here are troubleshooting steps for your {device}:\n\n1. Check if WiFi is enabled\n2. Restart your WiFi\n3. Forget and reconnect to the network\n4. Restart your device & Wifi router (unplug 30 seconds)\n5. Try connecting to different mobile hotspot\n\nTry these steps and let me know if you need more help!"
                    ]
                },
                EmailAccess: {
                    steps: [
                        "I can help with email access issues. Which email application are you using?",
                        "What specific problem are you experiencing?",
                        "Here's how to fix {issue} in {client}:\n\n1. Verify your login credentials\n2. Check internet connection\n3. Clear browser cache\n4. Try different device\n5. Check server settings:\n   - IMAP: mail.company.com:993\n   - SMTP: smtp.company.com:587\n\nIf this doesn't help, I can escalate to email support."
                    ]
                },
                EscalateToHuman: {
                    steps: [
                        "I'll connect you with a human agent. Please describe your issue briefly.",
                        "How urgent is this issue? (Low, Medium, High, Critical)",
                        "Thanks! I've created ticket #{ticketId} and assigned it {priority} priority.\n\n📋 Ticket Details:\n• Issue: {issue}\n• Priority: {priority}\n• Expected response: {responseTime}\n\nA technician will contact you soon!"
                    ]
                }
            },
            systemStatus: {
                email: "🟢 Operational",
                network: "🟢 Operational", 
                servers: "🟡 Maintenance Scheduled",
                phones: "🟢 Operational"
            }
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateSystemStatus();
        this.updateAnalytics();
        this.initializeFAQ();
    }
    
    bindEvents() {
        // Chat form submission
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUserMessage();
        });
        
        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const intent = e.target.getAttribute('data-intent');
                this.handleQuickAction(intent);
            });
        });
        
        // Demo settings
        this.showConfidenceEl.addEventListener('change', this.updateMessageDisplay.bind(this));
        this.showIntentEl.addEventListener('change', this.updateMessageDisplay.bind(this));
        
        // Enter key support
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserMessage();
            }
        });
    }
    
    initializeFAQ() {
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', (e) => {
                const faqItem = e.target.closest('.faq-item');
                const isActive = faqItem.classList.contains('active');
                
                // Close all FAQ items
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Toggle current item
                if (!isActive) {
                    faqItem.classList.add('active');
                }
            });
        });
    }
    
    handleUserMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        this.addMessage('user', message);
        this.chatInput.value = '';
        
        // Process message
        this.processUserInput(message);
    }
    
    handleQuickAction(intent) {
        const action = this.botData.quickActions.find(a => a.intent === intent);
        if (action) {
            this.addMessage('user', action.text);
            this.startIntent(intent);
        }
    }
    
    processUserInput(message) {
        // Simulate intent recognition
        const intent = this.recognizeIntent(message);
        const confidence = this.calculateConfidence(message, intent);
        
        // Update session data
        this.sessionData.totalQueries++;
        this.sessionData.confidenceScores.push(confidence);
        this.sessionData.intents.push({intent, confidence, timestamp: Date.now()});
        
        if (this.currentIntent) {
            this.continueConversation(message);
        } else {
            this.startIntent(intent, confidence);
        }
        
        this.updateAnalytics();
    }
    
    recognizeIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('password') || lowerMessage.includes('reset') || lowerMessage.includes('login')) {
            return 'PasswordReset';
        } else if (lowerMessage.includes('wifi') || lowerMessage.includes('internet') || lowerMessage.includes('connection')) {
            return 'WiFiTroubleshooting';
        } else if (lowerMessage.includes('email') || lowerMessage.includes('outlook') || lowerMessage.includes('mail')) {
            return 'EmailAccess';
        } else if (lowerMessage.includes('help') || lowerMessage.includes('agent') || lowerMessage.includes('human')) {
            return 'EscalateToHuman';
        } else {
            return 'General';
        }
    }
    
    calculateConfidence(message, intent) {
        const keywords = {
            'PasswordReset': ['password', 'reset', 'login', 'account', 'forgot'],
            'WiFiTroubleshooting': ['wifi', 'internet', 'connection', 'network', 'router'],
            'EmailAccess': ['email', 'outlook', 'mail', 'smtp', 'imap'],
            'EscalateToHuman': ['help', 'agent', 'human', 'support', 'escalate']
        };
        
        const intentKeywords = keywords[intent] || [];
        const messageWords = message.toLowerCase().split(' ');
        const matches = messageWords.filter(word => intentKeywords.includes(word)).length;
        
        return Math.min(0.95, Math.max(0.6, (matches / intentKeywords.length) * 0.9 + 0.3));
    }
    
    startIntent(intent, confidence = 0.95) {
        this.currentIntent = intent;
        this.conversationStep = 0;
        this.userContext = {};
        
        if (intent === 'General') {
            this.handleGeneralQuery();
        } else {
            this.showTypingIndicator();
            setTimeout(() => {
                this.processIntentStep(confidence);
            }, this.getTypingDelay());
        }
    }
    
    continueConversation(message) {
        this.conversationStep++;
        this.storeUserInput(message);
        
        this.showTypingIndicator();
        setTimeout(() => {
            this.processIntentStep();
        }, this.getTypingDelay());
    }
    
    processIntentStep(confidence = 0.9) {
        const template = this.botData.responseTemplates[this.currentIntent];
        if (!template || this.conversationStep >= template.steps.length) {
            this.endConversation();
            return;
        }
        
        let response = template.steps[this.conversationStep];
        
        // Replace placeholders
        response = this.replacePlaceholders(response);
        
        this.hideTypingIndicator();
        this.addMessage('bot', response, confidence, this.currentIntent);
        
        // Check if conversation is complete
        if (this.conversationStep >= template.steps.length - 1) {
            this.endConversation();
        }
    }
    
    storeUserInput(message) {
        switch (this.currentIntent) {
            case 'PasswordReset':
                if (this.conversationStep === 1) {
                    this.userContext.username = message;
                } else if (this.conversationStep === 2) {
                    this.userContext.email = message;
                }
                break;
            case 'WiFiTroubleshooting':
                if (this.conversationStep === 1) {
                    this.userContext.device = message;
                } else if (this.conversationStep === 2) {
                    this.userContext.error = message;
                }
                break;
            case 'EmailAccess':
                if (this.conversationStep === 1) {
                    this.userContext.client = message;
                } else if (this.conversationStep === 2) {
                    this.userContext.issue = message;
                }
                break;
            case 'EscalateToHuman':
                if (this.conversationStep === 1) {
                    this.userContext.issue = message;
                } else if (this.conversationStep === 2) {
                    this.userContext.priority = message;
                    this.userContext.ticketId = this.generateTicketId();
                    this.userContext.responseTime = this.getResponseTime(message);
                    this.sessionData.escalations++;
                }
                break;
        }
    }
    
    replacePlaceholders(response) {
        return response.replace(/\{(\w+)\}/g, (match, key) => {
            return this.userContext[key] || match;
        });
    }
    
    handleGeneralQuery() {
        const responses = [
            "I'm here to help with IT support issues. I can assist with password resets, WiFi problems, email access, and more. What specific issue are you experiencing?",
            "I can help you with common IT issues. Try using the quick action buttons or describe your problem in detail.",
            "I'm designed to help with technical support. Is there a specific IT issue you're facing today?"
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        this.showTypingIndicator();
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addMessage('bot', response, 0.8, 'General');
            this.endConversation();
        }, this.getTypingDelay());
    }
    
    endConversation() {
        this.currentIntent = null;
        this.conversationStep = 0;
        this.userContext = {};
    }
    
    generateTicketId() {
        return 'IT-' + Date.now().toString().slice(-6);
    }
    
    getResponseTime(priority) {
        const times = {
            'low': '2-4 business hours',
            'medium': '1-2 business hours', 
            'high': '30-60 minutes',
            'critical': '15-30 minutes'
        };
        return times[priority.toLowerCase()] || '1-2 business hours';
    }
    
    addMessage(sender, text, confidence = null, intent = null) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        
        const meta = document.createElement('div');
        meta.className = 'message-meta';
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = this.formatTime(new Date());
        
        meta.appendChild(time);
        
        if (sender === 'bot' && confidence !== null && this.showConfidenceEl.checked) {
            const confidenceSpan = document.createElement('span');
            confidenceSpan.className = 'confidence-score';
            confidenceSpan.textContent = `Confidence: ${Math.round(confidence * 100)}%`;
            meta.appendChild(confidenceSpan);
        }
        
        if (sender === 'bot' && intent && this.showIntentEl.checked) {
            const intentSpan = document.createElement('span');
            intentSpan.className = 'intent-display';
            intentSpan.textContent = `Intent: ${intent}`;
            meta.appendChild(intentSpan);
        }
        
        content.appendChild(messageText);
        content.appendChild(meta);
        
        messageEl.appendChild(avatar);
        messageEl.appendChild(content);
        
        this.chatMessages.appendChild(messageEl);
        this.scrollToBottom();
        
        // Update intent history
        if (sender === 'bot' && intent) {
            this.updateIntentHistory(intent, confidence);
        }
    }
    
    showTypingIndicator() {
        if (this.typingDelayEl.checked) {
            this.typingIndicator.classList.add('show');
            this.scrollToBottom();
        }
    }
    
    hideTypingIndicator() {
        this.typingIndicator.classList.remove('show');
    }
    
    getTypingDelay() {
        return this.typingDelayEl.checked ? Math.random() * 2000 + 1000 : 100;
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    formatTime(date) {
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    updateSystemStatus() {
        const statusItems = document.querySelectorAll('.status-item');
        statusItems.forEach(item => {
            const service = item.getAttribute('data-service');
            const status = this.botData.systemStatus[service];
            if (status) {
                item.textContent = status;
            }
        });
    }
    
    updateAnalytics() {
        this.totalQueriesEl.textContent = this.sessionData.totalQueries;
        
        const avgConfidence = this.sessionData.confidenceScores.length > 0 
            ? Math.round(this.sessionData.confidenceScores.reduce((a, b) => a + b, 0) / this.sessionData.confidenceScores.length * 100)
            : 0;
        this.avgConfidenceEl.textContent = `${avgConfidence}%`;
        
        const escalationRate = this.sessionData.totalQueries > 0 
            ? Math.round((this.sessionData.escalations / this.sessionData.totalQueries) * 100)
            : 0;
        this.escalationRateEl.textContent = `${escalationRate}%`;
    }
    
    updateIntentHistory(intent, confidence) {
        const intentItem = document.createElement('div');
        intentItem.className = 'intent-item';
        
        const intentName = document.createElement('span');
        intentName.className = 'intent-name';
        intentName.textContent = intent;
        
        const intentConfidence = document.createElement('span');
        intentConfidence.className = 'intent-confidence';
        intentConfidence.textContent = `${Math.round(confidence * 100)}%`;
        
        intentItem.appendChild(intentName);
        intentItem.appendChild(intentConfidence);
        
        this.intentHistoryEl.insertBefore(intentItem, this.intentHistoryEl.firstChild);
        
        // Keep only last 5 items
        while (this.intentHistoryEl.children.length > 5) {
            this.intentHistoryEl.removeChild(this.intentHistoryEl.lastChild);
        }
    }
    
    updateMessageDisplay() {
        // Re-render messages with updated settings
        const messages = this.chatMessages.querySelectorAll('.message');
        messages.forEach(message => {
            const meta = message.querySelector('.message-meta');
            const confidence = meta.querySelector('.confidence-score');
            const intent = meta.querySelector('.intent-display');
            
            if (confidence) {
                confidence.style.display = this.showConfidenceEl.checked ? 'inline' : 'none';
            }
            if (intent) {
                intent.style.display = this.showIntentEl.checked ? 'inline' : 'none';
            }
        });
    }
}

// Initialize the chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ITSupportChatbot();
});

// Additional utility functions
function simulateProcessing(message) {
    const processingIndicator = document.createElement('div');
    processingIndicator.className = 'processing-indicator';
    processingIndicator.innerHTML = `
        <div class="processing-spinner"></div>
        <span>Processing your request...</span>
    `;
    
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.appendChild(processingIndicator);
    
    setTimeout(() => {
        processingIndicator.remove();
    }, 2000);
}

// Sample FAQ data for demonstration
const faqData = [
    {
        category: "Password Reset",
        question: "How do I reset my password?",
        answer: "Go to the login page, click 'Forgot Password', enter your username, and follow the email instructions.",
        confidence: 0.95
    },
    {
        category: "WiFi Issues",
        question: "My WiFi isn't working",
        answer: "Try restarting your WiFi adapter, forgetting and reconnecting to the network, or restarting your router.",
        confidence: 0.9
    },
    {
        category: "Email Access",
        question: "I can't access my email",
        answer: "Check your credentials, internet connection, and email server settings. Try accessing from a different device.",
        confidence: 0.85
    }
];

// Simulate AWS services integration
class AWSIntegration {
    static async queryDynamoDB(intent, userInput) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const faqItem = faqData.find(item => 
                    item.category.toLowerCase().includes(intent.toLowerCase())
                );
                resolve(faqItem || null);
            }, 500);
        });
    }

    static async sendSESEmail(ticketData) {
        const response = await fetch('https://pix5d9fdu4.execute-api.us-east-1.amazonaws.com/prod/sendTicket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });

        const result = await response.json();
        console.log("Live SES + DynamoDB result:", result);
        return result;
    }

    static logToCloudWatch(logData) {
        console.log('CloudWatch Log:', {
            timestamp: new Date().toISOString(),
            ...logData
        });
    }
}

// Performance monitoring
class ChatbotAnalytics {
    constructor() {
        this.metrics = {
            responseTime: [],
            userSatisfaction: [],
            intentAccuracy: [],
            escalationReasons: []
        };
    }
    
    recordResponseTime(startTime, endTime) {
        this.metrics.responseTime.push(endTime - startTime);
    }
    
    recordIntentAccuracy(predicted, actual) {
        this.metrics.intentAccuracy.push(predicted === actual);
    }
    
    getAverageResponseTime() {
        const times = this.metrics.responseTime;
        return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    }
    
    getIntentAccuracy() {
        const accuracy = this.metrics.intentAccuracy;
        return accuracy.length > 0 ? accuracy.filter(Boolean).length / accuracy.length : 0;
    }
}

// Global analytics instance
const analytics = new ChatbotAnalytics();