import React, { useState, useEffect } from 'react';
import { Users, FileText, Activity, AlertTriangle, Info, AlertCircle, CheckCircle, XCircle, Filter, Search, Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

function AdminDashboardPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    logLevel: '',
    username: '',
    action: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [systemStatus, setSystemStatus] = useState({ active: false, checking: true });

  const pageSize = 10;
  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchLogs();
    checkSystemStatus();
    // Sistem durumunu her 30 saniyede kontrol et
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, [currentPage, filters]);

  const checkSystemStatus = async () => {
    try {
      setSystemStatus({ active: false, checking: true });
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        setSystemStatus({ active: true, checking: false });
      } else {
        setSystemStatus({ active: false, checking: false });
      }
    } catch (error) {
      setSystemStatus({ active: false, checking: false });
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`${API_BASE_URL}/admin/loglar?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Loglar yüklenemedi');
      }

      const data = await response.json();
      const totalHeader = response.headers.get('X-Total-Count');
      
      setLogs(data);
      setTotalCount(totalHeader ? parseInt(totalHeader, 10) : (data.length || 0));
    } catch (err) {
      setError(err.message);
      setLogs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const getLogLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'debug': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLogLevelIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      case 'debug': return <CheckCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      logLevel: '',
      username: '',
      action: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Yönetim Paneli
              </h1>
              <p className="text-gray-600 mt-1">Sistem yönetimi ve izleme merkezi</p>
            </div>
            <div className="flex items-center space-x-2">
              {systemStatus.checking ? (
                <>
                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Sistem Kontrol Ediliyor...</span>
                </>
              ) : systemStatus.active ? (
                <>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Sistem Aktif</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600">Sistem Çevrimdışı</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800">Kullanıcı Yönetimi</h3>
                  <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"></div>
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Tüm kullanıcıları görüntüleyin, düzenleyin ve yönetin. Rol bazlı erişim kontrolü.
              </p>
              <button
                onClick={() => window.location.href = '/admin/users'}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105"
              >
                Kullanıcıları Görüntüle
              </button>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/50">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors duration-300">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800">Talep Yönetimi</h3>
                  <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"></div>
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Tayin taleplerini inceleyin, onaylayın ve durumlarını takip edin.
              </p>
              <button
                onClick={() => window.location.href = '/admin/requests'}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105"
              >
                Talepleri Görüntüle
              </button>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors duration-300">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800">Sistem Logları</h3>
                  <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"></div>
                </div>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Sistem aktivitelerini izleyin ve hata kayıtlarını inceleyin.
              </p>
              <button
                onClick={() => document.getElementById('logs-section').scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105"
              >
                Logları Görüntüle
              </button>
            </div>
          </div>
        </div>

        <div id="logs-section" className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Sistem Logları</h2>
                  <p className="text-gray-300">
                    {loading ? 'Yükleniyor...' : `Toplam ${totalCount} kayıt`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200"
              >
                <Filter className="w-4 h-4" />
                <span>Filtrele</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Log Seviyesi</label>
                  <select
                    value={filters.logLevel}
                    onChange={(e) => handleFilterChange('logLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="">Tümü</option>
                    <option value="Error">Error</option>
                    <option value="Warning">Warning</option>
                    <option value="Info">Info</option>
                    <option value="Debug">Debug</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı</label>
                  <input
                    type="text"
                    value={filters.username}
                    onChange={(e) => handleFilterChange('username', e.target.value)}
                    placeholder="Kullanıcı adı..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aksiyon</label>
                  <input
                    type="text"
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    placeholder="Aksiyon..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç</label>
                  <input
                    type="datetime-local"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş</label>
                  <input
                    type="datetime-local"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-4 text-gray-600">Loglar yükleniyor...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-lg font-semibold">Hata!</p>
                  <p className="text-sm">{error}</p>
                </div>
                <button
                  onClick={fetchLogs}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Henüz log kaydı bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="group bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getLogLevelColor(log.log_level)}`}>
                            {getLogLevelIcon(log.log_level)}
                            <span>{log.log_level}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-4 mb-2">
                              <span className="text-sm text-gray-500">{formatDate(log.timestamp)}</span>
                              {log.username && (
                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {log.username}
                                </span>
                              )}
                              {log.action && (
                                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  {log.action}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-800 font-medium mb-1">{log.message}</p>
                            {log.details && (
                              <p className="text-sm text-gray-600 truncate">{log.details}</p>
                            )}
                          </div>
                        </div>
                        {log.details && (
                          <button
                            onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                            className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {selectedLog === log.id && log.details && (
                        <div className="mt-4 p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Detaylar:</h4>
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap break-words">{log.details}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && logs.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200/50">
                <div className="text-sm text-gray-600">
                  Sayfa {currentPage} / {totalPages} 
                  {totalCount > 0 && ` (Toplam ${totalCount} kayıt)`}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Önceki
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/80 backdrop-blur-sm border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Sonraki
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;