/**
 * Builds every outbound contact link from the single source of truth in
 * `business.ts`, so the WhatsApp / tel / mailto behaviour lives in one place.
 */
import { business, primaryPhone } from './business';

/** `tel:` href for a phone record. */
export function telHref(phone: { digits: string }): string {
  return `tel:+${phone.digits}`;
}

/** `mailto:` href. */
export function mailtoHref(email: string = business.email, subject?: string): string {
  const base = `mailto:${email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}

export interface WhatsAppPayload {
  name?: string;
  phone?: string;
  service?: string;
  pickup?: string;
  destination?: string;
  preferredDate?: string;
  message?: string;
}

/**
 * Builds the prefilled WhatsApp enquiry message.
 *
 * Matches the layout the business asked for, and degrades gracefully — a field
 * the visitor left blank shows a dash rather than "undefined".
 */
export function buildWhatsAppMessage(payload: WhatsAppPayload = {}): string {
  const line = (label: string, value?: string | null): string => {
    const clean = (value ?? '').trim();
    return `${label}: ${clean.length > 0 ? clean : '-'}`;
  };

  return [
    'Hello Rathod Brothers,',
    '',
    'I would like to request a quote.',
    '',
    line('Name', payload.name),
    line('Phone', payload.phone),
    line('Service', payload.service),
    line('Pickup', payload.pickup),
    line('Destination', payload.destination),
    line('Preferred Date', payload.preferredDate),
    line('Message', payload.message),
  ].join('\n');
}

/**
 * wa.me deep link. Works on mobile (opens the app) and on desktop (falls back
 * to WhatsApp Web) because wa.me handles both.
 *
 * @param phone Optional override; defaults to the primary WhatsApp number.
 */
export function whatsappHref(payload: WhatsAppPayload = {}, phone: { digits: string } = primaryPhone): string {
  return `https://wa.me/${phone.digits}?text=${encodeURIComponent(buildWhatsAppMessage(payload))}`;
}

/** Opens WhatsApp in a new tab without leaking the opener reference. */
export function openWhatsApp(payload: WhatsAppPayload = {}): void {
  window.open(whatsappHref(payload), '_blank', 'noopener,noreferrer');
}

/** Formats an ISO timestamp for display, e.g. "27 Sep 2026, 6:45 pm". */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/** Formats a `YYYY-MM-DD` date for display, e.g. "27 Sep 2026". */
export function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
