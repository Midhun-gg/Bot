# BOT by Comski 🎤🤖

A React-based AI conversation bot designed to help improve your speaking skills through interactive voice conversations. The bot features an animated avatar that responds to speech and provides real-time feedback.

## 📖 About

**BOT by Comski** is an innovative language learning application that combines cutting-edge AI technology with an engaging user experience. Built as a React web application, it creates an interactive environment where users can practice speaking skills through natural conversations with an AI assistant.

The application features a unique animated avatar system that responds to speech patterns, making the learning experience more engaging and realistic. Whether you're learning a new language, practicing public speaking, or simply want to improve your communication skills, this bot provides a safe, judgment-free environment to practice and grow.

## ✨ Features

- **Voice Interaction**: Speak naturally with the AI assistant
- **Animated Avatar**: Dynamic avatar with blinking eyes and mouth movements that sync with speech
- **Speech-to-Text**: Converts your voice input to text for processing
- **Text-to-Speech**: Bot responses are converted to natural-sounding speech
- **Conversation Flow**: Structured 5-iteration conversation system
- **Silence Detection**: Automatically stops recording when you finish speaking
- **Conversation Summary**: Get a summary of your conversation at the end
- **Modern UI**: Built with Material-UI for a clean, responsive interface

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- A modern web browser with microphone access
- Backend server running on `http://localhost:8000` (see Backend Requirements below)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Midhun-gg/Bot
   cd bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## 🔧 Backend Requirements

This application requires a backend server running on `http://localhost:8000` with the following endpoints:

### Required Endpoints

1. **`POST /initial-greeting`**

   - Returns initial bot greeting message
   - Response: `{ "response": "Hello! How can I help you today?" }`

2. **`POST /process-audio`**

   - Processes uploaded audio files
   - Accepts: `FormData` with audio file
   - Returns: `{ "user_input": "transcribed text", "response": "bot response", "iteration": 1 }`

3. **`POST /text-to-speech`**

   - Converts text to speech
   - Accepts: `{ "text": "text to convert" }`
   - Returns: Audio blob

4. **`POST /final-greeting`**

   - Returns final conversation message
   - Response: `{ "response": "Thank you for the conversation!" }`

5. **`POST /summary-generation`**
   - Generates conversation summary
   - Response: `{ "response": "Here's a summary of your conversation..." }`

## 🎯 How to Use

1. **Start Conversation**: Click the "Start" button to begin
2. **Speak Naturally**: The bot will greet you and start listening
3. **Voice Input**: Speak clearly into your microphone
4. **Automatic Processing**: The bot will automatically stop recording when you finish speaking
5. **Conversation Flow**: Continue the conversation for up to 5 iterations
6. **Get Summary**: After 5 exchanges, click "Summarize" to get a conversation summary
7. **Start Over**: Begin a new conversation anytime

## 🎨 Avatar System

The bot features a dynamic avatar with multiple states:

- **Eyes**: Automatically blink every 3-6 seconds
- **Mouth**: Animates based on speech intensity:
  - Closed: No speech
  - Slightly Open: Low speech level
  - Half Open: Medium speech level
  - Fully Open: High speech level

## 🛠️ Technology Stack

- **Frontend**: React 19.1.0
- **UI Framework**: Material-UI (MUI) v7.1.1
- **Styling**: Emotion (CSS-in-JS)
- **Audio Processing**: Web Audio API, MediaRecorder API
- **Build Tool**: Create React App
- **Testing**: Jest, React Testing Library

## 📁 Project Structure

```
bot/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── ChatInterface.jsx    # Main chat interface
│   │   └── Avatar_*.png         # Avatar image assets
│   ├── App.js             # Main application component
│   ├── App.css            # Application styles
│   └── index.js           # Application entry point
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🔒 Browser Compatibility

- Chrome 66+
- Firefox 60+
- Safari 11.1+
- Edge 79+

## 🚨 Important Notes

- **Microphone Permission**: The app requires microphone access to function
- **HTTPS Required**: In production, HTTPS is required for microphone access
- **Backend Dependency**: The app will not function without the backend server running
- **Audio Format**: Audio is recorded in WAV format for optimal compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Ensure the backend server is running on port 8000
3. Verify microphone permissions are granted
4. Check that all required dependencies are installed

## 🔮 Future Enhancements

- [ ] Multiple avatar options
- [ ] Conversation history persistence
- [ ] Custom conversation topics
- [ ] Speech rate adjustment
- [ ] Multi-language support
- [ ] Mobile app version

---
