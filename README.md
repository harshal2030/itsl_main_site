# IndoThai website

Static Astro + TypeScript + Tailwind CSS v4 website for
[IndoThai Securities](https://indothai.co.in/), migrated from the
[WordPress staging website](https://staging-e356-indothaiweb.wpcomstaging.com/).

## Status

The following routes are implemented and linked locally:

`/`, `/about-us/`, `/mutual-funds/`, `/downloads/`, `/careers/`,
`/careers/job/`, `/close-account/`, `/procedure-of-closing-account/`,
`/raise-a-ticket/`, `/privacy-policy/`, `/investors/overview/`,
`/investors/shareholder-relation/`, `/investors/financial-reports/`,
`/investors/disclosures-under-regulation-46/`, `/investors/client-relation/`,
`/investors/corporate-presentation/`, `/blog/`, and `/blog/post/`.

`/investors/` redirects visitors to `/investors/shareholder-relation/`. When
`shareholder_type` is present, the redirect carries that parameter to the
Shareholder Relation URL, including an explicitly empty value.
Unknown routes use the generated `404.html` to redirect visitors to Home.
Astro accepts both slash and non-slash request forms so its development and
preview servers do not replace that custom fallback with a slash-mismatch page;
authored internal links remain slash-terminated.

The project is live at `https://indothai.co.in/`. Other unmigrated navigation
still points to the owner-approved WordPress staging destinations until their
production routes are approved.

Production builds emit self-referencing canonicals, indexable robots directives,
social preview metadata and Organization/WebSite/WebPage JSON-LD on the sixteen
stable sitemap routes. The query-ID Blog post and Job Details shells remain
`noindex, follow`: their browser-only architecture cannot provide record-specific
initial metadata or HTTP status codes. Set `SITE_INDEXING=false` for every public
branch preview or staging build; this changes normal pages and `robots.txt` back
to the safe preview policy.

See [DESIGN.md](DESIGN.md) for visual decisions and
[VERIFICATION.md](VERIFICATION.md) for completed checks and known limitations.

## Development

Use Node `24.14.1` and npm 11.

```sh
nvm install
nvm use
npm ci
npm run dev
```

Open the URL printed by Astro, normally `http://127.0.0.1:4321`.

Local development is not publicly reachable. For a publicly accessible preview,
build with indexing disabled:

```sh
SITE_INDEXING=false npm run build
```

| Command                     | Purpose                                            |
| --------------------------- | -------------------------------------------------- |
| `npm run dev`               | Start the development server.                      |
| `npm run check`             | Run Astro and TypeScript diagnostics.              |
| `npm run format`            | Format source and documentation.                   |
| `npm run format:check`      | Check formatting without editing.                  |
| `npm test`                  | Build and run static-output tests.                 |
| `npm run build`             | Generate the static site in `dist/`.               |
| `npm run preview`           | Serve the existing build locally.                  |
| `npm run test:browser`      | Run mocked Chromium tests.                         |
| `npm run test:dev`          | Test development-server images and layouts.        |
| `npm run capture:local`     | Capture local comparison screenshots.              |
| `npm run capture:reference` | Capture staging screenshots; needs network access. |

Install Chromium before browser tests:

```sh
npx playwright install chromium
```

Run the full verification set after application changes:

```sh
npm run format:check
npm run check
npm test
npm run test:browser
npm run test:dev
```

Keep `package-lock.json` committed. Builds do not require Strapi, WordPress,
environment variables, agent tools, or external accounts.

## Strapi configuration

Browser-only CMS reads and submissions use the optional public base URL:

```dotenv
PUBLIC_STRAPI_URL=http://localhost:1337
```

Copy `.env.example` to `.env.local`, set the URL, and restart Astro. Missing
configuration or JavaScript leaves CMS-backed controls unavailable while
contact links remain usable. Builds never call Strapi.

The website sends no tokens or cookies and does not change Strapi. Production
requires an approved HTTPS origin, restricted CORS, least-privilege public
permissions, server-side validation, abuse controls, privacy review, and
retention rules.

| Feature       | Endpoint(s)                                                                                                                                                            | Browser behavior                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Contact       | `POST /api/contact-forms`                                                                                                                                              | Four fields: `name`, `contact_no`, `email`, `message`.                                |
| Close Account | `POST /api/close-account-requests`                                                                                                                                     | Four required fields; creates a request, not confirmation of closure.                 |
| Raise Ticket  | `POST /api/complaints` and optional `POST /api/private-upload`                                                                                                         | Seven complaint fields and one optional attachment.                                   |
| Downloads     | `GET /api/software-categories`, `GET /api/softwares`                                                                                                                   | Fetches all pages, then filters locally.                                              |
| Careers       | `GET /api/openings`, `POST /api/private-upload`, `POST /api/candidates`                                                                                                | Lists only Open jobs and accepts PDF applications for those positions.                |
| Blog          | `GET /api/blogs` and one public document read                                                                                                                          | Lists published posts and renders sanitized Markdown.                                 |
| Investors     | `GET /api/overviews`, `/api/shareholder-relation-categories`, `/api/shareholder-relations`, `/api/financial-reports`, `/api/disclosure-2015s`, `/api/client-relations` | Loads published records in the browser and exposes only safe HTTP(S) files and links. |

Downloads, Careers, Blog and Investor records are absent from initial HTML.
They require published Strapi records and public read access. Private resumes
and complaint attachments use the private-upload flow; the website never
deletes failed or abandoned uploads. Live submission tests require separate
owner approval and synthetic data.

Shareholder Relation selects the first alphabetical document category after
loading and replaces the initial URL with that category's `shareholder_type`.
It intentionally does not provide an All Categories option and requests documents
from Strapi only when their category is selected. A visitor's category selection
uses that category's CMS-managed `slug` in the URL as
`shareholder_type` (for example, `?shareholder_type=reconciliationreport`) so it
can be shared and restored with browser Back and Forward navigation. A category
without the optional slug still loads normally but does not invent a query value.

Overview, Regulation 46 Disclosures and Client Relation are ordered through each
record's required integer `order` field. Smaller values appear first. Equal values
use Strapi's automatic `createdAt` timestamp, newest first, followed by title and
document ID for stable ordering. Legacy records whose `order` remains null or
missing are treated as `0` until an editor saves an explicit value. These fields
control placement only and are not shown on the website.

## Project structure

```text
src/
├── assets/                  Local images, artwork and documents
├── components/              Named page sections and shared UI
├── data/                    Typed content, navigation and CMS reads
├── layouts/BaseLayout.astro Document shell, SEO, header and footer
├── pages/                   Static route entry points
└── styles/                  tokens.css, global.css and content.css
public/                      Fonts, favicon and deployment header rules
scripts/                     Capture helpers
tests/                       Static and browser tests
```

Important files:

- `src/data/site.ts` — company information, destinations and shared metadata.
- `src/pages/robots.txt.ts` — production/preview-aware robots policy.
- `src/data/nav.ts` — primary, utility, legal and venture navigation.
- `src/data/home.ts`, `about.ts`, `mutual-funds.ts`, `apps.ts` — repeated page content.
- `src/data/openings.ts`, `blogs.ts`, `investors.ts` — typed browser CMS reads.
- `src/styles/tokens.css` — the single source of truth for shared design values.
- `src/components/shared/` — layout, SEO, contact and store-badge components.

Each route composes named sections. Keep CMS flows explicit and local to their
page components; do not add a generic CMS layer, server adapter, UI kit, React,
state-management library, or new backend integration without approval.

## Maintenance

- Edit repeated marketing content in the relevant `src/data/` file.
- Edit navigation and external destinations in `src/data/nav.ts` and `site.ts`.
- The hamburger menu becomes a full-page panel below the header on phone widths;
  its markup and behavior remain owned by `src/components/shared/Header.astro`.
- The shared accessibility toolbar is owned by
  `src/components/shared/AccessibilityToolbar.astro`. It stores only display and
  reading preferences under `a11y-plugin-prefs`; Reset all settings removes them.
- Edit layout or page-specific behavior in the named component under `src/components/`.
- Change typography, spacing, colors, breakpoints, shadows and motion in `tokens.css`.
- Replace local images under `src/assets/images/` and keep alt text and dimensions accurate.
- Replace `src/assets/docs/corporate-presentation_.pdf` to update the static presentation.
- Keep browser validation, timeout, safe-URL, sanitization and no-JavaScript fallbacks intact.

The accessibility toolbar provides text scaling, four contrast modes, a locally
bundled OpenDyslexic font, browser text-to-speech controls, missing-alt auditing
and enhanced focus visibility on all interactive routes. The toolbar is hidden
without JavaScript and does not replace semantic HTML, screen-reader testing or
the release accessibility review.

The full-resolution account-closing flowchart and its accessible transcript must
be updated together. About Us timeline artwork and text equivalents must also
remain synchronized. Intentional source-copy, destination and artwork anomalies
remain pending owner/editorial approval; do not silently correct them.

## Deployment and SEO checklist

- [ ] Approve visual fidelity, content, links, imagery and regulatory copy.
- [ ] Configure and verify production Strapi origin, CORS, permissions and private storage.
- [ ] Complete privacy, retention, abuse, malware and orphan-upload controls.
- [ ] Complete accessibility/compliance review, including screen readers, zoom and reflow.
- [x] Configure the approved apex production origin, canonicals, social metadata, sitemap and robots policy.
- [ ] Configure `www.indothai.co.in` to redirect permanently to the apex hostname.
- [ ] Approve permanent redirects for legacy WordPress URLs and the `/investors/` compatibility route.
- [ ] Keep `SITE_INDEXING=false` on every public preview/staging deployment.
- [ ] Select hosting and document deployment, rollback, caching and asset behavior.
- [ ] Run the full verification commands and inspect representative desktop and mobile pages.

Publishing a new `dist/` remains a separate deployment step. After the SEO build
is deployed, verify the live robots directive and canonical, submit
`https://indothai.co.in/sitemap.xml` in Search Console, and request inspection of
representative stable routes. Do not submit the Blog post or Job Details query
shells for indexing.
