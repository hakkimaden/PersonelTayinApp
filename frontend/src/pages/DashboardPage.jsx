import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaPhone, 
  FaBuilding, 
  FaIdCard, 
  FaPlus, 
  FaList, 
  FaSearch, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaHome, 
  FaChild, 
  FaInfoCircle,
  FaFileAlt,
  FaChartBar,
  FaGlobe
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import loadingGif from '../assets/loading.gif';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [adliyeler, setAdliyeler] = useState([]);
  const [selectedAdliyeDetail, setSelectedAdliyeDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdliyeModal, setShowAdliyeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error('Kullanıcı doğrulama bilgisi bulunamadı. Lütfen giriş yapın.');
          navigate('/login');
          return;
        }

        // Kullanıcı bilgilerini çek
        let userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          setUser(userData);
        } else {
          try {
            const userResponse = await axios.get(`${API_BASE_URL}/user`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            userData = userResponse.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (userErr) {
            console.error('Kullanıcı bilgileri çekilirken hata oluştu:', userErr);
            toast.error('Kullanıcı bilgileri yüklenirken bir hata oluştu.');
          }
        }

        // Tayin taleplerini çek
        const requestsResponse = await axios.get(`${API_BASE_URL}/transfer-requests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUserRequests(requestsResponse.data);

        // Adliyeleri çek
        const adliyelerResponse = await axios.get(`${API_BASE_URL}/adliyeler`);
        setAdliyeler(adliyelerResponse.data);

      } catch (err) {
        console.error('Dashboard verileri çekilirken hata oluştu:', err);
        if (err.response && err.response.status === 401) {
          toast.error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          toast.error('Veriler çekilirken bir hata oluştu.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleAdliyeInfoClick = async (adliyeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/adliyeler/${adliyeId}`);
      setSelectedAdliyeDetail(response.data);
      setShowAdliyeModal(true);
    } catch (err) {
      console.error('Adliye detayı çekilirken hata oluştu:', err);
      toast.error('Adliye detayları yüklenirken bir sorun oluştu.');
    }
  };

  const filteredAdliyeler = adliyeler.filter(adliye =>
    adliye.adi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <img src={loadingGif} alt="Yükleniyor..." className="w-24 h-24 mb-4" />
        <p className="text-gray-700 text-lg font-medium">Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="bg-white border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center">
            <FaInfoCircle className="text-red-500 mr-3 text-xl" />
            <div>
              <strong className="font-bold">Hata!</strong>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Anasayfa</h1>
              <p className="text-gray-600 mt-1">
                Hoş geldiniz, {user?.name || 'Kullanıcı'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Sicil No</p>
              <p className="text-lg font-semibold text-gray-900">{user?.sicil}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Kişisel Bilgiler Kartı */}
        {user && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaUser className="text-blue-600 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Kişisel Bilgileriniz</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <FaIdCard className="text-blue-500 mr-3 text-lg" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Sicil No</p>
                  <p className="text-lg font-semibold text-gray-900">{user.sicil}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <FaUser className="text-green-500 mr-3 text-lg" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Ad Soyad</p>
                  <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <FaBuilding className="text-purple-500 mr-3 text-lg" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Mevcut Adliye</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {user.mevcut_adliye?.adi || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <FaPhone className="text-red-500 mr-3 text-lg" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefon</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {user.telefon || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ana İşlemler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tayin Talepleri Kartı */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaFileAlt className="text-green-600 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Tayin Talepleriniz</h2>
            </div>

            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">{userRequests.length}</span>
              </div>
              <p className="text-gray-600">
                {userRequests.length > 0 
                  ? `${userRequests.length} adet tayin talebiniz bulunmaktadır`
                  : 'Henüz hiçbir tayin talebinde bulunmadınız'
                }
              </p>
            </div>

            <div className="space-y-3">
              {userRequests.length > 0 ? (
                <Link
                  to="/my-requests"
                  className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                >
                  <FaList className="mr-2" />
                  Taleplerimi Görüntüle ({userRequests.length})
                </Link>
              ) : null}
              
              <Link
                to="/create-request"
                className="flex items-center justify-center w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
              >
                <FaPlus className="mr-2" />
                Yeni Tayin Talebi Oluştur
              </Link>
            </div>
          </div>

          {/* İstatistik Kartı */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <FaChartBar className="text-orange-600 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Sistem Bilgileri</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">{adliyeler.length}</div>
                <div className="text-sm text-gray-600">Toplam Adliye</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">{userRequests.length}</div>
                <div className="text-sm text-gray-600">Talebiniz</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {userRequests.filter(req => req.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Bekleyen</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {userRequests.filter(req => req.status === 'approved').length}
                </div>
                <div className="text-sm text-gray-600">Onaylanan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Adliyeler Bölümü */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <FaBuilding className="text-indigo-600 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Adliyeler Hakkında Bilgi</h2>
            </div>
          </div>

          {/* Arama Kutusu */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Adliye ara..."
              className="w-full max-w-md pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
          </div>

          {/* Adliyeler Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredAdliyeler.map((adliye) => (
              <div
                key={adliye.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => handleAdliyeInfoClick(adliye.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm mb-1">{adliye.adi}</h3>
                    <p className="text-xs text-gray-500">Detayları görüntülemek için tıklayın</p>
                  </div>
                  <FaInfoCircle className="text-blue-500 text-lg ml-2 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {filteredAdliyeler.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-gray-500">Arama kriterinize uygun adliye bulunamadı.</p>
            </div>
          )}
        </div>
      </div>

      {/* Adliye Detay Modal */}
      {showAdliyeModal && selectedAdliyeDetail && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAdliyeModal(false)} // Dışa tıklama için handler
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()} 
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedAdliyeDetail.adi}</h3>
                <button
                  onClick={() => setShowAdliyeModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {selectedAdliyeDetail.resim_url && (
                <div className="mb-6 aspect-video overflow-hidden rounded-lg shadow-md">
                  <img
                    src={selectedAdliyeDetail.resim_url}
                    alt={`${selectedAdliyeDetail.adi} Resmi`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {selectedAdliyeDetail.adres && (
                  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <FaMapMarkerAlt className="text-blue-500 mr-3 text-lg mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Adres</p>
                      <p className="text-gray-700 text-sm">{selectedAdliyeDetail.adres}</p>
                    </div>
                  </div>
                )}
                
                {selectedAdliyeDetail.personel_sayisi && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <FaUsers className="text-blue-500 mr-3 text-lg" />
                    <div>
                      <p className="font-semibold text-gray-900">Personel Sayısı</p>
                      <p className="text-gray-700">{selectedAdliyeDetail.personel_sayisi}</p>
                    </div>
                  </div>
                )}
                
                {selectedAdliyeDetail.yapim_yili && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <FaBuilding className="text-blue-500 mr-3 text-lg" />
                    <div>
                      <p className="font-semibold text-gray-900">Yapım Yılı</p>
                      <p className="text-gray-700">{selectedAdliyeDetail.yapim_yili}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FaHome className="text-green-500 mr-3 text-lg" />
                  <div>
                    <p className="font-semibold text-gray-900">Lojman</p>
                    <p className={`${selectedAdliyeDetail.lojman_var_mi ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAdliyeDetail.lojman_var_mi ? 'Mevcut' : 'Mevcut Değil'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FaChild className="text-pink-500 mr-3 text-lg" />
                  <div>
                    <p className="font-semibold text-gray-900">Çocuk Kreşi</p>
                    <p className={`${selectedAdliyeDetail.cocuk_kresi_var_mi ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAdliyeDetail.cocuk_kresi_var_mi ? 'Mevcut' : 'Mevcut Değil'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FaGlobe className="text-blue-500 mr-2" /> Harita Konumu
                </h4>
                <div className="relative w-full rounded-lg overflow-hidden shadow-md" style={{ paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={selectedAdliyeDetail.harita_linki || `https://maps.google.com/maps?q=${encodeURIComponent(selectedAdliyeDetail.adi)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${selectedAdliyeDetail.adi} Harita`}
                  />
                </div>
                <a
                  href={selectedAdliyeDetail.harita_linki || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAdliyeDetail.adi)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mt-3 transition duration-150 ease-in-out"
                >
                  <FaGlobe className="mr-1" />
                  Google Haritalar'da Görüntüle
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;