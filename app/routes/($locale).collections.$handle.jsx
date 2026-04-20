import {redirect, useLoaderData, json} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({params, request, context}) {
  const {handle} = params;
  const searchParams = new URL(request.url).searchParams;

  // Estrazione dei filtri dai parametri della query nell'URL
  // Hydrogen si aspetta i filtri in un formato array di oggetti ProductFilter
  const filters = [];
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter.')) {
      try {
        // Molti link di filtro in Hydrogen vengono generati come oggetti JSON
        filters.push(JSON.parse(value));
      } catch (e) {
        // Gestione dei parametri che non sono in formato JSON
      }
    }
  }

  // Gestione della paginazione per mantenere la compatibilità con la query
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 16, // Numero di prodotti per pagina
  });

  // Esecuzione della query aggiornata
  const {collection, collections} = await context.storefront.query(
    COLLECTION_QUERY,
    {
      variables: {
        handle,
        filters,
        ...paginationVariables,
      },
    },
  );

  if (!collection) {
    throw new Response('Collezione non trovata', {status: 404});
  }

  return json({
    collection,
    collections, // Questo permetterà di popolare la sidebar laterale
  });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection} = useLoaderData();

  return (
    <div className="collection">
      <h1>{collection.title}</h1>
      <p className="collection-description">{collection.description}</p>
      <PaginatedResourceSection
        connection={collection.products}
        resourcesClassName="products-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $filters: [ProductFilter!] # <--- 1. AGGIUNTO PER IL FILTRAGGIO REALE
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    # 2. RECUPERIAMO TUTTE LE COLLEZIONI PER LA SIDEBAR SINISTRA
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
        filters: $filters # <--- 3. PASSIAMO I FILTRI ALL'API DI SHOPIFY
      ) {
        nodes {
          ...ProductItem
        }
        # 4. RECUPERIAMO I FILTRI CONFIGURATI NEL BACKOFFICE (Colore, Forma, etc.)
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input # Questo è l'oggetto JSON che useremo per i link dei filtri
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

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
