---
version: alpha
name: IndoThai
description: Reference-led IndoThai marketing pages, Blog, account services, investor support, Software Downloads and Careers.
omitted:
  - section: colors
    reason: Canonical values live only in src/styles/tokens.css.
  - section: typography
    reason: Canonical families and responsive values live only in src/styles/tokens.css.
  - section: spacing
    reason: Canonical spacing and widths live only in src/styles/tokens.css.
  - section: rounded
    reason: Canonical radii live only in src/styles/tokens.css.
components:
  action: {}
  navigation: {}
  testimonial: {}
  contactForm: {}
  closeAccountForm: {}
  closingProcedure: {}
  raiseTicketForm: {}
  applicationForm: {}
  investorNavigation: {}
  investorAlert: {}
  investorOverview: {}
  shareholderRelations: {}
  clientRelations: {}
  blogList: {}
  blogPost: {}
---

# IndoThai design guidance

## Overview

### Creative North Star

Recreate the supplied WordPress Home, About Us, Mutual Funds, Close Account,
Procedure for Closing an Account, Raise Ticket, Software Downloads, Careers, Blog and Investor pages: graph-paper hero, generous Raleway
headlines, blue investment-service identity, actual office and app imagery,
clearly presented statistics, and a substantial regulatory footer. This is a migration,
not a new brand direction. The corresponding staging pages are authoritative; the previous
Astro attempt is only a structure/asset reference.

### Product context and register

English-language brand/marketing site for IndoThai’s Indian investors, including
the HNIs, corporations and mega traders named in the source. Core tasks are
understanding services and reaching existing account, investment and support
destinations. Desktop and phone layouts matter equally. There is no product/admin
workflow or local trading interface. The shared contact form has a small submission
workflow documented below; a separate application UX contract is not needed.

Avoid generic SaaS gradients, dashboard layouts, invented financial claims and
new UI kits. Keep utility navigation familiar and legal content readable.

The owner approved a focused refinement of statistics, testimonials and disclosure
icons on 2 September 2026. Those sections now prioritize aligned metric cards,
quote-first testimonial cards and compact SVG controls over the source's overlapping
statistic boxes and decorative testimonial backdrop. A later comment approved more
breathing room between sections and matching the smaller staging header actions.
Other section designs remain reference-led.

**Token owner:** `src/styles/tokens.css`, never this document. Its `@theme` exports
Tailwind utilities; responsive custom properties are consumed directly by the
section CSS. `global.css` imports it once through the layout. Prose here explains
roles without duplicating values. Static checks and review must keep component
brand/type values token-backed.

Scoped styles use Tailwind `@reference` and `theme(--breakpoint-...)` so changing
a breakpoint in the token file updates both utilities and section media queries.

## Colors

Brand blue owns actions, section headings, the About band, Investor tab band and footer. Ink provides
body contrast and the hero’s restrained text gradient. The pale app surface and
metric icon tiles are secondary roles. White remains the main page
surface. The accessibility toolbar mirrors staging's three contrast treatments:
High Contrast boosts contrast with a white/black/blue palette, Dark Mode uses
the source inversion treatment while restoring media, and Inverted Colors uses
black/yellow/cyan with dark form controls. The toolbar remains readable instead
of reproducing staging's inverted-mode heading defect. Forced-colors mode must
retain readable text and native system controls.

## Typography

Local Raleway is the display family, Inter is the principal body family, and
Roboto preserves small-action/footer typography. All are variable fonts with
system fallbacks. Keep the measured desktop, tablet and phone scales; do not
substitute one generic responsive heading style. Each page has one H1; Downloads
uses a compact title instead of a promotional hero.
Reference spellings and capitalization are preserved pending approval.

## Layout

`index.astro` composes named sections. Shared chrome is separate from homepage
content. Grids reflow without horizontal page overflow. About stacks at tablet
width and moves its image before copy on phones. App headings precede the image
and body on phones. Statistic cards share dimensions, padding and baselines: three
columns where the content fits, then a single column with icons beside the values.
Testimonial cards show three, two or one at the token-owned breakpoints. Their
height follows the longest quote with a modest minimum, not an oversized fixed
blank area. Keep intrinsic image dimensions.

