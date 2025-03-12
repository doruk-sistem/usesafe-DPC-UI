# Implementation Details

## Authentication Flow

### Token Management
- JWT tokens stored in HTTP-only cookies
- Automatic token verification on application load
- Token expiration handling
- Secure token removal on sign out

### State Management
- React Context for global auth state
- Custom useAuth hook for component access
- Automatic state updates on auth changes
- Loading state management

### Components
1. AuthProvider
   - Wraps application for global auth state
   - Handles token verification
   - Provides auth context to components

2. UserNav Component
   - Displays user profile
   - Handles user actions
   - Manages dropdown menu
   - Implements sign out functionality

3. Navbar Integration
   - Conditional rendering based on auth state
   - Smooth transitions between states
   - Loading state handling

## Security Measures
- Secure cookie handling
- Protected route middleware
- Token verification
- XSS prevention
- CSRF protection

## Code Organization
- Separation of concerns
- Modular component structure
- Reusable hooks and utilities
- Clear type definitions
- Consistent error handling

## Authentication & Authorization

Bu sistemde kimlik doğrulama ve yetkilendirme Supabase tarafından sağlanmaktadır. Uygulamada çeşitli kullanıcı rolleri mevcuttur:

- Admin: Tüm platformu yönetir
- Company (Firma): Kendi ürünlerini ve alt yüklenicilerini (suppliers) yönetir
- Supplier (Üretici): Kendisine atanan DPP'leri görüntüler ve doldurur

### Davet ve Doğrulama Süreci

Firmalar kendi alt yüklenicilerini (supplier) davet edebilmektedir. Bu süreç şu şekilde işler:

1. Firma, bir e-posta adresi ve firma adı belirterek alt yüklenici davet eder
2. Davet işlemi sırasında `user_metadata` alanına firma bilgileri eklenirken e-postasına davet gönderilir
3. Kullanıcı, e-postasındaki davet bağlantısına tıkladığında, güvenlik için `/auth/approval` sayfasına yönlendirilir
4. Bu sayfa, Supabase doğrulama URL'sini güvenli bir şekilde işler ve kullanıcıyı gerçek doğrulama işlemi için yönlendirir
5. Doğrulama tamamlandıktan sonra, kullanıcı `/auth/callback` sayfasına yönlendirilir
6. Bu sayfada kullanıcı şifresini belirler ve hesabını aktifleştirir
7. Şifre belirlendikten sonra, kullanıcı otomatik olarak giriş yapar ve dashboard'a yönlendirilir

Bu güvenli doğrulama süreci, e-posta bağlantılarının önizlemesi sırasında oluşabilecek güvenlik sorunlarına karşı korunma sağlar ve kullanıcı deneyimini iyileştirir.