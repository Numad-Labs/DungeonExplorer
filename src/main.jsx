import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

const styles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: #2f2f2f;
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: 'Arial', sans-serif;
  }

  #root {
    width: 100vw;
    height: 100vh;
  }

  .app {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .game-container {
    width: 100%;
    height: 100%;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
