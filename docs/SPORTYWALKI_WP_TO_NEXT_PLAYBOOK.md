# SportyWalki.com.pl - playbook migracji WordPress -> Next.js

Ten dokument jest wzorcem pod kolejna migracje, opartym o proces wykonany dla `biomasaportal.pl`.
Cel: przeniesc serwis z WordPressa do Next.js z zachowaniem struktury URL, SEO, tresci, layoutu i funkcji serwisu 1:1.

## 1. Cel migracji

- Odtworzyc frontend WordPressa w Next.js mozliwie 1:1.
- Zachowac obecne adresy URL, paginacje, wewnetrzne linkowanie i canonicale.
- Przeniesc tresci, meta title, meta description, Open Graph, Twitter i schema.
- Odtworzyc robots.txt i sitemapy.
- Dolozyc nowoczesny backend pod funkcje dynamiczne, jesli WordPress robi to dzisiaj przez wtyczki.
- Zostawic WordPress tylko jako punkt odniesienia do porownania, a nie docelowy runtime.

## 2. Etap startowy

1. Zalozyc repo pod nowy projekt Next.js.
2. Uruchomic nowy projekt lokalnie.
3. Podpiac repo do GitHuba.
4. Podpiac repo do Vercela.
5. Zabezpieczyc dostepy:
   - SSH do serwera
   - dostep do plikow WordPressa
   - opcjonalnie `wp-admin`
   - eksport bazy
   - dostepy do API, analytics, Stripe, Supabase lub innych uslug

## 3. Inwentaryzacja WordPressa

Najpierw trzeba rozpoznac, z czego sklada sie stary serwis.

Do sprawdzenia:

- motyw i page builder, np. Elementor
- typy tresci: strony, wpisy, custom post types
- archiwa i paginacje
- formularze i panele uzytkownika
- wyszukiwarki
- pluginy SEO
- schema JSON-LD
- robots.txt
- sitemap index i wszystkie sitemap podsieci
- media i uploady
- menu, naglowek, stopka, widgety sidebara
- skrypty zewnetrzne: GA4, Meta Pixel, Hotjar, Stripe, chaty, cookiebot itd.

Na koncu tego etapu trzeba miec liste:

- wszystkich tras
- wszystkich typow widokow
- funkcji krytycznych biznesowo
- integracji zewnetrznych

## 4. Eksport WordPressa

Nalezy zrobic eksport HTML i danych referencyjnych z WordPressa.

Zakres eksportu:

- wszystkie publiczne URL-e
- HTML kazdej strony
- `title`
- `meta description`
- `canonical`
- `robots`
- Open Graph
- Twitter cards
- schema JSON-LD
- `body class`
- listy stylesheetow
- listing wpisow i ogloszen
- klasyfikacje i kategorie

Docelowo eksport powinien trafic do lokalnego katalogu danych, np.:

- `data/wordpress/routes/*.json`
- `data/wordpress/manifest.json`
- `data/wordpress/classifieds.json`
- `data/wordpress/classified-categories.json`

## 5. Postawienie fundamentu Next.js

Minimalny setup:

- App Router
- globalny layout
- middleware dla auth, jesli potrzebne
- env dla uslug zewnetrznych
- wspolna warstwa do czytania eksportu WordPressa

Na tym etapie trzeba juz miec:

- route resolver po `path`
- builder metadata z eksportu
- renderer mirrorujacy HTML
- ladowanie stylow WordPressa dla odtwarzanych widokow

## 6. Render 1:1 stron i wpisow

Najpierw odtwarzamy czysty mirror:

1. Strona glowna.
2. Podstrony statyczne.
3. Wpisy blogowe.
4. Archiwa wpisow.
5. Custom post types i inne listingi.

Kluczowe zasady:

- nie upraszczac struktury HTML na starcie
- nie zmieniac URL-i
- nie przepisywac tresci recznie, jesli da sie je wyrenderowac z eksportu
- zachowac wrappery i klasy potrzebne do stylow

## 7. Transformacje HTML

Po eksporcie trzeba zrobic kontrolowane czyszczenie i podmiane:

- usunac zbędne skrypty WordPressowe po stronie renderu
- poprawic linki absolutne na relatywne tam, gdzie powinny zostac w nowym serwisie
- zostawic absolutne linki do `wp-content`, jesli media dalej sa ciagniete z WordPressa
- poprawic `srcset`, `poster`, `form action`
- zachowac klasy potrzebne do stylow Elementora
- kontrolowac ukryte elementy i lazy-load

To jest jeden z najwazniejszych etapow, bo tu zwykle rozwala sie layout, sidebar albo CTA.

## 8. SEO 1:1

Kazdy widok musi miec odtworzone:

- `title`
- `meta description`
- `canonical`
- `robots`
- Open Graph
- Twitter card
- schema JSON-LD

Dodatkowo trzeba odtworzyc:

- `robots.txt`
- `sitemap_index.xml`
- sitemapy wpisow
- sitemapy stron
- sitemapy produktow lub innych CPT

Jesli pojawiaja sie nowe sekcje w Next.js, trzeba je tez dolaczyc do sitemap.

## 9. Backend pod funkcje dynamiczne

