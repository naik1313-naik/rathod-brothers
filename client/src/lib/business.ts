/**
 * ============================================================================
 *  SINGLE SOURCE OF TRUTH FOR BUSINESS DETAILS AND IMAGE PATHS
 * ============================================================================
 *
 *  To change a phone number, email, address or social handle, edit this file
 *  only — every button, link, tel: href, wa.me link and footer entry reads
 *  from here.
 *
 *  To swap a placeholder image for a real photograph, drop the file into
 *  src/assets/<folder>/ and change the matching import below. Nothing else in
 *  the codebase references an image path directly.
 */
import kumarPhoto from '@/assets/owners/kumar-rathod.jpg';
import kumarPhotoSm from '@/assets/owners/kumar-rathod-sm.jpg';
import karanPhoto from '@/assets/owners/karan-rathod.jpg';
import karanPhotoSm from '@/assets/owners/karan-rathod-sm.jpg';
import excavatorVisual from '@/assets/equipment/excavator-placeholder.svg';
import tipperVisual from '@/assets/equipment/tipper-placeholder.svg';
import jcbVisual from '@/assets/equipment/jcb-placeholder.svg';

export const business = {
  name: 'Rathod Brothers',
  initials: 'RB',
  tagline: 'Earthmovers & Heavy Machinery Services',
  legalName: 'Rathod Brothers',

  /**
   * Phones are stored as digits only so every consumer (tel:, wa.me, display)
   * derives from one source. `display` is the human-readable form.
   */
  phones: [
    { digits: '919019333304', display: '+91 90193 33304', primary: true },
    { digits: '98866983669', display: '+91 98866 98369', primary: false },
  ],

  email: 'info@rathodbrothers.com',
  website: 'rathodbrothers.com',
  websiteUrl: 'https://rathodbrothers.com',

  /**
   * Deliberately region-level. No invented street address — swap in a precise
   * address (and the Google Maps embed in ContactSection) when you have one.
   */
  location: {
    city: 'Karnataka',
    state: 'Karnataka',
    country: 'India',
    label: 'Karnataka, India',
    /** Rough centre of Karnataka, used for the service-area visualisation. */
    lat: 15.17,
    lng: 75.62,
  },

  social: [
    { platform: 'Instagram', handle: '@kumar_rathod_17', url: 'https://www.instagram.com/kumar_rathod_17/' },
    { platform: 'Instagram', handle: '@karan___rathod__25', url: 'https://www.instagram.com/karan___rathod__25/' },
  ],

  /**
   * No operating hours have been confirmed by the business, so none are
   * published — an incorrect schedule is worse than none. Visitors are pointed
   * straight at the phone numbers instead. Add real hours here (and the
   * matching `openingHours` in `seo.ts`) once they are confirmed.
   */
  availability: {
    label: 'Availability',
    note: 'Call or WhatsApp for current availability and scheduling',
  },
} as const;

export const primaryPhone = business.phones[0];
export const secondaryPhone = business.phones[1];

/* -------------------------------------------------------------------------- */
/*  IMAGES — swap these for real company photography when it is available      */
/* -------------------------------------------------------------------------- */
export const images = {
  owners: {
    kumar: { src: kumarPhoto, srcSmall: kumarPhotoSm, alt: 'Kumar Rathod, Owner / Partner at Rathod Brothers' },
    karan: { src: karanPhoto, srcSmall: karanPhotoSm, alt: 'Karan Rathod, Owner / Partner at Rathod Brothers' },
  },
  /**
   * These are deliberately on-brand technical illustrations, NOT photographs of
   * the Rathod Brothers fleet — no real machine photos have been supplied yet.
   * Replace each with the real machine photo and keep the same shape:
   *   import excavator from '@/assets/equipment/excavator.jpg';
   */
  equipment: {
    excavator: { src: excavatorVisual, alt: 'Illustrated tracked excavator — representative of the equipment category we support' },
    tipper: { src: tipperVisual, alt: 'Illustrated tipper truck — representative of the equipment category we support' },
    jcb: { src: jcbVisual, alt: 'Illustrated backhoe loader — representative of the equipment category we support' },
  },
} as const;

/* -------------------------------------------------------------------------- */
/*  SERVICES — the three core offerings                                        */
/* -------------------------------------------------------------------------- */
export type ServiceKey = 'excavators' | 'tipper' | 'jcb';

export interface Service {
  key: ServiceKey;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: 'excavator' | 'truck' | 'backhoe';
  equipmentImage: string;
}

export const services: Service[] = [
  {
    key: 'excavators',
    number: '01',
    title: 'Hitachi & Tata Excavators',
    subtitle: 'Sale & Service',
    description:
      'Professional excavator sale and service support for construction, infrastructure and earthmoving requirements.',
    icon: 'excavator',
    equipmentImage: images.equipment.excavator.src,
  },
  {
    key: 'tipper',
    number: '02',
    title: 'Tipper Transport',
    subtitle: 'Local & State-wide',
    description: 'Reliable tipper transport for material movement and project logistics.',
    icon: 'truck',
    equipmentImage: images.equipment.tipper.src,
  },
  {
    key: 'jcb',
    number: '03',
    title: 'JCB Earthmovers',
    subtitle: 'Site Clearance & Earthmoving',
    description: 'JCB earthmoving support for site preparation, clearance and construction activities.',
    icon: 'backhoe',
    equipmentImage: images.equipment.jcb.src,
  },
];

/* -------------------------------------------------------------------------- */
/*  OWNERS                                                                     */
/* -------------------------------------------------------------------------- */
export interface Owner {
  name: string;
  role: string;
  company: string;
  image: { src: string; srcSmall: string; alt: string };
}

export const owners: Owner[] = [
  {
    name: 'Kumar Rathod',
    role: 'Owner / Partner',
    company: business.name,
    image: images.owners.kumar,
  },
  {
    name: 'Karan Rathod',
    role: 'Owner / Partner',
    company: business.name,
    image: images.owners.karan,
  },
];

/* -------------------------------------------------------------------------- */
/*  ENQUIRY FORM OPTIONS — must stay in sync with the server's SERVICES list    */
/* -------------------------------------------------------------------------- */
export const SERVICE_OPTIONS = [
  'Tipper Transport',
  'Excavator Sale & Service',
  'JCB Earthmoving',
  'Site Clearance',
  'Other',
] as const;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number];

/* -------------------------------------------------------------------------- */
/*  NAVIGATION                                                                 */
/* -------------------------------------------------------------------------- */
export const navLinks = [
  { label: 'Home', href: '#home', id: 'home' },
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Services', href: '#services', id: 'services' },
  { label: 'Equipment', href: '#equipment', id: 'equipment' },
  { label: 'Coverage', href: '#coverage', id: 'coverage' },
  { label: 'Owners', href: '#owners', id: 'owners' },
  { label: 'Contact', href: '#contact', id: 'contact' },
] as const;

export type NavLinkId = (typeof navLinks)[number]['id'];
