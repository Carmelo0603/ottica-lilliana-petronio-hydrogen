import {useState, useEffect, Suspense} from 'react';
import {Await, NavLink, useAsyncValue, useLocation} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {Menu, ShoppingBag, Search, X, User} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import {CountrySelector} from './CountrySelector';
// Tappabuchi per evitare che Aside.jsx vada in crash
export function HeaderMenu() {
  return null;
}

export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const {open} = useAside();

  // Chiude il menu quando cambi rotta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Blocca lo scroll quando il menu a tutto schermo è aperto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <motion.header
        initial={{y: -100}}
        animate={{y: 0}}
        transition={{duration: 0.8, ease: [0.16, 1, 0.3, 1]}}
        className="fixed top-0 left-0 w-full z-40 bg-brand-light/95 backdrop-blur-md border-b border-brand-gray"
      >
        <div className="flex items-center px-6 py-5 md:px-12 md:py-6 relative">
          {/* COLONNA SX: Solo il Burger */}
          <div className="flex-1">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-brand-dark"
            >
              <Menu strokeWidth={1.5} size={28} />
            </button>
          </div>

          {/* LOGO CENTRALE: Protetto dal flex e da un max-width */}
          <div className="flex-[2] flex justify-center overflow-hidden">
            <NavLink
              to="/"
              className="text-brand-dark font-serif text-base sm:text-lg md:text-2xl tracking-widest uppercase font-medium whitespace-nowrap truncate"
            >
              {shop.name}
            </NavLink>
          </div>

          {/* COLONNA DX: Cerca (sempre), Valuta (solo desktop), Cart */}
          <div className="flex-1 flex items-center justify-end gap-4 md:gap-6">
            {/* Cerca: Rimosso 'hidden md:block' -> SEMPRE VISIBILE */}
            <button
              onClick={() => open('search')}
              className="text-brand-dark hover:text-brand-accent transition-colors"
            >
              <Search strokeWidth={1.5} size={20} />
            </button>
            <NavLink
              prefetch="intent"
              to="/account"
              className="text-brand-dark hover:text-brand-accent transition-colors duration-300 hidden md:block"
            >
              <User strokeWidth={1.5} size={20} />
            </NavLink>

            {/* Valuta: Visibile solo da Desktop */}
            <CountrySelector className="hidden lg:block w-[60px]" />

            <CartToggle cart={cart} openAside={open} />
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{opacity: 0, y: '-100%'}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: '-100%'}}
            transition={{duration: 0.8, ease: [0.16, 1, 0.3, 1]}}
            className="fixed inset-0 z-50 bg-brand-dark text-brand-light flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 md:px-12 md:py-6 border-b border-brand-light/10">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-brand-light hover:text-brand-accent transition-colors duration-300"
              >
                <X strokeWidth={1.5} size={32} />
              </button>

              <NavLink
                prefetch="intent"
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-brand-light font-serif text-sm sm:text-base md:text-xl lg:text-2xl tracking-widest uppercase font-medium absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                {shop.name}
              </NavLink>

              <div className="w-[32px]"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-6 md:space-y-10">
              {/* Le rotte sono state adattate per Shopify. Niente finti "Archive" */}

              <MenuLink
                to="/"
                label="Home"
                onClick={() => setIsMenuOpen(false)}
              />
              <MenuLink
                to="/collections/all"
                label="Catalogo"
                onClick={() => setIsMenuOpen(false)}
              />
              <MenuLink
                to="/pages/philosophy"
                label="Filosofia"
                onClick={() => setIsMenuOpen(false)}
              />
              <MenuLink
                to="/pages/studio"
                label="Studio Optometrico"
                onClick={() => setIsMenuOpen(false)}
              />
              <MenuLink
                to="/pages/contacts"
                label="Contatti"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="px-6 py-8 border-t border-brand-light/10 flex flex-row items-center gap-10">
                <div className="">
                  <p className="text-[10px] uppercase tracking-widest text-brand-light/50">
                    Cambia Valuta
                  </p>
                  {/* Qui lo rendiamo bianco perché il menu mobile è scuro */}
                  <CountrySelector className="w-full max-w-[150px] border-brand-light/20 text-brand-light" />
                </div>
                <div className="flex-1">
                  <NavLink
                    to="/account"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full bg-transparent border-b border-brand-light/10 py-1 font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] text-brand-light text-center hover:text-brand-accent hover:border-brand-accent transition-all duration-300"
                  >
                    {isLoggedIn ? 'Area Profilo' : 'Accedi'}
                  </NavLink>
                </div>
              </div>
            </div>

            <div className="px-6 py-8 md:px-12 text-center text-brand-light/50 font-sans uppercase text-[10px] tracking-[0.3em]">
              © {new Date().getFullYear()} {shop.name}. Tutti i diritti
              riservati.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ==========================================
// Logica del Carrello: Non toccare, morde.
// ==========================================

function CartToggle({cart, openAside}) {
  return (
    <Suspense fallback={<CartBadge count={0} openAside={openAside} />}>
      <Await resolve={cart}>
        <CartBanner openAside={openAside} />
      </Await>
    </Suspense>
  );
}

function CartBanner({openAside}) {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} openAside={openAside} />;
}

function CartBadge({count, openAside}) {
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        openAside('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
      className="text-brand-dark hover:text-brand-accent transition-colors duration-300 relative flex items-center gap-2"
    >
      <span className="hidden md:block uppercase text-xs tracking-[0.2em] font-sans font-medium">
        Carrello
      </span>
      <ShoppingBag strokeWidth={1.5} size={20} />
      <span className="absolute -top-1.5 -right-2 md:-top-2 md:-right-2.5 bg-brand-accent text-brand-dark text-[9px] font-bold px-1.5 py-0.5 rounded-full">
        {count}
      </span>
    </button>
  );
}

// ==========================================
// Componenti UI di Supporto
// ==========================================

const MenuLink = ({to, label, onClick}) => (
  <div className="overflow-hidden">
    <NavLink
      prefetch="intent"
      to={to}
      onClick={onClick}
      className="group block"
    >
      <motion.div
        initial={{y: 50, opacity: 0}}
        animate={{y: 0, opacity: 1}}
        exit={{y: -50, opacity: 0}}
        transition={{duration: 0.5, delay: 0.2}}
        className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-center uppercase tracking-tighter text-brand-light group-hover:text-brand-accent transition-colors duration-500 relative"
      >
        <span className="relative z-10">{label}</span>
      </motion.div>
    </NavLink>
  </div>
);
