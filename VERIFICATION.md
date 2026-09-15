# Website migration verification

## Privacy Policy — 15 September 2026

`/privacy-policy/` is the twentieth static output and the sixteenth stable
sitemap route. It uses the shared header, footer, content-page typography and
SEO shell, with one H1 and the owner-supplied Privacy Policy wording. The
footer's Privacy Policy destination now links locally. The supplied
`http://www.indothai.co.in` destination remains an external new-window link
with safe relationship attributes and an accessible new-window notice.

The copy is presented in a token-width reading column that reflows without
horizontal page overflow. The page introduces no client script, form, CMS
request, dependency, image or Investor Alert. Its production output is
indexable and self-canonical and is included in `public/sitemap.xml`.

| Check                     | Result                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| Formatting                | `npm run format:check` passed.                                                                |
| Astro/TypeScript          | `npm run check`: 107 files, zero errors, warnings or hints.                                   |
| Static output/build       | `npm test`: 54/54 passed; all twenty static outputs built.                                    |
| Production browser tests  | `npm run test:browser`: 216/216 Chromium tests passed.                                        |
| Development layout/assets | `npm run test:dev`: 37/37 responsive and local-asset checks passed.                           |
| Design checks             | Strict frontend audit completed with zero findings; token ownership and `DESIGN.md` reviewed. |
| Reference and visual      | Staging structure inspected; local 1280px and 320px captures reviewed.                        |
| Safety                    | No deployment, CMS request, CMS mutation or live submission was performed.                    |

## Production SEO remediation — 12 September 2026

The post-launch audit found that every live sitemap route returned `noindex,
nofollow`, without a canonical URL, social URL/image metadata or structured data.
The production build now makes all 15 stable sitemap routes indexable and
self-canonical at `https://indothai.co.in`, with matching Open Graph metadata and
a factual Organization, WebSite and WebPage JSON-LD graph. The browser-only Blog
post and Job Details query shells remain `noindex, follow` because they cannot
provide record-specific initial metadata or accurate record-level status codes.

`robots.txt` now follows the same build policy and advertises the production
sitemap only in an indexable build. A deployment `_headers` rule gives hashed
Astro assets immutable one-year caching. On phones, the five configured
CMS-backed Investor result areas reserve token-owned space while loading to limit
footer movement when records arrive. No Strapi code, configuration or record was
changed, and no live submission was made.

| Check                      | Result                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------- |
| Formatting                 | `npm run format:check` passed.                                                          |
| Astro/TypeScript           | `npm run check`: 104 files, zero errors, warnings or hints.                             |
| Static output/build        | `npm test`: 52/52 passed; all nineteen approved outputs built.                          |
| Production browser tests   | `npm run test:browser`: 215/215 Chromium tests passed.                                  |
| Development layout/assets  | `npm run test:dev`: 37/37 responsive and local-asset checks passed.                     |
| Production SEO assertions  | Every sitemap URL is indexable, canonical and machine-readable; query shells excluded.  |
| Preview indexing safeguard | `SITE_INDEXING=false` build inspected as `noindex, nofollow` with no sitemap directive. |
| Safety                     | No deployment, CMS mutation or live form/upload submission was performed.               |

The remediation is not live until deployed. External follow-up remains required
for the failing `www` hostname, Search Console/Bing submission, legacy URL
redirect decisions, approved replacements for staging legal links and
compliance-led review of financial claims. CMS records also remain absent from
initial static HTML under the approved browser-only architecture. The complete
evidence and ordered handoff are in `FULL-AUDIT-REPORT.md` and `ACTION-PLAN.md`.

## Investor Alert, redirects and shareholder URLs — 11 September 2026

Home now opens the production reference's Investor Alert on page load. The exact
warning copy is presented in a responsive native modal with a dark backdrop, red
heading, dotted content border and an accessible close control. Initial focus,
contained Tab navigation, Escape, backdrop dismissal and document scroll locking
were verified. The panel remains within a 320×600 viewport and scrolls its copy
when needed. The alert is absent from non-home routes.

The new `/investors/` compatibility route immediately replaces itself with
`/investors/shareholder-relation/`; its meta refresh and direct link preserve the
redirect when JavaScript is unavailable. The redirect shell remains `noindex,
nofollow`. When `shareholder_type` is present, browser navigation forwards that
parameter to Shareholder Relation, including an explicitly empty value; unrelated
parameters are not carried across. The generated `404.html` uses the same safe
fallback pattern to send unknown routes to Home. Astro now accepts slash and
non-slash request forms so its development and preview servers reach that custom
page instead of replacing it with their built-in trailing-slash mismatch screen.
The exact `/sdsd` path was verified in both environments.

Shareholder category changes now use the category's CMS-managed `slug` as the
`shareholder_type` query value instead of deriving it from the category name. The
Reconciliation of Share Capital Audit Report category fixture uses the requested
`?shareholder_type=reconciliationreport` value, and a deliberately different
Notices slug verifies the field is authoritative. Valid direct links restore the
matching category, browser Back and Forward reload the correct records, and the
Strapi filter continues to use the category document ID. When no query is supplied,
the first alphabetical category is selected and its slug is added with
`history.replaceState`, so initial loading does not create a redundant Back entry.

| Check                       | Result                                                                          |
| --------------------------- | ------------------------------------------------------------------------------- |
| Formatting                  | `npm run format:check` passed.                                                  |
| Astro/TypeScript            | `npm run check`: 103 files, zero errors, warnings or hints.                     |
| Static output/build         | `PUBLIC_STRAPI_URL= npm test`: 9/9 passed; all nineteen static outputs built.   |
| Focused browser tests       | 20/20 Investor Alert, redirect and Investor page checks passed.                 |
| Complete browser tests      | `npm run test:browser`: 214/214 Chromium tests passed.                          |
| Development layout/assets   | `npm run test:dev`: 37/37 checks passed, including both redirect regressions.   |
| Frontend static audit       | Strict audit completed with zero findings.                                      |
| Reference and visual review | Production reference measured; local 760×926 alert and redirect inspected live. |

## SEO quick-fix pass — 9 September 2026

The first post-audit implementation pass addressed changes that do not require a
production origin, redirect approval, Strapi changes or regulated-fact edits.
Preview remains `noindex, nofollow`. Its `robots.txt` no longer advertises the
production sitemap. Home, Careers and Blog have clearer search titles; Careers
also has a descriptive H1. Downloads, the five CMS-backed Investor pages and
Corporate Presentation now retain a short useful introduction before browser
records load.

Corporate Presentation uses native lazy loading for its local PDF preview.
Financial-report years are H2 headings. Close Account links to its procedure,
Raise Ticket exposes official SCORES/SMART ODR resources, and Blog “Read More”
links gain post-specific accessible context. Job Details hides its inactive
application panel before enhanced rendering, reserves the loading viewport and
keeps the disabled explanatory form available without JavaScript. A new mobile
PerformanceObserver regression enforces CLS at or below 0.1.

The five Investor static-test expectations now match the documented unconfigured
fallback. The Raise Ticket native-select test uses Playwright's deterministic
native selection API; application markup and browser behavior were not replaced
with a custom select. The Close Account busy-state regression compares button
dimensions rather than viewport-relative position after browser scrolling.

| Check                   | Result                                                                     |
| ----------------------- | -------------------------------------------------------------------------- |
| Formatting              | `npm run format:check` passed.                                             |
| Astro/TypeScript        | `npm run check`: 98 files, zero errors, warnings or hints.                 |
| Static output/build     | `npm test`: 49/49 passed; all seventeen static routes built.               |
| Complete browser tests  | `npm run test:browser`: 209/209 Chromium tests passed.                     |
| Development asset tests | `npm run test:dev`: 35/35 responsive and local-asset checks passed.        |
| Safety                  | No live form, upload, candidate, complaint or closure request was created. |

