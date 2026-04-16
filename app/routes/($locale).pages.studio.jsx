import {useRef} from 'react';
import {motion, useScroll, useTransform} from 'framer-motion';
import {Link} from 'react-router';

export default function Studio() {
  const containerRef = useRef(null);
  const {scrollYProgress} = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <div className="w-full bg-brand-light text-brand-dark overflow-hidden pt-20">
      {/* Hero Section */}
      <section className="relative w-full min-h-[70vh] flex flex-col items-center justify-center px-6 md:px-12 py-24 border-b border-brand-gray bg-brand-light">
        <motion.div
          initial={{opacity: 0, y: 30}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8}}
          className="text-center max-w-4xl mx-auto space-y-6"
        >
          <span className="font-sans text-brand-accent uppercase tracking-[0.4em] text-xs font-bold">
            Studio Optometrico
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif uppercase tracking-tight leading-[0.9] text-brand-dark">
            L&apos;Arte della <br />
            <span className="italic font-light text-brand-dark/50">
              Visione
            </span>
          </h1>
          <p className="font-sans text-sm md:text-base uppercase tracking-widest text-brand-dark/70 leading-relaxed max-w-2xl mx-auto pt-6">
            Non siamo solo curatori di estetica. Siamo professionisti della
            salute visiva. La misurazione della vista trattata con il massimo
            rigore clinico.
          </p>
        </motion.div>
      </section>

      {/* Content Section: Optometrists & Tech */}
      <section
        ref={containerRef}
        className="w-full py-24 md:py-32 px-6 md:px-12 max-w-[1400px] mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
          {/* Left: Text Content */}
          <div className="space-y-16 order-2 lg:order-1">
            <motion.div
              initial={{opacity: 0, y: 30}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, margin: '-100px'}}
              transition={{duration: 0.8}}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 text-brand-accent mb-4">
                <ScanEyeIcon size={24} />
                <h3 className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-brand-dark">
                  Optometristi Qualificati
                </h3>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tight leading-tight">
                L&apos;Equilibrio del{' '}
                <span className="italic font-light text-brand-dark/50">
                  Sistema Visivo
                </span>
              </h2>
              <p className="font-sans text-sm uppercase tracking-widest text-brand-dark/70 leading-relaxed">
                Il nostro titolo di Optometristi certifica un approccio che va
                oltre la semplice prescrizione. Studiamo le abitudini, la
                postura e le reali necessità dei tuoi occhi per garantirti un
                comfort duraturo.
              </p>
            </motion.div>

            <motion.div
              initial={{opacity: 0, y: 30}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, margin: '-100px'}}
              transition={{duration: 0.8, delay: 0.2}}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 text-brand-accent mb-4">
                <MicroscopeIcon size={24} />
                <h3 className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-brand-dark">
                  Strumentazione Avanzata
                </h3>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tight leading-tight">
                Precisione{' '}
                <span className="italic font-light text-brand-dark/50">
                  Millimetrica
                </span>
              </h2>
              <p className="font-sans text-sm uppercase tracking-widest text-brand-dark/70 leading-relaxed">
                Eseguiamo esami visivi completi utilizzando{' '}
                <strong className="text-brand-dark font-bold">
                  Autorefrattometri
                </strong>{' '}
                di ultima generazione per azzerare il margine di errore umano.
              </p>

              <ul className="space-y-4 pt-4 border-t border-brand-gray">
                <li className="flex items-center gap-4 font-sans text-xs uppercase tracking-widest text-brand-dark/80">
                  <CrosshairIcon size={16} />
                  Analisi oggettiva computerizzata
                </li>
                <li className="flex items-center gap-4 font-sans text-xs uppercase tracking-widest text-brand-dark/80">
                  <CrosshairIcon size={16} />
                  Test per la visione binoculare
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Right: Parallax Image */}
          <div className="order-1 lg:order-2 h-full min-h-[60vh] relative overflow-hidden bg-brand-gray">
            <motion.img
              style={{y}}
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1080"
              alt="Medical precision equipment"
              className="absolute inset-0 w-full h-[120%] object-cover object-center grayscale mix-blend-multiply opacity-80"
            />
            <div className="absolute inset-0 border border-brand-dark/10 m-6 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Booking Banner */}
      <section className="w-full bg-brand-dark text-brand-light py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-tight">
            Il Tuo Sguardo Merita <br />{' '}
            <span className="text-brand-accent italic font-light">
              Attenzione Clinica
            </span>
          </h2>
          <div className="pt-8">
            <Link
              to="/pages/contacts"
              className="inline-flex items-center gap-4 border border-brand-light px-8 py-5 font-sans font-bold text-xs tracking-[0.2em] uppercase hover:bg-brand-light hover:text-brand-dark transition-all duration-500 group"
            >
              <span>Prenota una Visita</span>
              <svg
                className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Icone SVG per evitare errori di importazione
const ScanEyeIcon = ({size}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M7 21h.01" />
    <path d="M17 21h.01" />
    <path d="M12 21h.01" />
    <path d="M12 3h.01" />
    <path d="M7 3h.01" />
    <path d="M17 3h.01" />
  </svg>
);
const MicroscopeIcon = ({size}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 18h8" />
    <path d="M3 22h18" />
    <path d="M14 22a7 7 0 1 0-14 0" />
    <path d="M9 14h2" />
    <path d="M9 12a2 2 0 1 1-4 0V7a2 2 0 1 1 4 0v5Z" />
    <path d="M12 7a2 2 0 1 1 4 0v5c0 1.1.9 2 2 2h3" />
  </svg>
);
const CrosshairIcon = ({size}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="22" y1="12" x2="18" y2="12" />
    <line x1="6" y1="12" x2="2" y2="12" />
    <line x1="12" y1="6" x2="12" y2="2" />
    <line x1="12" y1="22" x2="12" y2="18" />
  </svg>
);
