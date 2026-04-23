import {Await, Link} from 'react-router';
import {Suspense, useId} from 'react';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

/**
 * @param {PageLayoutProps}
 */
export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <main>{children}</main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </Aside.Provider>
  );
}

/**
 * @param {{cart: PageLayoutProps['cart']}}
 */
function CartAside({cart}) {
  return (
    <Aside type="cart" heading="IL TUO CARRELLO">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();

  return (
    <Aside type="search" heading="RICERCA">
      <div className="search-overlay bg-brand-light text-brand-dark min-h-full">
        <div className="px-6 md:px-12 pt-24 md:pt-32 pb-12 max-w-[1400px] mx-auto">
          <div className="border-b border-brand-gray30 pb-8 mb-10">
            <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.35em] text-brand-accent font-bold mb-4">
              Cerca un prodotto
            </p>

            <SearchFormPredictive className="search-form">
              {({fetchResults, goToSearch, inputRef}) => (
                <div className="flex flex-col gap-6">
                  <input
                    ref={inputRef}
                    name="q"
                    type="search"
                    onChange={fetchResults}
                    onFocus={fetchResults}
                    list={queriesDatalistId}
                    placeholder="Cerca montature, collezioni, pagine..."
                    className="search-input w-full bg-transparent border-0 border-b border-brand-dark/20 rounded-none px-0 py-4 md:py-6 font-serif text-xs md:text-xs  tracking-tight text-brand-dark placeholder:text-brand-dark focus:outline-none focus:border-brand-accent transition-colors duration-300"
                  />

                  <button
                    type="button"
                    onClick={goToSearch}
                    className="group inline-flex items-center gap-4 self-start border border-brand-dark px-6 md:px-8 py-3 md:py-4 font-sans font-bold text-[10px] md:text-xs uppercase tracking-[0.25em] text-brand-dark hover:bg-brand-dark hover:text-brand-light transition-all duration-500"
                  >
                    <span>Vai alla ricerca completa</span>
                  </button>
                </div>
              )}
            </SearchFormPredictive>
          </div>

          <SearchResultsPredictive>
            {({items, total, term, state, closeSearch}) => {
              const {articles, collections, pages, products, queries} = items;

              if (state === 'loading' && term.current) {
                return (
                  <div className="py-12 font-sans text-xs uppercase tracking-[0.3em] text-brand-dark/40">
                    Ricerca in corso...
                  </div>
                );
              }

              if (!total) {
                return <SearchResultsPredictive.Empty term={term} />;
              }

              return (
                <div className="space-y-12 md:space-y-16">
                  <SearchResultsPredictive.Queries
                    queries={queries}
                    queriesDatalistId={queriesDatalistId}
                  />
                  <SearchResultsPredictive.Products
                    products={products}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Collections
                    collections={collections}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Pages
                    pages={pages}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Articles
                    articles={articles}
                    closeSearch={closeSearch}
                    term={term}
                  />

                  {term.current && total ? (
                    <div className="pt-4 border-t border-brand-gray30">
                      <Link
                        onClick={closeSearch}
                        to={`${SEARCH_ENDPOINT}?q=${encodeURIComponent(term.current)}`}
                        className="group inline-flex items-center gap-4 font-sans text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-brand-dark hover:text-brand-accent transition-colors duration-300"
                      >
                        <span>Vedi tutti i risultati per “{term.current}”</span>
                      </Link>
                    </div>
                  ) : null}
                </div>
              );
            }}
          </SearchResultsPredictive>
        </div>
      </div>
    </Aside>
  );
}

/**
 * @param {{
 *   header: PageLayoutProps['header'];
 *   publicStoreDomain: PageLayoutProps['publicStoreDomain'];
 * }}
 */
function MobileMenuAside({header, publicStoreDomain}) {
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENU">
        <HeaderMenu
          menu={header.menu}
          viewport="mobile"
          primaryDomainUrl={header.shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
      </Aside>
    )
  );
}

/**
 * @typedef {Object} PageLayoutProps
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 * @property {React.ReactNode} [children]
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