Jesli serwis ma konta, panele, formularze, dodawanie tresci lub platnosci, nie zostawiamy tego w WordPressie.

Docelowy stack:

- Next.js po frontendzie i server actions/API routes
- Supabase pod auth, profile i dane dynamiczne
- Supabase Storage pod uploady
- Stripe pod platnosci, jesli serwis ich potrzebuje

Na tym etapie trzeba rozpisac nowy model danych i zapisac go w SQL.

## 10. Migracja tresci redakcyjnych

Jesli jest dodatkowe zrodlo tresci, np. Excel albo CSV, proces powinien wygladac tak:

1. Odczyt workbooka.
2. Zmapowanie kolumn na model wpisu.
3. Wygenerowanie seedu JSON.
4. Oznaczenie wpisow:
   - juz opublikowane
   - queued
   - published
5. Synchronizacja z baza.
6. Plan publikacji wedlug `sort_order`.

Przykladowe pola:

- keyword
- title
- meta title
- meta description
- html artykulu
- faq schema
- slug
- path
- category
- status publikacji
- scheduled_for

## 11. Panel administratora

Panel admina ma sluzyc do:

- synchronizacji seedu do bazy
- recznej publikacji kolejnych wpisow
- podgladu kolejki i terminow
- kontroli statusow wpisow
- podgladu kategorii i klastra tresci

Minimum funkcjonalne:

- licznik rekordow
- licznik queued
- licznik published
- lista najblizszych publikacji
- akcja `sync`
- akcja `publish next batch`

## 12. Automatyczna publikacja

Jesli tresci maja pojawiac sie stopniowo, dodajemy cron.

Model:

- Vercel cron uruchamia endpoint raz w tygodniu
- endpoint publikuje kolejnych 5 wpisow
- po publikacji przelicza kolejne `scheduled_for`
- na koniec robi `revalidatePath` dla archiwow i sitemap

Do env:

- `CRON_SECRET`
- `ADMIN_EMAILS`
- klucze Supabase

## 13. UX i interakcje

Po odtworzeniu HTML trzeba domknac zachowanie:

- spisy tresci z `h2`
- FAQ akordeony
- ajaxowa wyszukiwarka wpisow
- lazy i reveal animations
- page transition
- tracking eventow GA4

Najpierw trzeba odtworzyc to, co juz bylo w WordPressie. Dopiero potem dokladamy nowe ulepszenia.

## 14. Performance

Optymalizacje obowiazkowe:

- lazy loading tam, gdzie nie psuje LCP
- `fetchpriority=high` dla glownego hero
- preconnect do krytycznych zrodel
- ograniczenie skryptow WP tylko do niezbednych assetow
- cache dla lokalnych odczytow eksportu
- usuniecie zbednych runtime scriptow WordPressa po stronie Next.js

## 15. QA przed przelaczeniem domeny

Trzeba porownac WordPress vs Next.js ekran po ekranie:

- home
- listing wpisow
- single wpis
- podstrony
- formularze
- wyszukiwarki
- mobile
- sidebar
- breadcrumbsy
- pagination

Do sprawdzenia:

- czy URL-e sa identyczne
- czy meta sa identyczne lub lepsze
- czy nie ma pustych blokow
- czy sidebar i sekcje poboczne sa w dobrych miejscach
- czy sitemapy i robots dzialaja
- czy nie ma 404 po wewnetrznym linkowaniu

## 16. Cutover produkcyjny

Kolejnosc:

1. Ostatni eksport z WordPressa.
2. Ostatnia synchronizacja danych dynamicznych.
3. Finalny build i deploy na Vercel.
4. Podpiecie domeny.
5. Weryfikacja:
   - homepage
   - kilka wpisow
   - sitemap
   - robots
   - formularze
   - analytics

## 17. Checklist operacyjny dla kolejnego projektu

Przed startem:

- potwierdzic repo
- potwierdzic domeny
- potwierdzic SSH
- potwierdzic integracje
- potwierdzic zakres funkcjonalny

W trakcie:

- najpierw eksport i routing
- potem SEO i layout
- potem funkcje dynamiczne
- potem panel admina i cron
- potem polishing 1:1

Na koniec:

- build production musi przechodzic
- smoke testy HTTP musza zwracac 200
- sitemap i robots musza byc online
- commit i push na `main`

## 18. Notatka dla projektu SportyWalki.com.pl

Ten playbook zaklada, ze proces dla `sportywalki.com.pl` bedzie identyczny jak dla `biomasaportal.pl`, tylko bez etapu przebudowy mega menu.

Priorytet dla `sportywalki.com.pl`:

- mirror tresci i layoutu 1:1
- SEO 1:1
- routing 1:1
- sidebary, listingi i paginacje 1:1
- dynamiczne funkcje przeniesione poza WordPressa tylko wtedy, gdy serwis ich wymaga

## 19. Gdzie trzymac dostepy

Dane dostepowe do serwera i projektowe hasla trzymaj w osobnym pliku lokalnym, niecommitowanym do repo.

Lokalny plik dla tego projektu:

- [SPORTYWALKI_SSH_ACCESS.local.md](/C:/Nextjs/biomasaportal-next/docs/SPORTYWALKI_SSH_ACCESS.local.md)
