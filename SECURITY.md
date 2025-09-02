# 🔒 Security Guidelines for Aura Asset Manager

## ⚠️ CRITICAL SECURITY PRACTICES

### **Environment Variables**
- **NEVER** commit `.env` files to version control
- **ALWAYS** use `.env.example` as a template
- **REGENERATE** all keys immediately after any exposure
- **USE** different keys for development, staging, and production

### **Exposed Credentials Cleanup Checklist**

If credentials have been exposed in a public repository:

#### ✅ **Immediate Actions Completed:**
- [x] Removed `debug-auth.js` with exposed Supabase credentials
- [x] Removed `frontend/src/lib/supabase-test.js` with exposed keys
- [x] Updated `docker-compose.yml` to use environment variables
- [x] Enhanced `.gitignore` with comprehensive security rules
- [x] Created secure `.env.example` template

#### 🚨 **URGENT: Manual Actions Required:**

1. **Regenerate Supabase Keys** (Do this immediately!)
   ```bash
   # Go to: https://supabase.com/dashboard/projects/buuyvrysvjwqqfoyfbdr/settings/api
   # 1. Click "Regenerate" for anon/public key
   # 2. Click "Regenerate" for service_role key
   # 3. Update your local .env files with new keys
   ```

2. **Change Database Password**
   ```bash
   # Go to: https://supabase.com/dashboard/projects/buuyvrysvjwqqfoyfbdr/settings/database
   # Change the database password and update DATABASE_URL
   ```

3. **Review RLS Policies**
   ```bash
   # Ensure Row Level Security is enabled on all tables
   # Review and update access policies if needed
   ```

### **Environment Variable Setup**

#### **For Development:**
```bash
# 1. Copy the template
cp .env.example .env

# 2. Edit with your actual values
nano .env

# 3. Verify .env is in .gitignore
git status  # .env should NOT appear in changes
```

#### **For Production Deployment:**
- **Vercel**: Add environment variables in dashboard settings
- **Railway**: Use railway CLI or dashboard
- **Netlify**: Add in site settings
- **Render**: Add in service environment variables

### **File Security Rules**

#### **NEVER Commit These Files:**
```bash
.env
.env.*
debug-*.js
*-test.js
*-credentials.*
*-secrets.*
config.production.*
```

#### **Safe to Commit:**
```bash
.env.example
.env.production.example
config.example.js
```

### **Git Security Commands**

#### **Check for Exposed Secrets:**
```bash
# Scan for potential secrets
git log --all --grep="password\|secret\|key" -i

# Check current changes don't include secrets
git diff --cached | grep -i "password\|secret\|key"
```

#### **Remove Secrets from Git History (if needed):**
```bash
# WARNING: This rewrites git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch debug-auth.js' \
  --prune-empty --tag-name-filter cat -- --all
```

### **Development Workflow**

1. **Clone Repository:**
   ```bash
   git clone https://github.com/cerebral-valley/aura-asset-manager.git
   cd aura-asset-manager
   ```

2. **Setup Environment:**
   ```bash
   # Backend
   cp .env.example backend/.env
   # Edit backend/.env with your credentials
   
   # Frontend  
   cp frontend/.env.example frontend/.env.local
   # Edit frontend/.env.local with your credentials
   ```

3. **Verify Security:**
   ```bash
   # Ensure no secrets in git
   git status
   git diff
   ```

### **Emergency Response**

If credentials are accidentally committed:

1. **Stop all services** using the exposed credentials
2. **Regenerate all exposed keys/passwords** immediately  
3. **Remove files** from repository
4. **Clean git history** if needed
5. **Update all deployments** with new credentials
6. **Review access logs** for unauthorized usage

### **Security Monitoring**

- Monitor Supabase dashboard for unusual activity
- Review authentication logs regularly
- Set up alerts for failed authentication attempts
- Regular security audits of environment configurations

---

**Remember: Security is not optional. When in doubt, regenerate credentials and err on the side of caution.**