The main container on all seventeen routes owns the space between sections and before
the footer using `--space-section-gap` from `tokens.css`. The owner requested a
more generous rhythm across all three pages after their migration. This outer-gap
token is independent of `--space-section`, which retains internal padding in
colored bands. Do not stack section-specific outer margins/padding on top of that
rhythm. Other internal spacing (for example the About heading-to-band distance)
also remains unchanged. Header actions
have dedicated compact height/padding tokens, with a larger minimum on coarse
pointers; other calls to action keep their existing dimensions. The shared header
uses its own full-width `--header-max` token so wide screens retain only the normal
page gutter instead of inheriting the narrower content container's outer margins.

Secondary routes compose sections from their own folders. `content.css` supplies
patterns scoped to `.content-page`; its independent content-heading and hero tokens
must not shrink or enlarge the homepage. About Us uses a viewport-filling photographic
hero with a cover crop behind its sticky header. The About-only header surface uses
`--header-about-surface`; never apply opacity to the whole header. Its text, logo,
buttons and dropdown stay opaque. `--about-hero-height` owns the viewport sizing;
content may grow beyond it on unusually short screens. About continues with an
image-and-story introduction that stacks at tablet width, three-column director
portraits on wider screens, original desktop/mobile timeline artwork, a blue vision
band, bordered value cards, a full-width business image, company logos and a five-photo
gallery. Portraits and gallery photos have descriptive alternatives. The timeline
has visually hidden text equivalents with every source event, with only the matching
desktop or mobile version exposed. The originals disagree on two facts; see README.

Mutual Funds uses its own larger phone hero scale, original responsive investment
artwork, blue introduction and benefit bands, five numbered vertical steps, WINVEST
download banner and app artwork, flight-path illustration and NRI cards. On phones,
cards and app content stack. Keep the source-specific login and investing button
styles without changing shared header actions. The NRI section has a static,
left-to-right flight trajectory layered across its heading and cards, explicitly
requested by the owner after the separated-divider experiments. Its light dashed
stroke crosses the content; the original plane sits at the right endpoint with
an independent, consistent size. The overlay adds no layout height and cannot
intercept pointer events. `--nri-flight-*`, `--nri-plane-*` and `--nri-content-layer`
own its geometry and depth. Do not animate the plane, stretch the icon, or restore
the miniature centered divider. The decoration is hidden from assistive technology.
Both pages remain ordinary readable HTML without animation-dependent
visibility; do not reproduce the source's broken mobile line heights or timeline
overlap during entrance animation.

## Elevation & Depth

Use restrained service-card borders, subtle aligned statistic-card elevation and a
small utility-dropdown shadow. Testimonials use white cards with a light border;
there is no floating backdrop. Do not introduce frosted glass or decorative panels.

## Shapes

Use the token-owned control/card corners, asymmetric account-panel corners,
rounded office image and app surface, and circular testimonial portraits. Metrics
and testimonials share the panel-radius and panel-border tokens; controls retain
separate rounded, touch-sized geometry.

## Components

### Foundational visual states

Actions have hover and visible keyboard focus states. White-on-blue sections
use white focus outlines. Unconfigured/no-JavaScript submission remains unavailable
with nearby explanatory text. Sending and feedback states reflect actual requests.

### Accessibility toolbar

The shared bottom-right accessibility toolbar follows the staging control set
without importing its runtime. Its 56px blue trigger opens a 340px, internally
scrolling non-modal panel that fits narrow viewports. The panel owns focus while
open, closes from its trigger, close button, Escape or an outside press, and
restores focus for keyboard dismissal. It sits above the header/mobile menu but
below the Home Investor Alert dialog; outside dismissal prevents those controls
from overlapping.

Font scaling changes the root rem scale from 70% to 150% without rewriting
individual component sizes. Contrast, OpenDyslexic, missing-alt highlighting and
enhanced keyboard focus are root states backed by the accessibility tokens in
`tokens.css`. Text to speech reads a selection or visible text from `main` through
the browser speech API and exposes voice, rate, pause/resume and stop controls.
Only these preferences are stored locally; the panel opens closed and Reset all
settings removes the stored entry. The toolbar is hidden without JavaScript and
does not make accessibility or compliance a user opt-in.

### Buttons and actions

`ActionLink` owns reusable link-as-button styling. Primary actions are blue;
secondary actions use borders. External new-tab actions expose an accessible
new-tab notice. Account and IPO actions navigate to existing approved services.

### Navigation and data display

