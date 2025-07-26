import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/apiService';

const Chatbot = ({ assessmentId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeConversation = async () => {
    if (!assessmentId || conversation) {
      console.log('Skipping initialization:', { assessmentId, hasConversation: !!conversation });
      return;
    }

    console.log('Initializing conversation for assessment:', assessmentId);
    setIsInitializing(true);
    setError('');

    try {
      // First, try to get existing conversation for this assessment
      let existingConversation = null;

      try {
        // Try to get conversation details using assessment ID as conversation ID
        // This assumes the backend might return existing conversations for an assessment
        const existingResponse = await apiService.getConversation(assessmentId, {
          includeMessages: true,
          messageLimit: 100
        });

        if (existingResponse && existingResponse.success && existingResponse.data.conversation) {
          existingConversation = existingResponse.data.conversation;
        }
      } catch (getError) {
        // No existing conversation found, will create new one
      }

      if (existingConversation) {
        // Use existing conversation
        setConversation({
          conversationId: existingConversation.id,
          title: existingConversation.title,
          context: existingConversation.context,
          assessmentId: assessmentId,
          status: existingConversation.status
        });

        // Load existing messages
        if (existingConversation.messages && existingConversation.messages.length > 0) {
          setMessages(existingConversation.messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            timestamp: msg.timestamp,
            type: msg.type || 'text'
          })));
        }
      } else {
        // Create new conversation from assessment
        console.log('Creating new conversation from assessment...');
        const response = await apiService.createConversationFromAssessment({
          assessment_id: assessmentId,
          conversation_type: 'career_guidance',
          include_suggestions: true
        });

        console.log('API Response:', response);

        if (response && response.success) {
          setConversation(response.data);

          // Add welcome message
          const welcomeMessage = response.data.personalizedWelcome;
          if (welcomeMessage) {
            setMessages([{
              id: welcomeMessage.messageId,
              content: welcomeMessage.content,
              sender: 'ai',
              timestamp: welcomeMessage.timestamp,
              type: 'text'
            }]);
          }
        } else {
          // If API doesn't return success, show fallback
          // API response not successful
          setError('Unable to connect to career assistant. Please try again later.');

          // Add fallback welcome message
          setMessages([{
            id: 'fallback-welcome',
            content: 'Hello! I\'m your career assistant. I\'m here to help you understand your assessment results and explore career opportunities. How can I assist you today?',
            sender: 'ai',
            timestamp: new Date().toISOString(),
            type: 'text'
          }]);

          // Set a basic conversation object for fallback
          setConversation({
            conversationId: 'fallback-conversation',
            title: 'Career Guidance Session',
            suggestions: [
              { id: 'suggestion_1', title: 'Tell me about my personality type', description: 'What does my personality assessment reveal about me?' },
              { id: 'suggestion_2', title: 'Career recommendations', description: 'What career paths would suit my profile?' },
              { id: 'suggestion_3', title: 'Skills to develop', description: 'What skills should I focus on developing?' }
            ]
          });
        }
      }
    } catch (err) {
      setError(`Connection failed: ${err.message || 'Unknown error'}`);

      // Add fallback welcome message even on error
      setMessages([{
        id: 'fallback-welcome',
        content: 'Hello! I\'m your career assistant. I\'m currently having trouble connecting to our servers, but I\'m still here to help. Please try asking me about your assessment results.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: 'text'
      }]);

      // Set a basic conversation object for fallback
      setConversation({
        conversationId: 'fallback-conversation',
        title: 'Career Guidance Session',
        suggestions: [
          { id: 'suggestion_1', title: 'Tell me about my personality type', description: 'What does my personality assessment reveal about me?' },
          { id: 'suggestion_2', title: 'Career recommendations', description: 'What career paths would suit my profile?' },
          { id: 'suggestion_3', title: 'Skills to develop', description: 'What skills should I focus on developing?' }
        ]
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Input sanitization function
  const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') return '';

    // Remove potentially dangerous characters and limit length
    return input
      .trim()
      .slice(0, 1000) // Limit message length
      .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversation || isLoading) return;

    // Sanitize user input
    const sanitizedMessage = sanitizeInput(inputMessage);
    if (!sanitizedMessage) return;

    const userMessage = {
      id: Date.now().toString(),
      content: sanitizedMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.sendChatMessage(conversation.conversationId, {
        content: sanitizedMessage,
        type: 'text'
      });

      if (response.success) {
        const aiMessage = {
          id: response.data.aiResponse.id,
          content: response.data.aiResponse.content,
          sender: 'ai',
          timestamp: response.data.aiResponse.timestamp,
          type: 'text',
          metadata: response.data.aiResponse.metadata
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const suggestionText = sanitizeInput(suggestion.description || suggestion.title);
    setInputMessage(suggestionText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !conversation) {
      initializeConversation();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          )}
        </svg>
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-20 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 z-40 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Career Assistant</h3>
                  <p className="text-sm opacity-90">Ask me about your assessment results</p>
                </div>
                <button
                  onClick={toggleChatbot}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isInitializing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-gray-600">Initializing...</span>
                </div>
              ) : (
                <>
                  {/* Show error message if there's an error but still show messages */}
                  {error && !messages.length && (
                    <div className="text-center text-red-600 p-4 mb-4">
                      <p className="text-sm">{error}</p>
                      <button
                        onClick={initializeConversation}
                        className="mt-2 text-indigo-600 hover:text-indigo-800 underline text-sm"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Messages */}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{sanitizeInput(message.content)}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Suggestions - show when there's exactly one message (welcome message) */}
                  {conversation?.suggestions && messages.length <= 2 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-sm text-gray-600 font-medium">Suggested questions:</p>
                      {conversation.suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left p-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-sm text-indigo-700 transition-colors"
                        >
                          {suggestion.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Show default message if no messages and no error */}
                  {!messages.length && !error && !isInitializing && (
                    <div className="text-center text-gray-500 p-4">
                      <p>Welcome! I'm here to help you understand your assessment results.</p>
                      <p className="text-sm mt-2">Click the button below to get started!</p>
                      <button
                        onClick={initializeConversation}
                        className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Start Conversation
                      </button>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your career path..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading || !conversation}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading || !conversation}
                  className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
