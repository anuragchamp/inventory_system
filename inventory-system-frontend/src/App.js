import logo from './logo.svg';
import './App.css';
import SignIn from './components/signup/signin/SignIn';
import { useState } from 'react';
import SignUp from './components/signup/SignUp';
import { Route, Routes } from 'react-router-dom';

function App() {

  const [userLoggedIn, isUserLoggedIn] = useState(false);

  return (
    <div className="App">
      <Routes>
        <Route path="sign-up" element={<SignUp />} />
        <Route path="sign-in" element={<SignIn />} />
      </Routes>
    </div>
  );
}

export default App;
