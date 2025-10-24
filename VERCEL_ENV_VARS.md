# 🚀 VERCEL ENVIRONMENT VARIABLES

## Copy-Paste These Into Vercel

When deploying to Vercel, add these environment variables:

### **Required Variables:**

```
NEXT_PUBLIC_SUPABASE_URL=https://nqzbvypkhwxulaucmmsz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE=sb_publishable_K6GaAJAWBaWtji5upd2NRA_6BgmorLE
SUPABASE_SECRET=sb_secret_OB-j6Q-XS8g0QBAsh_hg7g_PYQcgRFJ
NEXT_PUBLIC_BASE_CHAIN_ID=84532
NEXT_PUBLIC_SAFE_API_URL=https://safe-transaction-base-sepolia.safe.global
```

### **Optional (if you have them in your .env):**

```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=[your-existing-value]
NEXT_PUBLIC_CDP_PROJECT_ID=[your-existing-value]
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=[if-you-have-it]
```

---

## ⚡ Quick Steps:

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. For each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: The value from above
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your app for changes to take effect

---

## 🔒 Security Note:

- ✅ **NEXT_PUBLIC_*** variables are safe to expose (client-side)
- ⚠️ **SUPABASE_SECRET** is server-only (never exposed to browser)
- ⚠️ **NEXT_PUBLIC_ONCHAINKIT_API_KEY** is technically public but should be kept secure

---

## ✅ Verification:

After deploying, check:
1. Open browser console on your Vercel URL
2. No "Missing Supabase environment variables" errors
3. FundCard works (no IP address errors)
4. Wallet connection works

---

**Ready to deploy!** 🚀