## Full-page phone navigation — 8 September 2026

At widths below the existing 48rem tablet breakpoint, opening the shared
hamburger menu now creates a fixed white panel from the bottom of the header to
the bottom of the viewport. The header remains visible, the menu scrolls
internally and the covered document is locked until the menu closes. Tablet and
desktop widths keep the existing compact dropdown.

| Check                    | Result                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------- |
| Formatting               | `npm run format:check` passed.                                                         |
| Astro/TypeScript         | `npm run check`: 98 files, zero errors, warnings or hints.                             |
| Static output/build      | `npm test` passed; all seventeen static routes built.                                  |
| Focused browser tests    | 31/31 passed across Home, About Us and Mutual Funds.                                   |
| Complete browser tests   | 208/208 Chromium tests passed.                                                         |
| Responsive menu behavior | Verified viewport bounds, internal scroll, page lock, close/unlock and keyboard paths. |
| Visual inspection        | The open menu was inspected at a 760px-wide local viewport.                            |

## CMS-controlled Investor ordering — 8 September 2026

Overview, Regulation 46 Disclosure and Client Relation records now request the
CMS-managed `order` field from lowest to highest and use Strapi's automatic
`createdAt` timestamp, newest first, when values match. After every API page is
loaded, the browser reapplies that ordering to the complete result and uses title
and document ID as deterministic final tie-breakers. Neither ordering field is
displayed. Shareholder Relation, Financial Reports and category ordering were not
changed.

Existing local records were observed returning `order: null` after the schema
addition. The browser treats legacy null or missing values as `0`, while still
rejecting non-integer values, so those records remain visible until an editor
saves an explicit order.

The corresponding Strapi schemas define `order` as a required integer with
default `0`, and the generated content-type declarations were refreshed. No live
records, permissions, endpoints or Draft & Publish settings were changed. Before
starting the updated Strapi instance against an existing database, take a database
backup; Strapi must then be restarted so schema synchronization can create the new
columns.

| Check                       | Result                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------- |
| Strapi schema tests         | All 15 Node tests passed, including the three required integer/default checks.          |
| Strapi TypeScript and build | `npm run typecheck` and the production admin build passed.                              |
| Website formatting          | `npm run format:check` passed.                                                          |
| Website Astro/TypeScript    | `npm run check`: 98 files, zero errors, warnings or hints.                              |
| Static output/build         | `npm test`: all 48 checks passed; all seventeen static routes built.                    |
| Investor browser tests      | All 15 passed, including ordering across pages and exact timestamp/title/document ties. |
| Complete browser tests      | `npm run test:browser`: 208/208 Chromium tests passed.                                  |
| Frontend static audit       | Strict audit completed with zero errors, warnings or unresolved findings.               |

## Shareholder category loading and original-date ordering — 8 September 2026

The Shareholder Relation page now requests `original_created_at:desc` and sorts the
complete paginated result by the custom original creation date before building
cards. Dated records appear newest first, equal dates use title and document ID
for stable ordering, and undated records remain visible at the end. Each category
is requested from Strapi only when selected and preserves this order. The date is
not rendered in the interface.
The category selector intentionally omits All Categories and selects the first
alphabetical category after loading.

The accompanying Strapi schema and seed script add and populate the optional
`original_created_at` field without conflicting with Strapi's system `createdAt`
database column. Migration values
are required in `YYYY-MM-DD HH:mm:ss` format and are normalized from
Asia/Kolkata time. No live seed was run; Strapi must be restarted before the
owner reruns the script to backfill existing records.

| Check                    | Result                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------- |
| Strapi seed tests        | All six Strapi test files passed, including fixture date validation and payload checks. |
| Strapi TypeScript        | `npm run typecheck` passed.                                                             |
| Website formatting       | `npm run format:check` passed.                                                          |
| Website Astro/TypeScript | `npm run check`: 98 files, zero errors, warnings or hints.                              |
| Static output/build      | `npm test`: all nine Node test files passed; all seventeen static routes built.         |
| Browser tests            | Full 206/206 and all 13 focused Investor tests passed, including per-category requests. |
| Development layouts      | `npm run test:dev`: all 35 responsive and local-asset checks passed.                    |

## Blog listing and post pages — 7 September 2026

`/blog/` and `/blog/post/?id=<documentId>` are the sixteenth and seventeenth
static routes. They read published records from `GET /api/blogs`; the list
follows pagination, populates the optional banner and sorts the complete result
by newest `publish_date`. Each post page fetches one public document and renders
its `content` as sanitized Markdown. Tables retain their structure and scroll
inside the article on narrow screens; unsafe links, images, scripts and forms are
removed.

Both routes use the shared header, footer, preview metadata and design tokens.
The listing follows the source's single-column banner, title, excerpt, Read More
and date pattern. Loading, empty, missing, malformed, permission and network
states remain distinct, with manual Retry and honest configuration/no-JavaScript
fallbacks. The Blog navigation destination is local and remains current on an
individual post. No Strapi code, schema, record, permission or configuration was
changed.

| Check                     | Result                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| Formatting                | `npm run format:check` passed.                                                                 |
| Astro/TypeScript          | `npm run check`: 98 files, zero errors, warnings or hints.                                     |
| Static output/build       | `npm test`: all nine Node test files passed; all seventeen static routes built.                |
| Production browser tests  | `npm run test:browser`: 205/205 Chromium tests passed, including eight focused Blog tests.     |
| Development layout/assets | `npm run test:dev`: 35/35 responsive and local-asset checks passed, including four Blog sizes. |
| Design checks             | Strict frontend audit found zero findings; DESIGN.md lint reported zero errors and warnings.   |
| Reference review          | The live IndoThai Blog listing and its desktop layout were inspected without changing content. |

The local Strapi service was unavailable during implementation, so no live Blog
response or banner was verified and no record was created or changed. Mocked
browser tests cover pagination, sorting, missing banners, safe Markdown, errors
and responsive layouts. Before release, verify Public Find for Blog, populated
banner access, production CORS and all published copy/images. CMS records and
per-post metadata are absent from initial HTML because this deliberately simple
static implementation loads them in browser JavaScript; preview remains
`noindex, nofollow`.

## Client Relation and Investor navigation — 5 September 2026

`/investors/client-relation/` is the sixth local Investors destination and the
fifteenth static route. It reads published `client-relation` records from
`GET /api/client-relations`, populates each required `file`, sorts the complete
paginated result by title and renders a simple document list. Safe HTTP(S) files
receive a Download action; missing or unsafe files remain visible as unavailable.

The shared Investor page navigation is now one rounded brand-blue tab band with
white labels and a clear white active tab. It remains a single row and scrolls
inside the band on narrow screens, with a slim high-contrast scrollbar; the page
itself does not overflow. The Client Relation page has one H1, unique preview
metadata, loading/empty/error states, manual Retry, contact alternatives and a
no-JavaScript/configuration explanation. No Strapi code, schema, record,
permission or configuration was changed.

| Check                     | Result                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| Formatting                | `npm run format:check` passed.                                                                          |
| Astro/TypeScript          | `npm run check`: 91 files, zero errors, warnings or hints.                                              |
| Static output/build       | `npm test`: all eight Node test files passed; all fifteen static routes built.                          |
| Production browser tests  | `npm run test:browser`: 197/197 Chromium tests passed, including Client Relation and narrow navigation. |
| Development layout/assets | `npm run test:dev`: 31/31 responsive and local-asset checks passed across all six Investor routes.      |
| Design checks             | Strict frontend audit found zero findings; DESIGN.md lint reported zero errors and warnings.            |
| Manual visual check       | The populated local Overview and revised shared tab band were inspected at the available browser width. |

