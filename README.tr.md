# GitHub Contribution Graph Art CLI 🎨

GitHub contribution graph'ınıza yazı, şekil ve desenler ekleyen interaktif CLI aracı.

## 🚀 Özellikler

### İnteraktif CLI Modu
- ✨ Adım adım pattern oluşturma
- 📊 GitHub profil analizi
- 💾 Pattern kaydetme ve yükleme
- 🎨 Hazır şekiller (kalp, yıldız, üçgen, kare, elmas)
- 🌊 Efektler (dalga, satranç tahtası, spiral)
- 📝 Metin yazdırma (A-Z, 0-9)
- 🔍 Boş alan tespiti ve öneri sistemi

### GitHub Profil Analizi
- Mevcut contribution verilerini çeker
- Boş alanları tespit eder
- Pattern yerleştirme önerileri sunar
- Yıllık istatistikler gösterir

## 📦 Kurulum

```bash
# Repoyu klonla
git clone https://github.com/muhammetalisongur/graphic-contribution-greening.git
cd graphic-contribution-greening

# Bağımlılıkları yükle
npm install
```

## 🔧 Konfigürasyon

### GitHub Token (Opsiyonel - Profil analizi için)

Personal Access Token (Classic) oluşturun:

**Hızlı Link:** [Token Oluştur (Classic)](https://github.com/settings/tokens/new)

Veya manuel:

1. GitHub → **Settings** (sağ üst köşede profil resminize tıklayın)
2. Aşağı kaydırın → **Developer settings** (sol menü)
3. **Personal access tokens** → **Tokens (classic)** tıklayın
4. **Generate new token** → **Generate new token (classic)** seçin
5. Formu doldurun:
   - **Note**: Token'ınıza isim verin (örn: "Contribution Graph CLI")
   - **Expiration**: Son kullanma tarihi seçin (önerilen: 90 gün)
   - **Select scopes**: **`read:user`** işaretleyin (profil verilerini okuma için)
6. **Generate token** butonuna tıklayın (sayfanın altında)
7. **⚠️ Önemli**: Token'ı hemen kopyalayın - bir daha göremezsiniz!
8. Proje klasöründe `.env` dosyası oluşturun ve token'ı ekleyin:

```env
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_USERNAME=your_github_username_here
```

## 🎮 Kullanım

### İnteraktif CLI Modu (Önerilen)

```bash
npm start
```

veya

```bash
node bin/cli.js
```

Açılan menüden:
1. **🎨 Yeni Pattern Oluştur** - Yazı, şekil veya efekt ekle
2. **📊 GitHub Profil Analizi** - Mevcut contribution'ları analiz et
3. **📂 Kayıtlı Pattern Yükle** - Önceden kaydettiğin pattern'leri kullan
4. **⚙️ Ayarlar** - Token ve kullanıcı adı ayarla

## 🎨 Pattern Türleri

### 📝 Yazı Yazdırma
```javascript
// "HELLO" yazısını 10. haftadan itibaren yaz
{
  type: "text",
  content: "HELLO",
  startWeek: 10,
  intensity: 3
}
```

### 🎨 Hazır Şekiller
- ❤️ Kalp
- ⭐ Yıldız
- 📐 Üçgen
- ⬜ Kare
- 🔷 Elmas

### 🌊 Efektler
- Dalga deseni
- Satranç tahtası
- Diyagonal çizgi
- Spiral
- Random

### 📊 Manuel Pattern
Hafta ve gün bazında özel commit sayıları belirleme

## 📋 CLI Akışı

```
1. Yıl Seçimi (2020-2025)
   ↓
2. Mod Seçimi (Yazı/Şekil/Efekt/Manuel)
   ↓
3. Parametreleri Belirleme
   ↓
4. Önizleme
   ↓
5. Kaydet/Gönder/İptal
```

## 🔍 GitHub Profil Analizi

Analiz özellikleri:
- Toplam contribution sayısı
- Boş/dolu gün oranı
- En yoğun gün tespiti
- Aylık trend analizi
- Boş alan önerileri

## 💾 Pattern Yönetimi

Pattern'lerinizi kaydedin ve tekrar kullanın:
- Kaydetme: Pattern oluşturduktan sonra "💾 Kaydet" seçeneği
- Yükleme: Ana menüden "📂 Kayıtlı Pattern Yükle"
- Silme: Ayarlardan tüm pattern'leri temizleme

## 🛠️ Gelişmiş Özellikler

### Gradient Efekti
Pattern'e kademeli yoğunluk ekler

### Alternating Efekti
Ardışık commit'lerde farklı yoğunluklar

### Shadow Efekti
Pattern'e gölge ekler

### Multi-Pattern
Birden fazla pattern'i birleştirme

## 📊 Visualizer Modları

- **ASCII**: Terminal'de basit görünüm
- **Color**: Renkli terminal görünümü
- **Emoji**: Emoji ile görselleştirme

## 📁 Proje Yapısı

```
graphic-contribution-greening/
├── bin/
│   └── cli.js              # CLI giriş noktası
├── src/
│   ├── constants/          # Uygulama sabitleri (mesajlar, config)
│   │   ├── cli-messages.js
│   │   ├── messages.js
│   │   └── config.js
│   ├── core/               # Temel mantık (grid, pattern'ler, yazı)
│   │   ├── grid-calculator.js
│   │   ├── pattern-builder.js
│   │   └── text-to-pattern.js
│   ├── services/           # Dış servisler (GitHub API, config)
│   │   ├── github-analyzer.js
│   │   └── config-manager.js
│   ├── ui/                 # Kullanıcı arayüzü (CLI, görselleştirme)
│   │   ├── cli-interface.js
│   │   └── visualizer.js
│   └── utils/              # Yardımcı fonksiyonlar
│       ├── pattern-utils.js
│       └── date-helpers.js
├── patterns/               # Pattern tanımları (harfler, şekiller)
│   └── letters.js
└── contribution-tracker.json  # Commit takip verisi
```

## 🚀 Geliştirme Komutları

```bash
# CLI'yi başlat (interaktif mod)
npm start

# Geliştirme modunda çalıştır
npm run dev
```

## ⚠️ Önemli Notlar

1. **Yıl Başı Offset**: Yıllar her zaman Pazar'dan başlamaz - bazı yılların başındaki kutular boş olabilir
2. **Commit Limitleri**: Çok yüksek commit sayıları şüpheli görünebilir
3. **Private Repo**: Test için private repo kullanmanız önerilir
4. **Rate Limiting**: GitHub API rate limit'e dikkat edin
5. **Hesap Yaşı**: Hesap oluşturma tarihinden önce commit atmak şüpheli görünür

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Pull Request göndermekten çekinmeyin.

1. Repo'yu fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/HarikaBirOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Harika bir özellik ekle'`)
4. Branch'inizi push edin (`git push origin feature/HarikaBirOzellik`)
5. Pull Request açın

### Geliştirme Kuralları

- Mevcut kod stiline uyun
- Anlamlı commit mesajları yazın
- Dokümantasyonu güncelleyin
- Commit'lemeden önce manuel test yapın

## 📄 Lisans

ISC

## 🙏 Teşekkürler

- [simple-git](https://github.com/steveukx/git-js) - Git işlemleri
- [inquirer](https://github.com/SBoudrias/Inquirer.js) - İnteraktif CLI
- [chalk](https://github.com/chalk/chalk) - Terminal renklendirme
- [ora](https://github.com/sindresorhus/ora) - Loading spinner'ları
- [moment](https://github.com/moment/moment) - Tarih manipülasyonu
- [axios](https://github.com/axios/axios) - HTTP client

## 📧 İletişim

GitHub: [@muhammetalisongur](https://github.com/muhammetalisongur)

## 🌟 Destek

Projeyi beğendiyseniz ⭐️ vermeyi unutmayın!

---

**Not**: Bu araç eğitim ve sanatsal amaçlar içindir. Sorumlu kullanın ve GitHub Kullanım Şartları'na dikkat edin.
