# 🚀 NGO ERP — সম্পূর্ণ অনলাইন লাইভ ডিপ্লয়মেন্ট গাইড (Production Live Deployment Guide)

এই গাইডে **Firebase (Database & Auth)**, **Cloudflare (Frontend Hosting & Custom Domain)**, এবং **Cloudinary (Image/Storage)** সেটআপ করে প্রজেক্ট সম্পূর্ণ লাইভে নেওয়ার ধাপে ধাপে নির্দেশনা দেওয়া হয়েছে।

---

## ১. ফায়ারবেস কনফিগারেশন (Firebase Database & Authentication)

> [!TIP]
> আপনার কম্পিউটারের টার্মিনালে অন্য কোনো Firebase একাউন্ট লগইন করা থাকলে কোনো সমস্যা নেই! আপনি ব্রাউজার কনসোল ব্যবহার করে অথবা টার্মিনালে নতুন একাউন্ট সুইচ করে কাজ করতে পারেন।

### ধাপ ১.১: ফায়ারবেস প্রজেক্ট তৈরি করুন
1. [Firebase Console](https://console.firebase.google.com/)-এ যান এবং আপনার গুগল একাউন্টে লগইন করুন।
2. **"Add project"**-এ ক্লিক করে নতুন প্রজেক্ট তৈরি করুন (যেমন: `ngo-erp-platform` বা আপনার পছন্দমতো নাম)।
3. Google Analytics প্রয়োজন না থাকলে বন্ধ রেখে **Create project** চাপুন।

### ধাপ ১.২: Authentication চালু করুন
1. বাম পাশের মেনু থেকে **Build > Authentication**-এ যান।
2. **Get Started** ক্লিক করুন।
3. **Sign-in method** ট্যাব থেকে **Email/Password** সিলেক্ট করে **Enable** করুন এবং Save দিন।

### ধাপ ১.৩: Cloud Firestore ডাটাবেজ তৈরি করুন
1. বাম পাশের মেনু থেকে **Build > Firestore Database**-এ যান।
2. **Create database**-এ ক্লিক করুন।
3. Database location সিলেক্ট করুন: **`asia-south1 (Mumbai)`** (বাংলাদেশ থেকে সবচেয়ে ফাস্ট পিং ও রেসপন্স টাইম পাওয়ার জন্য)।
4. সিকিউরিটি রুলসে **Start in production mode** নির্বাচন করে Finish দিন।

### ধাপ ১.৪: ওয়েব অ্যাপ ক্রেডেনশিয়াল (Web API Keys) সংগ্রহ
1. ফায়ারবেস ড্যাশবোর্ডের উপরে গিয়ার আইকন (⚙️) থেকে **Project settings**-এ যান।
2. **General** ট্যাবের নিচে **"Your apps"** সেকশনে গিয়ে ওয়েব আইকন **`</>`**-এ ক্লিক করুন।
3. অ্যাপের নাম দিন (যেমন: `NGO ERP Web`) এবং **Register app** চাপুন।
4. একটি `firebaseConfig` অবজেক্ট দেখতে পাবেন:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcd123"
   };
   ```

### ধাপ ১.৫: আপনার কম্পিউটারে অন্য একাউন্ট থাকলে ফায়ারবেস CLI হ্যান্ডেল করার উপায়
যদি আপনার টার্মিনালে আগে থেকেই অন্য কোনো ক্লায়েন্টের ফায়ারবেস একাউন্ট লগইন থাকে:
```bash
# বর্তমান লগইনকৃত একাউন্ট চেক করতে:
firebase login:list

# নতুন গুগল একাউন্ট যুক্ত করতে:
firebase login:add

# অথবা নির্দিষ্ট প্রজেক্টে লগইন টোকেন ব্যবহার করতে:
firebase use --add
```
> [!NOTE]
> টার্মিনালে ফায়ারবেস লগইন না করলেও চলে! আপনি ফায়ারবেস কনসোলের **Firestore Database > Rules** ট্যাবে গিয়ে সরাসরি আমাদের প্রজেক্টের `firestore.rules` ফাইলের লেখাগুলো কপি করে পেস্ট করে **Publish** করে দিতে পারেন!

---

## ২. ক্লাউডিনারি সেটআপ (Cloudinary Media & Documents Storage)

এনজিও লোগো, সদস্য ও কর্মীদের ছবি, এনআইডি স্ক্যান কপি ও সিটিজেন চার্টার ফাইল বিনামূল্যে নিরাপদে সংরক্ষণের জন্য ক্লাউডিনারি ব্যবহার করা হয়।

1. [Cloudinary Registration](https://cloudinary.com/users/register_free)-এ গিয়ে একটি ফ্রি একাউন্ট খুলুন।
2. ড্যাশবোর্ডে প্রবেশ করলে ৩টি গুরুত্বপূর্ণ তথ্য পাবেন:
   - **Cloud name** (যেমন: `dxyzk123`)
   - **API Key** (যেমন: `892716491724912`)
   - **API Secret**
3. **Upload Preset তৈরি করুন (Unsigned)**:
   - উপরে ডানপাশের গিয়ার আইকনে (⚙️ **Settings**) ক্লিক করুন।
   - বাম মেনু থেকে **Upload** ট্যাবে যান।
   - স্ক্রল করে নিচে গিয়ে **Upload presets** সেকশনে **Add upload preset**-এ ক্লিক করুন।
   - **Upload preset name**: দিন `ngo_erp_preset`
   - **Signing Mode**: সিলেক্ট করুন **`Unsigned`**
   - **Save** বাটনে চাপ দিন।

---

## ৩. প্রজেক্টের এনভায়রনমেন্ট ভ্যারিয়েবল (`.env`) কনফিগারেশন

আপনার প্রজেক্টের `apps/web` ফোল্ডারে গিয়ে `.env.example` ফাইলটিকে কপি করে `.env` নামে একটি ফাইল তৈরি করুন:

```env
# apps/web/.env
VITE_FIREBASE_API_KEY=AIzaSy...আপনার_এপিআই_কি
VITE_FIREBASE_AUTH_DOMAIN=আপনার_প্রজেক্ট.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=আপনার_প্রজেক্ট_আইডি
VITE_FIREBASE_STORAGE_BUCKET=আপনার_প্রজেক্ট.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=১০২৯৩৮৪৭৫৬১২
VITE_FIREBASE_APP_ID=১:১০২৯৩৮৪৭৫৬১২:web:abcd123

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=আপনার_ক্লাউড_নেম
VITE_CLOUDINARY_UPLOAD_PRESET=ngo_erp_preset
VITE_CLOUDINARY_API_KEY=আপনার_ক্লাউডিনারি_এপিআই_কি

