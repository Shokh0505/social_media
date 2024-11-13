import React from 'react';
import { useState } from 'react';
import Signup from './Signup';
import Login from './Login';
import Home from './Home';
import CreatePost from './CreatePost';
import Profile from './Profile';
import UpdatePost from './UpdatePost';
import {BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
  const [activeTab, setActiveTab] = useState("Home");

  return (
    <>
      <Router>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/' element={<Home activeTab={activeTab} setActiveTab={setActiveTab} />} />
          <Route path='/createPost' element={<CreatePost />} />
          <Route path='/profile/:username' element={<Profile />} />
          <Route path='/update_post/:post_id' element={<UpdatePost />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