Header disclosures are non-modal and not focus trapped. Native details/summary
provide the no-JavaScript baseline. On phone widths, the main menu fills the
viewport below the still-visible header and scrolls internally; enhanced browsers
lock the covered page while it is open. Tablet and desktop widths retain the compact
dropdown. Enhancements handle Escape, outside dismissal, focus restoration and
expanded state. Closed descendants leave the tab order.
Home, About Us, Mutual Funds, Close Account, Procedure for Closing an Account,
Raise Ticket, Software Downloads, Careers, Blog and all six Investor pages route
locally, with the current page marked in its navigation link. Careers remains
active on job details and Blog remains active on individual posts.
Investors is a primary disclosure with a hover enhancement on precise pointers and
native click, touch and keyboard access everywhere. Both its group and current child
show active state. The local Investor navigation uses one brand-blue, rounded tab
band with a white active tab. Labels stay on one line and the band scrolls horizontally
instead of wrapping on narrow screens. Downloads remains in the utility menu; other
destinations remain on their existing services.

The main menu uses an SVG menu/close pair; nested disclosures have a rotating SVG
chevron. Open-state styling is driven by native details state and works without
JavaScript. Testimonials lead with readable, non-italic quotes, followed by an
aligned portrait/name/role row. Compact previous/next, position and pause controls
sit below the cards; the accessible pause label remains explicit even when its
visible text is shortened. Disabled reduced-motion controls remain readable.

### Software catalogue

Downloads follows staging's horizontal underlined category filters and bordered,
lightly elevated white cards with blue Download actions. The compact heading uses
the existing section type scale; cards use the content-card scale, body text and
caption-sized file metadata. `--color-subtle`, `--radius-testimonial`, `--shadow-card`
and existing spacing tokens own the card treatment. No new theme is introduced.
The grid has three desktop columns, two tablet columns and one phone column at the
existing breakpoints. Filters wrap, long CMS text wraps, and card actions align at
the bottom. The shared `.action` styling and native focus treatment remain intact.
File details share one compact row: file icon and filename on the left, size on
the right with a subtle divider. Use the same caption/muted tokens. Long names
wrap within their column while the size stays aligned with the first line.
Keep the full filename and extension readable; hide absent values and omit the
divider when there is no filename.

All Categories is initially selected. Native buttons use `aria-pressed` and an
underline, not color alone. Loading, error, result count and “No software yet.”
share an accessible status region. Failures offer manual Retry; completion returns
keyboard focus to All Categories when the retry button disappears. No skeleton,
fake software, modal or automatic download is introduced. Contact links remain
available in all states. CMS content is plain text; only the first attachment is
offered (or the single media object in the current schema). No JavaScript means
an explicit catalogue-unavailable explanation, not a blank area or invented data.

### Blog

Blog follows the source's restrained editorial stream rather than introducing a
generic multi-column magazine layout. A compact centered heading with a brand-blue
rule leads into one readable column of banner-led posts. Each card keeps the title,
plain-text excerpt, Read More action and publish date visually distinct. Borders,
subtle elevation, typography and controls reuse existing tokens; the only new
geometry tokens own the editorial width and banner height.

Individual posts use the same column, a clear Back to Blog link, one H1, date,
optional banner and readable Markdown body. Tables scroll inside the article on
narrow screens. Missing or non-image banners do not create empty placeholders.
Loading, empty, error and Retry states use the established CMS patterns. Motion is
limited to a slight banner hover scale and is disabled for reduced motion.

### Investor content

Investor Overview, Shareholder Relation, Financial Reports, Regulation 46
Disclosures, Client Relation and Corporate Presentation use the same restrained secondary-page
language: compact Raleway headings, readable body copy, white bordered cards and
brand-blue document actions. A small local page navigation sits above each title
so visitors can switch between the six destinations without reopening the header.
The shareholder filter is a labeled native select, matching the source's familiar
category interaction while preserving keyboard and mobile behavior. It starts on
the first alphabetical category and does not include an All Categories option.
Selecting a category replaces the document list with that category's on-demand
Strapi response and records its CMS-managed category `slug` as the
`shareholder_type` value in the URL. Opening a valid category URL restores that
selection, and browser Back and Forward keep the URL, control and document list
aligned.

