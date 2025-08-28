import React, { useState, useRef, useEffect } from 'react';
import { Button, Box, Typography, Paper, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SummarizeIcon from '@mui/icons-material/Summarize';
import avatarEyesOpenMouthClose from './Avatar_eyesopen_mouthclose.png';
import avatarEyesOpenMouthOpen from './Avatar_eyesopen_mouthopen.png';
import avatarEyesClosedMouthClose from './Avatar_eyesclose_mouthclose.png';
import avatarEyesOpenMouthHalfOpen from './Avatar_eyesopen_mouthhalfopen.png';


const AvatarDisplay = ({ isSpeaking, mouthLevel }) => {
  const [eyesClosed, setEyesClosed] = useState(false);

  useEffect(() => {
    const blink = () => {
      setEyesClosed(true);
      setTimeout(() => setEyesClosed(false), 150);
      setTimeout(blink, Math.random() * 3000 + 3000);
    };
    const timeout = setTimeout(blink, 3000);
    return () => clearTimeout(timeout);
  }, []);

  let avatarImage = avatarEyesOpenMouthClose;

  if (eyesClosed) {
    avatarImage = avatarEyesClosedMouthClose;
  } else if (mouthLevel > 0.7) {
    avatarImage = avatarEyesOpenMouthHalfOpen;
  } else if (mouthLevel > 0.4) {
    avatarImage = avatarEyesOpenMouthOpen;
  } else if (mouthLevel > 0.1) {
    avatarImage = avatarEyesOpenMouthClose; // maybe slightly open image if available
  } else {
    avatarImage = avatarEyesOpenMouthClose;
  }

  return (
    <Box sx={{ width: '10em', mr: 2 }}>
      <img src={avatarImage} alt="Avatar" style={{ width: '100%' }} />
    </Box>
  );
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mouthLevel, setMouthLevel] = useState(0);
  const MAX_ITERATIONS = 5;

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const isRecordingRef = useRef(false);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const addMessage = (text, sender) => {
    setMessages(prev => [...prev, { text, sender, timestamp: new Date() }]);
  };

  const playBotResponse = async (text, callback = null) => {
    try {
      const response = await fetch("http://localhost:8000/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(audio);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      let prevLevel = 0;
      const smoothingFactor = 0.3;

      const updateMouth = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
        const normalized = Math.min(1, avg / 128);

        // Smooth transition to reduce flickering
        const smoothed = prevLevel * (1 - smoothingFactor) + normalized * smoothingFactor;
        prevLevel = smoothed;

        setMouthLevel(smoothed); // Will now be a value like 0.15, 0.32, 0.61 etc.

        if (!audio.paused && !audio.ended) {
          requestAnimationFrame(updateMouth);
        } else {
          setMouthLevel(0);
        }
      };


      audio.onplaying = () => {
        setIsSpeaking(true);
        updateMouth();
      };

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
        setMouthLevel(0);
        audioCtx.close();
        if (callback) callback();
      };

      await audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsSpeaking(false);
      setMouthLevel(0);
      if (callback) callback();
    }
  };



  const startConversation = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch("http://localhost:8000/initial-greeting", {
        method: "POST",
      });
      const data = await response.json();
      addMessage(data.response, "bot");
      await playBotResponse(data.response, () => {
        setIsProcessing(false);
        startRecording();
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = handleRecordingStop;

      mediaRecorderRef.current.start();
      setIsRecording(true);
      isRecordingRef.current = true;
      detectSilence(stream);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      addMessage("Error accessing microphone. Please check permissions.", "bot");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const handleRecordingStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audio", audioBlob);

    try {
      setIsProcessing(true);
      const response = await fetch("http://localhost:8000/process-audio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.user_input) addMessage(data.user_input, "user");

      if (data.iteration < MAX_ITERATIONS) {
        addMessage(data.response, "bot");
        await playBotResponse(data.response, () => {
          setIsProcessing(false);
          startRecording();
        });
        setIteration(data.iteration);
      } else {
        await handleFinalGreeting();
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      addMessage("Sorry, there was an error processing your request.", "bot");
      setIsProcessing(false);
    }
  };

  const handleFinalGreeting = async () => {
    try {
      const response = await fetch("http://localhost:8000/final-greeting", {
        method: "POST",
      });
      const data = await response.json();
      addMessage(data.response, "bot");
      await playBotResponse(data.response);
      setShowSummary(true);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error fetching final greeting:", error);
      setIsProcessing(false);
    }
  };

  const generateSummary = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch("http://localhost:8000/summary-generation", {
        method: "POST",
      });
      const data = await response.json();
      addMessage(data.response, "bot");
      await playBotResponse(data.response);
      setShowSummary(false);
      setIteration(0);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error generating summary:", error);
      addMessage("Failed to generate summary.", "bot");
      setIsProcessing(false);
    }
  };

  const detectSilence = (stream) => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);

    let silenceStart = null;
    const silenceTimeout = 3000;

    const checkSilence = () => {
      analyser.getByteTimeDomainData(data);
      const rms = Math.sqrt(
        data.reduce((sum, value) => {
          const normalized = (value - 128) / 128;
          return sum + normalized * normalized;
        }, 0) / data.length
      );

      const now = Date.now();
      if (rms < 0.02) {
        if (!silenceStart) silenceStart = now;
        else if (now - silenceStart > silenceTimeout) {
          console.log("Silence detected: stopping recording");
          stopRecording();
          return;
        }
      } else {
        silenceStart = null;
      }

      if (isRecordingRef.current) {
        requestAnimationFrame(checkSilence);
      }
    };

    checkSilence();
  };


  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto', padding: 2, display: 'flex' }}>
      <AvatarDisplay isSpeaking={isSpeaking} mouthLevel={mouthLevel} />
      <Box sx={{ flex: 1 }}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 2,
            height: '60vh',
            overflow: 'auto',
            backgroundColor: '#f5f5f5'
          }}
          ref={chatMessagesRef}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#fff',
                  borderRadius: 2,
                }}
              >
                <Typography>{message.text}</Typography>
              </Paper>
            </Box>
          ))}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {iteration === 0 && !isRecording && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={startConversation}
              disabled={isProcessing}
            >
              {iteration === 0 ? "Start" : "Start Over"}
            </Button>
          )}

          {isRecording && (
            <Button
              variant="contained"
              color="error"
              startIcon={<MicIcon />}
              onClick={stopRecording}
              disabled={isProcessing}
              sx={{
                backgroundColor: '#f44336',
                '&:hover': {
                  backgroundColor: '#d32f2f',
                },
              }}
            >
              Stop Recording
            </Button>
          )}

          {showSummary && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SummarizeIcon />}
              onClick={generateSummary}
              disabled={isProcessing}
            >
              {isProcessing ? "Summarizing..." : "Summarize"}
            </Button>
          )}

          {isProcessing && <CircularProgress size={24} />}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInterface;