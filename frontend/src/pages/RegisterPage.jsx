// src/pages/RegisterPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react'; // useRef'i de ekledik
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaChevronDown } from 'react-icons/fa'; // FaChevronDown'ı ekledik

function RegisterPage({ setIsLoggedIn, setIsAdmin }) {
  const [name, setName] = useState('');
  const [sicil, setSicil] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [adliyeler, setAdliyeler] = useState([]);
  const [currentAdliyeId, setCurrentAdliyeId] = useState('');
  const [currentAdliyeName, setCurrentAdliyeName] = useState(''); // Yeni: Seçilen adliyenin adını tutmak için
  const [adliyeSearchTerm, setAdliyeSearchTerm] = useState('');
  const [showAdliyeDropdown, setShowAdliyeDropdown] = useState(false); // Yeni: Dropdown'ı kontrol etmek için
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const adliyeDropdownRef = useRef(null); // Dropdown dışına tıklamaları yönetmek için ref
  const adliyeInputRef = useRef(null); // Input'a referans, odaklamak için

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchAdliyeler = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/adliyeler`);
        setAdliyeler(response.data);
      } catch (err) {
        console.error('Adliyeler çekilirken hata oluştu:', err);
        setError('Adliyeler yüklenirken bir sorun oluştu.');
      }
    };

    fetchAdliyeler();

    if (localStorage.getItem('access_token')) {
      setIsLoggedIn(true);
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
          console.error("Kullanıcı bilgisi parse edilirken hata oluştu:", e);
          setIsAdmin(false);
        }
      }
      navigate('/dashboard', { replace: true });
    }
  }, [setIsLoggedIn, setIsAdmin, navigate]);

  // Dropdown dışına tıklandığında kapatma işlevi
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adliyeDropdownRef.current && !adliyeDropdownRef.current.contains(event.target) &&
          adliyeInputRef.current && !adliyeInputRef.current.contains(event.target)) {
        setShowAdliyeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectAdliye = (adliye) => {
    setCurrentAdliyeId(adliye.id);
    setCurrentAdliyeName(adliye.adi);
    setAdliyeSearchTerm(adliye.adi); // Seçilen adliyeyi arama kutusuna yaz
    setShowAdliyeDropdown(false); // Dropdown'ı kapat
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    const sicilRegex = /^\d{5,}$/;
    if (!sicilRegex.test(sicil)) {
      setError('Sicil numarası sadece sayılardan oluşmalı ve en az 5 haneli olmalıdır.');
      return;
    }

    const phoneRegex = /^\d{10,11}$/;
    if (!phoneRegex.test(phone)) {
      setError('Telefon numarası geçerli bir formatta olmalı (ör: 05XXXXXXXXX) ve sadece rakamlardan oluşmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }

    if (!currentAdliyeId) {
      setError('Lütfen çalıştığınız adliyeyi seçin.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        name,
        sicil,
        phone,
        current_adliye_id: currentAdliyeId,
        password,
        password_confirmation: confirmPassword,
      });

      console.log('Kayıt Başarılı:', response.data);
      setSuccess('Kayıt başarıyla oluşturuldu! Otomatik olarak giriş yapılıyor...');

      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('token_type', response.data.token_type);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        if (setIsLoggedIn) {
          setIsLoggedIn(true);
        }

        if (setIsAdmin) {
          if (response.data.user && response.data.user.id === 1) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }

        console.log('Token stored:', response.data.access_token);
        navigate('/dashboard');
      } else {
        setError('Kayıt başarılı, ancak otomatik giriş yapılamadı. Lütfen manuel olarak giriş yapın.');
        navigate('/login');
      }

    } catch (err) {
      console.error('Kayıt Hatası:', err);
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.data && err.response.data.errors) {
          const errorMessages = Object.values(err.response.data.errors).flat().join(' ');
          setError(errorMessages);
        } else {
          setError('Kayıt işlemi sırasında bir hata oluştu.');
        }
      } else if (err.request) {
        setError('Sunucuya ulaşılamadı. Lütfen ağ bağlantınızı kontrol edin.');
      } else {
        setError('Beklenmedik bir hata oluştu: ' + err.message);
      }
    }
  };

  const filteredAdliyeler = adliyeler.filter(adliye =>
    adliye.adi.toLowerCase().includes(adliyeSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Kayıt Ol</h2>
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
            <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">Ad Soyad</label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Adınızı ve soyadınızı girin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="sicil" className="block text-gray-700 text-sm font-semibold mb-2">Sicil Numarası</label>
            <input
              type="text"
              id="sicil"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Sicil numaranızı girin (en az 5 hane, sadece sayı)"
              value={sicil}
              onChange={(e) => setSicil(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-semibold mb-2">Telefon Numarası</label>
            <input
              type="tel"
              id="phone"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Telefon numaranızı girin (ör: 05XXXXXXXXX)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
         <div className="mb-4">
            <label htmlFor="currentAdliye" className="block text-gray-700 text-sm font-semibold mb-2">Çalıştığınız Adliye</label>
            <div className="relative" ref={adliyeDropdownRef}>
              <input
                ref={adliyeInputRef}
                type="text"
                id="currentAdliyeInput"
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900 cursor-pointer"
                placeholder="Çalıştığınız adliyeyi arayın veya seçin..."
                value={currentAdliyeName || adliyeSearchTerm} // Corrected: Display name if selected, otherwise search term
                onChange={(e) => {
                  setAdliyeSearchTerm(e.target.value);
                  setCurrentAdliyeId('');
                  setCurrentAdliyeName('');
                  setShowAdliyeDropdown(true);
                }}
                onFocus={() => setShowAdliyeDropdown(true)}
                autoComplete="off"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                   onClick={() => setShowAdliyeDropdown(!showAdliyeDropdown)}>
                <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${showAdliyeDropdown ? 'rotate-180' : ''}`} />
              </div>

              {showAdliyeDropdown && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {filteredAdliyeler.length > 0 ? (
                    filteredAdliyeler.map((adliye) => (
                      <div
                        key={adliye.id}
                        className="p-2 hover:bg-blue-50 cursor-pointer text-gray-800 text-sm"
                        onClick={() => handleSelectAdliye(adliye)}
                      >
                        {adliye.adi}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500 text-sm text-center">
                      "{adliyeSearchTerm}" için sonuç bulunamadı.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">Şifre</label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Şifrenizi oluşturun"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-semibold mb-2">Şifreyi Onayla</label>
            <input
              type="password"
              id="confirmPassword"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Kayıt Ol
            </button>
          </div>
          <p className="text-center text-gray-600 text-sm mt-4">
            Zaten hesabınız var mı? <Link to="/login" className="text-green-600 hover:underline">Giriş Yap</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;