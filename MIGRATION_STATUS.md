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

## Current blocker

The Supabase schema has not been applied yet.

Current import error:

`Could not find the table 'public.classified_categories' in the schema cache`

## Immediate next step

Apply `supabase/schema.sql` in the Supabase SQL editor or provide a direct Postgres connection string.

Once that is done:

1. run `npm run import:supabase`
2. verify imported classifieds/categories
3. connect real create/update/delete flows
4. connect Stripe checkout + webhook in Next.js
5. migrate media/upload flow to Supabase Storage
