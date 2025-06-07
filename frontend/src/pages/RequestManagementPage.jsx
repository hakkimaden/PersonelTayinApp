import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import loadingGif from '../assets/loading.gif';
import { FaTrashAlt, FaPlus, FaFileAlt } from 'react-icons/fa'; // FaFileAlt'ı ekledik

function RequestManagementPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Laravel API URL'niz
  // Dökümanlara erişmek için Laravel'in public/storage yolunu kullanacağız
  const DOCUMENT_BASE_URL = 'http://127.0.0.1:8000/';

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Yetkilendirme tokenı bulunamadı.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/admin/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setRequests(response.data.requests);
    } catch (err) {
      console.error('Talepleri çekerken hata oluştu:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Talepler yüklenirken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (requestId, newStatus) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Yetkilendirme tokenı bulunamadı.');
        setLoading(false);
        return;
      }

      await axios.put(`${API_BASE_URL}/admin/requests/${requestId}/status`, { status: newStatus }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Update the status of the specific request in the local state
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );
      setSuccessMessage('Talep durumu başarıyla güncellendi!');
    } catch (err) {
      console.error('Talep durumunu güncellerken hata oluştu:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Talep durumu güncellenirken bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <img src={loadingGif} alt="Yükleniyor..." className="w-24 h-24 mb-4" />
        <p className="text-gray-700 text-lg">Talepler Yükleniyor...</p>
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
          <Link to="/admin/users" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition duration-300 shadow-md text-sm sm:text-base">
            Kullanıcı Yönetimi
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
      </div>


          
      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Talep Yönetimi</h1>
      <p className="text-gray-600 mb-6 text-center">Sistemdeki tüm tayin talepleri.</p>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Başarılı!</strong>
          <span className="block sm:inline"> {successMessage}</span>
          <span onClick={() => setSuccessMessage('')} className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer">
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Hata!</strong>
          <span className="block sm:inline"> {error}</span>
          <span onClick={() => setError('')} className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer">
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-center text-gray-700 text-lg">Hiç talep bulunamadı.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  SİCİL
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ADI SOYADI
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Mevcut İl
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  TALEP EDİLEN İLLER
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Döküman
                </th> {/* YENİ SÜTUN: Döküman */}
                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Oluşturulma TARİHİ
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  AKSİYONLAR
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{request.user.sicil}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {request.user ? `${request.user.name}` : 'Bilinmiyor'}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {request.current_adliye ? request.current_adliye.adi : 'Bilinmiyor'}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {request.requested_adliyes && Object.keys(request.requested_adliyes).length > 0
                        ? Object.values(request.requested_adliyes).join(', ')
                        : 'Belirtilmemiş'}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                        request.status === 'pending' ? 'text-yellow-900' :
                        request.status === 'approved' ? 'text-green-900' :
                        'text-red-900'
                    }`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                          request.status === 'pending' ? 'bg-yellow-200' :
                          request.status === 'approved' ? 'bg-green-200' :
                          'bg-red-200'
                      }`}></span>
                      <span className="relative">
                        {request.status === 'pending' && 'Beklemede'}
                        {request.status === 'approved' && 'Onaylandı'}
                        {request.status === 'rejected' && 'Reddedildi'}
                      </span>
                    </span>
                  </td>
                  {/* YENİ KISIM: Döküman Sütunu */}
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    {request.document_path ? (
                      <a
                        href={`${DOCUMENT_BASE_URL}${request.document_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center"
                      >
                        <FaFileAlt className="w-4 h-4 mr-1" />
                        Görüntüle
                      </a>
                    ) : (
                      <p className="text-gray-500">Yok</p>
                    )}
                  </td>
                  {/* Döküman Sütunu Sonu */}
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{new Date(request.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 text-sm">
                    <div className="relative inline-block text-left">
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="pending">Beklemede</option>
                        <option value="approved">Onaylandı</option>
                        <option value="rejected">Reddedildi</option>
                      </select>
                    </div>
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

export default RequestManagementPage;