# Beig Estates — Real Estate Website + Admin Panel

A full working website for Beig Estates with a public property listing
site and a password-protected admin panel to manage properties and leads.

**Stack:** Next.js (React) + Supabase (database + auth) + Vercel (hosting)

---

## What's Included

- Public website — hero, how-it-works, live property listings, contact form
- Enquiry form — submissions save directly to the database (not just WhatsApp)
- Admin panel at `/admin` — add/edit/delete properties, view and manage leads
- WhatsApp, call, and email contact options built in

---

## Setup — Do This Once

### 1. Create a free Supabase project
1. Go to [supabase.com](https://supabase.com) → Sign up → New Project
2. Wait ~2 minutes for it to provision
3. Open `supabase-schema.sql` (in this repo) and replace
   `CHANGE-ME@example.com` with the email you want to log in with.
   Only emails in that list can use the admin panel.
4. Go to **SQL Editor** → New Query → paste the entire edited file →
   click **Run**. This creates the `properties`, `leads`, and `admins`
   tables with sample data.
5. Go to **Settings → API** → copy:
   - `Project URL`
   - `anon public` key

### 2. Create your admin login
1. In Supabase, go to **Authentication → Users → Add User**
2. Enter the **same email** you put in the `admins` table above, plus a
   password — this is what you'll use to log in at `/admin/login`
3. Go to **Authentication → Sign In / Providers** and turn **off**
   "Allow new users to sign up". Nobody should be creating their own
   account on your project.

> **Already deployed before this change?** Your old policies let any
> logged-in user manage properties and read leads. Run
> `supabase-migration-admin-rls.sql` (edit the email in it first) to
> close that, then do step 2.3 above.

### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. **Add New Project** → import this repository
3. Before deploying, add these Environment Variables (from Step 1):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

Your site will be live at `your-project-name.vercel.app` within a couple
of minutes. You can connect a custom domain later from the Vercel
dashboard (Settings → Domains).

---

## Using the Admin Panel

Go to `yoursite.com/admin/login` and sign in with the email/password you
created in Supabase Step 2.

- **Dashboard** — quick stats (total properties, total leads, new leads)
- **Properties** — add new listings with photo URL, price, location,
  bedrooms/bathrooms, status. Edit or delete anytime — changes reflect
  on the public site immediately.
- **Leads** — every enquiry form submission appears here automatically.
  Filter by status, update status (New → Contacted → Closed), click
  through to WhatsApp or call directly, delete spam entries.

---

## Local Development

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev
```

Visit `http://localhost:3000`
