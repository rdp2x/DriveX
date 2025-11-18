# Security Setup Guide

## 🔒 Important Security Information

This project has been configured to protect sensitive credentials. Please follow the steps below to set up your local environment.

---

## Backend Setup (Spring Boot)

### 1. Create Your Local Configuration File

Copy the template file to create your actual configuration:

```bash
cd BackendDriveX/src/main/resources
cp application.properties.template application.properties
```

### 2. Fill in Your Credentials

Edit `application.properties` and replace the placeholder values:

#### Database Configuration
Get from **Supabase Dashboard → Settings → Database**:
- Database URL
- Database password

#### Supabase Keys
Get from **Supabase Dashboard → Settings → API**:
- Project URL
- Anon key (public)
- Service role key (secret - never expose to frontend!)
- JWT Secret

#### Generate JWT Secrets
Create secure random secrets:
```bash
# For JWT secret
openssl rand -base64 64

# For refresh token secret
openssl rand -base64 64
```

Add these to your `application.properties` file.

#### Email Configuration (Optional)
For Gmail:
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication
3. Go to https://myaccount.google.com/apppasswords
4. Create App Password → Select "Mail" → Copy the password
5. Add to `application.properties`:
   - `EMAIL_USERNAME=your-email@gmail.com`
   - `EMAIL_PASSWORD=your-16-char-app-password`

---

## Frontend Setup (Next.js)

### 1. Create Your Local Environment File

```bash
cd driveX-frontend
cp .env.example .env.local
```

### 2. Fill in Your Environment Variables

Edit `.env.local` and replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Get these from **Supabase Dashboard → Settings → API**.

---

## 🚨 CRITICAL: What NOT to Commit

**NEVER commit these files to Git:**
- ❌ `application.properties` (backend)
- ❌ `.env.local` (frontend)
- ❌ `.env` or any `.env.*` files (except `.env.example`)
- ❌ Any file containing real passwords, keys, or secrets

**ALWAYS commit these files:**
- ✅ `application.properties.template` (backend template)
- ✅ `.env.example` (frontend template)
- ✅ `.gitignore` files

---

## 🔄 If You Already Committed Secrets

If you accidentally committed secrets to Git:

1. **Remove from Git history:**
   ```bash
   git rm --cached path/to/secret/file
   git commit -m "Remove sensitive file from tracking"
   ```

2. **Rotate all exposed secrets immediately:**
   - Reset database password in Supabase
   - Regenerate Supabase API keys
   - Generate new JWT secrets
   - Change any other exposed credentials

3. **Push the changes:**
   ```bash
   git push
   ```

---

## ✅ Verify Your Setup

### Check Backend
```bash
cd BackendDriveX
./mvnw spring-boot:run
```

### Check Frontend
```bash
cd driveX-frontend
npm run dev
```

If you see errors about missing environment variables, double-check that you've created and filled in your configuration files.

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Spring Boot Properties](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🆘 Need Help?

If you encounter any issues:
1. Verify all environment variables are set correctly
2. Check that your Supabase project is active
3. Ensure your database is accessible
4. Review application logs for specific error messages
