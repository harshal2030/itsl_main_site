# Agent instructions: IndoThai website

## Project status

The static Astro + TypeScript + Tailwind v4 Home (`/`), About Us (`/about-us/`),
Mutual Funds (`/mutual-funds/`), Software Downloads (`/downloads/`), Careers
(`/careers/`), job details (`/careers/job/`), Close Account
(`/close-account/`), Procedure for Closing an Account
(`/procedure-of-closing-account/`), Raise Ticket (`/raise-a-ticket/`), Privacy
Policy (`/privacy-policy/`), Investor
Overview (`/investors/overview/`) and Shareholder Relation
(`/investors/shareholder-relation/`) and Financial Reports
(`/investors/financial-reports/`) and Regulation 46 Disclosures
(`/investors/disclosures-under-regulation-46/`), Client Relation
(`/investors/client-relation/`) and Corporate Presentation
(`/investors/corporate-presentation/`), Blog (`/blog/`) and blog post
(`/blog/post/?id=<documentId>`) routes are implemented and link locally.
The compatibility route `/investors/` redirects to Shareholder Relation.
The generated 404 page redirects unknown routes to Home.
Only Home opens the source Investor Alert on page load; keep it off all other routes.
Downloads, Careers, Blog and five Investor pages load CMS records in browser
JavaScript; Corporate Presentation is fully static.
All other unbuilt pages still link to staging. The previous project remains
read-only. Nothing has been deployed. Read `README.md`, `DESIGN.md`
and `VERIFICATION.md` before changes; distinguish implementation from release approval.

Owner-approved refinements include aligned statistic cards, quote-first testimonial
cards with compact controls, SVG disclosure icons, compact header actions and a
centralized section gaps across all three pages. Preserve these changes rather than restoring
the source's overlaps/backdrop; see `DESIGN.md` for their token ownership.
On phone widths, the hamburger menu covers the viewport below the visible header,
scrolls internally and prevents the covered page from scrolling. Keep the compact
dropdown behavior at tablet and desktop widths.
The owner requested a static left-to-right NRI flight overlay crossing the heading
and cards, superseding the earlier separated divider. Keep its line subtle,
non-interactive and decorative; do not animate the plane or shrink the original icon.
About Us alone has a full-viewport photographic hero behind a translucent header
background. Header text, logo, actions and dropdown remain fully opaque.
Home and Mutual Funds share a browser-only Strapi contact submission handler,
enabled by optional `PUBLIC_STRAPI_URL`. The owner explicitly prohibits changing
Strapi code, schema, permissions, CORS or configuration for this integration.

## Scope and sources of truth

- The approved static routes are Home (`/`), About Us (`/about-us/`), Mutual Funds
  (`/mutual-funds/`), Software Downloads (`/downloads/`), Careers (`/careers/`),
  job details (`/careers/job/?id=<documentId>`), Close Account
  (`/close-account/`), Procedure for Closing an Account
  (`/procedure-of-closing-account/`), Raise Ticket (`/raise-a-ticket/`), Privacy
  Policy (`/privacy-policy/`), Investor
  Overview (`/investors/overview/`) and Shareholder Relation
  (`/investors/shareholder-relation/`) and Financial Reports
  (`/investors/financial-reports/`) and Regulation 46 Disclosures
  (`/investors/disclosures-under-regulation-46/`), Client Relation
  (`/investors/client-relation/`) and Corporate Presentation
  (`/investors/corporate-presentation/`), Blog (`/blog/`) and blog post
  (`/blog/post/?id=<documentId>`).
- `/investors/` is an approved compatibility redirect to
  `/investors/shareholder-relation/`. Forward `shareholder_type` when it is
  present, including an explicitly empty value, and do not forward unrelated
  query parameters.
