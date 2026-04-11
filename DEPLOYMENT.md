# Rach Tours — Hostinger Deployment Guide

## Pre-Deployment Checklist

### 1. Credential Rotation (CRITICAL)

Before deploying, generate **new** values for ALL secrets:

```bash
# Generate strong random secrets (run in terminal):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Replace these in your `.env`:

- [ ] `WHATSAPP_TOKEN` — New token from Meta Developer Dashboard
- [ ] `ADMIN_API_TOKEN` — New random string (use the command above)
- [ ] `JWT_SECRET` — New random string (min 64 characters)
- [ ] `JWT_REFRESH_SECRET` — New random string (min 64 characters)
- [ ] `DB_PASSWORD` — Change in Hostinger MySQL panel, then update here
- [ ] `GOOGLE_SHEET_API_TOKEN` — New token if exposed

### 2. Environment Setup

```bash
# Copy the template
cp .env.example .env

# Edit with your REAL values
nano .env   # or use Hostinger File Manager
```

Set `NODE_ENV=production` in your `.env` file.

### 3. Upload Files

Upload everything EXCEPT:

- `node_modules/` (will be installed on server)
- `.env` (create on server directly)
- `.git/` (not needed in production)
- `rach_admin/` (Flutter app, separate deployment)
- `tests/` (not needed in production)

### 4. Install Dependencies

```bash
npm install --production
```

### 5. SSL Certificate

- Hostinger provides free SSL via Let's Encrypt
- Enable in: **Hosting → SSL/TLS → Install**
- Verify HTTPS works at `https://rach-tours.com`

### 6. Start the Application

**Option A: Hostinger Node.js Panel**

- Go to Hosting → Website → Node.js
- Set startup file: `server.js`
- Set Node.js version: 18+ (LTS)
- Click "Create"/"Start"

**Option B: PM2 (SSH Access)**

```bash
npm install -g pm2
pm2 start server.js --name rach-tours
pm2 save
pm2 startup
```

### 7. DNS Configuration

- Point your domain `rach-tours.com` to Hostinger nameservers
- Add an A record pointing to your VPS IP
- Wait for propagation (up to 48 hours)

---

## Post-Deployment Verification

1. **HTTPS**: Visit `https://rach-tours.com` — should load without certificate errors
2. **Health Check**: `curl https://rach-tours.com/api/health` — should return `{"success":true,"status":"ok"}`
3. **Security Headers**: Check at [securityheaders.com](https://securityheaders.com/?q=rach-tours.com)
4. **Sensitive Files Blocked**: `curl https://rach-tours.com/.env` — should return 403
5. **Reservation Test**: Submit a test reservation through the website

---

## Database Security (Hostinger MySQL)

### Least-Privilege Users

Create two MySQL users in Hostinger panel:

```sql
-- App User (day-to-day operations)
CREATE USER 'rachtours_app'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE ON u812989409_RESERVATIONS.* TO 'rachtours_app'@'localhost';

-- Migration User (schema changes only — use manually)
CREATE USER 'rachtours_admin'@'localhost' IDENTIFIED BY 'DIFFERENT_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON u812989409_RESERVATIONS.* TO 'rachtours_admin'@'localhost';
```

Use `rachtours_app` in your `.env` for the running application.

---

## CI/CD & Security Scanning (Recommended)

### SAST (Static Analysis)

- **npm audit**: Run `npm audit` before each deployment
- **Snyk**: Free tier at snyk.io for dependency vulnerability scanning
- **ESLint Security Plugin**: `eslint-plugin-security` for code-level issues

### DAST (Dynamic Testing)

- **OWASP ZAP**: Free, open-source web scanner
- **Burp Suite Community**: Manual penetration testing

### GitHub Actions (Optional)

Add `.github/workflows/security.yml` for automated scanning on push.

---

## Flutter Admin App — Release Build

### 1. Set SSL Pinning Fingerprint

After deploying the backend with SSL, get the certificate fingerprint:

```bash
openssl s_client -connect rach-tours.com:443 < /dev/null 2>/dev/null | openssl x509 -fingerprint -sha256 -noout
```

Update `lib/services/secure_http_client.dart` with the real fingerprint.

### 2. Build Release APK (with obfuscation)

```bash
cd rach_admin
flutter build apk --release --obfuscate --split-debug-info=build/debug-info
```

### 3. Build Release App Bundle (for Play Store)

```bash
flutter build appbundle --release --obfuscate --split-debug-info=build/debug-info
```

### 4. Signing Config

Ensure `android/app/build.gradle` has your keystore configured for release signing.
See [Flutter deployment docs](https://docs.flutter.dev/deployment/android) for details.