The staging Investor Client Relation tab was inspected for its document-row
pattern. The running local browser loaded one published Client Relation record
and its populated file through the existing Strapi endpoint; no Strapi data was
changed. API pagination, sorting, unsafe URL handling and empty/error states are
additionally covered with mocked browser responses. Before release, verify the
production CORS origin and review all published titles/files. CMS records remain
absent from initial HTML and preview remains `noindex, nofollow`.

## Corporate Presentation — 5 September 2026

`/investors/corporate-presentation/` is the fifth local Investors destination
and the fourteenth static route. It imports the owner-supplied
`src/assets/docs/corporate-presentation_.pdf`, embeds it in a responsive preview
and provides separate View and Download actions using the same generated local
asset URL. It makes no Strapi request and adds no page JavaScript or dependency.

The staging IndoThai Investors reference was inspected with its Corporate
Presentation tab selected. The implemented page follows its centered heading,
large rounded 16:9 preview and View/Download pattern while retaining the migrated
site's shared Investor navigation and design tokens. The phone frame becomes 4:3
so both actions stay visible and the page does not overflow.

| Check                     | Result                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| PDF inspection            | `pdfinfo`/`file`: valid 31-page PDF, optimized, not encrypted and no embedded JavaScript.               |
| Astro/TypeScript          | `npm run check`: 89 files checked with no errors, warnings or hints.                                    |
| Static output/build       | `npm test`: all eight Node test files passed; all fourteen static routes built.                         |
| Production browser tests  | `npm run test:browser`: 195/195 Chromium tests passed, including the local preview/actions check.       |
| Development layout/assets | `npm run test:dev`: 31/31 responsive and local-asset checks passed, including all five Investor pages.  |
| Design checks             | Strict frontend audit found zero findings; DESIGN.md lint completed successfully.                       |
| Manual visual check       | Desktop and 390px phone layouts were inspected; heading, frame, actions and navigation remained usable. |

The embedded preview depends on the browser's built-in PDF support. View and
Download remain available if inline preview is unsupported. The supplied PDF is
not tagged, so accessibility remediation of the document itself remains a release
requirement. Preview metadata remains `noindex, nofollow`; nothing was deployed.

## Regulation 46 Disclosures — 5 September 2026

`/investors/disclosures-under-regulation-46/` is the fourth local Investors
destination. It loads published records from `GET /api/disclosure-2015s`, whose
maintained Strapi schema contains only required `title` and `link` fields. The
complete paginated result is sorted alphabetically and rendered as clear document
rows with a single “View Disclosure” action. Only HTTP(S) links without embedded
credentials become clickable; unsafe destinations remain visible as unavailable.

The route has the requested Regulation 46 H1, unique preview metadata, shared
Investor navigation, loading/empty/error states, manual Retry, contact alternatives
and a no-JavaScript/configuration explanation. It remains a static Astro shell;
CMS records are loaded in browser JavaScript and are absent from initial HTML.
No Strapi code, schema, permission, record or configuration was changed.

| Check                     | Result                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| Formatting                | `npm run format:check` passed.                                                                  |
| Astro/TypeScript          | `npm run check`: 87 files, zero errors, warnings or hints.                                      |
| Static output/build       | `npm test`: all eight Node test files passed; all thirteen static routes built.                 |
| Production browser tests  | `npm run test:browser`: 194/194 Chromium tests passed, including nine focused Investor tests.   |
| Development layout/assets | `npm run test:dev`: 31/31 responsive and local-asset checks passed across all four routes.      |
| Design checks             | Strict frontend audit found zero issues; DESIGN.md lint reported zero errors and warnings.      |
| Manual visual check       | The populated local page, long Investor label, active state and document row were inspected.    |
| Live read                 | Existing local Strapi returned one published disclosure; no record or configuration was edited. |

Before release, verify Public Find permission, the production CORS origin and all
published titles and destinations. The route remains `noindex, nofollow` until the
production domain and WordPress routing are approved.

## Financial Reports — 5 September 2026

`/investors/financial-reports/` is the third local Investors destination. It
loads published `financial-report` records from `GET /api/financial-reports`,
populates each record's `file`, sorts the complete result by newest year and
groups the already-loaded records in native year dropdowns. The newest year opens
initially and older years remain collapsed until selected. Each dropdown uses the
fixed staging order of four quarters followed by Full Year, with only a “Download
Report” action for available files. Per-year counts, filenames and sizes are not
shown, and the loaded total is announced without adding visible clutter. Periods
with missing or unsafe files are omitted.

The route has one H1, unique preview metadata, the shared Investor page navigation,
loading/empty/error states, manual Retry, a no-JavaScript/configuration explanation
and contact alternatives. It keeps the static build independent of Strapi and
introduces no framework, CMS SDK, server adapter, dependency or new design token.

| Check                     | Result                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| Formatting                | `npm run format:check` passed.                                                                           |
| Astro/TypeScript          | `npm run check`: 85 files, zero errors, warnings or hints.                                               |
| Static output/build       | `npm test`: all eight Node test files passed; all twelve static routes built.                            |
| Production browser tests  | `npm run test:browser`: 192/192 Chromium tests passed, including seven focused Investor tests.           |
| Development layout/assets | `npm run test:dev`: 31/31 responsive and local-asset checks passed, including all three Investor routes. |
| Design checks             | Strict frontend audit found zero issues; DESIGN.md lint reported zero errors and warnings.               |
| Manual visual check       | The populated latest-year open state and collapsed year row were inspected in the local browser.         |

The running local page loaded five published reports across 2024 and 2025 from
the existing Strapi endpoint, including a Full Year record with `quarter: null`.
The latest year opened initially and older years remained collapsed; no Strapi
record or file was changed. Mocked browser tests additionally verify
sorting, unsafe URL rejection, multiple year dropdowns and responsive layouts.
Before release, verify Public Find, populated media access and the approved
production CORS origin, then review the published years, report types, quarter
values and files. CMS records remain absent from initial HTML and preview remains
`noindex, nofollow`.

## Investor Overview and Shareholder Relation — 5 September 2026

The shared header now exposes an Investors disclosure containing Overview and
Shareholder Relation. Precise desktop pointers open it on hover; native
details/summary retains click, touch and keyboard operation. Escape closes the
menu and restores focus, and closed links leave the tab order. Both options route
locally and the active group/child are identified.

`/investors/overview/` reads published `overviews` in browser JavaScript and
renders every title as an independently expandable native dropdown. Descriptions
remain collapsed initially and are sanitized before rendering. Safe Markdown
tables retain their row and column semantics and scroll horizontally on narrow
screens. The JavaScript fallback is confined to `noscript`, preventing it from
flashing or repeating while CMS data loads.
`/investors/shareholder-relation/` reads shareholder relation categories and
documents, populates the category and file relations, then filters the loaded
cards locally. Empty categories retain a useful message; unsafe or missing file
URLs do not become links. Both pages have unique preview metadata, one H1, a
no-JavaScript/configuration explanation, 20-second loading timeout, manual Retry
and contact alternatives.

| Check                     | Result                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| Formatting                | `npm run format:check` passed.                                                                         |
| Astro/TypeScript          | `npm run check`: 83 files, zero errors, warnings or hints.                                             |
| Static output/build       | `npm test`: all eight Node test files passed; all eleven static routes built.                          |
| Production browser tests  | `npm run test:browser`: 191/191 Chromium tests passed, including six focused Investor tests.           |
| Development layout/assets | `npm run test:dev`: 31/31 checks passed, including both Investor routes at four responsive widths.     |
| Design checks             | Strict frontend audit found zero issues; DESIGN.md lint reported zero errors and warnings.             |
| Manual visual check       | Both unconfigured/error page states were inspected in the local in-app browser at the available width. |

