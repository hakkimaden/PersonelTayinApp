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
* **Veritabanı**: PostgreSQL desteği

### Temel Özellikler

* **Kullanıcı Yönetimi**: Güvenli kayıt, giriş ve profil yönetimi sistemi. Sicil numarası tabanlı kimlik doğrulama.
* **Tayin Talepleri**: Tayin taleplerinin oluşturulması, görüntülenmesi ve yönetimi. Dosya ekleme desteği.
* **Yönetici Paneli**: Tüm kullanıcıları ve talepleri görüntüleme, talep durumlarını güncelleme yetkisi.
* **Adliye Veritabanı**: Türkiye'deki 81 adliyeye ait kapsamlı veritabanı ve sorgulama sistemi.

---

## Kurulum

**Önemli Not**: Her iki backend seçeneği de aynı işlevselliği sunar. Sadece birini seçip kurmanız yeterlidir. Her iki backend de port 8000 üzerinden çalışacak şekilde yapılandırılmalıdır.

**Veritabanı Notu**: Laravel ve ASP.NET Core backend'leri farklı veritabanı yapıları kullandığından, her biri için ayrı veritabanı oluşturulmalıdır. Aynı veritabanını paylaşamazlar.

### Frontend (React.js) Kurulumu

1.  **Gereksinimler**
    * Node.js 18+ ve npm 9+
    * Git (opsiyonel)

2.  **Proje Klonlama ve Dizine Geçiş**
    ```bash
    git clone https://github.com/hakkimaden/PersonelTayinApp.git
    cd PersonelTayinApp/frontend
    ```

3.  **Bağımlılıkları Yükleme**
    ```bash
    npm install
    ```

4.  **Ortam Değişkenlerini Yapılandırma**
    * `.env` dosyasını oluşturun:
    ```bash
    cp .env.example .env
    ```
    * Backend URL'ini yapılandırın (tercih ettiğiniz backend'e göre):
    ```
    REACT_APP_API_URL=http://localhost:8000/api
    ```

5.  **Geliştirme Sunucusunu Başlatma**
    ```bash
    npm start
    ```
    Uygulama `http://localhost:3000` adresinde çalışacaktır.

### Backend Kurulumu

#### Laravel Backend Kurulumu

1.  **Sistem Gereksinimleri**
    * PHP 8.1+
    * Composer 2+
    * MySQL 8+ veya PostgreSQL 13+ (tercih edilen)

2.  **Proje Dizinine Geçiş**
    ```bash
    cd PersonelTayinApp/laravel
    ```

3.  **Composer Bağımlılıklarını Yükleme**
    ```bash
    composer install
    ```

4.  **Ortam Değişkenlerini Yapılandırma**
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
    
5.  **Veritabanı Yapılandırma**
    * `.env` dosyasında veritabanı bilgilerini düzenleyin:
    ```
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=tayin_laravel
    DB_USERNAME=root
    DB_PASSWORD=[YourPassword]
    ```
    * Veritabanını oluşturun:
    ```bash
    mysql -u root -p -e "CREATE DATABASE tayin_laravel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    ```
    * Migrasyon ve seeder'ları çalıştırın:
    ```bash
    php artisan migrate:fresh --seed
    ```

6.  **Storage Dizini İzinlerini Ayarlama**
    ```bash
    php artisan storage:link
    chmod -R 775 storage bootstrap/cache
    ```

7.  **Sunucuyu Başlatma**
    ```bash
    php artisan serve --port=8000
    ```

#### ASP.NET Core Backend Kurulumu

1.  **Sistem Gereksinimleri**
    * .NET 8 SDK
    * SQL Server 2019+ veya PostgreSQL 13+ (tercih edilen)
    * Visual Studio 2022 (opsiyonel)

2.  **Proje Dizinine Geçiş**
    ```bash
    cd PersonelTayinApp/asp
    ```

3.  **.NET Araçlarını ve Bağımlılıkları Yükleme**
    ```bash
    dotnet tool install --global dotnet-ef
    dotnet restore asp.sln
    ```

4.  **Veritabanı Yapılandırma**
    * `appsettings.json` dosyasında veritabanı bağlantı dizesini düzenleyin:
    ```json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Host=localhost;Port=5432;Database=tayinasp;Username=postgres;Password=[YourPassword];"
      }
    }
    ```
    * Veritabanını oluşturun:
    ```bash
    dotnet ef database update
    ```

5.  **Sunucuyu Başlatma**
    ```bash
    dotnet run asp.sln
    ```

### Kurulum Sonrası Test

Kurulum tamamlandıktan sonra aşağıdaki adımları izleyerek test edebilirsiniz:

1. Frontend uygulamasını `http://localhost:3000` adresinde açın
2. Aşağıdaki test kullanıcısı ile giriş yapın:
   * **Sicil Numarası**: 221694
   * **Şifre**: 221694
3. Başarılı giriş sonrası dashboard sayfasına yönlendirileceksiniz

### Olası Sorunlar ve Çözümleri

1. **CORS Hatası**
   * Backend'in CORS ayarlarının doğru yapılandırıldığından emin olun
   * Frontend `.env` dosyasında API URL'inin doğru olduğunu kontrol edin

2. **Veritabanı Bağlantı Hatası**
   * Veritabanı servisinin çalıştığından emin olun
   * Bağlantı bilgilerinin doğru olduğunu kontrol edin
   * Kullanıcının yeterli yetkiye sahip olduğundan emin olun

3. **Port Çakışması**
   * 8000 portunda çalışan başka bir uygulama varsa, kapatın veya portu değiştirin
   * 3000 portunda çalışan başka bir uygulama varsa, React otomatik olarak farklı bir port önerecektir

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

* ✓ PostgreSQL

### Güvenlik Özellikleri

#### Kimlik Doğrulama ve Yetkilendirme

* **JWT Token Tabanlı Kimlik Doğrulama**: Güvenli ve stateless authentication
* **Sicil Numarası Bazlı Giriş**: Kurumsal kimlik doğrulama sistemi
* **Rol Tabanlı Yetkilendirme**: Kullanıcı ve admin rolleri
* **Şifre Hashleme**: bcrypt algoritması ile güvenli şifre saklama
* **CORS Koruması**: Cross-Origin Resource Sharing güvenlik politikaları
* **Rate Limiting**: API endpoint'leri için istek sınırlaması

#### Loglama ve İzlenebilirlik

> Not: Loglama ve izlenebilirlik altyapısı hem Laravel hem de ASP.NET Core backend projelerinde mevcuttur. Her iki sistemde de önemli işlemler, hatalar ve kullanıcı aktiviteleri merkezi olarak kaydedilir ve denetlenebilir.

* **Merkezi Loglama**: Tüm önemli işlemler ve hatalar merkezi olarak kaydedilir.
* **Kapsamlı İzlenebilirlik**: Kullanıcı ve yönetici işlemleri detaylı şekilde loglanır.
* **Aksiyon Bazlı Loglama**: API istekleri, kimlik doğrulama, veri güncellemeleri ve yönetici işlemleri ayrı ayrı izlenir.
* **Log Seviyeleri**: Bilgi, uyarı ve hata seviyelerinde kayıt tutulur.
* **Gizlilik ve Güvenlik**: Kişisel veriler loglarda maskeleme ile korunur.
* **Denetim Kolaylığı**: Sistem yöneticileri için denetim ve hata ayıklama süreçlerini kolaylaştırır.