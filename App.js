import React from 'react';
import { ChatApp } from './src/ChatApp';

function App() {
  const API_URL = '';
  const QALisenceKey = '';
  return (
    <ChatApp apiUrl={API_URL} licenseKey={QALisenceKey} isSandBox={false} />
  );
}

export default App;
