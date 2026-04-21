import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';

export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <Suspense
      fallback={<footer className="w-full bg-brand-dark py-24"></footer>}
    >
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="w-full bg-brand-dark border-t border-brand-light/10 pt-24 pb-12 px-6 md:px-12 relative z-10 text-brand-light">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-24 mb-24">
              {/* Colonna 1: Brand */}
              <div className="md:col-span-2 space-y-8">
                <NavLink
                  to="/"
                  prefetch="intent"
                  className="block text-brand-light font-serif text-3xl md:text-4xl tracking-tight uppercase font-medium"
                >
                  {header?.shop?.name || 'Ottica Liliana Petronio'}
                </NavLink>
                <p className="font-sans text-brand-light/60 text-sm max-w-sm uppercase leading-relaxed font-medium">
                  Sperimenta la visione definitiva. Design accademico, anima
                  siciliana.
                </p>
              </div>

              {/* Colonna 2: Navigazione Statica */}
              <div className="space-y-8">
                <h4 className="text-brand-light font-sans text-xs tracking-[0.3em] uppercase font-bold">
                  Esplora
                </h4>
                <ul className="space-y-4">
                  <li>
                    <NavLink
                      to="/collections/all"
                      prefetch="intent"
                      className="text-brand-light hover:text-brand-accent transition-colors text-sm uppercase tracking-widest"
                    >
                      Collezioni
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/pages/philosophy"
                      prefetch="intent"
                      className="text-brand-light hover:text-brand-accent transition-colors text-sm uppercase tracking-widest"
                    >
                      Filosofia
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/pages/studio"
                      prefetch="intent"
                      className="text-brand-light hover:text-brand-accent transition-colors text-sm uppercase tracking-widest"
                    >
                      Studio
                    </NavLink>
                  </li>
                </ul>
              </div>

              {/* Colonna 4: Policy legali — dinamiche da Shopify
                  Il cliente le gestisce in Admin → Impostazioni → Policy.
                  Vengono mostrate solo le policy che il cliente ha compilato. */}
              <div className="space-y-8">
                <h4 className="text-brand-light font-sans text-xs tracking-[0.3em] uppercase font-bold">
                  Legale
                </h4>
                <PolicyLinks shop={footer?.shop} />
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-[1400px] mx-auto border-t border-brand-light/10 pt-8 flex justify-between items-center">
              <p className="font-sans text-brand-light/40 text-[10px] uppercase tracking-[0.2em]">
                © {new Date().getFullYear()}{' '}
                {header?.shop?.name || 'Ottica Liliana Petronio'}.
              </p>
              <div className="flex gap-6">
                <InstagramIcon
                  size={18}
                  className="text-brand-light/60 hover:text-brand-accent cursor-pointer transition-colors"
                />
                <MailIcon
                  size={18}
                  className="text-brand-light/60 hover:text-brand-accent cursor-pointer transition-colors"
                />
              </div>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

// ==========================================
// Policy dinamiche da Shopify
// Mostra solo le policy che il cliente ha effettivamente compilato
// nell'admin (Impostazioni → Policy).
// ==========================================
function PolicyLinks({shop}) {
  if (!shop) return null;

  // Lista delle policy nell'ordine desiderato
  const policies = [
    shop.privacyPolicy,
    shop.shippingPolicy,
    shop.refundPolicy,
    shop.termsOfService,
  ].filter(Boolean); // rimuove quelle non compilate

  if (policies.length === 0) return null;

  return (
    <ul className="space-y-4">
      {policies.map((policy) => (
        <li key={policy.handle}>
          <NavLink
            to={`/policies/${policy.handle}`}
            prefetch="intent"
            className={({isActive}) =>
              isActive
                ? 'block text-brand-accent font-bold text-sm uppercase tracking-widest'
                : 'block text-brand-light/60 hover:text-brand-accent transition-colors text-sm uppercase tracking-widest'
            }
          >
            {policy.title}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

// ==========================================
// Menu dinamico dal menu "footer" di Shopify
// ==========================================

// ==========================================
// Icone
// ==========================================
const InstagramIcon = ({className, size}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const MailIcon = ({className, size}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
