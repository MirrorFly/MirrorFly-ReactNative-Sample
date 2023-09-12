/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from "react";
import { ChatApp } from "mirrorfly-uikit-react-native";

const App = () => {
  const API_URL = "";
  const QALisenceKey = "";

  return (
    <>
      <ChatApp apiUrl={API_URL} licenseKey={QALisenceKey} />
    </>
  );
};

export default App;
