# BiomasaPortal Migration Status

## Done

- New Next.js project created in `C:\Nextjs\biomasaportal-next`
- SSH access to current WordPress server verified
- Current WordPress structure audited:
  - theme: `hello-elementor`
  - plugins: WooCommerce, Yoast, Elementor, custom `biomasa-classifieds`
  - pages, posts, products, classifieds, menus, taxonomies, users
- Public routes exported from WordPress sitemap into `data/wordpress`
- Catch-all route and mirrored SEO/title rendering implemented
- New dedicated Next.js pages created for:
  - `/ogloszenia/`
  - `/ogloszenia/[slug]`
  - `/dodaj-ogloszenie/`
  - `/moje-ogloszenia/`
  - `/zaloz-konto/`
  - `/zaloguj-sie/`
- Supabase auth wiring added
- Supabase schema prepared in `supabase/schema.sql`
- Supabase import script prepared in `scripts/import-supabase.mjs`
- Live Stripe keys recovered from current WordPress instance and saved locally in `.env.local`

## Verified

- `npm run build` passes
- WordPress export completed successfully
- Supabase credentials are loaded locally
- Supabase schema applied successfully
- Supabase import completed successfully
- Imported into Supabase:
  - `5` profiles
  - `13` classified categories
  - `24` classifieds with mapped owners

## Current focus

Now that data and users are in Supabase, the next implementation steps are:

1. connect real create/update/delete flows for classifieds
2. add media upload flow to Supabase Storage
3. implement Stripe checkout + webhook in Next.js
4. move archive/single classifieds from mirrored HTML to native data-driven components
5. prepare Vercel envs and final production cutover
