# Adliye Tayin Talep Sistemi
---

### Hızlı Başlangıç

Bu sistem, adliye personelinin tayin taleplerini dijital ortamda yönetmelerine olanak sağlayan kurumsal bir web uygulamasıdır. Kullanıcılar tayin taleplerini oluşturabilir, mevcut taleplerini görüntüleyebilir ve yönetebilirler.

### Test Kullanıcı Bilgileri

Sisteme giriş yapmak için aşağıdaki test kullanıcısını kullanabilirsiniz:

* **Sicil Numarası**: 221694
* **Şifre**: 221694

### Sistem Mimarisi

Sistem, modern web teknolojileri kullanılarak geliştirilmiş üç katmanlı bir mimari üzerine kurulmuştur:

React.js Frontend <-> REST API <-> Veritabanı

* **Ön Yüz (Frontend)**: React.js ile geliştirilmiş, kullanıcı dostu arayüz
* **Arka Yüz (Backend)**: Laravel (PHP) veya ASP.NET Core (C#) seçenekleri
* **Veritabanı**: MySQL, PostgreSQL, SQLite veya SQL Server desteği

### Temel Özellikler

* **Kullanıcı Yönetimi**: Güvenli kayıt, giriş ve profil yönetimi sistemi. Sicil numarası tabanlı kimlik doğrulama.
* **Tayin Talepleri**: Tayin taleplerinin oluşturulması, görüntülenmesi ve yönetimi. Dosya ekleme desteği.
* **Yönetici Paneli**: Tüm kullanıcıları ve talepleri görüntüleme, talep durumlarını güncelleme yetkisi.
* **Adliye Veritabanı**: Türkiye'deki 81 adliyeye ait kapsamlı veritabanı ve sorgulama sistemi.

---

## Kurulum

**Önemli Not**: Her iki backend seçeneği de aynı işlevselliği sunar. Sadece birini seçip kurmanız yeterlidir. Her iki backend de port 8000 üzerinden çalışacak şekilde yapılandırılmalıdır.

### Frontend (React.js) Kurulumu

1.  **Node.js ve npm Kurulumu**
    Bilgisayarınızda Node.js ve npm yüklü olduğundan emin olun.
    ```bash
    npm --version
    node --version
    ```
2.  **Proje Dizinine Geçiş**
    ```bash
    cd path/to/your/project
    ```
3.  **Bağımlılıkları Yükleme**
    ```bash
    npm install
    # veya
    yarn install
    ```
4.  **Geliştirme Sunucusunu Başlatma**
    ```bash
    npm start
    ```
    Uygulama `http://localhost:3000` adresinde çalışacaktır.

### Backend Kurulumu

#### Laravel Backend Kurulumu

1.  **PHP ve Composer**
    ```bash
    php --version
    composer --version
    ```
2.  **Ortam Yapılandırması**
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
3.  **Bağımlılıklar**
    ```bash
    composer install
    ```
4.  **Veritabanı**
    ```bash
    php artisan migrate:fresh --seed
    ```
5.  **Sunucu Başlatma**
    ```bash
    php artisan serve --port=8000
    ```

#### ASP.NET Core Backend Kurulumu

1.  **.NET SDK**
    ```bash
    dotnet --version
    ```
2.  **Paketleri Geri Yükleme**
    ```bash
    dotnet restore
    ```
3.  **EF Tools**
    ```bash
    dotnet tool install --global dotnet-ef
    ```
4.  **Veritabanı**
    ```bash
    dotnet ef database update
    ```
5.  **Sunucu Başlatma**
    ```bash
    dotnet run --urls "http://localhost:8000"
    ```

### Kurulum Sonrası Test

Kurulum tamamlandıktan sonra aşağıdaki bilgilerle sisteme giriş yapabilirsiniz:

* **Sicil Numarası**: 221694
* **Şifre**: 221694

---

## API Dokümantasyonu

### API Endpoint'leri

Sistem, RESTful API prensiplerine uygun olarak tasarlanmış endpoint'ler sunar:

* **`POST /api/register`**
    * **İşlev**: Yeni kullanıcı kaydı
    * **Parametreler**: `name`, `sicil`, `phone`, `current_adliye_id`, `password`, `password_confirmation`

* **`POST /api/login`**
    * **İşlev**: Kullanıcı girişi ve token üretimi
    * **Parametreler**: `sicil`, `password`
    * **Dönen Değer**: `access_token`, `token_type`, `user`

* **`POST /api/logout`**
    * **İşlev**: Oturum kapatma ve token iptali
    * **Yetkilendirme**: Bearer Token gerekli

* **`GET /api/user`**
    * **İşlev**: Kullanıcı profil bilgilerini getirme
    * **Yetkilendirme**: Bearer Token gerekli

* **`GET /api/adliyeler`**
    * **İşlev**: Tüm adliyelerin listesini getirme
    * **Yetkilendirme**: Gerekli değil (Public)

* **`POST /api/transfer-requests`**
    * **İşlev**: Yeni tayin talebi oluşturma
    * **Parametreler**: `request_type`, `reason`, `requested_adliye_ids[]`, `documents`
    * **Yetkilendirme**: Bearer Token gerekli

* **`GET /api/admin/users`**
    * **İşlev**: Tüm sistem kullanıcılarını listeleme
    * **Yetkilendirme**: Admin yetkisi gerekli

* **`PUT /api/admin/requests/{id}/status`**
    * **İşlev**: Tayin talebi durumu güncelleme
    * **Parametreler**: `status` (pending, approved, rejected)
    * **Yetkilendirme**: Admin yetkisi gerekli

---

## Proje Yapısı

### Proje Klasör Yapısı 
.
├── public/ # Statik dosyalar
├── src/ # React kaynak dosyaları
│   ├── assets/
│   │   └── loading.gif
│   ├── components/ # React bileşenleri
│   │   └── Navbar.jsx
│   ├── pages/ # Sayfa bileşenleri
│   │   ├── AdminDashboardPage.jsx
│   │   ├── CreateRequestPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MyRequestsPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── RequestManagementPage.jsx
│   │   └── UserManagementPage.jsx
│   ├── App.jsx # Ana uygulama bileşeni
│   ├── index.css # Global stiller
│   └── main.jsx # Uygulama giriş noktası
├── backend_laravel/ # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/ # API kontrolcüleri
│   │   │   │   ├── AdliyeController.php
│   │   │   │   ├── AdminController.php
│   │   │   │   ├── AuthController.php
│   │   │   │   └── TransferRequestController.php
│   │   │   └── Kernel.php
│   │   └── Models/ # Veri modelleri
│   │       ├── Adliye.php
│   │       ├── TransferRequest.php
│   │       └── User.php
│   ├── database/
│   │   ├── migrations/ # Veritabanı şemaları
│   │   └── seeders/ # Başlangıç verileri
│   ├── routes/
│   │   └── api.php # API rotaları
│   ├── storage/ # Dosya depolama
│   └── .env.example # Ortam değişkenleri örneği
├── backend_aspnet/ # ASP.NET Core Backend
│   ├── Controllers/ # API kontrolcüleri
│   │   ├── AdliyeController.cs
│   │   ├── AdminController.cs
│   │   ├── AuthController.cs
│   │   └── TransferRequestController.cs
│   ├── Data/ # Veritabanı bağlamı
│   │   └── ApplicationDbContext.cs
│   ├── Models/ # Veri modelleri
│   │   ├── Adliye.cs
│   │   ├── TransferRequest.cs
│   │   └── User.cs
│   ├── Services/ # İş mantığı servisleri
│   │   └── AdminCheckService.cs
│   ├── appsettings.json # Uygulama ayarları
│   ├── Program.cs # Uygulama giriş noktası
│   └── TayinAspApi.csproj # Proje dosyası
└── package.json # Node.js bağımlılıkları


### Teknoloji Yığını

#### Frontend

* ✓ React.js 18+
* ✓ React Router
* ✓ Axios (HTTP Client)
* ✓ Modern CSS3

#### Backend (Laravel)

* ✓ PHP 8.1+
* ✓ Laravel 10+
* ✓ Laravel Sanctum
* ✓ Eloquent ORM

#### Backend (ASP.NET Core)

* ✓ .NET 8
* ✓ ASP.NET Core Web API
* ✓ Entity Framework Core
* ✓ JWT Authentication

#### Veritabanı

* ✓ MySQL
* ✓ PostgreSQL
* ✓ SQLite
* ✓ SQL Server

### Güvenlik Özellikleri

#### Kimlik Doğrulama ve Yetkilendirme

* **JWT Token Tabanlı Kimlik Doğrulama**: Güvenli ve stateless authentication
* **Sicil Numarası Bazlı Giriş**: Kurumsal kimlik doğrulama sistemi
* **Rol Tabanlı Yetkilendirme**: Kullanıcı ve admin rolleri
* **Şifre Hashleme**: bcrypt algoritması ile güvenli şifre saklama
* **CORS Koruması**: Cross-Origin Resource Sharing güvenlik politikaları
* **Rate Limiting**: API endpoint'leri için istek sınırlaması