The local terminal could not connect to `localhost:1337`, so no live overview,
category, shareholder document or file response was verified and no Strapi record
was created or changed. API behavior is covered with mocked responses. Before
release, enable and verify Public Find for all three content types, populated media
access and the approved production CORS origin, then review the actual published
copy and documents. Browser-loaded Investor content is absent from initial HTML;
preview remains `noindex, nofollow`.

## Private resume and complaint storage — 4 September 2026

Careers and Raise Ticket now send attachments to `POST /api/private-upload`
with `purpose=resume` or `purpose=complaint`. Their existing Candidate and
Complaint JSON bodies still contain only the returned numeric media ID. The form
layout, browser validation, 20-second timeouts, error wording and in-memory retry
behavior are unchanged.

The accompanying Strapi implementation uses a local dual-bucket provider. Ordinary
Media Library uploads stay in the existing public bucket; private-endpoint uploads
go to the configured private bucket. Provider metadata records visibility, purpose
and exact byte count. Private file access is signed for five minutes, while public
media continues to use its direct URL. Candidate and Complaint creation reject
public, cross-purpose, invalid or already-related media.

The Strapi startup rule enables only `api::private-upload.private-upload.create`
for public upload access and removes all normal Upload API actions without changing
unrelated permissions. The current relevant Public-role actions are Candidate
Create, Complaint Create and Private Upload Create only; no Candidate, Complaint
or normal Upload read/update/delete action is present. A local anonymous HTTP check returned 403 for
`GET /api/upload/files`, 403 for `POST /api/upload`, and reached validation
with 400 for an empty `POST /api/private-upload`.

A read-only GCS preflight confirmed that both configured buckets exist, the private
bucket rejects anonymous access with 403, an existing public software media URL
returns 200, and the service account can generate a five-minute signed URL. The
signed test targeted a deliberately nonexistent object and returned 404; no object
was created, listed, copied or deleted, and no bucket name or signed URL was logged.

| Check                       | Result                                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Website formatting          | `npm run format:check` passed.                                                                                          |
| Website Astro/TypeScript    | `npm run check`: 75 files, zero diagnostics.                                                                            |
| Website static output/build | `npm test`: all seven Node test files passed and all nine routes built.                                                 |
| Website browser tests       | `npm run test:browser`: 185/185 Chromium tests passed.                                                                  |
| Website development checks  | `npm run test:dev`: 30/30 asset and responsive checks passed.                                                           |
| Strapi TypeScript           | `npm run typecheck` passed.                                                                                             |
| Strapi focused tests        | `npm test`: 14/14 tests passed, including bucket-preserving media replacement.                                          |
| Strapi routes/admin build   | `POST /api/private-upload` is listed; the production admin build passed.                                                |
| Migration dry run           | 2 unique resumes, 1 unique complaint attachment and 2 generated variants; all 15 media rows still use the old provider. |

No live upload, Candidate creation or Complaint creation was performed. The
migration `apply` and `finalize` phases were deliberately not run: apply first
requires a database backup, and deleting verified public copies requires the
specified confirmation checkpoint. Private-bucket anonymous denial, Content
Manager access for allowed/limited administrator roles, and public software
downloads must be checked against the deployed storage and admin roles before
finalization.

## Procedure for Closing an Account — 4 September 2026

`/procedure-of-closing-account/` is implemented as the ninth static route and
the utility-menu destination now links locally. The page now uses the exact
full-resolution staging flowchart, stored locally and rendered responsively through
Astro's Image component.

The image preserves the eight source steps, nil-holding and with-holdings branch,
external eKYC destination, submit path and visible error-return state. A hidden
heading and matching text transcript make the image content available to assistive
technology. The route has unique preview metadata and `noindex, nofollow`. It needs
no Strapi service, client JavaScript or new dependency.

| Check                    | Result                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Formatting               | `npm run format:check` passed.                                                                                |
| Astro/TypeScript         | `npm run check`: 75 files, zero errors, warnings or hints.                                                    |
| Static output and build  | `npm test` passed all seven Node test files and generated the nine approved static routes.                    |
| Production browser tests | `npm run test:browser`: all 185 Chromium tests passed, including the three new procedure tests.               |
| Development tests        | `npm run test:dev`: all 30 layout and asset checks passed, including the procedure at four responsive widths. |
| Design checks            | Strict frontend audit found zero issues; DESIGN.md lint reported zero errors and warnings.                    |

The new browser coverage verifies the local optimized image, complete transcript,
current navigation state and layouts at 1280, 768, 390 and 320px. Captures at all
four widths were inspected. No horizontal overflow or missing assets were found.

