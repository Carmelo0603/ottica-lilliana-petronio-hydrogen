import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {ShoppingBag} from 'lucide-react';

function getLineItemChildrenMap(lines) {
  const children = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
  }
  return children;
}

export function CartMain({layout, cart: originalCart}) {
  // QUESTA è la vera magia di Hydrogen, non il tuo Context fasullo
  const cart = useOptimisticCart(originalCart);
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = linesCount && cart.totalQuantity > 0;
  const {close} = useAside();

  return (
    <div className="flex flex-col h-full bg-brand-light">
      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-brand-light">
        {!cartHasItems ? (
          <CartEmpty close={close} />
        ) : (
          <ul className="space-y-16">
            {cart.lines.nodes.map((line) => {
              const childrenMap = getLineItemChildrenMap(cart.lines.nodes);
              return (
                <CartLineItem
                  key={line.id}
                  line={line}
                  layout={layout}
                  childrenMap={childrenMap}
                />
              );
            })}
          </ul>
        )}
      </div>

      {cartHasItems && (
        <div className="p-0 bg-brand-light">
          {/* CartSummary ha già i suoi bordi e padding nel tuo CSS, lo iniettiamo qui */}
          <CartSummary cart={cart} layout={layout} />
        </div>
      )}
    </div>
  );
}

function CartEmpty({close}) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 py-20">
      <ShoppingBag size={48} strokeWidth={1} />
      <p className="font-sans uppercase tracking-widest text-xs">
        Il tuo carrello è vuoto.
      </p>
      <Link
        to="/collections/all"
        onClick={close}
        prefetch="viewport"
        className="mt-4 border-b border-brand-dark pb-1 font-sans text-[10px] uppercase tracking-[0.2em] hover:text-brand-accent transition-colors"
      >
        Torna all&apos;Archivio
      </Link>
    </div>
  );
}
