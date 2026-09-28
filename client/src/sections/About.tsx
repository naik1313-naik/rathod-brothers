/**
 * About section.
 *
 * Copy deliberately states only what is known about the business — no invented
 * years of experience, fleet counts, employee numbers, clients or awards.
 */
import { Factory, Hammer, Route, ShieldCheck } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

const PILLARS = [
  { icon: Factory, label: 'Earthmoving & heavy machinery' },
  { icon: Hammer, label: 'Excavators, JCB & site support' },
  { icon: Route, label: 'Local and statewide transport' },
  { icon: ShieldCheck, label: 'Direct, accountable communication' },
];

export function About(): JSX.Element {
  return (
    <section id="about" className="relative overflow-hidden bg-sand-100 py-20 sm:py-24 lg:py-32">
      <div className="grid-overlay" aria-hidden="true" />

      {/* soft gold arc, bottom-left */}
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full border border-navy-600/8"
        aria-hidden="true"
      />

      <div className="shell relative">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="About Rathod Brothers"
              title="Built around"
              accent="equipment, execution & trust."
            />

            <Stagger className="mt-10 grid gap-3.5 sm:grid-cols-2" stagger={0.08}>
              {PILLARS.map((pillar) => (
                <StaggerItem key={pillar.label}>
                  <div className="group flex items-start gap-3 border-l-2 border-gold/70 bg-white/55 px-4 py-3.5 transition-colors duration-300 hover:border-gold hover:bg-white">
                    <pillar.icon
                      className="mt-0.5 h-4 w-4 shrink-0 text-navy-500 transition-colors duration-300 group-hover:text-gold-dark"
                      strokeWidth={2.2}
                    />
                    <span className="text-[12.5px] font-bold leading-snug text-navy-700">{pillar.label}</span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <Reveal direction="left" delay={0.1} amount={0.15}>
            <div className="relative">
              {/* accent rule */}
              <span className="absolute -left-4 top-2 hidden h-full w-0.5 bg-gradient-to-b from-gold to-transparent lg:block" aria-hidden="true" />

              <div className="space-y-5 lg:pl-6">
                <p className="text-[16px] leading-[1.8] text-ink-soft">
                  <strong className="font-extrabold text-navy-600">Rathod Brothers</strong> is a
                  Karnataka-based earthmoving and heavy machinery business built around three things
                  that matter on any site: equipment that starts, operators who know it, and
                  communication that actually reaches you.
                </p>

                <p className="text-[15px] leading-[1.8] text-ink-soft">
                  We work across the full movement chain — from preparing and clearing a site, to
                  putting an excavator on it, to hauling material away by tipper. That means one
                  point of contact instead of coordinating three separate vendors, and it means the
                  machine, the operator and the transport stay coordinated with each other.
                </p>

                <p className="text-[15px] leading-[1.8] text-ink-soft">
                  Our work covers <strong className="font-bold text-navy-700">Hitachi and Tata
                  excavator sale and service</strong>, <strong className="font-bold text-navy-700">
                  local and statewide tipper transport</strong>, and{' '}
                  <strong className="font-bold text-navy-700">JCB earthmoving for site clearance and
                  construction activities</strong>. Whether it is a single site or a statewide
                  movement, the process is the same — you tell us the requirement, we tell you
                  exactly what it will take.
                </p>
              </div>

              {/* operating principles */}
              <div className="mt-10 grid gap-4 border-t border-navy-600/12 pt-8 sm:grid-cols-3 lg:pl-6">
                {[
                  { title: 'Equipment first', body: 'Machines are serviced and site-ready before dispatch.' },
                  { title: 'Direct access', body: 'You speak to the people doing the work, not a call centre.' },
                  { title: 'Clear scope', body: 'Pickup, destination and material agreed before we move.' },
                ].map((item, index) => (
                  <Reveal key={item.title} delay={0.1 + index * 0.09} duration={0.6}>
                    <div>
                      <h3 className="font-display text-[13.5px] font-extrabold uppercase tracking-[0.05em] text-navy-600">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-mute">{item.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
