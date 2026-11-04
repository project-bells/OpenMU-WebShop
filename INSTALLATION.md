# คู่มือการติดตั้งและใช้งาน Open-Webshop (React + OpenMU-Origins Edition)
# Installation & Deployment Guide

เอกสารฉบับนี้จัดทำขึ้นโดย Senior Security Engineer และ Technical Writer เพื่อแนะนำขั้นตอนการติดตั้ง ตั้งค่าสภาพแวดล้อม และแนวทางปฏิบัติด้านความปลอดภัย (Security Best Practices) สำหรับระบบ **Open-Webshop (React & TypeScript Edition)** ที่เชื่อมต่อกับ **OpenMU-Origins** (C# .NET & PostgreSQL)

---

## 1. Project Overview (ภาพรวมโครงการ)

**Open-Webshop (React Edition)** คือระบบเว็บช็อปสำหรับเกม MMORPG (MU Online) ที่ได้รับการเขียนใหม่ทั้งหมดจาก Open-Webshop v0.9 (PHP/MSSQL ดั้งเดิม) มาเป็นโมเดิร์นเว็บแอปพลิเคชัน Full-Stack พร้อมระบบจำลองและเชื่อมต่อ **OpenMU-Origins Public API & CashShop**:
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion (Framer Motion)
- **Backend / API Bridge**: Node.js, Express, TSX, Vite Server Middleware
- **Game Server Integration**: เชื่อมต่อ OpenMU-Origins (PostgreSQL Schema: `data."Account"`, `data."ItemStorage"`, `data."CashShopCoinGrant"`)
- **Payment Gateways**: TrueMoney Wallet (ระบบซองอั่งเปา & บัตรเงินสด) และ PayPal REST Checkout API
- **Key Features**: 
  - คลังเก็บของเสมือนจริง 8×15 Warehouse Vault Grid
  - ระบบตีบวก สุ่มออปชัน Excellent และ Ancient Stamina
  - ระบบสมาชิก VIP (+30% EXP / +20% Drop)
  - ระบบรีเซ็ตพอยต์ตามสายอาชีพคำนวณแม่นยำ
  - ซื้อ-ลบตัวละครเลเวล 400 รับเครดิต
  - ระบบออนไลน์แลกเครดิต (1 ชม. = 5 Cr)
  - ระบบแอดมินครบวงจร 8 โมดูล (Item Manager, Group Manager, Credit Manager, Hawk Eye Logs, Serial Search, Top Accounts, User Vault Viewer, IP Ban Manager)

---

## 2. Prerequisites (สิ่งที่ต้องติดตั้งล่วงหน้า)

ก่อนเริ่มการติดตั้ง กรุณาตรวจสอบว่าเครื่องเซิร์ฟเวอร์หรือเครื่องพัฒนาติดตั้งเครื่องมือดังต่อไปนี้ครบถ้วน:

| ซอฟต์แวร์ / เครื่องมือ | เวอร์ชันที่แนะนำ | วัตถุประสงค์ |
|---|---|---|
| **Node.js** | `>= 20.12.0 LTS` (แนะนำ Node 22.x) | สภาพแวดล้อมรัน JavaScript / TypeScript |
| **npm** หรือ **bun** | npm `>= 10.x` หรือ bun `>= 1.1.x` | ตัวจัดการแพ็กเกจ (Package Manager) |
| **Git** | `>= 2.40.0` | จัดการ Source Code จาก GitHub |
| **PostgreSQL** *(อุปกรณ์เสริม)* | `>= 15.0` | ฐานข้อมูลหลักของ OpenMU-Origins |
| **Docker & Docker Compose** *(อุปกรณ์เสริม)* | `>= 24.0` | สำหรับรันเซิร์ฟเวอร์ OpenMU-Origins ในคอนเทนเนอร์ |

---

## 3. Environment Variables (การตั้งค่าตัวแปรแวดล้อม)

คัดลอกไฟล์ `.env.example` ไปเป็น `.env` ใน Root Directory:

```bash
cp .env.example .env
```

### รายละเอียดตัวแปรแวดล้อมใน `.env`:

| ตัวแปรแวดล้อม | ค่าเริ่มต้น / ตัวอย่าง | จำเป็น | คำอธิบายความปลอดภัย |
|---|---|:---:|---|
| `PORT` | `3000` | ไม่ | พอร์ตสำหรับ Express Web Server |
| `NODE_ENV` | `development` หรือ `production` | ใช่ | ควบคุมโหมด Vite Dev Server และการแสดง Stack Trace |
| `OPENMU_API_URL` | `http://localhost:5000` | ใช่ | URL ของเซิร์ฟเวอร์ OpenMU-Origins Web API |
| `OPENMU_API_KEY` | `your_secret_api_key_32_chars` | ใช่ | คีย์ลับสำหรับยืนยันตัวตนกับ OpenMU API (ห้ามเปิดเผย) |
| `OPENMU_DATABASE_URL` | `postgresql://user:pass@localhost:5432/openmu` | ไม่ | Connection String สำหรับต่อตรง PostgreSQL |
| `PAYPAL_CLIENT_ID` | `AQkO...` | ไม่ | Client ID จาก PayPal Developer Dashboard |
| `PAYPAL_CLIENT_SECRET` | `EL_...` | ไม่ | Client Secret จาก PayPal (ห้ามใส่ใน Client-Side) |
| `PAYPAL_USE_SANDBOX` | `true` | ใช่ | `true` สำหรับทดสอบ, `false` เมื่อใช้งานจริง |
| `TRUEMONEY_MERCHANT_PHONE` | `0891234567` | ใช่ | เบอร์โทรศัพท์บัญชี TrueMoney Wallet ผู้รับเงิน |
| `TRUEMONEY_WEBHOOK_SECRET` | `secret_signature_hash` | ไม่ | Secret Key สำหรับตรวจสอบ Signature ของ Webhook |
| `VITE_CF_TURNSTILE_SITE_KEY` | `1x00000000000000000000AA` | ใช่ | Public Site Key สำหรับแสดงผล Cloudflare Turnstile Widget ฝั่ง Frontend |
| `CF_TURNSTILE_SITE_KEY` | `1x00000000000000000000AA` | ใช่ | Public Site Key สำหรับเซิร์ฟเวอร์ |
| `CF_TURNSTILE_SECRET_KEY` | `1x0000000000000000000000000000000AA` | ใช่ | Secret Key สำหรับ Backend ตรวจสอบ token กับ Cloudflare API (ห้ามเปิดเผย) |

> ⚠️ **คำเตือนความปลอดภัย**: ห้าม Commit ไฟล์ `.env` ที่มีข้อมูลจริงขึ้นสู่ Git Repository โดยเด็ดขาด ให้ใส่ `.env` ไว้ใน `.gitignore` เสมอ

### การขอรับและการตั้งค่า Cloudflare Turnstile (Turnstile Setup)
Cloudflare Turnstile เป็นระบบ CAPTCHA ทางเลือกที่ทำงานแบบ Smart Bot Challenge โดยไม่รบกวนผู้เล่น:
1. เข้าสู่ระบบ [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. ในเมนูด้านซ้าย เลือก **Turnstile** (หรือเข้าผ่าน URL: `https://dash.cloudflare.com/?to=/:account/turnstile`)
3. คลิกปุ่ม **Add site**
4. ตั้งค่า:
   - **Site name**: `Open-Webshop MU Online`
   - **Domain**: ใส่โดเมนของคุณ เช่น `webshop.lorencia.mu` (หรือระบุ `localhost` สำหรับ Local Development)
   - **Widget Mode**: แนะนำ **Managed** (วิเคราะห์พฤติกรรมอัตโนมัติ)
5. คัดลอก **Site Key** นำไปใส่ใน `VITE_CF_TURNSTILE_SITE_KEY` และ `CF_TURNSTILE_SITE_KEY`
6. คัดลอก **Secret Key** นำไปใส่ใน `CF_TURNSTILE_SECRET_KEY`
7. *สำหรับการทดสอบ Local Development*: Cloudflare มี Universal Test Keys ให้ใช้ทดสอบได้ทันที:
   - Test Site Key (ผ่านเสมอ): `1x00000000000000000000AA`
   - Test Secret Key (ผ่านเสมอ): `1x0000000000000000000000000000000AA`

---

## 4. Step-by-Step Installation (ขั้นตอนการติดตั้งทีละขั้นตอน)

### ขั้นตอนที่ 1: Clone โครงการจาก GitHub
```bash
git clone https://github.com/project-bells/Open-Webshop.git
cd Open-Webshop
```

### ขั้นตอนที่ 2: ติดตั้ง Dependencies
```bash
npm install
```
*(หรือหากใช้ Bun: `bun install`)*

### ขั้นตอนที่ 3: สร้างและตั้งค่าไฟล์ Environment
```bash
cp .env.example .env
nano .env  # แก้ไขค่าตามสภาพแวดล้อมของคุณ
```

### ขั้นตอนที่ 4: การตั้งค่าฐานข้อมูล OpenMU-Origins (กรณีใช้งานร่วมกับ OpenMU)
หากคุณใช้งานร่วมกับเซิร์ฟเวอร์ [OpenMU-Origins](https://github.com/project-bells/OpenMU-Origins.git):
1. ตรวจสอบให้แน่ใจว่า PostgreSQL และ OpenMU Database Engine ทำงานอยู่
2. ตรวจสอบว่าใน schema `data` มีตารางดังนี้:
   - `data."Account"` (คอลัมน์ `LoginName`, `PasswordHash`, `VaultPasswordHash`, `E-Mail`, `State`, `VipExpiry`)
   - `data."ItemStorage"` (สำหรับเก็บไอเทมในคลัง Warehouse Vault)
   - `data."CashShopCoinGrant"` (สำหรับประวัติการเติม WCoinC, WCoinP, GoblinPoints)
3. กำหนด `X-Api-Key` ใน `OpenMU.AdminPanel` ให้ตรงกับ `OPENMU_API_KEY` ในไฟล์ `.env`

---

## 5. Running the Application (การรันแอปพลิเคชัน)

### โหมดพัฒนา (Development Mode)
รัน Dev Server พร้อม Hot Module Replacement (Vite + Express Bridge):
```bash
npm run dev
```
เข้าใช้งานผ่านเบราว์เซอร์: `http://localhost:3000`

### การตรวจสอบ Syntax และ Type Check (Linting)
```bash
npm run lint
```

### การ Build สำหรับ Production
สร้างโค้ดที่ผ่านการ Optimize และ Minify สำหรับ Production:
```bash
npm run build
```

### การรันในโหมด Production
```bash
export NODE_ENV=production
npm start
```
*(แนะนำให้ใช้ Process Manager เช่น PM2: `pm2 start server.ts --name open-webshop`)*

---

## 6. Security Checklist ก่อนขึ้น Production (Production Hardening)

ก่อนนำระบบขึ้น Production เพื่อให้บริการผู้เล่นจริง โปรดตรวจสอบรายการด้านล่างนี้ให้ครบถ้วน:

- [ ] **1. เปลี่ยนรหัสผ่านและค่า Default Secret**:
  - เปลี่ยนรหัสผ่านบัญชีเริ่มต้นทั้งหมด (`netsplit`, `admin`) ทันที
  - สร้าง `OPENMU_API_KEY` ที่มีความยาวไม่ต่ำกว่า 32 ตัวอักษร สุ่มด้วย Cryptographic Generator
- [ ] **2. ติดตั้ง HTTP Security Headers (Helmet)**:
  - ติดตั้ง `helmet` ใน Express เพื่อป้องกัน Clickjacking, MIME Sniffing, และ Cross-Site Scripting
- [ ] **3. ตั้งค่า CORS (Cross-Origin Resource Sharing)**:
  - ระบุโดเมนที่อนุญาตเฉพาะเจาะจง (Whitelist Domain) ห้ามใช้ `Access-Control-Allow-Origin: *`
- [ ] **4. เปิดใช้งาน Rate Limiting (ป้องกัน Brute Force)**:
  - จำกัดความถี่ในการเรียก Endpoint สำคัญ เช่น `/api/openmu/login`, `/api/openmu/register`, `/api/payments/*`
- [ ] **5. ปิดโหมด Debug และ Sandbox ใน Production**:
  - ตั้งค่า `PAYPAL_USE_SANDBOX=false`
  - ตรวจสอบว่า `NODE_ENV=production` เพื่อไม่ให้ระบบส่ง Stack Trace สู่ผู้ใช้
- [ ] **6. บังคับใช้งาน HTTPS (SSL/TLS)**:
  - ติดตั้ง SSL Certificate (เช่น Let's Encrypt / Cloudflare) หน้า Reverse Proxy (Nginx / Caddy)
  - กำหนดค่า `Strict-Transport-Security` (HSTS)
- [ ] **7. ตรวจสอบการยืนยันสิทธิ์ API (Authentication & Authorization)**:
  - ตรวจสอบว่า Endpoint การเพิ่ม Coins (`/api/accounts/:loginName/cash-shop/grants`) มีการตรวจสอบสิทธิ์แอดมินหรือ `X-Api-Key` เสมอ

---

## 7. Troubleshooting (ปัญหาที่พบบ่อยและวิธีแก้ไข)

### ปัญหาที่ 1: `Error: listen EADDRINUSE: address already in use :::3000`
* **สาเหตุ**: พอร์ต 3000 ถูกใช้งานโดยโปรเซสอื่นอยู่
* **วิธีแก้ไข**: ตรวจสอบโปรเซสและปิดโปรเซสเดิม หรือเปลี่ยนพอร์ตใน `.env`:
  ```bash
  lsof -i :3000
  kill -9 <PID>
  # หรือระบุ PORT=3001 npm start
  ```

### ปัญหาที่ 2: เชื่อมต่อ OpenMU-Origins API ไม่ได้ (`Fetch failed / Connection Refused`)
* **สาเหตุ**: เซิร์ฟเวอร์ OpenMU-Origins ยังไม่ได้เปิด หรือระบุ `OPENMU_API_URL` ผิดพลาด
* **วิธีแก้ไข**: 
  - ตรวจสอบว่า OpenMU-Origins รันอยู่ที่พอร์ตใด (เช่น `5000` หรือ `80`)
  - ตรวจสอบ Firewall / Security Group อนุญาตให้พอร์ตเชื่อมต่อหากอยู่คนละเซิร์ฟเวอร์
  - ทดสอบ Ping และ Curl จากเครื่อง WebShop: `curl -I http://localhost:5000/api/status`

### ปัญหาที่ 3: เติมเงิน TrueMoney หรือ PayPal แล้วสถานะขึ้น `AlreadyGranted (409 Conflict)`
* **สาเหตุ**: ระบบตรวจจับว่ารหัสอ้างอิง (Reference / Voucher Code) ถูกใช้งานไปแล้ว เพื่อป้องกันการส่งคำขอซ้ำซ้อน (Idempotent Anti-Replay Protection)
* **วิธีแก้ไข**: เป็นการทำงานที่ถูกต้องของระบบความปลอดภัย หากต้องการทดสอบ ให้ใช้ซองอั่งเปาใหม่ หรือสร้าง Transaction Token ใหม่

### ปัญหาที่ 4: การแสดงผลภาษาไทยหรือภาษาต่างประเทศไม่ถูกต้อง
* **สาเหตุ**: การตั้งค่าฟอนต์หรือ Encode ไม่เป็น UTF-8
* **วิธีแก้ไข**: เว็บช็อปรองรับ UTF-8 อย่างสมบูรณ์ ตรวจสอบว่าไฟล์และฐานข้อมูลกำหนด Character Encoding เป็น `UTF8`
