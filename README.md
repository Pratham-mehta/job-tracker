# Job Tracker

A job tracker (Next.js + Supabase + Resend) with a daily email digest. Access is
by invitation only: there is a login page, but **no sign-up page**. Visitors are
told to contact the admin, Pratham Mehta (prathamadmire@gmail.com).

## Authentication

Built on Supabase Auth (email + password) with cookie sessions via `@supabase/ssr`.

- `middleware.ts` requires a signed-in user for every page and API route except `/login`,
  `/forgot-password`, `/reset-password`, `/auth/*`, `/api/unsubscribe` (token link in digest
  emails) and `/api/daily-digest` (Vercel Cron, guarded by `CRON_SECRET`). Signed-out page
  requests are redirected to `/login`; signed-out API requests get a 401.
- **Forgot password** on the login page emails a reset link → `/auth/callback` → `/reset-password`.
- The email list (`subscribers` table) is only reachable through `/admin/subscribers`, which
  only the admin account (`ADMIN_EMAIL` in `lib/auth.ts`) can open. The table itself is
  locked to the server-side service-role key.

### One-time setup (Supabase dashboard)

The code can't do these for you, and the login is only meaningful once they're done:

1. **Create the admin user** — Authentication → Users → *Add user* → *Create new user*.
   Email `prathamadmire@gmail.com`, choose a password, tick *Auto Confirm User*.
2. **Turn off sign-ups** — Authentication → Sign In / Providers → Email → switch off
   *Allow new users to sign up*. **This is essential**: the Supabase URL and anon key are public,
   so while sign-ups are on, anyone can create their own account and get in.
3. **Allow the reset link's redirect** — Authentication → URL Configuration: set *Site URL* to your
   production URL and add these *Redirect URLs*:
   - `https://<your-domain>/auth/callback`
   - `http://localhost:3000/auth/callback`
4. **Lock the database** — run [`supabase/auth-lockdown.sql`](supabase/auth-lockdown.sql) in the SQL editor.
   Without it the anon key can still read/write `jobs` and `companies` directly through Supabase's API,
   login page or not. It replaces *all* existing policies on those two tables with "signed-in users only".
5. *(Recommended)* **Reset emails that work from any device** — Authentication → Email Templates →
   *Reset Password*, set the link to
   `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`.
   With Supabase's default template the link only works in the same browser that requested the reset.
6. *(Recommended)* **Use your own SMTP** (Resend works) under Project Settings → Authentication → SMTP.
   Supabase's built-in sender is meant for testing and is tightly rate-limited.
   Optionally set the minimum password length to 8 there too, to match the reset form.

### Giving someone access

Authentication → Users → *Add user* (with *Auto Confirm User*). They can set their own password
afterwards with *Forgot password?*. Only `prathamadmire@gmail.com` can see the subscriber list.

No new environment variables were added; the existing ones are
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`RESEND_API_KEY`, `CRON_SECRET` and `NEXT_PUBLIC_SITE_URL`.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
