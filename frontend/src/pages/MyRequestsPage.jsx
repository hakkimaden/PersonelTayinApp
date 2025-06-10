import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaTrashAlt, FaPlus, FaFileAlt } from 'react-icons/fa'; 
import loadingGif from '../assets/loading.gif';

function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestIdToDelete, setRequestIdToDelete] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://127.0.0.1:8000/api';
  const BASE_APP_URL = 'http://127.0.0.1:8000'; 

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Kullanıcı doğrulama bilgisi bulunamadı. Lütfen giriş yapın.');
        setLoading(false);
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/transfer-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setRequests(response.data);

    } catch (err) {
      console.error('Talepler çekilirken hata oluştu:', err);
      if (err.response && err.response.status === 401) {
        setError('Oturumunuz sona erdi veya geçersiz. Lütfen tekrar giriş yapın.');
        localStorage.removeItem('access_token');
        navigate('/login');
      } else if (err.response) {
        setError(err.response.data.message || 'Talepleriniz yüklenirken bir hata oluştu.');
      } else {
        setError('Sunucuya ulaşılamadı veya bilinmeyen bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [navigate]);

  const openDeleteModal = (requestId) => {
    setRequestIdToDelete(requestId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setRequestIdToDelete(null);
  };

  const handleDeleteRequest = async () => {
    if (!requestIdToDelete) return;

    try {
      setError('');
      setSuccessMessage('');

      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Yetkisiz işlem. Lütfen giriş yapın.');
        closeDeleteModal();
        navigate('/login');
        return;
      }

      await axios.delete(`${API_BASE_URL}/transfer-requests/${requestIdToDelete}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccessMessage('Tayin talebi başarıyla silindi.');
      closeDeleteModal();
      fetchMyRequests();

    } catch (err) {
      console.error('Talep silinirken hata oluştu:', err);
      if (err.response) {
        setError(err.response.data.message || 'Talep silinirken bir hata oluştu.');
      } else {
        setError('Sunucuya ulaşılamadı veya bilinmeyen bir hata oluştu.');
      }
      closeDeleteModal();
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Beklemede' },
      approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Onaylandı' },
      rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Reddedildi' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <img src={loadingGif} alt="Yükleniyor..." className="w-16 h-16" />
          <p className="text-sm text-gray-600">Talepler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg max-w-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Tayin Taleplerim</h1>
          <Link
            to="/create-request"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Yeni Talep
          </Link>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Content */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz talep yok</h3>
            <p className="text-gray-500 mb-6">İlk tayin talebinizi oluşturun</p>
            <Link
              to="/create-request"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Talep Oluştur
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mevcut Adliye</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talep Edilen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Döküman</th> {/* Yeni sütun başlığı */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.current_adliye?.adi || 'Bilinmiyor'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={request.requested_adliye_names?.join(', ') || 'Belirtilmedi'}>
                          {request.requested_adliye_names && request.requested_adliye_names.length > 0
                            ? request.requested_adliye_names.join(', ')
                            : 'Belirtilmedi'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString('tr-TR')}
                      </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.document_path || request.documents_path ? ( // İki path'ten herhangi biri varsa | Asp ve Laravel'de dökümanlar farklı yerlerde bulunduğu için.
                              <a
                                  href={
                                      request.document_path
                                          ? `${BASE_APP_URL}/storage/${request.document_path}` // document_path varsa storage ekle
                                          : `${BASE_APP_URL}/${request.documents_path}`     // documents_path varsa olduğu gibi kullan
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center"
                                  title="Belgeyi Görüntüle"
                              >
                                  <FaFileAlt className="w-4 h-4 mr-1" />
                                  Görüntüle
                              </a>
                          ) : (
                              <span className="text-gray-400">Yok</span>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {request.status === 'pending' ? (
                          <button
                            onClick={() => openDeleteModal(request.id)}
                            className="inline-flex items-center text-red-600 hover:text-red-700 transition-colors duration-200"
                            title="Talebi Sil"
                          >
                            <FaTrashAlt className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tayin Talebini Sil</h3>
            <p className="text-sm text-gray-600 mb-6">Bu tayin talebini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteRequest}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyRequestsPage;