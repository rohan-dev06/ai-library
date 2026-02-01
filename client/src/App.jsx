import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BookDetails from './pages/BookDetails';
import ReadBook from './pages/ReadBook';
import Browse from './pages/Browse';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import History from './pages/History';
import SavedBooks from './pages/SavedBooks';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/saved-books" element={<SavedBooks />} />
      <Route path="/history" element={<History />} />
      <Route path="/book/:id" element={<BookDetails />} />
      <Route path="/read/:id" element={<ReadBook />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
