# Üretici Dashboard Özellikleri

## 1. Genel Bakış
Üretici dashboard'u, üreticilerin UseSafe platformunda tüm işlemlerini yönetebilecekleri ana kontrol merkezidir. Bu dashboard üzerinden ürün yönetimi, DPC (Dijital Ürün Sertifikasyon) başvuruları, belge yönetimi ve firma bilgilerini kontrol edebilirler.

## 2. Ana Özellikler

### 2.1 Özet Kartları
- Toplam ürün sayısı
- Onay bekleyen başvuru sayısı
- Aktif DPC sayısı
- Reddedilen başvuru sayısı

### 2.2 Ürün Yönetimi (Tekstil)
- Yeni tekstil ürünü ekleme (DPP oluşturma)
- Mevcut tekstil ürünlerini listeleme ve düzenleme
- Ürün detaylarını görüntüleme
  - Kumaş bilgileri
  - Materyal içerikleri (%)
  - Üretim yöntemi
  - Bakım talimatları
  - Boyama/İşlem detayları
- Ürün fotoğrafları ve belgeleri yükleme

### 2.3 DPC (Dijital Ürün Sertifikasyon) Yönetimi
- Ürünler için DPC başvurusu oluşturma
- Mevcut DPC'leri listeleme
- DPC durumlarını takip etme
- DPC detaylarını görüntüleme
  - Ürün DPP bilgileri
  - İlgili sertifikalar
  - Güvenlik belgeleri
  - Test raporları
  - Regülasyon uyumluluk belgeleri
- DPC belgelerini yönetme

### 2.4 Belge Yönetimi
- Firma belgelerini yükleme (admin onayı gerekli)
- Firma belgelerini silme (onay gerekmez)
- Belge geçerlilik tarihlerini takip etme
- Belge yenileme bildirimleri
- Belge onay durumlarını görüntüleme
- Sertifika yönetimi
  - Güvenlik sertifikaları (yükleme için admin onayı gerekli)
  - Uyumluluk sertifikaları (yükleme için admin onayı gerekli)
  - Test raporları (yükleme için admin onayı gerekli)

#### 2.4.1 Belge Durumları
- Onay Bekliyor: Yeni yüklenen belge
- Onaylandı: Admin tarafından onaylanmış belge
- Reddedildi: Admin tarafından reddedilmiş belge
- Süresi Dolmak Üzere: Geçerlilik süresi yakında dolacak belge
- Süresi Dolmuş: Geçerlilik süresi bitmiş belge

#### 2.4.2 Belge İşlemleri
- Yeni belge yükleme (onay gerekli)
- Mevcut belgeyi silme (onay gerekmez)
- Belge detaylarını görüntüleme
- Belge geçmişini görüntüleme
- Red edilen belgeler için yeniden yükleme

#### 2.4.3 Belge Onay Süreci
1. Üretici belgeyi sisteme yükler
2. Sistem belgeyi "Onay Bekliyor" durumuna alır
3. Admin belgeyi inceler
4. Admin onaylar veya reddeder
5. Onaylanırsa belge "Onaylandı" durumuna geçer
6. Reddedilirse belge "Reddedildi" durumuna geçer ve red nedeni belirtilir
7. Reddedilen belge için üretici yeni belge yükleyebilir
8. Onaylı veya reddedilmiş belgeleri üretici direkt silebilir

### 2.5 Firma Profili

#### 2.5.1 Değiştirilemez Bilgiler (Immutable)
- Şirket ünvanı
- Vergi kimlik numarası 
- İmza yetkilileri
- Ticaret sicil numarası (varsa)
- Mersis numarası (varsa)

Bu bilgiler sadece UseSafe admin onayı ile değiştirilebilir. Değişiklik talebi için resmi evrak ile başvuru gerekir.

#### 2.5.2 Değiştirilebilir Bilgiler (Mutable)
- İletişim bilgileri
  - Telefon numarası
  - E-posta adresi
  - Faks
  - Web sitesi
- Adres bilgileri
  - Merkez ofis adresi
  - Şube adresleri
  - Fabrika adresleri
- Yetkili kişi bilgileri
  - Ad soyad
  - Unvan
  - Departman
  - İletişim bilgileri
- Şifre ve güvenlik ayarları
  - Kullanıcı şifresi
  - İki faktörlü doğrulama
  - Bildirim tercihleri

## 3. Teknik Gereksinimler

### 3.1 Kullanıcı Arayüzü
- Responsive tasarım (mobil uyumlu)
- Kolay kullanılabilir navigasyon
- Modern ve profesyonel görünüm
- Türkçe dil desteği

### 3.2 Güvenlik
- Rol tabanlı erişim kontrolü
- Oturum yönetimi
- İşlem logları
- Güvenli dosya yükleme
- Blockchain tabanlı doğrulama

### 3.3 Entegrasyonlar
- Blockchain altyapısı ile entegrasyon
- Dosya depolama sistemi
- Bildirim sistemi
- API entegrasyonları

## 4. İş Akışları

### 4.1 Ürün (DPP) Ekleme Süreci
1. Tekstil ürün bilgilerinin girilmesi
   - Ürün adı
   - Kumaş türü
   - Materyal içerikleri (pamuk, polyester vb.)
   - Üretim yöntemi
   - Boyama/İşlem detayları
2. Teknik özelliklerin tanımlanması
3. Ürün fotoğraflarının yüklenmesi
4. Materyal test raporlarının yüklenmesi
5. Blockchain kaydının oluşturulması

### 4.2 DPC Başvuru Süreci
1. DPC başvuru formunun doldurulması
2. İlgili ürün DPP'sinin seçilmesi
3. Gerekli sertifikaların yüklenmesi
4. Test raporlarının yüklenmesi
5. Güvenlik belgelerinin yüklenmesi
6. Regülasyon uyumluluk belgelerinin yüklenmesi
7. Blockchain doğrulaması
8. Başvurunun onaya gönderilmesi

## 5. Bildirimler ve Uyarılar
- Onay durumu değişiklikleri
- Belge ve sertifika geçerlilik süreleri
- Sistem bildirimleri
- Eksik bilgi/belge uyarıları
- Blockchain doğrulama bildirimleri

## 6. Raporlama
- Ürün istatistikleri
- DPC durumları
- Belge ve sertifika geçerlilik raporları
- Blockchain doğrulama raporları
- Aktivite logları