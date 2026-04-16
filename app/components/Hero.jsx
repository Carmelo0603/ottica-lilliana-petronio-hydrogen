import {motion} from 'framer-motion';
import {ArrowUpRight} from 'lucide-react';
import {Link} from 'react-router';
// ATTENZIONE: Assicurati di aver copiato il file ImageWithFallback.jsx dentro app/components/figma/
import {ImageWithFallback} from './figma/ImageWithFallback';

export const Hero = () => {
  return (
    <section className="relative w-full min-h-screen bg-brand-light flex flex-col md:flex-row overflow-hidden border-b border-brand-gray pt-20">
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 z-10 w-full md:w-1/2 bg-brand-light">
        <div className="space-y-8 max-w-xl">
          <motion.div
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 1, delay: 0.2}}
            className="flex flex-col space-y-4"
          >
            <span className="font-sans text-brand-accent uppercase tracking-[0.3em] text-xs font-bold">
              Collezione 01—SS26
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-brand-dark uppercase leading-[1.1] tracking-tight">
              Sfida <br />
              <span className="text-brand-dark/50 italic font-light">
                L&apos;Ordinario
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 1, delay: 0.5}}
            className="font-sans text-base md:text-lg text-brand-dark/70 font-medium tracking-wide leading-relaxed uppercase"
          >
            Occhiali progettati per chi non si ferma mai. Un&aposelegante
            sintesi di architettura all&apos; avanguardia e precisione senza
            compromessi. Per chi sa imporsi.
          </motion.p>

          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 1, delay: 0.7}}
            className="pt-8 flex items-center gap-6"
          >
            {/* Il link ora punta alla rotta reale di Shopify */}
            <Link
              to="/collections/all"
              className="group relative inline-flex items-center gap-4 border border-brand-dark bg-transparent text-brand-dark px-8 py-4 font-sans font-bold text-xs tracking-[0.2em] uppercase hover:bg-brand-dark transition-all duration-500 overflow-hidden"
            >
              <span className="relative z-10 group-hover:text-brand-light transition-colors duration-500">
                Esplora la Collezione
              </span>
              <ArrowUpRight className="relative z-10 w-4 h-4 group-hover:text-brand-light transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{scale: 1.05, opacity: 0}}
        animate={{scale: 1, opacity: 1}}
        transition={{duration: 1.2, ease: 'easeOut'}}
        className="flex-1 relative min-h-[50vh] md:min-h-screen w-full md:w-1/2"
      >
        <div className="absolute inset-0 bg-brand-dark/5 z-10 pointer-events-none"></div>
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1730713560733-4bd5f91f5ae4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZmFzaGlvbiUyMG1vZGVsJTIwd2VhcmluZyUyMGV5ZXdlYXJ8ZW58MXx8fHwxNzczMzI5MTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="High fashion model wearing eyewear"
          className="absolute inset-0 w-full h-full object-cover object-top md:object-center opacity-95"
        />

        <motion.div
          initial={{y: 30, opacity: 0}}
          animate={{y: 0, opacity: 1}}
          transition={{duration: 1, delay: 0.8}}
          className="hidden md:flex absolute bottom-0 left-0 bg-brand-light border-t border-r border-brand-gray p-8 items-center gap-6 z-20 w-80 shadow-[10px_-10px_30px_rgba(13,22,38,0.05)]"
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1766998162306-028b1ded919d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZ2xhc3NlcyUyMGNsb3NlJTIwdXB8ZW58MXx8fHwxNzczMzI5MTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Premium texture close-up"
            className="w-20 h-24 object-cover hover:scale-105 transition-all duration-700 shadow-md"
          />
          <div className="flex flex-col gap-2">
            <span className="text-brand-dark font-sans text-xs tracking-[0.2em] uppercase font-bold">
              Titanium Shift
            </span>
            <span className="text-brand-accent font-serif text-lg italic tracking-wider">
              €1,500
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
