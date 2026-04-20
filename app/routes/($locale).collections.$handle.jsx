import React from 'react';
import {useLoaderData, Link, useSearchParams} from 'react-router';
import {
  getPaginationVariables,
  Analytics,
  Image,
  Money,
} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {motion} from 'framer-motion';

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

  return (
    <section className="w-full min-h-screen bg-brand-light pb-24">
      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />

      {/* HEADER EDITORIALE */}
      <header className="pt-32 pb-16 px-6 md:px-12 border-b border-brand-gray/30 bg-brand-light">
        <div className="max-w-[1400px] mx-auto text-center md:text-left">
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8}}
          >
            <span className="font-sans text-brand-accent uppercase tracking-[0.4em] text-[10px] font-bold">
              Visione Privata // Archivio
            </span>
            <h1 className="text-5xl md:text-8xl font-serif text-brand-dark uppercase tracking-tighter mt-4 italic lowercase">
              {collection.title}
            </h1>
          </motion.div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-16 flex flex-col md:flex-row gap-20">
        {/* SIDEBAR FISSA A SINISTRA */}
        <aside
          id="archive-sidebar"
          className="w-full md:w-64 shrink-0 md:sticky md:top-32 self-start space-y-16 pb-20"
        >
          {/* NAVIGAZIONE COLLEZIONI */}
          <div className="space-y-6">
            <h3 className="font-sans text-[18px] uppercase tracking-[0.3em] font-bold text-brand-accent border-b border-brand-gray/30 pb-3">
              Collezioni
            </h3>
            <ul className="flex flex-col gap-4">
              {collections?.nodes?.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/collections/${c.handle}`}
                    className={`font-sans text-[11px] uppercase tracking-[0.2em] transition-all duration-300 hover:text-brand-accent ${
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

          {/* FILTRI DINAMICI (Sempre aperti) */}
          {collection?.products?.filters?.map((filter) => {
            if (filter.type === 'PRICE_RANGE') return null;
            return (
              <div key={filter.id} className="space-y-6">
                <h3 className="font-sans text-[18px] uppercase tracking-[0.3em] font-bold text-brand-accent border-b border-brand-gray/30 pb-3">
                  {filter.label}
                </h3>
                <ul className="flex flex-col gap-4">
                  {filter.values.map((value) => (
                    <li key={value.id}>
                      <FilterLink value={value} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </aside>

        {/* GRIGLIA PRODOTTI */}
        <main className="flex-1">
          <PaginatedResourceSection
            connection={collection.products}
            resourcesClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
          >
            {({node: product, index, NextLink}) => (
              <>
                <ProductCard product={product} index={index} />
                {/* IL BOTTONE LOAD MORE - Centrato e stilizzato */}
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

function FilterLink({value}) {
  const [searchParams] = useSearchParams();

  // value.input è una stringa JSON, la usiamo come chiave unica nell'URL
  const filterKey = 'filter.';
  const rawInput = value.input; // Questa è la stringa tipo '{"variantOption":...}'

  const currentFilters = searchParams.getAll(filterKey);
  const isSelected = currentFilters.includes(rawInput);

  const newParams = new URLSearchParams(searchParams);

  if (isSelected) {
    // Se è già selezionato, lo togliamo
    newParams.delete(filterKey);
    currentFilters.forEach((f) => {
      if (f !== rawInput) newParams.append(filterKey, f);
    });
  } else {
    // Altrimenti lo aggiungiamo
    newParams.append(filterKey, rawInput);
  }

  // Costruiamo l'URL mantenendo il percorso corrente
  const linkTo = `?${newParams.toString()}`;

  return (
    <Link
      to={linkTo}
      preventScrollReset
      className={`group flex justify-between items-center font-sans text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
        isSelected
          ? 'text-brand-accent font-bold pl-3 border-l-2 border-brand-accent'
          : 'text-brand-dark/50 hover:text-brand-dark'
      }`}
    >
      <span>{value.label}</span>
      <span className="text-[9px] opacity-20 group-hover:opacity-100 italic ml-4">
        ({value.count})
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
          <div className="w-full h-full bg-brand-gray flex items-center justify-center font-serif italic text-brand-dark/10 text-xs">
            Visione Privata
          </div>
        )}
        <div className="absolute inset-0 bg-brand-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
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
        <div className="flex items-center gap-2">
          <span className="w-4 h-[1px] bg-brand-gray" />
          <span className="text-brand-dark/40 text-[9px] tracking-[0.3em]">
            {product.vendor} {product.productType || 'Selection'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!, 
    $filters: [ProductFilter!], 
    $country: CountryCode, 
    $language: LanguageCode, 
    $first: Int, 
    $last: Int, 
    $startCursor: String, 
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(first: 100) {
      nodes {
        id
        title
        handle
      }
    }
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        filters: $filters
      ) {
        nodes {
          id
          handle
          title
          vendor
          productType
          featuredImage {
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;
