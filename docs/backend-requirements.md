# Backend Gereksinimleri

## 1. Teknoloji Stack
- Node.js & Express.js
- TypeScript
- PostgreSQL (Ana veritabanı)
- Redis (Session/Cache yönetimi)
- JWT (Authentication)
- Hyperledger Fabric (Blockchain)

## 2. Veritabanı Yapısı

### 2.1 Users Tablosu
- id (PK)
- email (unique)
- password_hash
- role (firma_sahibi, calisan)
- company_id (FK)
- first_name
- last_name
- tc_no
- phone
- country_code
- status (active, pending)
- email_verified
- created_at
- updated_at

### 2.2 Companies Tablosu
- id (PK)
- name
- tax_no (unique)
- trade_registry_no
- mersis_no
- status (active, pending)
- created_at
- updated_at

### 2.3 Company_Documents Tablosu
- id (PK)
- company_id (FK)
- document_type (imza_sirküleri, ticaret_sicil, vergi_levhasi, faaliyet_belgesi)
- file_path
- status (pending, approved, rejected)
- rejection_reason
- approved_at
- created_at
- updated_at

### 2.4 Company_Addresses Tablosu
- id (PK)
- company_id (FK)
- address_type (merkez, sube, fabrika, depo)
- street
- city
- district
- postal_code
- created_at
- updated_at

### 2.5 Products Tablosu (Tekstil)
- id (PK)
- company_id (FK)
- name
- fabric_type
- materials (JSON - materyal yüzdeleri)
- production_method
- dyeing_process
- care_instructions
- status (active, inactive)
- created_at
- updated_at

### 2.6 Product_Documents Tablosu
- id (PK)
- product_id (FK)
- document_type (test_raporu, sertifika)
- file_path
- status (pending, approved, rejected)
- valid_until
- created_at
- updated_at

### 2.7 DPCs Tablosu
- id (PK)
- product_id (FK)
- status (pending, approved, rejected)
- blockchain_hash
- created_at
- updated_at

## 3. API Endpoints

### 3.1 Authentication
- POST /api/auth/register (Üretici kaydı)
- POST /api/auth/verify-email (Email doğrulama)
- POST /api/auth/login (Giriş)
- POST /api/auth/logout (Çıkış)
- POST /api/auth/forgot-password (Şifre sıfırlama)
- POST /api/auth/reset-password (Yeni şifre belirleme)

### 3.2 Kullanıcı Yönetimi
- POST /api/users (Yeni çalışan ekleme)
- GET /api/users (Firma çalışanlarını listeleme)
- DELETE /api/users/:id (Çalışan silme)

### 3.3 Firma Yönetimi
- GET /api/company (Firma bilgilerini getirme)
- PUT /api/company (Firma bilgilerini güncelleme)
- POST /api/company/documents (Belge yükleme)
- DELETE /api/company/documents/:id (Belge silme)

### 3.4 Ürün Yönetimi
- POST /api/products (Yeni ürün ekleme)
- GET /api/products (Ürün listesi)
- GET /api/products/:id (Ürün detayı)
- PUT /api/products/:id (Ürün güncelleme)
- DELETE /api/products/:id (Ürün silme)

### 3.5 DPC Yönetimi
- POST /api/dpcs (DPC başvurusu)
- GET /api/dpcs (DPC listesi)
- GET /api/dpcs/:id (DPC detayı)

### 3.6 Admin Endpoints
- GET /api/admin/companies (Tüm firmalar)
- PUT /api/admin/companies/:id/status (Firma onay/red)
- GET /api/admin/documents (Bekleyen belgeler)
- PUT /api/admin/documents/:id/status (Belge onay/red)
- GET /api/admin/dpcs (Bekleyen DPC'ler)
- PUT /api/admin/dpcs/:id/status (DPC onay/red)

## 4. Blockchain Yapısı

### 4.1 Smart Contracts
- CompanyContract (Firma kayıtları)
- DocumentContract (Belge doğrulama)
- DPCContract (DPC kayıtları)

### 4.2 Blockchain Kayıtları
- Firma kaydı
- Belge hash'leri
- DPC kayıtları
- Onay işlemleri

## 5. Güvenlik

### 5.1 Authentication
- JWT token yapısı
- Token yenileme mekanizması
- Oturum yönetimi

### 5.2 Yetkilendirme
- Role bazlı erişim kontrolü
- Endpoint bazlı yetkilendirme
- Resource bazlı yetkilendirme

### 5.3 Validasyonlar
- Input validasyonu
- Dosya upload güvenliği
- Rate limiting
- XSS koruması
- SQL injection koruması

### 5.4 Loglama
- Error logları
- Access logları
- Audit logları
- Security logları 