import React from 'react';
import { ChatApp } from './src/ChatApp';

function App() {
  const API_URL = 'https://api-uikit-qa.contus.us/api/v1';
  const QALisenceKey = 'ckIjaccWBoMNvxdbql8LJ2dmKqT5bp';
  return (
    <ChatApp apiUrl={API_URL} licenseKey={QALisenceKey} isSandBox={false} />
  );
}

export default App;
