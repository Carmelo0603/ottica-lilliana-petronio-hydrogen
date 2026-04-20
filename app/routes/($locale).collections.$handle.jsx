import React, {useState} from 'react';
import {useLoaderData, Link, useSearchParams} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

export const meta = ({data}) => {
  return [{title: `Visione Privata | ${data?.collection?.title ?? ''}`}];
};

export async function loader({params, request, context}) {
  const {handle} = params;
  const {storefront} = context;
  const searchParams = new URL(request.url).searchParams;

  // 1. Estrazione filtri
  const filters = [];
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter.')) {
      try {
        filters.push(JSON.parse(value));
      } catch (e) {
        // Fallback per filtri semplici
      }
    }
  }

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 16,
  });

  // 2. Query con contesto esplicito (Lingua e Paese)
  const {collection, collections} = await storefront.query(COLLECTION_QUERY, {
    variables: {
      handle,
      // Se l'array è vuoto, passiamo undefined per avere i filtri iniziali
      filters: filters.length > 0 ? filters : undefined,
      ...paginationVariables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  if (!collection) {
    throw new Response('Collection not found', {status: 404});
  }

  return {collection, collections};
}

export default function Collection() {
  const {collection, collections} = useLoaderData();

  // DEBUG GIALLO IN CONSOLE
  console.warn('--- INFO FILTRI ---');
  console.warn('Prodotti trovati:', collection?.products?.nodes?.length);
  console.warn('Filtri ricevuti:', collection?.products?.filters);

  return (
    <section className="pt-32 pb-16 px-6 md:px-12 bg-brand-light min-h-screen text-brand-dark">
      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />

      <header className="mb-16">
        <h1 className="font-serif italic text-5xl md:text-6xl mb-4 lowercase tracking-tighter">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] opacity-60 max-w-2xl">
            {collection.description}
          </p>
        )}
      </header>

      <div className="flex flex-col md:flex-row gap-16">
        {/* SIDEBAR COLLEZIONI */}
        <aside className="w-full md:w-64 shrink-0">
          <h3 className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold mb-10 opacity-30 border-b border-brand-gray/30 pb-4">
            Collezioni
          </h3>
          <ul className="space-y-6">
            {collections?.nodes?.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/collections/${c.handle}`}
                  className={`font-sans text-[11px] uppercase tracking-[0.2em] transition-all duration-300 hover:text-brand-accent ${
                    collection.handle === c.handle
                      ? 'font-bold underline underline-offset-8'
                      : 'opacity-40'
                  }`}
                >
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN: FILTRI E PRODOTTI */}
        <main className="flex-1">
          <div className="flex flex-wrap gap-10 mb-12 border-y border-brand-gray/30 py-6">
            {collection?.products?.filters?.length > 0 ? (
              collection.products.filters.map((filter) => (
                <FilterDropdown key={filter.id} filter={filter} />
              ))
            ) : (
              <p className="font-sans text-[9px] uppercase tracking-widest opacity-30 italic">
                Nessun filtro disponibile per questa collezione.
              </p>
            )}
          </div>

          <PaginatedResourceSection
            connection={collection.products}
            resourcesClassName="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
          >
            {({node: product, index}) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 8 ? 'eager' : undefined}
              />
            )}
          </PaginatedResourceSection>
        </main>
      </div>
    </section>
  );
}

function FilterDropdown({filter}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative" onMouseLeave={() => setIsOpen(false)}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold hover:text-brand-accent flex items-center gap-2"
      >
        {filter.label} <span className="text-[8px]">▼</span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 pt-2 z-50">
          <ul className="bg-brand-light border border-brand-gray/30 p-6 space-y-4 min-w-[220px] shadow-sm">
            {filter.values.map((value) => (
              <li key={value.id}>
                <FilterLink
                  label={value.label}
                  input={value.input}
                  count={value.count}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FilterLink({label, input, count}) {
  const [searchParams] = useSearchParams();
  const filterValue = JSON.stringify(input);
  const isSelected = searchParams.getAll('filter.').includes(filterValue);
  const newParams = new URLSearchParams(searchParams);

  if (isSelected) {
    const currentValues = newParams.getAll('filter.');
    newParams.delete('filter.');
    currentValues.forEach((v) => {
      if (v !== filterValue) newParams.append('filter.', v);
    });
  } else {
    newParams.append('filter.', filterValue);
  }

  return (
    <Link
      to={`?${newParams.toString()}`}
      preventScrollReset
      className={`flex justify-between items-center font-sans text-[10px] uppercase tracking-widest ${
        isSelected
          ? 'text-brand-accent font-bold'
          : 'opacity-50 hover:opacity-100'
      }`}
    >
      <span>{label}</span>
      <span className="text-[8px] opacity-30 ml-4">({count})</span>
    </Link>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 { amount currencyCode }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage { id altText url width height }
    priceRange {
      minVariantPrice { ...MoneyProductItem }
      maxVariantPrice { ...MoneyProductItem }
    }
  }
`;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
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
    collections(first: 100) { nodes { id title handle } }
    collection(handle: $handle) {
      id handle title description
      products(first: $first, last: $last, before: $startCursor, after: $endCursor, filters: $filters) {
        nodes { ...ProductItem }
        filters { id label type values { id label count input } }
        pageInfo { hasPreviousPage hasNextPage endCursor startCursor }
      }
    }
  }
`;
