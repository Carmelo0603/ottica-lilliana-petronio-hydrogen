import React, {useState, useEffect} from 'react';
import {useLoaderData, Link, useSearchParams} from 'react-router';
import {
  getPaginationVariables,
  Analytics,
  Image,
  Money,
} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {motion, AnimatePresence} from 'framer-motion';

export async function loader({params, request, context}) {
  const {handle} = params;
  const {storefront} = context;
  const searchParams = new URL(request.url).searchParams;

  const filters = [];
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter.')) {
      try {
        filters.push(JSON.parse(value));
      } catch (e) {}
    }
  }

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  const {collection, collections} = await storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
      filters: filters.length > 0 ? filters : undefined,
      ...paginationVariables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  if (!collection) throw new Response('Not Found', {status: 404});

  return {collection, collections};
}

export default function CollectionArchive() {
  const {collection, collections} = useLoaderData();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Traccia se siamo su desktop (>=768px) — si aggiorna anche al resize
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e) => {
      setIsDesktop(e.matches);
      if (e.matches) setIsFilterOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Blocca lo scroll del body quando il drawer è aperto su mobile
  useEffect(() => {
    document.body.style.overflow = isFilterOpen ? 'hidden' : 'unset';
  }, [isFilterOpen]);

  const sidebarVisible = isDesktop || isFilterOpen;

  return (
    <section className="w-full min-h-screen bg-brand-light pb-24">
      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />

      {/* HEADER EDITORIALE */}
      <header className="pt-32 pb-16 px-6 md:px-12 border-b border-brand-gray/30 bg-brand-light">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8}}
          >
            <span className="font-sans text-brand-accent uppercase tracking-[0.4em] text-[13px] font-bold">
              Visione Privata // Archivio
            </span>
            <h1 className="text-5xl md:text-8xl font-serif text-brand-dark uppercase tracking-tighter mt-4 italic lowercase">
              {collection.title}
            </h1>
          </motion.div>

          {/* TRIGGER FILTRI MOBILE */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="md:hidden flex items-center gap-3 font-sans uppercase text-[10px] tracking-[0.3em] font-bold text-brand-dark border border-brand-dark px-8 py-4 hover:bg-brand-dark hover:text-brand-light transition-all duration-500 w-full justify-center"
          >
            <FilterIcon size={14} />
            Filtra
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-16 flex flex-col md:flex-row gap-20">
        {/* OVERLAY MOBILE */}
        <AnimatePresence>
          {isFilterOpen && !isDesktop && (
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-[60]"
            />
          )}
        </AnimatePresence>

        {/*
          SIDEBAR
          ───────────────────────────────────────────────────────────
          Mobile  → drawer fixed da sinistra, animato su x
          Desktop → sticky sotto l'header, altezza = viewport − header,
                    scroll autonomo via overflow-y-auto
          md:[transform:none] resetta l'x di Framer Motion su desktop.
        */}
        <motion.div
          animate={{x: sidebarVisible ? 0 : '-100%'}}
          transition={{type: 'spring', damping: 25, stiffness: 200}}
          style={{pointerEvents: sidebarVisible ? 'auto' : 'none'}}
          className="
            fixed inset-y-0 left-0 z-[70] w-[85%] max-w-[320px]
            bg-brand-light p-8 overflow-y-auto no-scrollbar
            md:relative md:left-auto md:inset-y-auto
            md:w-64 md:flex-shrink-0 md:z-auto md:p-0 md:bg-transparent
            md:sticky md:top-32
            md:h-[calc(100vh-8rem)] md:overflow-y-auto md:no-scrollbar
            md:[transform:none]
          "
        >
          {/* HEADER DRAWER — solo mobile */}
          <div className="flex justify-between items-center mb-12 md:hidden">
            <span className="font-sans text-[12px] uppercase tracking-[0.4em] font-bold">
              Filtri
            </span>
            <button onClick={() => setIsFilterOpen(false)} className="p-2">
              <XIcon size={20} />
            </button>
          </div>

          <div className="space-y-12 pb-8">
            {/* NAVIGAZIONE COLLEZIONI — lista singola colonna */}
            <div className="space-y-4">
              <h3 className="font-sans text-[18px] uppercase tracking-[0.4em] font-bold text-brand-accent border-b border-brand-gray/30 pb-3">
                Collezioni
              </h3>
              <ul className="flex flex-col gap-3">
                {collections?.nodes?.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/collections/${c.handle}`}
                      onClick={() => setIsFilterOpen(false)}
                      className={`font-sans text-[12px] uppercase tracking-[0.2em] transition-all duration-300 hover:text-brand-accent ${
                        collection.handle === c.handle
                          ? 'text-brand-accent font-bold pl-2 border-l-2 border-brand-accent'
                          : 'text-brand-dark/60'
                      }`}
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* FILTRI DINAMICI — griglia a 2 colonne per categoria */}
            {collection?.products?.filters?.map((filter) => {
              if (filter.type === 'PRICE_RANGE') return null;
              return (
                <div key={filter.id} className="space-y-4">
                  <h3 className="font-sans text-[18px] uppercase tracking-[0.4em] font-bold text-brand-accent border-b border-brand-gray/30 pb-3">
                    {filter.label}
                  </h3>
                  {/*
                    Grid 2 colonne: ogni voce ha label + count.
                    Se la lista ha ≤3 voci rimane su colonna singola
                    per evitare una grid quasi vuota.
                  */}
                  <ul
                    className={
                      filter.values.length > 3
                        ? 'grid grid-cols-2 gap-x-4 gap-y-3'
                        : 'flex flex-col gap-3'
                    }
                  >
                    {filter.values.map((value) => (
                      <li key={value.id}>
                        <FilterLink
                          value={value}
                          closeMobile={() => setIsFilterOpen(false)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* TASTO APPLICA — solo mobile */}
          <button
            onClick={() => setIsFilterOpen(false)}
            className="w-full bg-brand-dark text-brand-light py-5 font-sans uppercase text-[10px] tracking-[0.4em] font-bold mt-4 md:hidden"
          >
            Applica Filtri
          </button>
        </motion.div>

        {/* GRIGLIA PRODOTTI */}
        <main className="flex-1">
          <PaginatedResourceSection
            connection={collection.products}
            resourcesClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
          >
            {({node: product, index, NextLink}) => (
              <>
                <ProductCard product={product} index={index} />
                {NextLink && (
                  <div className="flex justify-center pt-20 pb-32 border-t border-brand-gray/10 w-full">
                    <NextLink className="group relative inline-block px-24 py-8 border border-brand-dark overflow-hidden transition-all duration-500">
                      <span className="relative z-10 font-sans text-[12px] uppercase tracking-[0.8em] font-bold text-brand-dark group-hover:text-brand-light transition-colors duration-500">
                        Carica Altri Pezzi
                      </span>
                      <div className="absolute inset-0 bg-brand-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                    </NextLink>
                  </div>
                )}
              </>
            )}
          </PaginatedResourceSection>
        </main>
      </div>
    </section>
  );
}

// COMPONENTI DI SUPPORTO
function FilterLink({value, closeMobile}) {
  const [searchParams] = useSearchParams();
  const filterKey = 'filter.';
  const rawInput = value.input;
  const currentFilters = searchParams.getAll(filterKey);
  const isSelected = currentFilters.includes(rawInput);
  const newParams = new URLSearchParams(searchParams);

  if (isSelected) {
    newParams.delete(filterKey);
    currentFilters.forEach((f) => {
      if (f !== rawInput) newParams.append(filterKey, f);
    });
  } else {
    newParams.append(filterKey, rawInput);
  }

  return (
    <Link
      to={`?${newParams.toString()}`}
      preventScrollReset
      className={`group flex flex-col gap-0.5 font-sans text-[12px] uppercase tracking-[0.15em] transition-all duration-300 ${
        isSelected
          ? 'text-brand-accent font-bold pl-2 border-l-2 border-brand-accent'
          : 'text-brand-dark/50 hover:text-brand-dark'
      }`}
    >
      <span className="leading-tight">{value.label}</span>
      <span className="text-[12px] opacity-30 group-hover:opacity-80 italic">
        {value.count}
      </span>
    </Link>
  );
}

function ProductCard({product, index}) {
  return (
    <motion.div
      initial={{opacity: 0, y: 30}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true}}
      transition={{duration: 0.6, delay: (index % 3) * 0.1}}
      className="group flex flex-col gap-6"
    >
      <Link
        to={`/products/${product.handle}`}
        className="relative aspect-[4/5] bg-brand-gray overflow-hidden block"
      >
        {product.featuredImage ? (
          <Image
            data={product.featuredImage}
            aspectRatio="4/5"
            sizes="(min-width: 45em) 30vw, 90vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-brand-gray flex items-center justify-center font-serif italic text-brand-dark/10 text-xs text-center p-4">
            Visione Privata // Archivio
          </div>
        )}
      </Link>
      <div className="flex flex-col gap-2 font-sans uppercase">
        <div className="flex justify-between items-start gap-4">
          <Link
            to={`/products/${product.handle}`}
            className="text-brand-dark font-medium text-[12px] tracking-[0.2em] hover:text-brand-accent transition-colors truncate"
          >
            {product.title}
          </Link>
          <span className="text-brand-accent font-bold text-[12px] tracking-widest italic">
            <Money data={product.priceRange.minVariantPrice} />
          </span>
        </div>
        <span className="text-brand-dark/40 text-[9px] tracking-[0.3em] truncate">
          {product.vendor} {product.productType || 'Selection'}
        </span>
      </div>
    </motion.div>
  );
}

// ICONE
const FilterIcon = ({size}) => (
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
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const XIcon = ({size}) => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const COLLECTION_QUERY = `#graphql
  query Collection($handle: String!, $filters: [ProductFilter!], $country: CountryCode, $language: LanguageCode, $first: Int, $last: Int, $startCursor: String, $endCursor: String) @inContext(country: $country, language: $language) {
    collections(first: 100) { nodes { id title handle } }
    collection(handle: $handle) {
      id handle title description
      products(first: $first, last: $last, before: $startCursor, after: $endCursor, filters: $filters) {
        nodes {
          id handle title vendor productType
          featuredImage { url altText width height }
          priceRange { minVariantPrice { amount currencyCode } }
        }
        filters { id label type values { id label count input } }
        pageInfo { hasPreviousPage hasNextPage endCursor startCursor }
      }
    }
  }
`;
