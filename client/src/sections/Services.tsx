/**
 * Services section — three large cards on navy.
 *
 * Each card carries an oversized service number, a Lucide icon, the equipment
 * illustration as its visual, title, subtitle, description and an "Enquire Now"
 * CTA that both scrolls to the quote form and pre-selects the service.
 */
import { ArrowUpRight, Construction, Truck, Shovel } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal, TiltCard } from '@/components/motion';
import { services, type Service } from '@/lib/business';
import { usePrefersReducedMotion } from '@/hooks';
import { useScrollToSection } from '@/hooks/useActiveSection';

const ICONS = {
  excavator: Construction,
  truck: Truck,
  backhoe: Shovel,
} as const;

export function Services(): JSX.Element {
  const scrollToSection = useScrollToSection();

  /**
   * Sends the visitor to the quote form with the matching service already
   * chosen, so they don't have to re-select it.
   */
  const enquire = (service: Service): void => {
    window.dispatchEvent(
      new CustomEvent('rb:preselect-service', { detail: service.title }),
    );
    scrollToSection('contact');
  };

  return (
    <section
      id="services"
      className="on-dark relative overflow-hidden bg-navy-700 py-20 sm:py-24 lg:py-32"
    >
      <div className="grid-overlay-dark" aria-hidden="true" />

      {/* concentric gold rings, bottom right */}
      <div className="pointer-events-none absolute -bottom-52 -right-40 h-[36rem] w-[36rem] rounded-full border border-white/6" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 -right-28 h-[26rem] w-[26rem] rounded-full border border-gold/10" aria-hidden="true" />

      <div className="shell relative">
        <SectionHeading
          eyebrow="What we do"
          title="One partner for the"
          accent="whole movement."
          description="Three services that cover most of what a site needs — the machine, the haulage and the ground work. Ask for any one of them, or all three."
          onDark
          className="mb-14 lg:mb-16"
        />

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-7">
          {services.map((service, index) => (
            <ServiceCard key={service.key} service={service} index={index} onEnquire={enquire} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  index,
  onEnquire,
}: {
  service: Service;
  index: number;
  onEnquire: (service: Service) => void;
}): JSX.Element {
  const reduced = usePrefersReducedMotion();
  const Icon = ICONS[service.icon];

  return (
    <Reveal direction="up" delay={0.1 * index} duration={0.7} amount={0.15}>
      <TiltCard max={reduced ? 0 : 7} lift={-8} glare className="h-full">
        <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/[0.045] backdrop-blur-sm transition-colors duration-500 hover:border-gold/60">
          {/* visual */}
          <div className="relative aspect-[16/10] overflow-hidden bg-navy-900/50">
            <img
              src={service.equipmentImage}
              alt={`${service.title} — representative equipment category visual`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[1100ms] ease-industrial group-hover:scale-[1.08]"
            />
            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-700 via-navy-700/25 to-transparent"
              aria-hidden="true"
            />

            {/* huge service number */}
            <span
              className="pointer-events-none absolute -bottom-5 right-3 font-display text-[5.5rem] font-extrabold leading-none text-white/10 transition-colors duration-500 group-hover:text-gold/25 sm:text-[6.5rem]"
              aria-hidden="true"
            >
              {service.number}
            </span>

            {/* icon chip */}
            <span className="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gold/40 bg-navy-900/85 backdrop-blur-sm transition-colors duration-500 group-hover:border-gold group-hover:bg-gold">
              <Icon
                className="h-5 w-5 text-gold-contrast transition-colors duration-500 group-hover:text-navy-800"
                strokeWidth={2.1}
              />
            </span>
          </div>

          {/* body */}
          <div className="relative flex flex-1 flex-col p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
              Service {service.number}
            </span>

            <h3 className="mt-3 font-display text-[20px] font-extrabold leading-tight text-white sm:text-[23px]">
              {service.title}
            </h3>

            <p className="mt-1.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-navy-300">
              {service.subtitle}
            </p>

            <span className="mt-4 block h-px w-12 bg-gold/60 transition-all duration-500 ease-industrial group-hover:w-20" aria-hidden="true" />

            <p className="mt-4 flex-1 text-[14px] leading-[1.7] text-navy-200">{service.description}</p>

            <button
              type="button"
              onClick={() => onEnquire(service)}
              className="group/cta mt-6 inline-flex w-full items-center justify-between border-t border-white/12 pt-4 text-left"
            >
              <span className="text-[11.5px] font-extrabold uppercase tracking-eyebrow text-gold">
                Enquire Now
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gold/45 text-gold transition-all duration-300 group-hover/cta:border-gold group-hover/cta:bg-gold group-hover/cta:text-navy-800">
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.6} />
              </span>
            </button>
          </div>
        </article>
      </TiltCard>
    </Reveal>
  );
}