# Cloudflare Worker (ঐচ্ছিক - এসএমএস প্রক্সি)
VITE_WORKER_API_URL=https://ngo-erp-worker.thakurgaonstore.workers.dev
```

এরপর প্রোডাকশন বান্ডেল তৈরি করুন:
```bash
npm run build --workspace=apps/web
```
এটি `apps/web/dist` ফোল্ডারে সুপার ফাস্ট লাইটওয়েট প্রোডাকশন রেডি ফাইল তৈরি করবে।

---

## ৪. ক্লাউডফ্লেয়ার পেজেস ডিপ্লয়মেন্ট (Cloudflare Pages Frontend & Custom Domain)

> [!IMPORTANT]
> ক্লাউডফ্লেয়ার পেজেস (Cloudflare Pages) সম্পূর্ণ **ফ্রি**, এতে আনলিমিটেড ব্যান্ডউইথ পাওয়া যায় এবং কাস্টম ডোমেইন ও সাবডোমেইনে স্বয়ংক্রিয়ভাবে বিনামূল্যে SSL সার্টিফিকেট দিয়ে দেয়।

### পদ্ধতি ১: গিটহাবের মাধ্যমে অটো ডিপ্লয়মেন্ট (সবচেয়ে সহজ ও স্ট্যান্ডার্ড)
1. আপনার প্রজেক্টটি আপনার [GitHub](https://github.com/)-এ পুশ করুন।
2. [Cloudflare Dashboard](https://dash.cloudflare.com/)-এ লগইন করুন।
3. বাম মেনু থেকে **Workers & Pages**-এ গিয়ে **Create application** চাপুন।
4. **Pages** ট্যাব সিলেক্ট করে **Connect to Git** চাপুন।
5. আপনার গিটহাব রিপোজিটরিটি নির্বাচন করুন।
6. বিল্ড সেটিংস দিন:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build --workspace=apps/web`
   - **Build output directory**: `apps/web/dist`
   - **Environment variables**: ধাপ ৩-এর `.env` ভ্যারিয়েবলগুলো এখানে যুক্ত করুন।
7. **Save and Deploy** চাপুন! ২ মিনিটের মধ্যে আপনার পুরো ওয়েবসাইট লাইভ হয়ে যাবে এবং একটি ফ্রি URL পাবেন (যেমন: `ngo-erp.pages.dev`)।

### পদ্ধতি ২: সরাসরি ডিরেক্ট আপলোড (গিটহাব ছাড়া)
টার্মিনালে Wrangler দিয়ে এক কমান্ডেই সরাসরি `dist` ফোল্ডার লাইভ করতে পারেন:
```bash
npx wrangler pages deploy apps/web/dist --project-name=ngo-erp
```

---

## ৫. কাস্টম ডোমেইন কানেক্ট করা (Custom Domain & Client Subdomains)

আপনার যদি নিজস্ব ডোমেইন থাকে (যেমন: `ngoerp.xyz` বা `yourdomain.com`):
1. Cloudflare Pages প্রজেক্ট ড্যাশবোর্ডে গিয়ে **Custom domains** ট্যাবে যান।
2. **Set up a custom domain**-এ ক্লিক করে আপনার ডোমেইন বা সাবডোমেইন নাম লিখুন (যেমন: `ngoerp.xyz` বা `app.ngoerp.xyz`)।
3. Cloudflare স্বয়ংক্রিয়ভাবে DNS CNAME রেকর্ড যুক্ত করে দিবে এবং বিনামূল্যে **SSL (https://)** চালু করে দিবে।
4. ক্লায়েন্টদের জন্য কাস্টম ডোমেইন (যেমন: `jagoranibd.org`):
   - ক্লায়েন্ট তাদের ডোমেইন প্রোভাইডারে গিয়ে একটি CNAME রেকর্ড দিয়ে আপনার ক্লাউডফ্লেয়ার পেজেসের ঠিকানা পয়েন্ট করে দিলেই সরাসরি তাদের ডোমেইনে তাদের ল্যান্ডিং পেজ ওপেন হবে!

---

## ৬. ব্যাকএন্ড এসএমএস ও অথ ওয়ার্কার ডিপ্লয়মেন্ট (Cloudflare Workers)

প্রজেক্টের `apps/workers` ডিরেক্টরিতে এসএমএস গেটওয়ে (bulksmsbd.net) এবং ক্লাউডিনারি সিগনেচারের এজ ওয়ার্কার তৈরি রয়েছে।
```bash
cd apps/workers
npx wrangler deploy
```
এটি ডিপ্লয় হলে একটি URL পাবেন (যেমন: `https://ngo-erp-worker.yourname.workers.dev`), যা আপনার `.env` ফাইলের `VITE_WORKER_API_URL`-এ বসিয়ে দিলেই কাজ করবে।
