import React, { useState, useEffect, useRef } from "react"; // useRef'i import et
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

// Page components
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CreateRequestPage from "./pages/CreateRequestPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import DashboardPage from "./pages/DashboardPage";

// Admin pages
import AdminDashboardPage from "./pages/AdminDashboardPage";
import UserManagementPage from "./pages/UserManagementPage";
import RequestManagementPage from "./pages/RequestManagementPage";

// ProtectedRoute and AdminProtectedRoute components (no changes needed here)
function ProtectedRoute({ children, isLoggedIn, isLoading }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, navigate, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-lg">Yükleniyor...</p>
      </div>
    );
  }
  return isLoggedIn ? children : null;
}

function AdminProtectedRoute({ children, isLoggedIn, isAdmin, isLoading }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
    } else if (!isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoggedIn, isAdmin, navigate, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-lg">Yükleniyor...</p>
      </div>
    );
  }

  return isLoggedIn && isAdmin ? children : null;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Admin status state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // Yeni: Profil menüsü durumu
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState(""); // Yeni: Kullanıcı adı durumu

  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef(null); // Yeni: Profil menüsü için ref

  // Bu useEffect artık ilk yüklemede ve isLoggedIn değiştiğinde çalışır
  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      const user = localStorage.getItem("user");

      if (token && user) {
        setIsLoggedIn(true);
        try {
          const userData = JSON.parse(user);
          setUserName(userData.name || "Kullanıcı"); // Kullanıcı adını ayarla
          if (userData && userData.id === 1) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          console.error("Kullanıcı bilgisi ayrıştırma hatası:", e);
          setIsAdmin(false);
          setUserName("Kullanıcı");
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserName("");
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, [isLoggedIn]); // isLoggedIn değiştiğinde tekrar çalıştır

  // Yeni: Profil menüsü dışına tıklamayı algılamak için useEffect
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserName(""); // Kullanıcı adını sıfırla
    setIsProfileMenuOpen(false); // Menüyü kapat
    navigate("/login");
  };

  // Geçerli yolun admin bölümünde olup olmadığını belirle
  const isBanneredOnAdmin = location.pathname.startsWith("/admin");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-xl font-semibold">
          Uygulama Yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <>
      <nav className="bg-gray-800 p-4 text-white shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-xl font-semibold text-gray-50 hover:text-gray-200 transition duration-200"
          >
            Personel Tayin Uygulaması
          </Link>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-50 hover:text-gray-200 focus:outline-none focus:text-gray-200"
              aria-label="Toggle navigation"
            >
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {isLoggedIn && (
              <>
                {!isBanneredOnAdmin && ( // Sadece admin bölümünde değilse göster
                  <>
                    <Link
                      to="/dashboard"
                      className="text-gray-200 hover:text-white transition duration-200 px-3 py-1 rounded"
                    >
                      Anasayfa
                    </Link>
                    <Link
                      to="/create-request"
                      className="text-gray-200 hover:text-white transition duration-200 px-3 py-1 rounded"
                    >
                      Talep Oluştur
                    </Link>
                    <Link
                      to="/my-requests"
                      className="text-gray-200 hover:text-white transition duration-200 px-3 py-1 rounded"
                    >
                      Taleplerim
                    </Link>
                  </>
                )}

                {isAdmin && ( // Sadece admin ise admin bağlantılarını göster
                  <>
                    {isBanneredOnAdmin ? ( // Admin bölümündeyken "Kullanıcı Paneli" göster
                      <>
                        
                        <Link to="/dashboard" className="text-yellow-300 hover:text-yellow-100 transition duration-200 px-3 py-1 rounded font-semibold">
                          Kullanıcı Paneline Geç
                        </Link>
                      </>
                    ) : (
                      // Admin bölümünde değilken "Yönetim Paneli" göster
                      <Link
                        to="/admin"
                        className="text-yellow-300 hover:text-yellow-100 transition duration-200 px-3 py-1 rounded font-semibold"
                      >
                        Yönetim Paneli
                      </Link>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4 relative" ref={profileMenuRef}> {/* useRef'i buraya ekle */}
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-gray-200 hover:text-white focus:outline-none focus:text-white transition duration-200"
                >
                  <span className="font-medium">{userName}</span>
                  
                  <svg
                    className={`h-4 w-4 transform ${isProfileMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 top-full">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-200 hover:text-white transition duration-200 px-3 py-1 rounded"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-md shadow-sm transition duration-200"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-700 mt-4 py-2 rounded-md">
            <ul className="flex flex-col space-y-1">
              {isLoggedIn && (
                <>
                  {!isBanneredOnAdmin && (
                    <>
                      <li>
                        <Link
                          to="/dashboard"
                          className="block py-2 px-4 text-gray-100 hover:bg-gray-600 rounded-md transition duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Anasayfa
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/create-request"
                          className="block py-2 px-4 text-gray-100 hover:bg-gray-600 rounded-md transition duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Talep Oluştur
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/my-requests"
                          className="block py-2 px-4 text-gray-100 hover:bg-gray-600 rounded-md transition duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Taleplerim
                        </Link>
                      </li>
                    </>
                  )}
                  {isAdmin && (
                    <li>
                      {isBanneredOnAdmin ? (
                        <Link
                          to="/dashboard"
                          className="block py-2 px-4 text-yellow-300 hover:bg-gray-600 rounded-md transition duration-200 font-semibold"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Kullanıcı Paneli
                        </Link>
                      ) : (
                        <Link
                          to="/admin"
                          className="block py-2 px-4 text-yellow-300 hover:bg-gray-600 rounded-md transition duration-200 font-semibold"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Yönetim Paneli
                        </Link>
                      )}
                    </li>
                  )}
                  <li>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-2 px-4 text-white bg-red-600 hover:bg-red-700 rounded-md transition duration-200"
                    >
                      Çıkış Yap
                    </button>
                  </li>
                </>
              )}
              {!isLoggedIn && (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="block py-2 px-4 text-gray-100 hover:bg-gray-600 rounded-md transition duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Giriş Yap
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="block py-2 px-4 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Kayıt Ol
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </nav>

      {/* Route Definitions */}
      <Routes>
        {/* Pass setIsAdmin to LoginPage and RegisterPage */}
        <Route
          path="/login"
          element={
            <LoginPage setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />
          }
        />
        <Route
          path="/register"
          element={
            <RegisterPage
              setIsLoggedIn={setIsLoggedIn}
              setIsAdmin={setIsAdmin}
            />
          }
        />

        {/* Normal Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-request"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading}>
              <CreateRequestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-requests"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading}>
              <MyRequestsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              isLoading={isLoading}
            >
              <AdminDashboardPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              isLoading={isLoading}
            >
              <UserManagementPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <AdminProtectedRoute
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              isLoading={isLoading}
            >
              <RequestManagementPage />
            </AdminProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route
          path="/"
          element={
            isLoading ? null : isLoggedIn ? (
              <DashboardPage />
            ) : (
              <LoginPage
                setIsLoggedIn={setIsLoggedIn}
                setIsAdmin={setIsAdmin}
              />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;