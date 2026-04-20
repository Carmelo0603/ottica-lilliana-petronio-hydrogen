import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection> personalizzato per Visione Privata.
 */
export function PaginatedResourceSection({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div className="w-full">
            {/* LINK PRECEDENTI - Stile minimale per non distrarre */}
            <div className="flex justify-center mb-12">
              <PreviousLink className="font-sans text-[10px] uppercase tracking-[0.3em] opacity-30 hover:opacity-100 transition-opacity italic">
                {isLoading ? 'Caricamento...' : '↑ Esplora i precedenti'}
              </PreviousLink>
            </div>

            {/* GRIGLIA PRODOTTI */}
            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={resourcesClassName}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}

            {/* IL TUO BOTTONE "CARICA ALTRI" - DESIGN DRIVEN */}
            <div className="flex justify-center pt-2 pb-32 border-t border-brand-gray/10 w-full mt-24">
              <NextLink className="group relative w-full md:w-auto px-20 py-8 border border-brand-dark overflow-hidden transition-all duration-500 hover:border-brand-accent text-center inline-block">
                <span className="relative z-10 font-sans text-[12px] uppercase tracking-[0.6em] font-bold text-brand-dark group-hover:text-brand-light transition-colors duration-500">
                  {isLoading ? 'Caricamento...' : 'Carica Altri Pezzi'}
                </span>

                {/* L'anima nera del bottone (l'effetto fill) */}
                <div className="absolute inset-0 bg-brand-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
              </NextLink>
            </div>
          </div>
        );
      }}
    </Pagination>
  );
}
