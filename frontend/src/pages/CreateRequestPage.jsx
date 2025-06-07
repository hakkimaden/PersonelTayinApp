import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaInfoCircle, FaMapMarkerAlt, FaUsers, FaBuilding, FaGlobe, FaSearch, FaCheckSquare, FaHome, FaChild, FaPaperPlane, FaCloudUploadAlt } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const AdliyeListItem = React.memo(({ adliye, isChecked, onToggle, onInfoClick }) => {
  return (
    <div className="group flex items-center p-3 mb-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-md border border-transparent hover:border-blue-100">
      <input
        type="checkbox"
        id={`adliye-${adliye.id}`}
        value={adliye.id}
        checked={isChecked}
        onChange={onToggle}
        className="mr-4 h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-2 border-gray-300 rounded-md transition-all duration-200"
      />
      <label htmlFor={`adliye-${adliye.id}`} className="text-gray-800 flex-grow cursor-pointer text-base font-medium group-hover:text-blue-800 transition-colors duration-200">
        {adliye.adi}
      </label>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <FaInfoCircle
          className="text-blue-500 ml-3 cursor-pointer hover:text-blue-700 transition-all duration-200 text-lg hover:scale-110"
          onClick={() => onInfoClick(adliye.id)}
          title={`Detaylar için tıklayın: ${adliye.adi}`}
        />
      </div>
    </div>
  );
});