- Use the [staging website](https://staging-e356-indothaiweb.wpcomstaging.com/)
  as the design and content reference. Preserve its layouts, typography, imagery,
  content, and approved external links unless the user approves a change.
- The previous attempt is at `/home/mrrobot/Projects/itsl-website`. Use it as a
  structural reference and inspect reusable assets; it is not the authoritative
  design. Do not modify it or blindly copy its placeholders and incomplete flows.
- Do not migrate additional pages or rewrite financial or regulatory copy without
  approval. Keep navigation to unmigrated WordPress pages working using approved
  destinations; never invent URLs.

## Architecture and maintainability

- Use standard Astro components, TypeScript, semantic HTML, and Tailwind CSS v4.
  Use ordinary component CSS only where it improves clarity or handles styling
  that utilities do not express well. Keep browser JavaScript limited to
  interactions that need it.
- Tailwind CSS and its `@tailwindcss/vite` integration are approved for scaffolding.
  Compile styles through Astro's build; do not use the browser-based Play CDN.
- Follow the familiar `pages`, `layouts`, `components`, `data`, and `styles`
  structure documented in `README.md`.
- Keep pages focused on composing sections. Share the layout, header, footer,
  SEO markup, and genuinely reusable sections. Avoid both monolithic pages and
  unnecessary component splitting or generic page-builder abstractions.
- Keep repeated content in readable, typed data files. Centralize company details
  and external URLs in `src/data/site.ts`, navigation in `src/data/nav.ts`, and
  repeated page content in the corresponding page data file.
- About Us content belongs in `src/data/about.ts`; Mutual Funds content belongs
  in `src/data/mutual-funds.ts`. `src/data/apps.ts` owns the shared WINVEST copy
  and destinations. Reuse shared Contact and StoreBadges rather than duplicating them.
- Downloads keeps markup, typed fetching and filters in one `Downloads.astro`
  component. Keep loading, card creation and filtering clearly separated; build
  cards once and toggle their `hidden` state on category changes. Avoid generic
  CMS/rendering abstractions. Reuse `PUBLIC_STRAPI_URL`; fetch all pages of software categories and
  software only in the browser, with `artifact` and `software_category` populated.
  No tokens, cookies, CMS SDK, adapter, placeholder data or CMS configuration edits.
  All Categories includes uncategorized entries; filter locally by `documentId`
  and retain empty categories. Show “No software yet.” only after successful loading.
  Preserve first-file-only behavior for arrays and support the current single-media
  response. Use safe text rendering and HTTP(S) file URLs; never execute downloads.
  Current software and category schemas both use Draft & Publish (changed by the
  owner since planning); do not send publication overrides. See README.
  Preserve accessible loading/error/empty states, manual retry and the 20-second
  timeout. Without configuration or JavaScript, explain and retain contact links.
- Careers uses three explicit components: OpeningList, JobDetails and ApplicationForm.
  Share only the typed opening reads/configuration in `src/data/openings.ts`; keep
  submission alongside its fields. Do not turn this into a generic CMS/form framework.
  Show all published Open/Closed/Filled jobs, alphabetically, with only Open jobs
  accepting applications. Fetch pages of `/api/openings` and the selected document
  on refresh; never populate/read candidates. Use query-ID links, not build-time jobs.
  The approved `marked` and DOMPurify packages render descriptions with the formatting
  allowlist in JobDetails. No scripts, styles, embedded media or forms; normalize
  headings below the overview H2 and keep other CMS values plain text.
  Applications require name, email, LinkedIn URL and a single PDF, at most 2,000,000
  bytes; phone/additional links remain optional. Recheck Open before upload, then
  POST multipart `files` plus `purpose=resume` to `/api/private-upload` and JSON
  `data` to `/api/candidates` with
  the numeric media ID and opening documentId. No tokens, cookies, publication
  overrides, Strapi changes or automatic retries. Keep disabled HTML until the
  form guard and opening are ready; clear only after confirmed candidate creation.
  Retain a confirmed file ID only in memory for manual retry with the same File.
  Never delete uploads automatically: failures can leave unattached files.
  Keep the 20-second timeouts, truthful uncertain-outcome messages and token-backed
  inline validation. Never serialize/log applicant data or read existing candidates.
  Ask separately before live synthetic uploads/applications. Strapi owns private
  storage and server enforcement; the browser checks remain usability feedback.
- Blog uses two explicit components, `BlogList.astro` and `BlogPost.astro`, with
  typed browser reads in `src/data/blogs.ts`. Read published `blogs`, populate
  only `banner`, follow pagination and sort the complete list by newest
  `publish_date`. Use `/blog/post/?id=<documentId>` so new posts need no website
  rebuild. Render list excerpts as plain text. Sanitize post Markdown with the
  existing marked and DOMPurify packages, normalize headings below the page H1,
  preserve safe tables and allow only validated HTTP(S)/mailto links and HTTP(S)
  images. Non-image, missing or unsafe banners stay hidden. Keep loading, empty,
  error, Retry and no-JavaScript/configuration states; do not add a CMS SDK,
  adapter, placeholder posts, build-time fetch or Strapi changes.
- Investors is a six-item primary navigation disclosure. Desktop opens it on
  hover while native details/summary preserves click, touch and keyboard access.
  Keep Overview, Shareholder Relation, Financial Reports, Regulation 46
  Disclosures, Client Relation and Corporate Presentation as separate local routes and mark each
  the group and current child. `src/data/investors.ts` owns only typed browser
  reads for `overviews`, `shareholder-relation-categories`,
  `shareholder-relations`, `financial-reports`, `disclosure-2015s` and
  `client-relations`; do not turn it into a generic CMS layer. Overview rich
  text must be sanitized before insertion. Render every overview title as an
  independent native details/summary dropdown, closed initially; do not add a
  custom accordion script. Preserve safe Markdown table tags and the focusable
  horizontal table wrapper used on narrow screens. Shareholder Relation populates `file`
  and `shareholder_relation_category`, then loads only the selected category's
  records using a Strapi relation filter. It exposes only safe HTTP(S) file URLs
  and orders each complete paginated category result by the custom
  `original_created_at` field, newest first, with undated records last; do not display the
  date or confuse it with Strapi's system `createdAt`. The category selector has no
  All Categories option and selects the first alphabetical category after loading.
  User selections use the category's optional CMS `slug` as the `shareholder_type`
  query value; never derive it from `name`. Valid incoming slug values restore the
  category, and browser history must keep the URL, selector and documents aligned.
  A missing slug omits the query value. Keep filtering Strapi with the category
  document ID.
  Financial Reports populates `file`, sorts
  newest year first and groups records in native year dropdowns, with only the
  newest year expanded initially. Each expanded year keeps the staging-style fixed
  order: 1st, 2nd, 3rd and 4th Quarter, then Full Year. Show only the period and
  “Download Report” action; do not expose per-year counts, filenames or sizes.
  Hide periods without a safe published file instead of showing an unavailable
  placeholder or false link. Keep its explicit
  `year`, `report_type`, `quarter` and `file` contract: Quarter records require
  1–4 while Full Year records use `null`; do not invent CMS fields.
  Overview, Regulation 46 Disclosures and Client Relation use the CMS-managed
  required integer `order` field: smaller values appear first, ties use Strapi's
  system `createdAt` newest first, then title and document ID provide stable
  ordering across all fetched pages. Treat legacy null or missing `order` values
  as `0` until the record is updated. Do not display either ordering field.
  Regulation 46 Disclosures reads `disclosure-2015s` with required `title`,
  `link` and `order`; expose only safe HTTP(S) destinations and keep unsafe
  destinations non-clickable.
  Client Relation reads `client-relations`, populates its single required `file`,
  and exposes only safe HTTP(S) file URLs. Keep each record as one simple
  title-and-download row; do not add categories or invented fields.
  Corporate Presentation is static: import
  `src/assets/docs/corporate-presentation_.pdf` in its named component and retain
  the reference-style preview plus View and Download actions. Do not add Strapi,
  a PDF-rendering package or custom browser JavaScript for this page.
  Keep loading, empty, error, Retry and
  no-JavaScript/configuration states. No token, cookies, build-time Strapi request
  or Strapi configuration change is allowed.
- Raise Ticket keeps its markup, issue choices, scoped styles and browser handler
  together in `RaiseTicketForm.astro`. Keep the seven required complaint fields
  and optional single attachment explicit; do not add a generic form/upload layer.
  With no attachment, POST JSON directly to `/api/complaints`. With a file, POST
  it under multipart `files` with `purpose=complaint` to `/api/private-upload`, then
  include the returned numeric
  ID as `attachment` in the complaint. Retain a confirmed upload ID only in memory
  for manual retry with the same File; never delete uploads automatically. Accept
  only the documented JPG/PNG/GIF/PDF/DOC/DOCX/XLS/XLSX/TXT/CSV extensions up to
  5,000,000 bytes. These client checks are not a server-side security boundary.
- Procedure for Closing an Account uses the original full-resolution staging
  flowchart from `src/assets/images/account-closing.jpg`, rendered through Astro's
  Image component in `ClosingProcedure.astro`. Preserve its centered responsive
  presentation and matching screen-reader transcript. Do not substitute the
  previous project's small derivative or invented five-step wording.
- Privacy Policy renders the owner-supplied static legal copy in
  `PrivacyPolicy.astro`. Keep its footer destination local and preserve the
  supplied external `http://www.indothai.co.in` link with safe new-window
  attributes. Do not rewrite its legal wording without owner approval.
- Preserve all six directors, the 11-event milestone transcript, three values,
  four company links and five gallery images. The timeline uses the original
  responsive SVG artwork plus matching desktop/mobile text equivalents, not inferred
  history. Preserve and document their conflicting currency year and raised amount
  until the owner approves a correction; expose only the applicable transcript.
- Mutual Funds has five steps, six benefits and six NRI cards. Preserve the
  distinct login and Start Investing destinations and both original artwork variants.
  Do not introduce a calculator, financial transactions, gallery lightbox or new
  backend integrations without approval.
- Tailwind does not require React or shadcn/ui. Do not introduce either, a CMS,
  a state-management library, a server adapter, or another additional dependency
  without a concrete requirement and approval.
- A developer must be able to maintain, build, test, and deploy the project without
  AI. Do not make agent tools, plugins, accounts, or generated prompts prerequisites.
- Document useful conventions and non-obvious decisions in ordinary language.
  Update `README.md` alongside changes to setup, commands, structure, or deployment.

## Central design system

- `src/styles/tokens.css` is the single source of truth for shared design values:
  font families, type sizes, weights, line heights, colors, spacing, container
  sizes, radii, shadows, and shared motion values.
- Define Tailwind theme tokens with top-level `@theme` declarations and any
  supporting CSS custom properties in that same file. Keep responsive type and
  spacing overrides there too, outside `@theme` when using media queries.
- `src/styles/global.css` imports Tailwind and `tokens.css`; the shared layout
  imports this stylesheet. Keep base styling in the appropriate CSS layer so it
  does not unexpectedly override utilities.
- Use token-backed utilities for shared design values. Keep repeated styling in
  reusable Astro components rather than copying long class lists across pages.
  Component-specific CSS must consume the same tokens, not redefine brand values.
- Do not bypass central tokens with repeated arbitrary color, font-size, or spacing
  values. Use complete, statically detectable utility names rather than building
  partial class names dynamically; avoid generating large sets of unused classes.
- About Us and Mutual Funds import `src/styles/content.css`; its selectors are scoped to
  `.content-page`. Keep their measured type scales separate from the homepage.
  Preserve the shared outer section rhythm; do not restore WordPress animation
  overlaps or unusable line heights merely to match a broken source state.
- Derive initial values from the reference website. Do not substitute a new visual
  direction. Documentation explains the tokens rather than maintaining a second
  independent set of values.

## Accessibility, interactions, and SEO

- Preserve meaningful HTML structure, heading hierarchy, descriptive links, image
  alternatives, associated form labels, visible focus, and reduced-motion support.
- Verify navigation by keyboard and pointer. Closed menus must not leave hidden
  links in the tab order. Preserve actions and readable layouts on mobile.
- Connect forms only to an approved submission service. Do not expose personal
  details in query strings or show success without a confirmed submission.
- Contact uses only the existing `POST /api/contact-forms` endpoint and its four
  fields (`name`, `contact_no`, `email`, `message`) inside `data`. Do not add tokens,
  cookies, honeypots, custom responses, publication overrides or email integration.
  No CMS request occurs during builds. Missing configuration or JavaScript leaves
  the fieldset and Submit disabled; install the submit guard before enabling them.
- Preserve accessible inline validation, stable sending/error/success feedback,
  duplicate-click prevention and the 20-second timeout without automatic retries.
  Clear values only after a confirmed Strapi creation; preserve them on error and
  describe uncertain completion honestly. Never log personal data or place it in
  URLs or browser storage. Keep phone/email links and the no-JavaScript fallback.
- Keep the four form fields and their browser handler together in shared
  `Contact.astro`; do not add a generic field registry or form helper layer.
- Close Account uses only `POST /api/close-account-requests` and the four required
  fields `bo_id`, `ucc`, `email` and `mobile_no` inside `data`. Keep its markup,
  scoped styles and browser handler together in `CloseAccountForm.astro`; do not
  share customer identifiers with the contact form or add a generic form framework.
  BO ID is required only, with no invented length, numeric or pattern restriction.
  A confirmed `201` response with a Strapi document ID clears the form; every
  uncertain outcome retains values and directs the visitor to compliance before
  another attempt. Submission creates a request and must never be presented as
  confirmation that the account has been closed.
- Never perform a live Close Account test without separate owner approval. Tests
  must mock the endpoint and must not read existing closure requests. Public Strapi
  access should remain Create-only; production still requires server validation,
  abuse controls, restricted CORS, retention and privacy/security approval.
- Raise Ticket uses `POST /api/complaints` and, only when an attachment is selected,
  `POST /api/private-upload`. Send only `name`, `client_id`, `email`, `mobile_no`, `issue`,
  `subject`, `description` and the optional numeric `attachment` inside `data`.
  Preserve the exact Strapi issue enumeration, 20-second timeout per request,
  disabled fallback, inline validation, stable busy states and uncertain-result
  wording. Never log or persist complaint data. Public complaint access must remain
  Create-only; Private Upload Create is the only public upload action and normal
  Upload API operations remain disabled. Do not live-test complaints without approval.
- Tests must mock submissions by default. Real local smoke tests use explicitly
  synthetic data only; never read, alter or delete existing enquiries. Browser
  tests use one mock-configured build and preview server; no running Strapi is
  needed. Rebuild with the intended configuration before normal preview/deployment.
- The floating accessibility toolbar is deferred to pre-release compliance review.
  Do not add it or claim compliance approval without authorization.
- Preserve all six testimonials and the five-second token-owned autoplay interval.
  Pause for interaction and disable autoplay for reduced motion. No-JavaScript
  content must remain readable; never hide sections behind entrance animations.
- Final statistics are `10,000+ cr`, `15,000+` clients and `75+` employees. Preserve
  source anomalies listed in README until editorial approval changes them.
- Use shared SEO markup with unique titles, descriptions and social metadata.
  This preview must remain `noindex, nofollow`; production canonicals, sitemap,
  indexing activation, social image and domain-dependent structured data are
  deferred until the production origin and WordPress routing are approved.
- Preserve existing production paths where possible. Coordinate sitemap,
  `robots.txt`, redirects, and links with the remaining WordPress site.
- Keep staging/preview pages out of search indexing and verify that production
  pages are indexable. Do not assume `robots.txt` alone prevents indexing.
- Optimize images and fonts, reserve image dimensions, and avoid unnecessary
  client JavaScript. Never claim guaranteed rankings or equate an audit score with
  complete SEO readiness.

## Build, verification, and change discipline

- Use npm and preserve `package-lock.json`. Node is pinned in `.nvmrc`.
  Build the twenty approved static outputs into `dist/`, including the Investors
  compatibility redirect and generated 404 redirect. Software, opening,
  Blog and investor records require JavaScript and are absent from initial HTML;
  retain preview noindex and do not claim per-job or per-post server-rendered
  metadata.
- Inspect `package.json` before running commands. Run `npm run format:check`,
  `npm run check`, `npm test`, and `npm run test:browser` after application changes.
  Browser tests need the development-only Playwright Chromium installation.
- After application changes, run the available formatter checks, type checks,
  relevant tests, and production build. For image/asset changes or delivery failures,
  also run `npm run test:dev`; static-output tests do not exercise `/_image/`.
  Verify affected pages in a browser,
  including narrow layouts, keyboard navigation, and applicable interaction states.
- For migration changes, compare the implemented pages with the reference, check links
  and assets, and inspect generated HTML for metadata and indexing settings.
- For documentation-only changes, check accuracy, consistency, Markdown, and file
  scope; an application build is not required.
- Recheck the working tree before editing, preserve unrelated work, and keep changes
  within the user request. Do not deploy, change domains, configure a form service,
  or expand the migration without authorization.
- Report what changed, exactly what was verified, and unresolved risks. Keep
  planned, implemented, and tested capabilities distinct.

This file follows the project-level guidance described in the
[official AGENTS.md documentation](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
