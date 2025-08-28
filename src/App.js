import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Typography, Box } from '@mui/material';
import ChatInterface from './components/ChatInterface';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: 'left' }}>
          <Typography variant="h1" component="h1" gutterBottom color='rgb(115, 148, 180)' sx={{ fontWeight: 'bold' }}>
            BOT by Comski
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'left' }}>
            Improve your Speaking Skills by talking to our AI assistant.
          </Typography>
        </Box>
        <ChatInterface />
      </Container>
    </ThemeProvider>
  );
}

export default App;