function CreateRequestPage() {
  const [adliyeler, setAdliyeler] = useState([]);
  const [requestedAdliyeIds, setRequestedAdliyeIds] = useState(new Set());
  const [reason, setReason] = useState('');
  const [documents, setDocuments] = useState(null);
  const [selectedAdliyeDetail, setSelectedAdliyeDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [transferType, setTransferType] = useState('');

  const navigate = useNavigate();
  const adliyeDetailsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      toast.info('Giriş yapmanız gerekiyor. Lütfen giriş yapın.', { position: "top-center" });
      return;
    }

    const fetchAdliyeler = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/adliyeler`);
        setAdliyeler(response.data);
      } catch (err) {
        console.error('Adliyeler çekilirken hata oluştu:', err);
        toast.error('Adliyeler listesi yüklenirken bir sorun oluştu.', { position: "top-right" });
      }
    };

    fetchAdliyeler();
  }, [navigate]);

  const handleRequestedAdliyeChange = useCallback((e) => {
    const { value, checked } = e.target;
    setRequestedAdliyeIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(value);
      } else {
        newSet.delete(value);
      }
      return newSet;
    });
  }, []);

  const handleInfoClick = useCallback(async (adliyeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/adliyeler/${adliyeId}`);
      setSelectedAdliyeDetail(response.data);
      if (adliyeDetailsRef.current) {
        adliyeDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('Adliye detayı çekilirken hata oluştu:', err);
      toast.error('Adliye detayları yüklenirken bir sorun oluştu.', { position: "top-right" });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Giriş yapmanız gerekiyor. Lütfen giriş yapın.');
      navigate('/login');
      return;
    }

    if (!transferType) {
      toast.error('Lütfen tayin talebi türünü seçin.');
      return;
    }

    if (requestedAdliyeIds.size === 0) {
      toast.error('Lütfen tayin olmak istediğiniz en az bir adliye seçin.');
      return;
    }

    const formData = new FormData();
    formData.append('transfer_type', transferType);

    Array.from(requestedAdliyeIds).forEach((id) => {
      formData.append('requested_adliye_ids[]', id);
    });

    formData.append('reason', reason);
    if (documents) {
      formData.append('documents', documents);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/transfer-requests`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      console.log('Tayin Talebi Oluşturuldu:', response.data);
      toast.success('Tayin talebiniz başarıyla oluşturuldu!');
      setRequestedAdliyeIds(new Set());
      setReason('');
      setDocuments(null);
      setSelectedAdliyeDetail(null);
      setTransferType('');

    } catch (err) {
      console.error('Tayin Talebi Oluşturma Hatası:', err);
      let errorMessage = 'Tayin talebi oluşturulurken bir hata oluştu.';
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && err.response.data.errors) {
          const errorMessages = Object.values(err.response.data.errors).flat().join(' ');
          errorMessage = errorMessages;
        } else {
          errorMessage = 'Tayin talebi oluşturulurken bir hata oluştu.';
        }
      } else if (err.request) {
        errorMessage = 'Sunucuya ulaşılamadı. Lütfen ağ bağlantınızı kontrol edin.';
      } else {
        errorMessage = 'Beklenmedik bir hata oluştu: ' + err.message;
      }
      toast.error(errorMessage);
    }
  };

  const filteredAdliyeler = adliyeler.filter(adliye =>
    adliye.adi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAdliyeNames = adliyeler
    .filter(adliye => requestedAdliyeIds.has(String(adliye.id)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-8">
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
        toastClassName="rounded-xl shadow-xl"
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Tayin Talebi Sistemi
          </h1>
          <p className="text-sm text-gray-600">Yeni bir başlangıç için talebinizi oluşturun</p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/50 flex flex-col lg:flex-row gap-4">
          {/* Sol Kolon: Form */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <h2 className="text-lg font-semibold text-center mb-4 text-gray-900 flex items-center justify-center">
                <FaPaperPlane className="mr-2 text-blue-500 text-base" />
                Tayin Talebi Oluştur
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Transfer Type */}
                <div className="group">
                  <label htmlFor="transferType" className="block text-gray-700 text-sm font-medium mb-2">
                    Tayin Talebi Türü
                  </label>
                  <div className="relative">
                    <select
                      id="transferType"
                      className="appearance-none block w-full pl-3 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 cursor-pointer transition-all duration-200 hover:border-blue-300"
                      value={transferType}
                      onChange={(e) => setTransferType(e.target.value)}
                      required
                    >
                      <option value="">Lütfen bir tür seçin...</option>
                      <option value="Aile Birliği">🏠 Aile Birliği</option>
                      <option value="Sağlık">🏥 Sağlık</option>
                      <option value="Eğitim">🎓 Eğitim</option>
                      <option value="Diğer">📋 Diğer</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <svg className="fill-current h-4 w-4 transition-transform group-hover:rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.061 6.889 4.646 8.303l4.647 4.647z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Adliye Selection */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Tayin Olmak İstediğiniz Adliyeler
                  </label>
                  
                  {/* Search Input */}
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Adliye ara..."
                      className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm transition-all duration-200 hover:border-blue-300"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400 text-sm" />
                    </div>
                  </div>

                  {/* Adliye List */}
                  <div className="border border-gray-300 rounded-lg p-2 h-64 overflow-y-auto bg-gradient-to-b from-gray-50 to-white shadow-inner">
                    {filteredAdliyeler.map((adliye) => (
                      <AdliyeListItem
                        key={adliye.id}
                        adliye={adliye}
                        isChecked={requestedAdliyeIds.has(String(adliye.id))}
                        onToggle={handleRequestedAdliyeChange}
                        onInfoClick={handleInfoClick}
                      />
                    ))}
                    {filteredAdliyeler.length === 0 && searchTerm && (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">🔍 Sonuç bulunamadı</p>
                      </div>
                    )}
                  </div>

                  {/* Selected Adliyeler */}
                  {selectedAdliyeNames.length > 0 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                      <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                        <FaCheckSquare className="mr-1 text-sm" /> 
                        Seçilen Adliyeler ({selectedAdliyeNames.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedAdliyeNames.map((adliye) => (
                          <div
                            key={adliye.id}
                            className="bg-white px-2 py-1.5 rounded-md shadow-sm border border-blue-200 cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-blue-50"
                            onClick={() => handleInfoClick(adliye.id)}
                            title={`Detaylar için tıklayın: ${adliye.adi}`}
                          >
                            <span className="text-blue-700 font-medium text-xs">{adliye.adi}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-gray-700 text-sm font-medium mb-2">
                    Gerekçe
                  </label>
                  <textarea
                    id="reason"
                    rows="4"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 placeholder-gray-400 text-gray-900 bg-white transition-all duration-200 hover:border-blue-300 resize-none text-sm"
                    placeholder="Tayin talebinizin gerekçesini detaylıca açıklayın..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label htmlFor="documents" className="block text-gray-700 text-sm font-medium mb-2">
                    Ek Belgeler (isteğe bağlı)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="documents"
                      className="hidden"
                      onChange={(e) => setDocuments(e.target.files[0])}
                    />
                    <label
                      htmlFor="documents"
                      className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 bg-gray-50"
                    >
                      <div className="text-center">
                        <FaCloudUploadAlt className="mx-auto text-2xl text-gray-400 mb-1" />
                        <p className="text-gray-600 font-medium text-sm">
                          {documents ? documents.name : 'Dosya yüklemek için tıklayın'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center text-sm"
                  >
                    <FaPaperPlane className="mr-2 text-sm" />
                    Tayin Talebini Oluştur
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sağ Kolon: Adliye Detayları */}
          <div ref={adliyeDetailsRef} className="w-full lg:w-1/2">
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 h-full">
              <h2 className="text-lg font-semibold text-center mb-4 text-gray-900 flex items-center justify-center">
                <FaInfoCircle className="mr-2 text-blue-500 text-base" />
                Adliye Detayları
              </h2>
              
              {selectedAdliyeDetail ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                      {selectedAdliyeDetail.adi}
                    </h3>
                  </div>

                  {selectedAdliyeDetail.resim_url && (
                    <div className="relative overflow-hidden rounded-lg shadow-md group">
                      <img
                        src={selectedAdliyeDetail.resim_url}
                        alt={`${selectedAdliyeDetail.adi} Resmi`}
                        className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {selectedAdliyeDetail.adres && (
                      <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                        <FaMapMarkerAlt className="text-red-500 mr-2 text-sm mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800 text-sm">Adres</p>
                          <p className="text-gray-600 text-xs">{selectedAdliyeDetail.adres}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      {selectedAdliyeDetail.personel_sayisi && (
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <FaUsers className="text-blue-500 mr-2 text-sm" />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">Personel</p>
                            <p className="text-gray-600 text-xs">{selectedAdliyeDetail.personel_sayisi}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedAdliyeDetail.yapim_yili && (
                        <div className="flex items-center p-3 bg-green-50 rounded-lg">
                          <FaBuilding className="text-green-500 mr-2 text-sm" />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">Yapım Yılı</p>
                            <p className="text-gray-600 text-xs">{selectedAdliyeDetail.yapim_yili}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                        <FaHome className="text-purple-500 mr-2 text-sm" />
                        <div>
                          <p className="font-medium text-gray-800 text-sm">Lojman</p>
                          <p className={`font-medium text-xs ${selectedAdliyeDetail.lojman_var_mi ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedAdliyeDetail.lojman_var_mi ? '✓ Var' : '✗ Yok'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-pink-50 rounded-lg">
                        <FaChild className="text-pink-500 mr-2 text-sm" />
                        <div>
                          <p className="font-medium text-gray-800 text-sm">Çocuk Kreşi</p>
                          <p className={`font-medium text-xs ${selectedAdliyeDetail.cocuk_kresi_var_mi ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedAdliyeDetail.cocuk_kresi_var_mi ? '✓ Var' : '✗ Yok'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map Section */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                      <FaGlobe className="text-blue-500 mr-1 text-sm" /> Harita Konumu
                    </h4>
                    <div className="relative w-full rounded-lg overflow-hidden shadow-md" style={{ paddingBottom: '40%', height: 0 }}>
                      {/* Fixed map link: it should be correctly encoded for Google Maps */}
                      <iframe
                        src={selectedAdliyeDetail.harita_linki || `https://maps.google.com/maps?q=${encodeURIComponent(selectedAdliyeDetail.adi)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        className="absolute top-0 left-0 w-full h-full"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`${selectedAdliyeDetail.adi} Harita`}
                      />
                    </div>
                    <div className="text-center mt-2">
                      <a
                        href={selectedAdliyeDetail.harita_linki || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedAdliyeDetail.adi)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg text-sm"
                      >
                        <FaGlobe className="mr-1 text-sm" />
                        Google Haritalar'da Görüntüle
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-center">
                  <div className="max-w-xs">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <FaInfoCircle className="text-2xl text-blue-500" />
                    </div>
                    <h3 className="text-base font-medium text-gray-800 mb-2">Adliye Detayları</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      Soldaki listeden bir adliyenin <span className="font-medium text-blue-600">bilgi ikonuna</span> tıklayarak 
                      detaylarını görüntüleyebilirsiniz.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRequestPage;