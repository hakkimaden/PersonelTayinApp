// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Receive setIsAdmin as a prop
function LoginPage({ setIsLoggedIn, setIsAdmin }) { 
  const [sicil, setSicil] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      setIsLoggedIn(true);
      
      // Also check admin status on component mount if already logged in
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          if (userData && userData.id === 1) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          console.error("User info parsing error:", e);
          setIsAdmin(false);
        }
      }
      navigate('/dashboard', { replace: true });
    }
  }, [setIsLoggedIn, setIsAdmin, navigate]); // Add setIsAdmin to dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const sicilRegex = /^\d{5,}$/; 
    if (!sicilRegex.test(sicil)) {
      setError('Sicil numarası sadece sayılardan oluşmalı ve en az 5 haneli olmalıdır.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        sicil, 
        password,
      });

      setSuccess('Başarıyla giriş yapıldı!');

      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('token_type', response.data.token_type);
      localStorage.setItem('user', JSON.stringify(response.data.user)); 
      
      // Update login status
      setIsLoggedIn(true);

      // Immediately update admin status based on the received user data
      if (response.data.user && response.data.user.id === 1) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      navigate('/dashboard');

    } catch (err) {
      console.error('Login Error:', err);
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.data && err.response.data.errors) {
          const errorMessages = Object.values(err.response.data.errors).flat().join(' ');
          setError(errorMessages);
        } else {
          setError('Giriş işlemi sırasında bir hata oluştu.');
        }
      } else if (err.request) {
        setError('Sunucuya ulaşılamadı. Lütfen ağ bağlantınızı kontrol edin.');
      } else {
        setError('Beklenmedik bir hata oluştu: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Giriş Yap</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Hata!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Başarılı!</strong>
            <span className="block sm:inline"> {success}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="sicil" className="block text-gray-700 text-sm font-semibold mb-2">Sicil Numarası</label>
            <input
              type="text" 
              id="sicil"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Sicil numaranızı girin"
              value={sicil}
              onChange={(e) => setSicil(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Şifre</label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Giriş
            </button>
          </div>
          <p className="text-center text-gray-600 text-sm mt-4">
            Hesabınız yok mu? <Link to="/register" className="text-blue-600 hover:underline">Kayıt Ol</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;