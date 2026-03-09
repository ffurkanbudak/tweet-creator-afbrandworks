# AFBrandworks Tweet Manager - Kurulum Rehberi

## 1. Projeyi bilgisayarına indir

Terminalde şu komutları sırayla çalıştır:

```bash
cd ~/Desktop
mkdir afbrandworks-tweets
cd afbrandworks-tweets
```

Ardından tüm dosyaları bu klasöre kopyala.

## 2. Bağımlılıkları yükle

```bash
npm install
```

## 3. .env.local dosyasını düzenle

`.env.local` dosyasındaki placeholder'ları gerçek key'lerle değiştir:

```
NEXT_PUBLIC_SUPABASE_URL=https://fwrbzgurkmabcoijplke.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Klhvm7e... (tam key)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_X4znv... (tam key)

TWITTER_API_KEY=senin_consumer_key
TWITTER_API_SECRET=senin_consumer_secret
TWITTER_ACCESS_TOKEN=senin_access_token
TWITTER_ACCESS_TOKEN_SECRET=senin_access_token_secret
TWITTER_BEARER_TOKEN=senin_bearer_token

ANTHROPIC_API_KEY=senin_anthropic_api_key
```

## 4. Lokal test

```bash
npm run dev
```

Tarayıcıda http://localhost:3000 aç.

## 5. GitHub'a push

```bash
git init
git add .
git commit -m "initial: afbrandworks tweet manager"
git remote add origin https://github.com/KULLANICI_ADIN/afbrandworks-tweets.git
git push -u origin main
```

## 6. Vercel'e deploy

1. vercel.com'a git
2. "Import Project" > GitHub repo seç
3. Environment Variables kısmına .env.local'deki tüm key'leri ekle
4. Deploy

## 7. Twitter API key'leri yenile

Ekran görüntüsünde key'ler göründüğü için:
1. console.x.com > Apps > AFBrandworks Tweet Manager
2. Her key için "Regenerate" butonuna bas
3. Yeni key'leri .env.local ve Vercel env vars'a güncelle

## Dosya Yapısı

```
afbrandworks-tweets/
├── app/
│   ├── api/
│   │   ├── tweets/route.js    # Tweet CRUD
│   │   ├── generate/route.js  # AI tweet üretimi
│   │   └── publish/route.js   # Twitter'a paylaşım
│   ├── globals.css
│   ├── layout.js
│   └── page.js                # Ana dashboard
├── lib/
│   ├── supabase.js            # Supabase client
│   └── twitter.js             # Twitter client
├── .env.local
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── jsconfig.json
```
