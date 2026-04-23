import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {SlidersHorizontal} from 'lucide-react';

export function FloatingFilter({onClick}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Appare solo dopo aver scrollato giù di 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Il flag passive: true è fondamentale per non bloccare lo scroll del browser
    window.addEventListener('scroll', handleScroll, {passive: true});

    // Pulizia del listener quando il componente viene smontato
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{y: 100, opacity: 0}}
          animate={{y: 0, opacity: 1}}
          exit={{y: 100, opacity: 0}}
          transition={{duration: 0.4, ease: [0.16, 1, 0.3, 1]}}
          // Se proprio lo vuoi a sinistra cambia in: left-6 bottom-6
          // Ma io te l'ho messo al centro stile "Pill" perché è molto più premium
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
        >
          <button
            onClick={onClick}
            className="flex items-center gap-3 bg-brand-dark text-brand-light px-8 py-4 rounded-full shadow-2xl hover:bg-brand-accent transition-colors duration-300"
          >
            <SlidersHorizontal strokeWidth={1.5} size={18} />
            <span className="uppercase text-[10px] tracking-[0.2em] font-bold">
              Filtra e Ordina
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
