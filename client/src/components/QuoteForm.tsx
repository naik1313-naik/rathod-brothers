/**
 * Quote / enquiry form.
 *
 * Client-side validation mirrors the server's Zod rules so visitors get instant
 * feedback, but the server remains the authority — its field errors are mapped
 * back onto the inputs.
 *
 * On success the enquiry is stored in MySQL and the visitor is offered a
 * one-tap WhatsApp follow-up with the same details prefilled.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, Check, Loader2, MessageSquare, Send } from 'lucide-react';
import { SERVICE_OPTIONS, business, primaryPhone } from '@/lib/business';
import { whatsappHref } from '@/lib/links';
import { submitEnquiry } from '@/services/enquiryService';
import { ApiError, type CreateEnquiryPayload } from '@/types/api';

type FieldName = keyof CreateEnquiryPayload;
type Errors = Partial<Record<FieldName | 'form', string>>;

interface FormValues {
  name: string;
  phone: string;
  service: string;
  pickup: string;
  destination: string;
  preferredDate: string;
  message: string;
}

const EMPTY: FormValues = {
  name: '',
  phone: '',
  service: '',
  pickup: '',
  destination: '',
  preferredDate: '',
  message: '',
};

/** Mirrors server/…/validators.ts so feedback is instant. */
function validate(values: FormValues): Errors {
  const errors: Errors = {};

  if (values.name.trim().length < 2) {
    errors.name = 'Please enter your full name.';
  }

  const digits = values.phone.replace(/\D/g, '');
  if (digits.length < 10) {
    errors.phone = 'Enter a valid 10-digit phone number.';
  } else if (!/^[6-9]/.test(digits.slice(-10))) {
    errors.phone = 'Enter a valid Indian mobile number.';
  }

  if (!values.service) {
    errors.service = 'Please choose a service.';
  }

  if (values.message.length > 2000) {
    errors.message = 'Message is too long (2000 characters max).';
  }

  if (values.preferredDate) {
    const chosen = new Date(`${values.preferredDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(chosen.getTime()) || chosen < today) {
      errors.preferredDate = 'Preferred date cannot be in the past.';
    }
  }

  return errors;
}

export function QuoteForm(): JSX.Element {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string>('');
  const [submitted, setSubmitted] = useState<CreateEnquiryPayload | null>(null);

  const serviceRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  // "Enquire Now" on a service card pre-selects the matching service.
  useEffect(() => {
    const handler = (event: Event): void => {
      const detail = (event as CustomEvent<string>).detail;
      if (!detail) return;
      setValues((current) => ({ ...current, service: detail }));
      setErrors((current) => ({ ...current, service: undefined }));
      // Give the section time to scroll into view before focusing.
      window.setTimeout(() => serviceRef.current?.focus({ preventScroll: true }), 520);
    };

    window.addEventListener('rb:preselect-service', handler);
    return () => window.removeEventListener('rb:preselect-service', handler);
  }, []);

  // Move focus to the status message so screen readers announce the result.
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      statusRef.current?.focus();
    }
  }, [status]);

  const update = (field: FieldName, value: string): void => {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear the error for a field as soon as it is edited.
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
    if (status !== 'idle') setStatus('idle');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setServerError('');

    // Honeypot: a bot filled the hidden field. Pretend it worked, send nothing.
    if (honeypotRef.current?.value) {
      setStatus('success');
      setValues(EMPTY);
      formRef.current?.reset();
      return;
    }

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      // Focus the first invalid field for keyboard and screen-reader users.
      const firstInvalid = Object.keys(found)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus('sending');
    setErrors({});

    const payload: CreateEnquiryPayload = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      service: values.service,
      pickup: values.pickup.trim(),
      destination: values.destination.trim(),
      preferredDate: values.preferredDate,
      message: values.message.trim(),
    };

    try {
      await submitEnquiry(payload);
      setSubmitted(payload);
      setStatus('success');
      setValues(EMPTY);
      formRef.current?.reset();
    } catch (error) {
      if (error instanceof ApiError) {
        // Map server field errors (camelCase) onto our form fields.
        const mapped: Errors = {};
        for (const [key, message] of Object.entries(error.fields)) {
          if (key in EMPTY) mapped[key as FieldName] = message;
        }
        setErrors(mapped);
        setServerError(error.message);
      } else {
        setServerError('Something went wrong. Please try again, or call us directly.');
      }
      setStatus('error');
    }
  };

  const whatsappLink = submitted
    ? whatsappHref(
        {
          name: submitted.name,
          phone: submitted.phone,
          service: submitted.service,
          pickup: submitted.pickup,
          destination: submitted.destination,
          preferredDate: submitted.preferredDate,
          message: submitted.message,
        },
        primaryPhone,
      )
    : '';

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-navy-600/12 bg-white shadow-card-lg">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-navy-600/10 bg-sand-50 px-6 py-5">
          <div>
            <span className="eyebrow">Request a quote</span>
            <h3 className="mt-2.5 font-display text-[22px] font-extrabold text-navy-600 sm:text-[26px]">
              Tell us what you need
            </h3>
          </div>
          <p className="max-w-[15rem] text-[11px] leading-relaxed text-ink-mute">
            No account needed. We store your request and get back to you directly.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="p-6 sm:p-7">
          {/* Honeypot — bots fill it, humans never see it. */}
          <div className="absolute left-[-9999px]" aria-hidden="true">
            <label htmlFor="rb-website">Website</label>
            <input
              ref={honeypotRef}
              id="rb-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="quote-name"
              name="name"
              label="Name"
              placeholder="Your full name"
              autoComplete="name"
              value={values.name}
              error={errors.name}
              required
              onChange={(value) => update('name', value)}
            />

            <Field
              id="quote-phone"
              name="phone"
              label="Phone"
              type="tel"
              inputMode="tel"
              placeholder="+91 90193 33304"
              autoComplete="tel"
              value={values.phone}
              error={errors.phone}
              required
              onChange={(value) => update('phone', value)}
            />

            {/* service — full width on mobile */}
            <div className="sm:col-span-2">
              <label htmlFor="quote-service" className="field-label">
                Service <span className="text-gold-dark">*</span>
              </label>
              <select
                ref={serviceRef}
                id="quote-service"
                name="service"
                value={values.service}
                onChange={(event) => update('service', event.target.value)}
                aria-invalid={errors.service ? 'true' : undefined}
                aria-describedby={errors.service ? 'quote-service-error' : undefined}
                className={`field ${errors.service ? 'field-error' : ''}`}
                required
              >
                <option value="">Select a service…</option>
                {SERVICE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.service ? (
                <FieldError id="quote-service-error">{errors.service}</FieldError>
              ) : null}
            </div>

            <Field
              id="quote-pickup"
              name="pickup"
              label="Pickup / Site"
              placeholder="Town or area"
              value={values.pickup}
              error={errors.pickup}
              onChange={(value) => update('pickup', value)}
            />

            <Field
              id="quote-destination"
              name="destination"
              label="Destination"
              placeholder="Town or area"
              value={values.destination}
              error={errors.destination}
              onChange={(value) => update('destination', value)}
            />

            <div className="sm:col-span-2">
              <Field
                id="quote-date"
                name="preferredDate"
                label="Preferred Date"
                type="date"
                value={values.preferredDate}
                error={errors.preferredDate}
                onChange={(value) => update('preferredDate', value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="quote-message" className="field-label">
                Message
              </label>
              <textarea
                id="quote-message"
                name="message"
                rows={4}
                placeholder="Material type, machine model, duration, or anything else we should know."
                value={values.message}
                onChange={(event) => update('message', event.target.value)}
                aria-invalid={errors.message ? 'true' : undefined}
                aria-describedby={errors.message ? 'quote-message-error' : undefined}
                className={`field resize-y ${errors.message ? 'field-error' : ''}`}
              />
              {errors.message ? (
                <FieldError id="quote-message-error">{errors.message}</FieldError>
              ) : null}
            </div>
          </div>

          {/* status messages */}
          <div ref={statusRef} tabIndex={-1} className="mt-5 focus:outline-none" aria-live="polite">
            <AnimatePresence mode="wait">
              {status === 'success' && submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-xl border border-emerald-500/35 bg-emerald-50 p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <div>
                      <p className="text-[14px] font-extrabold text-emerald-900">
                        Enquiry received. Thank you, {submitted.name.split(' ')[0]}.
                      </p>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-emerald-800">
                        We have your request and will contact you on {submitted.phone}. For a faster
                        reply, continue the conversation on WhatsApp — your details are already
                        filled in.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2.5">
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-whatsapp btn-sm"
                        >
                          <MessageSquare className="h-4 w-4" strokeWidth={2.3} />
                          Continue on WhatsApp
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setSubmitted(null);
                            setStatus('idle');
                          }}
                          className="btn-ghost btn-sm"
                        >
                          Send another enquiry
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : status === 'error' ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-xl border border-red-500/35 bg-red-50 p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                      <AlertCircle className="h-4 w-4" strokeWidth={2.4} />
                    </span>
                    <div>
                      <p className="text-[14px] font-extrabold text-red-900">
                        We could not send your enquiry
                      </p>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-red-800">
                        {serverError || 'Please try again, or call us directly.'}
                      </p>
                      <a
                        href={`tel:+${primaryPhone.digits}`}
                        className="mt-3 inline-flex items-center gap-2 text-[12.5px] font-extrabold text-red-900 underline underline-offset-4"
                      >
                        Call {primaryPhone.display}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn-primary mt-5 w-full"
          >
            {status === 'sending' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.6} />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" strokeWidth={2.4} />
                Send Enquiry
              </>
            )}
          </button>

          <p className="mt-4 text-center text-[10.5px] leading-relaxed text-ink-faint">
            We use your details only to respond to this enquiry. Prefer to talk? Call{' '}
            <a
              href={`tel:+${primaryPhone.digits}`}
              className="font-bold text-navy-600 underline underline-offset-2"
            >
              {primaryPhone.display}
            </a>{' '}
            or WhatsApp {business.name}.
          </p>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface FieldProps {
  id: string;
  name: FieldName;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  required?: boolean;
}

function Field({
  id,
  name,
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
  required,
}: FieldProps): JSX.Element {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {required ? <span className="text-gold-dark">*</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`field ${error ? 'field-error' : ''}`}
      />
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }): JSX.Element {
  return (
    <p id={id} className="field-error-msg">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
      {children}
    </p>
  );
}
