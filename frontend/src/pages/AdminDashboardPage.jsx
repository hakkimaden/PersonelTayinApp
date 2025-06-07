// src/pages/AdminDashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Yönetim Paneli</h1>
      <p className="text-lg text-gray-700 text-center mb-10">
        Yönetim fonksiyonlarına buradan erişebilirsiniz.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Kullanıcı Yönetimi</h2>
          <p className="text-gray-600 mb-4">Tüm kullanıcıları görüntüleyin, düzenleyin veya silin.</p>
          <Link
            to="/admin/users"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
          >
            Kullanıcıları Görüntüle
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Talep Yönetimi</h2>
          <p className="text-gray-600 mb-4">Tüm tayin taleplerini inceleyin ve durumlarını yönetin.</p>
          <Link
            to="/admin/requests"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
          >
            Talepleri Görüntüle
          </Link>
        </div>

        {/* İhtiyaç duyulursa buraya başka yönetim modülleri de eklenebilir */}
      </div>
    </div>
  );
}

export default AdminDashboardPage;