CMS loading, empty/error feedback and Retry use the existing muted caption and
action patterns. Each Overview card is a native details/summary disclosure: its
blue title and chevron form the trigger, entries start closed and open independently.
On phones, configured browser-loaded result containers reserve a token-owned
`75svh` minimum height while records load. This keeps the footer below the viewport
and limits insertion shift without creating empty space in unconfigured fallbacks.
Overview rich text is sanitized and normalized below its card H2. Markdown tables
use bordered rows and a focusable horizontal scroll region so their structure is
preserved on narrow devices.
Overview, Regulation 46 Disclosure and Client Relation records use the same
CMS-managed placement rule without adding visible metadata: lower `order` values
appear first, equal values use the newest Strapi `createdAt`, and title plus
document ID keep exact ties stable across paginated responses.
Shareholder filenames and sizes share a compact line; long text wraps instead of
forcing horizontal overflow. Missing or unsafe shareholder file destinations use
visible “Download unavailable” text. Cards use the original creation date for
newest-first ordering, but the date remains hidden to keep the existing compact
document-row design. Financial Reports uses native year dropdowns
and orders available periods as 1st–4th Quarter followed by Full Year. Each period
shows only a compact “Download Report” action; unavailable periods, filename, size
and per-year counts stay hidden.
The newest year opens initially, older years stay compact, and the grid becomes
three columns on tablet and one on phones. No custom accordion script, skeleton,
animation, placeholder records or new visual theme is introduced.
Regulation 46 disclosures use the same white bordered document rows as Shareholder
Relation, with the disclosure title carrying hierarchy and one compact action at
the edge. Rows stack the action below the title on phones. No new visual tokens or
regulatory-themed decoration is introduced.
Client Relation follows the reference's centered title and simple bordered document
rows. Each row uses the Strapi title and one compact Download action; rows stack on
phones and unsafe files remain visibly unavailable. It reuses existing typography,
border, spacing and focus tokens without adding a separate theme.
Corporate Presentation follows the staging section: a centered compact heading,
large rounded 16:9 PDF preview and compact View/Download actions at the lower-right.
Phones use a taller 4:3 frame so the embedded preview remains useful without page
overflow. The component uses only existing panel, spacing and action tokens; the
PDF itself is a local build asset and no client script or CMS loading state is needed.

### Forms and overlays

The homepage opens the source Investor Alert on every page load. Its white panel,
red title, dotted copy border and dark backdrop follow the production reference,
while the native modal keeps background content inert. The close button receives
initial focus; Tab stays within the dialog, and the close button, Escape or a
backdrop click dismisses it and restores scrolling. Long copy scrolls inside the
bounded panel on short viewports. The alert uses the global dialog layer and
token-owned color, width and backdrop values without animation or browser storage.
It is intentionally absent from every non-home route.

Careers retains the reference's large text-only hero, bordered opening cards and
Overview/Apply Now tabs. Its audience is prospective employees; the task is reading
a role and applying, not investing. `--text-careers-hero`, `--leading-careers-hero`,
`--text-careers-section`, `--text-careers-card` and `--careers-hero-min` preserve its measured responsive
type without changing other heroes. Phone headings align left; cards occupy the
available content width, tags wrap, and status uses visible text rather than color
alone. No new hero imagery, stock photos, benefits claims or animations are added.

`OpeningList` owns list loading and empty/error feedback; `JobDetails` owns read-only
description rendering and tabs; `ApplicationForm` owns its explicit fields and
submission code. They share only typed opening reads/configuration. The Careers
listing shows only Open positions. Closed/Filled job details remain unavailable for
applications when reached from an old or direct URL. The form is available only after
the script guard and Open job are ready.
Tabs use native buttons with selected state, roving focus, arrow/Home/End keys and
hidden inactive panels. Without JavaScript, the generic detail explanation and
disabled form remain readable. Missing/configuration/error states keep contact links.

Application fields follow Contact's tokens, label/error associations, first-invalid
focus and stable full-width busy button. Personal Information uses two columns,
stacking on phones; Profile contains a native single-file picker, filename/size,
Remove control, LinkedIn URL and additional links. No custom dropzone or form library.
Unlike staging, the approved schema requires LinkedIn and allows only PDFs at the
owner's smaller size limit; no unsupported candidate Location field is added.

Selection is local. Submit validates, rechecks the role, uploads the PDF and creates
the candidate. After local field validation and before any request, an accessible
native modal gives a short company description and requires the applicant to type
“stock broking company”. Cancel, Escape and backdrop dismissal return focus to the
application button without sending anything; only the accepted phrase continues
to the opening check and upload. Status names these phases; only confirmed creation
clears values.
Manual retry with the same File reuses its known upload ID. There is no optimistic
success, automatic retry, resume preview/download link, persistent draft, toast or
leave-page warning. Uploads can remain unattached after failure; accepted files are
stored privately and are exposed to authorized staff through short-lived signed URLs.
`--form-panel-max` owns the shared request-form width. All other controls/feedback consume the
existing Contact, action and spacing tokens. Shared Contact itself is unchanged.

