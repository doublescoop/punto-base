# 🚀 PUNTO - SETUP INSTRUCTIONS FOR BASE BATCH

## ⏱️ CRITICAL PATH - DO THESE IN ORDER

---

## 1️⃣ SUPABASE SETUP (5 minutes)

### Step 1: Create Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: `punto-base`
   - **Database Password**: (create a strong password, SAVE IT!)
   - **Region**: Choose closest to you
4. Wait for project to be created (~2 minutes)

### Step 2: Run Database Schema
1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Open `/supabase/schema.sql` in this repo
4. **Copy the ENTIRE file** and paste into SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. Wait for success message (should take ~5 seconds)

### Step 3: Get API Keys
1. Go to **Project Settings** → **API** (gear icon in sidebar)
2. Copy these THREE values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **anon public key**: (long string starting with `eyJ...`)
   - **service_role secret key**: (long string starting with `eyJ...`)

---

## 2️⃣ VERCEL DEPLOYMENT (5 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Alpha version for Base Batch"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **BEFORE DEPLOYING**, add environment variables:

### Step 3: Add Environment Variables in Vercel
Click "Environment Variables" and add these:

```
NEXT_PUBLIC_SUPABASE_URL=[paste Project URL from Supabase]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[paste anon key from Supabase]
SUPABASE_SERVICE_ROLE_KEY=[paste service_role key from Supabase]
NEXT_PUBLIC_BASE_CHAIN_ID=84532
```

**Optional (if you have them):**
```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=[your OnchainKit key]
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=[your WalletConnect ID]
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait ~2 minutes
3. Get your public URL: `https://punto-base.vercel.app` (or similar)

---

## 3️⃣ LOCAL DEVELOPMENT SETUP (2 minutes)

### Create `.env.local` file
In the root of your project, create `.env.local`:

```bash
# Copy from env.example
cp env.example .env.local
```

Then edit `.env.local` and paste your actual values:

```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-actual-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-actual-service-role-key...
NEXT_PUBLIC_BASE_CHAIN_ID=84532
```

---

## 4️⃣ TEST EVERYTHING (5 minutes)

### Test Supabase Connection
```bash
# Run dev server
bun run dev

# Open browser to http://localhost:3002
# Check browser console for any Supabase errors
```

### Test on Production URL
1. Go to your Vercel URL
2. Try creating a magazine
3. Check if data is saved to Supabase

---

## ✅ CHECKLIST

Before continuing development, verify:

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] API keys copied
- [ ] Vercel deployed with environment variables
- [ ] Public URL is live
- [ ] `.env.local` created locally
- [ ] No console errors on production
- [ ] FundCard works on production URL (no IP errors)

---

## 🆘 TROUBLESHOOTING

### "Missing Supabase environment variables"
- Check that you added ALL THREE env vars to Vercel
- Redeploy after adding env vars

### "FundCard IP address error"
- This only happens on localhost
- Use the Vercel production URL instead
- OR: Mock the FundCard for local dev

### "Database connection failed"
- Check that schema.sql ran successfully
- Verify Project URL is correct
- Check that anon key is correct

### "Build failed on Vercel"
- Check build logs
- Make sure all dependencies are in package.json
- Try deploying again

---

## 📋 WHAT I'VE SET UP FOR YOU

✅ **Database Schema** (`/supabase/schema.sql`)
- All tables with proper relationships
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for auto-updating timestamps
- Views for easy querying

✅ **Supabase Client** (`/lib/supabase/client.ts`)
- Client-side and server-side clients
- Error handling helpers
- TypeScript support

✅ **TypeScript Types** (`/lib/supabase/types.ts`)
- Full type safety for all database operations
- Auto-generated from schema

✅ **Environment Template** (`/env.example`)
- All required environment variables documented

---

## 🎯 NEXT STEPS AFTER SETUP

Once setup is complete, tell me and I'll implement:

1. **API Routes** - Connect wizard to Supabase
2. **Safe Treasury** - Create Safe on Base Sepolia
3. **Payment Flow** - Send USDC on Base
4. **Complete Flow** - End-to-end testing

---

## 📞 NEED HELP?

If you hit any issues:
1. Check the error message carefully
2. Verify all environment variables are correct
3. Check Supabase Dashboard → Logs for database errors
4. Check Vercel → Deployment Logs for build errors

---

**Time Estimate**: 15-20 minutes total for complete setup

**Let me know when you're done and I'll continue with the implementation!** 🚀

