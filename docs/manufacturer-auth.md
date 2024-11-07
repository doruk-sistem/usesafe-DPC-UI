# Üretici Kayıt ve Giriş Süreçleri

## 1. Üretici Kayıt Süreci

### 1.1 Kayıt Yetkilisi
- Sadece tüzel kişiliğin yasal sahibi/yetkili müdürü kayıt yapabilir
- Kayıt yapan kişi otomatik olarak "Firma Sahibi" rolüne sahip olur
- Firma başına sadece bir "Firma Sahibi" rolü olabilir

### 1.2 Kayıt Adımları

#### 1.2.1 Firma Bilgileri
Zorunlu Alanlar:
- Şirket ünvanı (*)
- Vergi kimlik numarası (*)
  - 10 haneli olmalı

Opsiyonel Alanlar:
- Ticaret sicil numarası
- Mersis numarası

#### 1.2.2 Yetkili (Firma Sahibi) Bilgileri
Zorunlu Alanlar:
- Ad soyad (*)
- T.C. kimlik numarası (*)
  - 11 haneli olmalı
  - İlk hanesi 0 olamaz
  - Son hanesi çift sayı olmalı
  - İlk 10 hanenin toplamının birler basamağı, 11. haneye eşit olmalı
  - 1, 3, 5, 7, 9. hanelerin toplamının 7 katından, 2, 4, 6, 8. hanelerin toplamı çıkarıldığında elde edilen sonucun birler basamağı, 10. haneye eşit olmalı
- Kurumsal e-posta adresi (*)
  - Geçerli bir e-posta formatında olmalı (örneğin, example@domain.com)
- Cep telefonu numarası (*)
  - Ülke kodu seçimi yapılmalı (örneğin, Türkiye için +90)
  - Başında 0 olmadan girilmeli
  - 10 haneli olmalı (örneğin, 5XX XXX XXXX)

#### 1.2.3 Adres Bilgileri
Zorunlu Alanlar:
- Merkez ofis adresi (*)
- İl (*)
- İlçe (*)

Opsiyonel Alanlar:
- Posta kodu
- Şube adresleri
- Fabrika adresleri
- Depo adresleri

#### 1.2.4 Zorunlu Belgeler (Tümü Zorunlu)
- İmza sirküleri (*)
- Ticaret sicil gazetesi (*)
- Vergi levhası (*)
- Faaliyet belgesi (*)

#### 1.2.5 Opsiyonel Belgeler
- ISO belgeleri
- Kalite sertifikaları
- İhracat belgeleri
- Üretim izin belgeleri

### 1.3 Doğrulama Süreci
- E-posta doğrulama (*)
- Belge kontrolü (Admin onayı) (*)

### 1.4 Hesap Aktivasyonu
- Admin onayı sonrası hesap aktif edilir
- Firma sahibine bilgilendirme e-postası gönderilir

## 2. Giriş Sistemi

### 2.1 Kullanıcı Rolleri
- Firma Sahibi: Tüm yetkilere sahip (firma bilgilerini düzenleme, çalışan yönetimi, tüm işlemler)
- Çalışan: Sınırlı yetkiler (ürün ve belge yönetimi, DPC başvuruları)

### 2.2 Giriş Yöntemi
- E-posta ve şifre ile giriş

### 2.3 Yetki Kontrolleri
- Her kullanıcı rolüne göre tanımlanmış sayfalara erişebilir
- Yetkisiz sayfalara erişim engellenir
- Tüm işlemler log'lanır

## 3. Kullanıcı Yönetimi (Firma Sahibi Yetkileri)

### 3.1 Yeni Kullanıcı Ekleme
- Çalışan bilgileri girişi
- Davet e-postası gönderimi

### 3.2 Kullanıcı Silme
- Kullanıcı hesabının tamamen silinmesi

## 4. Güvenlik Önlemleri

### 4.1 Şifre Politikaları
- Minimum 6 karakter (*)
- En az 1 sayı (*)

### 4.2 Oturum Güvenliği
- Otomatik oturum sonlandırma (24 saat)
- Basit IP kontrolü (şüpheli lokasyonlardan giriş engelleme)

### 4.3 Erişim Logları
- Giriş bilgileri
- Önemli işlemler
- Tarih/saat bilgileri

## 5. UI Akış Senaryoları

### 5.1 Yeni Kayıt Sonrası Akış
1. Kayıt formunu doldurur ve gönderir
2. Başarılı kayıt bildirimi gösterilir
3. E-posta doğrulama linki gönderilir
4. Kullanıcı e-postasını doğrular
5. Bekleme sayfasına yönlendirilir
   - "Başvurunuz inceleniyor" mesajı
   - Tahmini onay süresi bilgisi
   - Eksik belge/bilgi varsa bilgilendirme
6. Admin onayı sonrası:
   - Bilgilendirme e-postası alır
   - Giriş yapabileceği link gönderilir
7. İlk girişte:
   - Hoşgeldiniz ekranı gösterilir
   - Kısa bir platform turu sunulur
   - Yapılması gereken ilk adımlar listelenir
   - Dashboard'a yönlendirilir

### 5.2 Normal Giriş Sonrası Akış
1. E-posta ve şifre ile giriş yapar
2. Son giriş bilgileri gösterilir
3. Rol kontrolü yapılır:
   
   Firma Sahibi ise:
   - Dashboard ana sayfasına yönlendirilir
   - Bekleyen onay/işlem varsa bildirim gösterilir
   - Eksik belge varsa uyarı gösterilir
   
   Çalışan ise:
   - Kısıtlı dashboard'a yönlendirilir
   - Sadece yetkili olduğu modüller gösterilir

### 5.3 Oturum Zaman Aşımı
1. 24 saat sonra oturum sonlanır
2. Kullanıcıya bildirim gösterilir
3. Yeniden giriş yapması istenir
4. Giriş sonrası kaldığı sayfaya yönlendirilir

### 5.4 Hata Senaryoları
1. Yanlış giriş bilgileri:
   - Hata mesajı gösterilir
   - Kalan deneme hakkı bildirilir
   
2. Sistem bakımda:
   - Bakım sayfası gösterilir
   - Tahmini süre bilgisi verilir

### 5.5 Şifre İşlemleri
1. Şifremi Unuttum:
   - E-posta adresi istenir
   - Sıfırlama linki gönderilir
   - Yeni şifre belirlenir
   - Giriş sayfasına yönlendirilir

2. Şifre Değiştirme:
   - Mevcut şifre doğrulanır
   - Yeni şifre belirlenir
   - Başarılı değişiklik bildirimi gösterilir