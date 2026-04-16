import {motion} from 'framer-motion';
import {ShieldAlert, RefreshCw, Box} from 'lucide-react';

export const TrustBanner = () => {
  return (
    <section className="w-full bg-brand-dark py-24 md:py-32 relative overflow-hidden border-y border-brand-dark z-10">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24 items-start">
          <TrustItem
            Icon={Box}
            title="Spedizione Blindata"
            desc="Consegna tracciata in 24/48h. Il lusso non aspetta."
          />
          <TrustItem
            Icon={ShieldAlert}
            title="Garanzia Totale"
            desc="Due anni di protezione su ogni difetto di fabbrica."
          />
          <TrustItem
            Icon={RefreshCw}
            title="Reso Agevole"
            desc="Non ti convincono? Hai 14 giorni per cambiare idea."
          />
        </div>
      </div>
    </section>
  );
};

const TrustItem = ({Icon, title, desc}) => (
  <motion.div
    initial={{opacity: 0, y: 20}}
    whileInView={{opacity: 1, y: 0}}
    viewport={{once: true}}
    className="flex flex-col gap-6 group"
  >
    <div className="p-4 bg-brand-light/5 border border-brand-light/10 w-fit text-brand-light group-hover:text-brand-accent group-hover:border-brand-accent transition-colors duration-500">
      <Icon strokeWidth={1} size={32} />
    </div>
    <h4 className="font-sans text-brand-light uppercase text-sm tracking-widest font-bold">
      {title}
    </h4>
    <p className="font-sans text-brand-light/60 text-sm leading-relaxed uppercase max-w-xs">
      {desc}
    </p>
  </motion.div>
);
