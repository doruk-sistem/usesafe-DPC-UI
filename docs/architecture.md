# UseSafe Sistem Mimarisi

## 1. Genel Bakış
UseSafe, blockchain tabanlı bir dijital ürün sertifikasyon sistemidir. Sistem üç ana bileşenden oluşur:

- Frontend (Web Arayüzü)
- Backend (API ve İş Mantığı)
- Blockchain (Hyperledger Fabric)

## 2. Bileşenler

### 2.1 Frontend
- Next.js/React tabanlı web uygulaması
- Üretici portal arayüzü
- Admin panel arayüzü
- Genel kullanıcı DPP sorgulama arayüzü

### 2.2 Backend 
- Node.js Express API
- Blockchain entegrasyonu
- Dosya yönetimi
- Kullanıcı yönetimi
- JWT tabanlı kimlik doğrulama

### 2.3 Blockchain
- Hyperledger Fabric ağı
- 2 Organizasyon (Başlangıç için)
- RAFT konsensüs
- Özel chaincode'lar

## 3. Veri Akışı
1. Üretici kayıt/giriş
2. Ürün bilgisi girişi
3. Belge yükleme
4. Blockchain doğrulama
5. DPP oluşturma
6. Son kullanıcı sorgulama 