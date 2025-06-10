import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import loadingGif from '../assets/loading.gif';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Backend API URL

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Yetkilendirme tokenı bulunamadı.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(response.data.users); 
      } catch (err) {
        console.error('Kullanıcıları çekerken hata oluştu:', err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Kullanıcılar yüklenirken bir hata oluştu.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
          <img src={loadingGif} alt="Yükleniyor..." className="w-24 h-24 mb-4" /> 
          <p className="text-gray-700 text-lg">Kullanıcılar Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600 text-lg">Hata: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-6">
            <Link to="/admin" className="inline-flex items-center gap-2  px-4 py-2 rounded-full text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition duration-300 shadow-md w-fit text-sm sm:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Yönetim paneline dön
            </Link>
            <Link to="/admin/requests" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition duration-300 shadow-md text-sm sm:text-base">
              Talep Yönetimi
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
        </div>

   

      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Kullanıcı Yönetimi</h1>
      <p className="text-gray-600 mb-6 text-center">Sistemdeki tüm kayıtlı kullanıcılar.</p>

      {users.length === 0 ? (
        <p className="text-center text-gray-700 text-lg">Hiç kullanıcı bulunamadı.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Sicil
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ad Soyad
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Telefon 
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Çalıştığı Adliye 
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{user.sicil}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{user.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{user.telefon}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{user.mevcut_adliye.adi}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{new Date(user.created_at).toLocaleDateString()}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserManagementPage;