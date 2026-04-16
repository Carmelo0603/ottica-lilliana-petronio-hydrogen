import {useRef} from 'react';
import {motion, useScroll, useTransform} from 'framer-motion';
import {ImageWithFallback} from '~/components/figma/ImageWithFallback';

export default function Philosophy() {
  const containerRef = useRef(null);

  // Logica Scroll per l'effetto Hero
  const {scrollYProgress} = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="w-full bg-brand-light text-brand-dark overflow-hidden">
      {/* Hero Editorial */}
      <section
        ref={containerRef}
        className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-brand-dark"
      >
        <motion.div style={{y, opacity}} className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1764263996484-73fed2cf6b98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Abstract luxury texture"
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity grayscale"
          />
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-6">
          <motion.span
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, delay: 0.2}}
            className="font-sans text-brand-accent uppercase tracking-[0.4em] text-xs font-bold"
          >
            Il Nostro Manifesto
          </motion.span>
          <motion.h1
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8, delay: 0.4}}
            className="text-5xl md:text-8xl lg:text-9xl font-serif text-brand-light uppercase tracking-tighter leading-[0.9]"
          >
            La Fine <br />
            <span className="italic font-light text-brand-light/50">
              Della Banalità
            </span>
          </motion.h1>
        </div>
      </section>

      {/* Content Section 1 */}
      <section className="w-full py-24 md:py-40 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
          <motion.div
            initial={{opacity: 0, x: -30}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true, margin: '-100px'}}
            transition={{duration: 1}}
            className="aspect-[3/4] bg-brand-gray relative overflow-hidden"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1769414608525-64438594c59c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Craftsmanship"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: 30}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, margin: '-100px'}}
            transition={{duration: 1}}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-tight leading-tight">
              Oltre l&apos;oggetto. <br />{' '}
              <span className="italic font-light text-brand-dark/50">
                L&apos;esperienza.
              </span>
            </h2>
            <div className="space-y-6 font-sans text-sm uppercase tracking-widest text-brand-dark/70 leading-relaxed max-w-lg">
              <p>
                Ottica Liliana Petronio non vende semplicemente occhiali.
                Curiamo la tua visione e creiamo armature per lo sguardo. Siamo
                nati dal rifiuto categorico della produzione di massa, dalla
                nausea per i compromessi estetici e dall&apos;esigenza di
                distinguersi in un mare di uniformità.
              </p>
              <p>
                Ogni nostra creazione è pensata per chi non ha bisogno di
                presentazioni. Per chi sa che il vero lusso non urla il proprio
                nome, ma sussurra le proprie intenzioni.
              </p>
            </div>
            <div className="w-16 h-px bg-brand-accent mt-8" />
          </motion.div>
        </div>
      </section>

      {/* Statement Banner */}
      <section className="w-full py-32 bg-brand-dark text-brand-light flex items-center justify-center text-center px-6">
        <motion.p
          initial={{opacity: 0}}
          whileInView={{opacity: 1}}
          viewport={{once: true}}
          transition={{duration: 1.5}}
          className="font-serif text-2xl md:text-4xl lg:text-5xl max-w-5xl leading-snug uppercase tracking-tight"
        >
          Abbiamo spogliato l&apos;occhiale di tutto ciò che era superfluo.{' '}
          <br />
          <span className="text-brand-accent italic">
            Ciò che resta è puro carattere.
          </span>
        </motion.p>
      </section>
    </div>
  );
}