Contact, shared by Home and Mutual Funds, submits directly to the approved existing
Strapi endpoint. `Contact.astro` owns its four explicit fields, layout and browser
submission handler. No field registry, form library or separate helper layer is
needed. Neither route introduces its own form implementation.
The previous preview-only contract is intentionally superseded by owner approval.

Keep the existing labels, illustration, layout and token-backed controls. Validate
on submit and recheck fields already in error while editing; use `novalidate` rather
than browser validation bubbles. Inline error slots use `--color-error` and
`--contact-error-height`; the live status region uses `--contact-status-height`.
These values live only in `tokens.css`. Focus the first invalid field and associate
its error text; never rely on color alone. The textarea grows to
`--contact-textarea-max` and then scrolls without manual resizing.

Sending keeps the button size stable and fields readonly; a confirmed creation
clears them and announces success in place. Failures retain entered text, with no
automatic retry, raw server messages or personal data reflected in feedback.
Client validation uses field-associated errors; backend failures use a safe
form-level status rather than parsing backend error paths. The owner's simplification
removes leave-page warnings; unsaved values stay only in the controls and are lost
on navigation. Before initialization, or without configuration/JavaScript, controls
are disabled and phone/email remain available. No modal, native alert or toast
system is needed.

Close Account follows the same restrained form language without reusing Contact's
customer-independent fields or introducing a generic form abstraction. A centered
white request card, two-column desktop fields and single-column phone layout use
the existing panel, input, action, error and status tokens. Unlike the old embedded
WordPress form, the shared site header already owns the logo and navigation, so the
page does not duplicate its logo or add a modal-style close icon. The heading and
supporting copy make clear that submission creates a request rather than confirming
closure. Compliance contact links remain available when configuration or JavaScript
is missing. BO ID, UCC, registered email and mobile number are all required; BO ID
has no additional format rule. Only confirmed creation clears the form, and uncertain
outcomes retain the identifiers and advise contacting compliance before resubmission.

Procedure for Closing an Account displays the original staging flowchart at its
measured centered width, scaling down fluidly on phones. The full-resolution source
lives locally and Astro generates responsive image candidates, so normal builds do
not depend on WordPress. A visually hidden heading and transcript preserve the
eight-step sequence, branch and error path for assistive technology without adding
visible content around the approved artwork. The image has no map or simulated
click targets, matching the non-interactive source. No animation, client script or
diagram library is used. The maximum artwork width is owned by `tokens.css`.

Raise Ticket extends that restrained form-card language for the source complaint
workflow. Its wider two-column desktop grid follows the staging field order and
stacks without horizontal overflow on phones. Description and the optional file
picker span the grid; the native Issue select keeps familiar platform behavior and
the exact backend choices. The attachment summary shows its full filename, size
and a text Remove action without introducing a custom dropzone or upload library.
Status text distinguishes attachment upload from ticket creation while the primary
button retains stable geometry. Existing form, panel, error, status and support-band
tokens own the presentation; no new visual theme or durable token is introduced.
Private storage changes delivery only and introduces no visual trust claim.

### Iconography

Reuse the original extracted service and statistic icons. Decorative icons have
empty alternatives; meaningful controls have text/accessible names. No additional
icon library is required.

### Motion

The carousel interval is token-owned. Pause on hover, focus and direct interaction;
stop automatic motion for reduced-motion users and offscreen/hidden pages. All six
quotes remain in HTML and can be scrolled without JavaScript. No entrance animation
may make essential content invisible. Counters render their approved final values.

### Content and data visualization

Preserve source wording and external destinations; document anomalies rather than
quietly rewriting regulated/promotional content. Final statistics are informational
text, not an animated financial chart. The footer retains the complete regulatory
copy on phones even where the source hides parts of it.

## Do’s and Don’ts

- Do compare every section with staging at the same viewport dimensions.
- Do edit shared visual values only in the token file and keep source images local.
- Don’t copy old-project counter values or placeholder links.
- Don’t confuse homepage completion with deployment, compliance or editorial approval.
- Don’t invent director biographies, gallery interactions, fund calculators or
  investment integrations. A static migration does not add those product behaviors.
