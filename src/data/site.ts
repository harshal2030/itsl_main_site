/** Approved source destinations. Unbuilt pages deliberately remain on WordPress. */
const staging = 'https://staging-e356-indothaiweb.wpcomstaging.com';
export const productionOrigin = 'https://indothai.co.in';
export const links = {
  home: '/',
  about: '/about-us/',
  mutualFunds: '/mutual-funds/',
  careers: '/careers/',
  investors: '/investors/',
  investorsOverview: '/investors/overview/',
  shareholderRelation: '/investors/shareholder-relation/',
  financialReports: '/investors/financial-reports/',
  regulation46Disclosures: '/investors/disclosures-under-regulation-46/',
  clientRelation: '/investors/client-relation/',
  corporatePresentation: '/investors/corporate-presentation/',
  blog: '/blog/',
  openAccount: 'https://ekyc.indothai.co.in:447/',
  applyIpo: 'https://indothai.webappreports.com/applyipo/',
  login: 'https://backoffice.indothai.co.in:1467/capexweb/capexweb/index.html',
  transfer: 'https://money-transfer.indothai.co.in',
  mobileTransfer: 'https://fund-transfer.indothai.co.in/',
  mfLogin: 'https://indothai.investwell.app/app/#/login',
  mfStartInvesting:
    'https://play.google.com/store/search?q=Winvest&c=apps&pli=1',
  mfBackOffice: 'https://indothai.my-portfolio.in/',
  closeAccount: '/close-account/',
  closeProcedure: '/procedure-of-closing-account/',
  modifyAccount: 'https://ekyc.indothai.co.in:90/',
  downloads: '/downloads/',
  complaint: '/raise-a-ticket/',
  winstockApple:
    'https://apps.apple.com/in/app/winstock-indo-thai/id1409018654',
  winstockGoogle:
    'https://play.google.com/store/apps/details?id=com.wave.indothai',
  winvestApple: 'https://apps.apple.com/in/app/winvest/id1340268370',
  // The reference points both Google Play badges to WINSTOCK. Review before release.
  winvestGoogle:
    'https://play.google.com/store/apps/details?id=com.wave.indothai',
  scores: 'https://scores.sebi.gov.in/',
  sebi: 'https://www.sebi.gov.in/',
  nse: 'https://www.nseindia.com/',
  bse: 'https://www.bseindia.com/',
  rbi: 'https://www.rbi.org.in/',
  ncdex: 'https://ncdex.com/',
  mcx: 'https://www.mcxindia.com/home',
  disclaimer: `${staging}/disclaimer/`,
  raDisclaimer: `${staging}/ra-disclaimer/`,
  privacy: '/privacy-policy/',
  terms: `${staging}/terms-of-use/`,
  siteMap: `${staging}/site-map/`,
  faq: `${staging}/faqs/`,
  downloadForms: `${staging}/download-form/`,
  grievances: `${staging}/escalation-matrix/`,
  voting: 'https://evoting.cdslindia.com/Evoting/EvotingLogin',
  facebook: 'https://www.facebook.com/IndoThaiLtd/',
  twitter: 'https://x.com/IndoThaiLtd',
  linkedin: 'https://www.linkedin.com/company/indo-thai-securities-ltd/',
  femto: 'http://femtogreenhydrogen.com/',
  // The About page uses HTTPS; the original footer deliberately remains HTTP.
  femtoAbout: 'https://femtogreenhydrogen.com/',
  remigos: 'https://remigos.com/',
  skyspace: 'https://www.skyspaceoffices.com/',
  kisha: 'https://www.kishadiamonds.com/',
  smartOdr: 'https://smartodr.in/login',
  sebiCircular:
    'https://www.sebi.gov.in/legal/master-circulars/dec-2023/master-circular-for-online-resolution-of-disputes-in-the-indian-securities-market_80236.html',
} as const;

export const site = {
  name: 'IndoThai',
  legalName: 'INDO THAI SECURITIES LIMITED',
  origin: productionOrigin,
  locale: 'en-IN',
  socialHandle: '@IndoThaiLtd',
  reference: staging,
  registration: 'INZ000194938',
  researchRegistration: 'INH000024842',
  address:
    'Capital Tower, 2nd Floor, Plot Nos. 169A-171, PU-4, Scheme No. - 54, Indore, Madhya pradesh',
  structuredAddress: {
    streetAddress:
      'Capital Tower, 2nd Floor, Plot Nos. 169A-171, PU-4, Scheme No. - 54',
    addressLocality: 'Indore',
    addressRegion: 'Madhya Pradesh',
    addressCountry: 'IN',
  },
  helpdesk: { label: '9111801801', href: 'tel:+919111801801' },
  telephone: { label: '(0731) 4255800', href: 'tel:+917314255800' },
  companyPhone: { label: '+91 8269102198', href: 'tel:+918269102198' },
  marketingEmail: 'marketing@indothai.co.in',
  salesEmail: 'sales@indothai.co.in',
  complianceEmail: 'compliance@indothai.co.in',
} as const;

export const homeMeta = {
  title: 'Stock Broking, Trading & Investment Services | IndoThai',
  description:
    'Tailored financial solutions for your unique needs. Explore IndoThai’s trading, mutual funds, wealth management and investment services.',
};
