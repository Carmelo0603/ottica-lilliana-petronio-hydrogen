import {motion, useScroll, useTransform} from 'framer-motion';
import {useRef} from 'react';
import {ImageWithFallback} from './figma/ImageWithFallback';

export const Storytelling = () => {
  const containerRef = useRef(null);
  const {scrollYProgress} = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-brand-dark text-brand-light flex flex-col md:flex-row overflow-hidden"
    >
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-24 md:py-0 relative z-10 w-full md:w-1/2 bg-brand-dark">
        <motion.div
          initial={{opacity: 0, y: 50}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true, margin: '-100px'}}
          transition={{duration: 0.8}}
          className="space-y-12 max-w-xl"
        >
          <div className="space-y-6">
            <span className="font-sans text-brand-accent uppercase tracking-[0.3em] text-xs font-bold">
              La Nostra Genesi
            </span>
            <h2 className="text-4xl md:text-6xl font-serif uppercase leading-[1.1] tracking-tight">
              Oltre la{' '}
              <span className="italic font-light opacity-50">Visione.</span>
            </h2>
            <p className="font-sans text-brand-light/70 text-base md:text-lg leading-relaxed uppercase tracking-wide">
              Dal cuore di Sommatino alla precisione dell&apos;Accademia, ogni
              montatura racconta una storia di resistenza e avanguardia. Non
              vendiamo solo occhiali, plasmiamo il modo in cui guardi il mondo.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 pt-8 border-t border-brand-light/10">
            <div className="space-y-2">
              <span className="text-3xl md:text-5xl font-serif font-medium block text-brand-light">
                100%
              </span>
              <span className="uppercase text-[10px] tracking-[0.2em] font-bold opacity-60">
                Fatto in Italia
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-3xl md:text-5xl font-serif font-medium block text-brand-light">
                1/100
              </span>
              <span className="uppercase text-[10px] tracking-[0.2em] font-bold opacity-60">
                Edizioni Limitate
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative overflow-hidden flex-shrink-0 bg-brand-dark">
        <motion.div
          style={{y: imageY}}
          className="absolute inset-0 w-full h-[120%]"
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1557176766-618483419e3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Artigianato d'eccellenza"
            className="w-full h-full object-cover object-center opacity-80"
          />
        </motion.div>
      </div>
    </section>
  );
};