The [staging procedure page](https://staging-e356-indothaiweb.wpcomstaging.com/procedure-of-closing-account/)
was inspected as the content and visual reference. Its original 2366×3612 JPG was
downloaded from the staging media path; the previous project's small derivative was
not used. No live form or Strapi request was made, and nothing was deployed.

## Raise Ticket and complaint attachments — 4 September 2026

`/raise-a-ticket/` is implemented as the eighth static route. The utility menu
now links locally and marks the page as current. Its centered support heading,
two-column form card and single-column phone layout reuse the existing typography,
panel, action, error, status and support-band tokens without introducing a UI
library, dependency or new design system.

The seven required fields map exactly to `name`, `client_id`, `email`, `mobile_no`,
`issue`, `subject` and `description`. Issue choices match Strapi's enumeration.
The optional attachment accepts the documented extensions up to exactly 5,000,000
bytes and remains local until submission. With a file, the browser uploads multipart
`files` plus `purpose=complaint` to `/api/private-upload` and passes its numeric ID as `attachment` to
`POST /api/complaints`; without a file, only the seven strings are sent.

| Check                    | Result                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Formatting               | `npm run format:check` passed.                                                                               |
| Astro/TypeScript         | `npm run check`: 71 files, zero errors, warnings or hints.                                                   |
| Static output and build  | `npm test` passed all six Node test files and generated the eight approved static routes.                    |
| Production browser tests | `npm run test:browser`: all 182 Chromium tests passed, including all 20 Raise Ticket tests.                  |
| Development tests        | `npm run test:dev`: all 29 layout and asset checks passed, including Raise Ticket at four responsive widths. |
| Design checks            | Strict frontend audit found zero issues; DESIGN.md lint reported zero errors or warnings.                    |

Raise Ticket browser coverage verifies the exact JSON with and without an attachment,
multipart field name, numeric media relation, omitted credentials/referrers, stable
busy button, duplicate-click prevention, native Issue selection and first-error
focus. It covers empty, unsupported, maximum-size and oversized files; removal;
all planned validation, permission, rate-limit, size and server errors; network and
malformed responses; the 20-second timeout; and manual complaint retry without
uploading the same selected file twice. Missing configuration and no-JavaScript
fallbacks retain compliance contact links. Captures at 1280, 768, 390 and 320px
were inspected and have no horizontal overflow.

All website endpoint behavior was mocked. No complaint or attachment was submitted
to the live Strapi service and no existing complaint was read. The later private
storage work changed the separate Strapi provider, endpoint and upload permission
policy as recorded above. The website's final production build succeeds without
Strapi running.

The private-upload integration now supplies private delivery and server-enforced
file type/size checks. Production still requires least-privilege permissions,
restricted CORS, rate limiting, abuse and malware protection, retention/orphan
cleanup, HTTPS and privacy/security approval.

## Close Account request — 4 September 2026

`/close-account/` is implemented as the seventh static route. Its professional
single-card layout reuses the shared header, footer, SEO and design tokens without
the old page's duplicate logo or modal-style close icon. The Modify Account menu
links locally and marks the nested route as current.

The four required fields map exactly to `bo_id`, `ucc`, `email` and `mobile_no`.
The browser submits only those values to `POST /api/close-account-requests`, with
no token, cookie or publication override. BO ID has no length or pattern rule.
Only a confirmed Strapi creation clears the form; error and uncertain outcomes
retain values and never claim that the account itself has been closed.

| Check                    | Result                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Formatting               | `npm run format:check` passed.                                                                               |
| Astro/TypeScript         | `npm run check`: 67 files, zero errors, warnings or hints.                                                   |
| Static output and build  | `npm test` passed all five Node test files and generated the seven approved static routes.                   |
| Production browser tests | `npm run test:browser`: all 162 Chromium tests passed, including all 13 Close Account tests.                 |
| Development tests        | `npm run test:dev`: all 28 layout and asset checks passed, including the new form at four responsive widths. |
| Design checks            | Strict frontend audit found zero issues; DESIGN.md lint reported zero errors and warnings.                   |

Close Account browser coverage includes the exact four-field body, omitted tokens,
cookies and referrers, duplicate-click prevention, stable button size, inline
required/email validation, one-character BO ID acceptance, confirmed clearing,
retained values for every failure class, malformed and network responses, the
20-second timeout, missing configuration and no-JavaScript fallbacks. Error and
success states were captured at 1280, 768, 390 and 320px with no horizontal
overflow. The local route, heading structure, form controls, support links and
regulatory footer were also inspected in the browser.

All endpoint tests were mocked. No live closure request was created and no existing
request was read. The final production build succeeds without Strapi running.

Production still requires Create-only public permission, restricted CORS, server-side
validation, rate limiting and abuse controls, retention rules, HTTPS and privacy/security
approval. The Astro implementation does not modify Strapi.

## Careers and applications — 4 September 2026

The migration now includes `/careers/` and `/careers/job/?id=<documentId>`.
Published Open, Closed and Filled roles load in browser JavaScript; only Open
roles enable the application form. Careers remains active in shared navigation on
both routes. The detail page sanitizes formatted descriptions and retains the
reference's Overview/Apply Now tabs with keyboard operation.

Applications use the existing public Strapi endpoints without a token. The browser
rechecks the opening, uploads one PDF with `purpose=resume` to `/api/private-upload`, then creates the Candidate
through `/api/candidates`. Name, email, LinkedIn URL and resume are required;
contact number and additional links are optional. Selection does not upload, and
the client rejects empty, non-PDF and files larger than exactly 2,000,000 bytes.
Only confirmed Candidate creation clears the form. A confirmed upload ID is reused
only in memory for manual retry with the same selected File.

| Check                    | Result                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| Formatting               | `npm run format:check` passed.                                                                          |
| Astro/TypeScript         | `npm run check`: 63 files, zero errors, warnings or hints.                                              |
| Static output and build  | `npm test` passed all four Node test files and generated the six approved static routes.                |
| Production browser tests | `npm run test:browser`: all 149 Chromium tests passed, including all 58 Careers tests.                  |
| Development tests        | `npm run test:dev`: all 27 layout and asset checks passed at 1280, 768, 390 and 320px where applicable. |
| Design checks            | Strict frontend audit found zero issues; DESIGN.md lint reported zero errors and warnings.              |

Careers browser coverage includes sorted/paginated listings, every job status,
tags, empty/missing jobs, sanitized Markdown, tab focus, configuration/no-JavaScript
fallbacks, safe query IDs and list/detail errors with manual Retry. Form coverage
includes inline validation, PDF limits/signature, removal/replacement, duplicate
clicks, exact request bodies, omitted credentials/referrers, success clearing,
retained values on failure, each upload/create failure class, 20-second timeouts,
and retry after a successful upload. Long values and both routes were checked for
overflow and missing assets through 320px. An early run exposed focus loss when a
focused Retry button became disabled; the component now restores focus and the
final suite covers that regression.

Reference and local pages were inspected at desktop, tablet and phone widths.
The local page displayed the existing published opening from the read-only Strapi
endpoint with no horizontal overflow. No candidates were read. No resume upload or
Candidate creation was performed because live writes require separate approval;
upload/create permissions therefore remain unverified. All automated application
requests used mocked API responses, and the final normal build succeeds without
Strapi running.

Private file delivery and server-enforced limits are now implemented in Strapi.
Malware and abuse protection, retention/orphan cleanup, staff-access verification,
production HTTPS/CORS and privacy approval are still required. A failed application
can leave an unattached upload because the browser never deletes media. Job records
are absent from initial HTML, so per-job server-rendered metadata is not included.
The separate Strapi project now contains the private provider, endpoint, media
validation and Public upload-permission rule; no deployment, commit or email
notification integration was performed.

## Inline download metadata — 3 September 2026

Filename and size now share one row, with the file icon on the left and a subtle
divider before the right-aligned size. Long filenames wrap without hiding their
extension; missing values leave no stray divider or empty row. Only template/CSS
changed; the browser loading and filtering code is untouched.

Formatting, Astro/TypeScript (55 files, zero diagnostics), the four-route build,
all 20 static assertions and all 91 Chromium tests passed. Tests check single-line
metadata at 1280/768/390/320px, long-name containment, and absent filename/size.
Desktop and 320px screenshots were inspected. An initial geometry test compared
inline text bounds with flex line boxes; it was corrected to compare both line
boxes, keeping the same alignment tolerance. Design lint and the strict frontend
audit passed. API responses were mocked; no live CMS changes or file downloads
were made. The normal local-configured build was restored after browser tests.

## Downloads code simplification — 3 September 2026

The component now separates API loading, one-time card creation and category
filtering into named functions. Category changes toggle existing cards rather
than rebuilding their markup; there is no second in-memory software list.
Response checks use sequential guards, error handling no longer uses nested
ternaries, and file-size formatting shares one number-formatting step. The
templates, styling, filename behavior and API contract remain unchanged.

Formatting, Astro/TypeScript (55 files, zero diagnostics), the four-route build,
all 20 static assertions and all 90 Chromium tests passed. A new regression
checks card reuse; keyboard tests verify that hidden cards expose no tab stops.
Desktop cards, phone empty state and the full long filename at 320px were visually
inspected. Design lint, the strict frontend audit and whitespace checks passed.
The first type check caught an element-type mismatch in the new test; it was
fixed before rerunning. API verification used mocks, not live Strapi. The normal
local-configured build was restored afterwards. No CMS changes, dependencies,
software downloads, commits or deployment were made.

## Download filenames — 3 September 2026

Cards now display the selected attachment's filename and extension above its size.
The browser uses the media name, appends a missing known extension, and falls back
to the URL basename when the name is missing. Filenames render as plain text;
long names wrap without truncation. First-attachment behavior is unchanged.

Formatting, Astro/TypeScript (55 files, zero diagnostics), the four-route build,
all 20 static assertions and all 89 Chromium browser tests passed. The browser
suite includes 28 Downloads tests covering filename fallback, case-insensitive
extension matching, escaped URL names, literal CMS text, ignored later files and
long-name wrapping at 320px. Desktop and narrow-phone screenshots were inspected.
Design-document lint, the strict frontend audit and `git diff --check` passed.

The local Strapi address refused connections during this follow-up, so live
filename verification was unavailable; the page correctly showed its connection
error. Browser tests used mocked responses. The earlier live results below are
historical, not a claim of current API availability. The normal local-configured
build was restored after tests and succeeded without Strapi running. No Strapi
changes or software downloads were made.

## Software Downloads — 3 September 2026

Four routes are now implemented: Home, About Us, Mutual Funds and `/downloads/`.
Downloads is a static page shell with browser-only Strapi loading on each refresh.
The listing is absent from initial HTML; preview `noindex, nofollow` is retained.
No dependencies, server adapter, CMS helper framework or deployment were added.

| Check                    | Result                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Formatting               | `npm run format:check` passed.                                                                            |
| Astro/TypeScript         | `npm run check`: 55 files, zero errors, warnings or hints.                                                |
| Static output and build  | `npm test` passed; direct non-isolated execution passed all 20 assertions. Four static routes generated.  |
| Production browser tests | `npm run test:browser`: all 87 Chromium tests passed, including 26 Downloads tests.                       |
| Development tests        | `npm run test:dev`: all 19 layout/asset checks passed across the four routes.                             |
| Design checks            | Design-document lint and strict frontend audit reported no errors or warnings. `git diff --check` passed. |

Downloads coverage includes alphabetic sorting, pagination on both endpoints,
uncategorized records, duplicate category names distinguished by `documentId`,
empty categories and globally empty software, optional descriptions/sizes,
single-media responses, first-file-only arrays, missing/unsafe first files, and
literal rendering of CMS text. Requests omit credentials and do not run when
filtering. Loading, 20-second timeout, manual retry, duplicate-retry prevention,
401/403/429/500, network and malformed-response errors, later-page failures,
keyboard selection/focus, local navigation and no-JavaScript/configuration
fallbacks are covered. Both test servers use the mock API origin; neither reads
nor writes live CMS data. The mock-origin build succeeds without that host existing.

Desktop, tablet and phone checks verify 3/2/1 columns at 1280/768/390px; 320px is
also covered. Captures include populated, empty and denied-access states. Desktop
live, tablet/phone populated and narrow-phone error screenshots were inspected.
Reference comparison follows the staging filter underline and bordered card
treatment; the approved compact H1 and live Strapi data are intentional differences.
Initial tests caught missing utility-menu current-page markup and retry focus
restoration, both fixed. The timeout fixture was paused before advancing its clock
to avoid wall-time drift; no assertions were weakened.

**Read-only live verification:** both local endpoints now return HTTP 200, with
`Access-Control-Allow-Origin: http://127.0.0.1:4323`. The local Downloads page
displayed two existing software records under All Categories and IT, while
Compliance displayed “No software yet.” File sizes and destination URLs matched
the returned media objects. No records were created/edited/deleted, no enquiries
were read, and no attached files were downloaded or executed.

The live schema differs from the earlier plan: `artifact.multiple` is now false
and software now has Draft & Publish enabled. Categories also retain Draft &
Publish. The website accepts single media objects and first-file-only arrays,
without changing either schema or sending publication overrides. Public read
permissions were already available at verification; this task did not configure
them. The existing software descriptions identify the entries as samples; final
content, file safety and publication are the owner's pre-release responsibility.

Normal output is rebuilt with the local API configuration after the mock tests.
Production HTTPS/API availability, publication/read permissions, CORS and file
delivery headers remain deployment checks. Browser coverage is Chromium, not a
screen-reader/physical-device or accessibility-compliance certification.

## Previous contact endpoint integration — 3 September 2026

Home and Mutual Funds now use the same browser-only JSON POST handler for the
existing Strapi contact endpoint. Static output, three-route scope, visual token
ownership and `noindex, nofollow` remain unchanged. This supersedes the preview-only
contact assertions in the historical migration results below.

Owner-requested simplification: the four fields and handler now live in
`Contact.astro`. Removed the field/response helper layer, separate submission script,
leave-page warnings and two-build test setup. Client errors stay inline; backend
errors use safe form-level feedback. Tests use one mock-configured build/server.
The checks below were rerun for this simplification.

| Check                          | Result                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Formatting                     | `npm run format:check` passed.                                                                                                       |
| Astro/TypeScript               | `npm run check`: 51 files, zero errors, warnings or hints.                                                                           |
| Static checks                  | `npm test` passed; direct non-isolated execution passed all 18 assertions.                                                           |
| Production build               | Three static routes generated. Both the mock-configured and normal local builds passed; `dist/` was rebuilt with the local endpoint. |
| Production browser tests       | `npm run test:browser`: all 61 Chromium tests passed, including 30 contact tests.                                                    |
| Development image/layout tests | `npm run test:dev`: all 15 checks passed across the three routes on the isolated rerun.                                              |
| Design checks                  | Design-document lint and strict frontend static audit passed with zero errors/warnings; `git diff --check` passed.                   |

The first development run passed 13/15 checks; two encountered a page reload while
formatting/build verification was running alongside it (detached DOM/context errors).
Rerunning without simultaneous builds or edits passed all 15. No test assertions
were weakened to address those interruptions.

Verification covers required fields/email, optional message, international phone
formatting, exact four-field payload, no authorization/cookie/referrer headers,
duplicate-submit prevention, inline errors/focus, retained values on failure,
confirmed-success clearing, 400/422/401/403/429/500 responses, malformed responses,
network failure, and the 20-second timeout without automatic retries. A separate
composition check verifies that text composition cannot submit early. The disabled
client fallback is tested by removing the endpoint from a page fixture before its
script runs, not by maintaining a second build/server. No-JavaScript checks still
use actual generated HTML. All requests to the test endpoint `http://strapi.test`
are intercepted; automated browser tests do not create Strapi records.

Desktop (1280px), phone (390px) and narrow-phone (320px) error/success screenshots
were captured for both forms. Desktop Home errors and phone Mutual Funds success
were visually inspected; existing layout and image checks cover all three pages
at 1280, 768, 729, 390 and 320px. Form feedback uses reserved space, token-owned
error colors and an accessible status region outside the busy fieldset.
These checks are not screen-reader or full accessibility conformance approval.

**Earlier live smoke test (before simplification):** the local preview on port 4323 submitted one synthetic
enquiry from each page to `http://localhost:1337/api/contact-forms`, without an API
token. Both returned HTTP 201 with a created Strapi document, showed success and
cleared the form. Neither page acquired query parameters. The two test entries are
named `Website integration smoke test - Home` and
`Website integration smoke test - Mutual Funds`, using
`website-smoke-test@example.invalid`; they remain in Strapi. No existing enquiries
were read, changed or deleted. Strapi's repository stayed clean and its code,
schema, permissions, CORS and configuration were not changed. Admin-list retrieval
and email delivery were not tested; no email integration was added. This
simplification does not repeat those live submissions or create additional records.

Release limitations: existing backend permissions/CORS and publication behavior
remain the owner's responsibility. No backend rate limiter/honeypot or CAPTCHA is
included. Production HTTPS/origins, server-side abuse protection, staff permissions,
privacy/retention review and revoking the previously shared token remain outstanding.
The endpoint URL is public configuration; no token is used or stored by this change.

### Previous migration baseline (historical)

Implementation review: 2 September 2026. This records local Home, About Us and Mutual Funds builds,
not deployment readiness or regulatory/accessibility approval.

## Checks completed

| Check                        | Result                                                                                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run format:check`       | Passed.                                                                                                                                                                                               |
| `npm run check`              | Passed: zero errors, warnings or hints.                                                                                                                                                               |
| `npm test`                   | Passed, including a production static build.                                                                                                                                                          |
| Direct static test execution | Eight homepage/shared groups and ten secondary-page groups passed (18 total).                                                                                                                         |
| `npm run test:browser`       | All 33 Chromium tests passed, including the 16 homepage regressions, static NRI overlay and About Us viewport/header checks.                                                                          |
| `npm run test:dev`           | All 15 development-mode viewport/image tests passed across three routes.                                                                                                                              |
| `npm run build`              | Three static routes generated in `dist/`: Home, About Us and Mutual Funds.                                                                                                                            |
| Design-document lint         | Zero errors or warnings; token groups intentionally reference the CSS owner.                                                                                                                          |
| Frontend static audit        | Strict audit passed with zero findings; not a substitute for browser/accessibility review.                                                                                                            |
| Version control              | Homepage and secondary-page commits retained. This changeset contains the NRI illustration and About Us hero/header refinements. Generated artifacts remain ignored; no push or deployment performed. |

Browser asset tests used 1280px, 768px, 729px, 390px and 320px widths on every route. At each width the
document fit within the viewport, every tested image loaded, and no page-level
JavaScript errors were observed. The reference itself measured 394px wide at a
390px viewport; this overflow was not reproduced in the migration.

Verified interactions: primary and utility navigation, nested disclosure keyboard
operation, Escape focus restoration, outside-click dismissal, closed-menu tab
order, mobile account actions, all six testimonials, previous/next controls,
pause/resume, the five-second autoplay interval, reduced-motion automatic-motion
suppression, and readable no-JavaScript content/native disclosures.

The contact safety test filled synthetic values and pressed Enter: no submission
request or value-containing URL occurred. The button remained disabled; the fields
have no form owner or names. Static checks also enforce those constraints.

## About Us and Mutual Funds verification

- Checked complete section order: nine About Us sections and seven Mutual Funds
  sections, with shared footer after each. No contact form was added to About Us.
- About Us retains six directors, three values, four company links, five gallery
  photographs and all 11 milestone events. Original desktop/mobile timeline SVGs
  use matching responsive text transcripts. Only one transcript is exposed at a
  time. The source's currency-year and raised-amount disagreements are recorded
  in README, not silently reconciled.
- Mutual Funds retains three introductory paragraphs, five investment steps,
  six benefit cards, WINVEST content and six NRI support cards. Its login,
  Start Investing and store-badge links retain their distinct original URLs.
- Normalized heading/text-widget comparison covered 33 source widgets on About Us
  and 23 on Mutual Funds; none were missing from the generated HTML. This checks
  copy preservation, not the truth of financial or company-history claims.
- All 42 added image/icon assets are local (23 About Us, 19 Mutual Funds).
  Thirty-two were byte-equal to the prior project's assets. Responsive picture
  sources, images, styles and scripts resolve within build output.
- Tested current-page navigation, local links in both directions, nested keyboard
  disclosure controls, Escape focus restoration, outside-click dismissal and
  closed-menu tab order on both new routes. No-JavaScript/reduced-motion contexts
  retain readable sections and native navigation.
- Contact safety was tested separately on Mutual Funds with synthetic values.
  No submission or URL serialization occurred; phone/email links remain available.
- Both new routes returned HTTP 200 on the user's existing development preview
  at port 4323. All 22 About Us and 19 Mutual Funds main-content image elements
  decoded successfully, with no observed HTTP error responses.

The initial new mobile-menu test tried to click a heading covered by the open
menu; it was corrected to click genuinely outside the menu. The passing tests
do not bypass pointer hit-testing. Initial captures overlapping a rebuild were
refreshed from the completed build.

## Visual comparison

### Static NRI overlay and full-screen About Us follow-up

The owner requested a left-to-right flight trajectory crossing the NRI heading
and cards, then clarified that it must not animate. The resulting illustration
is a static, subtle foreground overlay with the original plane at its right
endpoint. It has no script, animation or pointer hit target and is hidden from
assistive technology. The earlier experimental animation was removed, not paused.
This explicitly supersedes the separated-divider treatments recorded below.

The regression checks eight widths from 320px to 1920px, including the reported
1327px viewport: overlay depth, heading/card overlap, zero animations, the 64px
plane box, containment, 60px heading-to-card gap and no horizontal overflow.
Live development screenshots at 1327px, 768px and 390px were captured; desktop
and phone captures were inspected for the line crossing content and the card layout.

About Us now fills the small viewport height with the cover-cropped office photo.
Its sticky header overlays the photo with a 50%-opaque white background; the header
itself has opacity 1, so its logo, text and actions are not faded. The menu remains
solid white. Automated checks at 1327px, 768px, 390px and 320px confirmed the hero
starts at y=0 and fills a 926px-high viewport, the photograph fills the hero,
the header remains sticky, and Escape restores focus after opening the menu.
Home and Mutual Funds retain solid header backgrounds.

Formatting, Astro checks (50 files, zero diagnostics), static-output tests,
the three-route production build, all 33 production browser tests and all 15
development asset/layout tests passed. Design lint and the strict frontend audit
reported zero errors or warnings. Screenshot evidence is ignored under
`artifacts/flight-and-about/` and browser test output. An initial capture was
interrupted by hot reload; a later lazy-image capture was corrected to scroll
the plane into view before decoding it. The final capture completed successfully.
These checks remain Chromium-only, not full contrast/compliance certification.

### Previous card-aligned NRI flight-path refinement (superseded)

After the owner rejected the miniature divider, the heading decoration was
recomposed as a wide, shallow SVG route aligned with the card grid. The line has
a non-scaling stroke; the original plane is independently sized and positioned
inside the reserved track. The complete decoration remains below the heading in
normal flow. This supersedes both flight-layout experiments recorded below.

The track is 80px high with 12px heading clearance and 40px separation before the
cards. The plane image box stays 64px square, including its transparent inset,
rather than shrinking with the illustration. Its embedded PNG bytes match the
original `fund-bg.svg`; both original flight files remain untouched. The new
shallow curve is an intentional owner-requested design refinement, not an exact
copy of the original flight path. No wording, heading typography, card styles,
page-wide section gaps or browser behavior changed.

Local preview screenshots at 1081px, 1679px, 768px and 390px were inspected.
The regression covers eight widths from 320px to 1920px, checking card alignment,
stable plane size, track containment, text clearance and no horizontal overflow.
Evidence is ignored under `artifacts/nri-flight-layout/` and browser test output.
Formatting, Astro/TypeScript checks, static-output tests, the production build,
32 production browser tests, 15 development browser tests, design lint and the
strict frontend audit passed for this revision.

### Compact NRI flight-divider follow-up

The owner found the full-width flight artwork left too much space beneath the
heading at 1081px. It is now centered and capped by `--nri-flight-max`, with the
smaller `--space-xs` heading gap. Original artwork proportions are preserved;
normal document flow still prevents text overlap. Card spacing and the shared
outer section rhythm are unchanged. These dimensions supersede the initial
overlap repair below.

Live preview screenshots were inspected at 1081px, 1679px, 768px and 390px. At
1081px the heading/artwork group is approximately 264px tall, about 120px shorter
than the preceding full-width version. The updated regression covers eight
widths from 320px to 1920px and checks an 8px heading gap, centered artwork no
wider than 560px or taller than 150px, preserved card clearance and no overflow.
Evidence is ignored under `artifacts/nri-flight-compact/` and browser test output.
Formatting, Astro checks, all 18 static assertion groups, the build, 32 production
and 15 development browser tests, design lint and the strict frontend audit passed.
The development server emitted one Astro toolbar audit `Failed to fetch` message;
the page asset and browser-error assertions still passed on all three routes.

### NRI flight-path overlap follow-up

The owner reported the flight path crossing the Mutual Funds NRI heading at
1679px. Its full-width artwork was absolutely positioned inside a smaller fixed
padding allowance. It now follows the heading in normal document flow, using the
existing spacing tokens. Original artwork, wording, typography and card styles
are unchanged; no JavaScript or new design values were added.

The new browser regression checks heading/artwork and artwork/card separation
at 1920px, 1679px, 1280px, 768px, 729px, 390px and 320px. Live development-preview
measurements at 1679px, 768px and 390px showed 20px heading clearance, 40px card
clearance and no horizontal overflow; screenshots at those widths were inspected.
Evidence is ignored under `artifacts/nri-flight/` and the browser test output.

Formatting, Astro checks, the production build, all 18 static assertion groups,
32 production browser tests, 15 development tests and the strict frontend audit
passed. Design lint passed using the locally cached official CLI after the npm
registry lookup failed. A direct static check initially overlapped a rebuild and
found no `dist/index.html`; rerunning it after the build passed both groups.

### Section-spacing follow-up

The owner requested more breathing room across all three pages after migration.
The new `--space-section-gap` token controls both the gaps between main sections
and the space before the footer: 128px desktop, 96px tablet and 72px phone.
Live measurements at 1280px, 768px and 390px confirmed those distances on every
route. Internal colored-band padding remains 96px, 80px and 56px respectively;
the separate `--space-section` token was not changed. Content, typography,
imagery and controls are unchanged.

Before/after boundary screenshots were captured on all three routes at those
widths and representative desktop/tablet/phone comparisons were inspected.
The 31 production browser tests and 15 development tests passed with stronger
assertions for exact section gaps and footer separation at five widths.
Formatting, Astro checks, all 18 static assertion groups, the static build,
design-document lint and the strict frontend audit passed. Evidence for this
follow-up is ignored under `artifacts/section-spacing/`. These gap values supersede
the earlier homepage measurements below; they are an owner-requested refinement,
not a claim of pixel equality with staging.

### Initial migration comparison

Both new routes were captured at 1280px, 768px, 390px and 320px; staging captures
cover the first three widths. Review covered the heroes, company/profile photos,
portraits, timeline variants, values, logos/gallery, investment artwork/steps,
blue bands, app promotion and NRI cards. Corrections included the tablet company
stack, source hero/subtitle scales, value-card borders, heading colors, original
mobile artwork and descriptive image alternatives. About Us hero text measures
80/60/40px and Mutual Funds 80/60/44px at desktop/tablet/phone. Source mobile
heading line heights as small as 3.2px were not reproduced. The shared outer
section rhythm remains unchanged.

These are measured and visual checks, not pixel-perfect approval. WordPress
entrance/scroll animations can leave the source timeline overlapping its next
section or produce temporarily blank content in full-page screenshots; use the
section captures and static artwork for comparison. The migration does not copy
those transient failures. Browser screenshot stitching can also show displaced
fixed-header/skip-link fragments; live DOM checks confirmed the skip link remains
offscreen until focused and the wrapped director role remains within its section.

### Homepage regression context

Staging and local screenshots were captured at desktop, tablet and phone widths.
The local capture also includes 320px. Section inspection covered the hero,
services, office imagery/About band, statistics, account-opening panel, app
promotions, testimonials, contact and regulatory footer. The original icons,
portraits, artwork and fonts are local. Shared Raleway hero sizes match the source
at desktop/tablet/phone, and the final statistic values are rendered directly.

The initial comparison corrected app-heading wording, image order, the account panel,
statistic-card arrangement, footer colors and narrow-screen wrapping. It is a
visual inspection, **not** a pixel-difference acceptance score. Owner sign-off
on exact spacing/crops is still appropriate before release.

Later owner-approved changes supersede the original statistics/testimonial layout:
equal-sized metric cards, quote-first testimonial cards with compact controls below,
SVG menu/close and nested chevron icons, a single responsive gap between sections,
and smaller desktop header actions. The gap measured 96px at desktop, 80px at
tablet and 56px below the tablet breakpoint. Header actions measured 40px high at
1644px, matching the captured staging CSS (20px line height plus 10px top/bottom
padding); coarse-pointer devices retain at least 44px targets. All values remain
owned by `tokens.css`, and the design decisions are documented in `DESIGN.md`.

Checks cover consistent metric-card geometry at 729px, 390px and 320px, testimonial
card sizing and pause-control stability, position updates, menu icon states,
section-to-section gaps, and the desktop button height. All six quotes, final
figures, source wording, destinations and reduced-motion behavior are preserved.

Other intentional differences: semantic heading hierarchy; explicit contact labels and
preview status; visible carousel controls; no entrance-animation hiding; safer
tablet/phone reflow; complete regulatory copy on mobile; visible focus states;
and the deferred accessibility toolbar. Source copy/link anomalies are listed in
README and are not silently corrected.

Generated comparison files are ignored artifacts under `artifacts/reference/`
and `artifacts/local/`; browser-test screenshots/traces are in `test-results/`.
The capture commands regenerate them. They are not shipped in `dist/`.

## Previous migration output and performance observations

Each production-build page has one H1, unique title/description, social text metadata and
`noindex, nofollow`, with no invented production canonical. Runtime images,
styles, fonts and scripts are local; account/social/regulatory destinations remain
external links. There are no React islands, third-party carousel runtime,
analytics scripts or contact endpoints.

The inspected build serves a shared CSS bundle of approximately 25 KB plus
page CSS: 4 KB for About Us, 6 KB for Mutual Funds and 11 KB for Home. Combined
gzip sizes are approximately 7–8 KB per route in a local measurement. Each new
page has about 0.85 KB of inline navigation JavaScript; Home has about 3.2 KB
including the carousel. The three local variable font files total about
137 KB. These are file-size observations, not Lighthouse scores, network-transfer
guarantees or measured Core Web Vitals. Host compression/caching and real-device
performance remain release checks.

## Remaining limitations

### Development-image repair (2 September 2026)

The original static-build checks did not catch the user's development-server
failure. Live `/_image/` requests returned HTTP 500 with `MissingSharp`, although
`sharp` was installed and importable from Node. A fresh server initially worked,
but configuration reloads brought the failure back. Explicitly externalizing
`sharp` in the Vite SSR configuration restored native-module loading without
changing imagery, styles, dependencies or production image optimization.

Follow-up checks:

- The exact user preview on port 4323 loaded all 27 image elements, with zero
  broken images and zero HTTP error responses during the full-page inspection.
- An isolated development server returned HTTP 200 for an optimized image before
  and after two simulated configuration-change events; the source file was not
  edited by this probe.
- `npm run test:dev` now runs five viewport/asset checks against a fresh
  development server, separately from the 16 production-preview browser tests.
  The heading assertion is scoped to `main` to exclude Astro's dev-toolbar shadow
  DOM. Both browser suites passed.
- Screenshots confirmed the service icons, office photograph and WINSTOCK artwork
  on the repaired development URL. No visual redesign was made.
- The additional frontend static audit initially reported a missing explicit
  `scrollbar-width` declaration. The subsequent requested UI refinement now
  declares the existing default (`auto`); the latest audit passed with zero findings.

### Release work still pending

- All nine approved routes are built, including Software Downloads. Other WordPress
  pages remain external; no calculator, transaction or account flow was migrated.
- No hosting, production routing, sitemap, canonical/social-image origin,
  indexing activation, redirects or deployment has been configured.
- The contact client and local endpoint smoke test are implemented as recorded
  above; production contact security/privacy configuration is not included.
  The floating accessibility toolbar/compliance decision remains deferred.
- External destination values were checked against source markup; authenticated
  account, payment/transfer, IPO and trading workflows were not exercised.
- Automated browser coverage is Chromium. Safari, Firefox, physical touch devices,
  screen readers, a complete contrast/zoom audit and compliance approval remain
  outstanding. No accessibility conformance certification is claimed.
- Financial/regulatory copy, publication permissions and source anomalies require
  the website owner’s release approval.
- The previous project was not modified. Normal builds do not read it or WordPress.
