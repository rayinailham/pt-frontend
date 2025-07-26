# Chatbot Component

## Overview
The Chatbot component provides an AI-powered career guidance assistant that integrates with assessment results. It allows users to ask questions about their assessment results and receive personalized career advice.

## Features
- **Assessment Integration**: Automatically creates conversations based on assessment results
- **Real-time Chat**: Interactive messaging with AI responses
- **Personalized Welcome**: Custom welcome message based on user's assessment
- **Conversation Suggestions**: AI-generated conversation starters
- **Responsive Design**: Mobile-friendly chat interface
- **Error Handling**: Graceful error handling and retry mechanisms

## API Integration
The chatbot uses three main API endpoints:

### 1. Create Conversation from Assessment
- **Endpoint**: `POST /api/chatbot/assessment/from-assessment`
- **Purpose**: Initialize a new conversation based on assessment results
- **Parameters**:
  - `assessment_id`: UUID of the assessment result
  - `conversation_type`: Type of conversation (default: 'career_guidance')
  - `include_suggestions`: Include AI-generated conversation starters

### 2. Send Message
- **Endpoint**: `POST /api/chatbot/conversations/:conversationId/messages`
- **Purpose**: Send a message to the AI and receive a response
- **Parameters**:
  - `content`: Message content
  - `type`: Message type (default: 'text')

### 3. Get Conversation Details
- **Endpoint**: `GET /api/chatbot/conversations/:conversationId`
- **Purpose**: Retrieve conversation details and message history
- **Parameters**:
  - `includeMessages`: Include full message history
  - `messageLimit`: Limit number of messages returned

## Usage
```jsx
import Chatbot from '../Chatbot/Chatbot';

// In your component
<Chatbot assessmentId={resultId} />
```

## Props
- `assessmentId` (string, required): The ID of the assessment result to base the conversation on

## State Management
The component manages the following state:
- `isOpen`: Controls chatbot window visibility
- `conversation`: Current conversation data
- `messages`: Array of chat messages
- `inputMessage`: Current input text
- `isLoading`: Loading state for message sending
- `isInitializing`: Loading state for conversation initialization
- `error`: Error messages

## Styling
The component uses Tailwind CSS classes and Framer Motion for animations. Key styling features:
- Gradient backgrounds for branding consistency
- Responsive design for mobile and desktop
- Smooth animations for open/close transitions
- Message bubbles with different styles for user/AI messages

## Error Handling
- Network errors are caught and displayed to the user
- Retry mechanisms for failed initialization
- Graceful degradation when API is unavailable
- User-friendly error messages

## Authentication
The chatbot automatically uses the user's authentication token through the existing axios interceptors configured in the application.
