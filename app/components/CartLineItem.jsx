import {CartForm, Image} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import {X, Minus, Plus} from 'lucide-react';

export function CartLineItem({layout, line, childrenMap}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  // Cerchiamo l'opzione colore o usiamo il titolo della variante
  const colorOption =
    selectedOptions?.find(
      (opt) => opt.name === 'Color' || opt.name === 'Colore',
    )?.value || title;

  return (
    <li
      key={id}
      className="flex gap-8 group mb-12 border-b border-brand-gray/30 pb-12 last:border-0 last:mb-0 last:pb-0"
    >
      {/* Immagine con le tue dimensioni e l'effetto hover scale */}
      <Link
        prefetch="intent"
        to={lineItemUrl}
        onClick={close}
        className="w-24 h-32 bg-brand-gray shrink-0 overflow-hidden group block"
      >
        {image && (
          <Image
            alt={title}
            data={image}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </Link>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <Link
              prefetch="intent"
              to={lineItemUrl}
              onClick={close}
              className="font-sans font-bold uppercase text-xs tracking-widest hover:text-brand-accent transition-colors pr-4"
            >
              {product.title}
            </Link>
            <CartLineRemoveButton lineIds={[id]} />
          </div>
          <p className="text-brand-dark/50 text-[10px] uppercase tracking-widest mt-1">
            {colorOption !== 'Default Title' ? colorOption : ''}
          </p>
        </div>

        <div className="flex items-center justify-between">
          {/* I tuoi bottoni, ma con il cervello di Hydrogen */}
          <div className="flex items-center border border-brand-gray h-8">
            <CartLineQuantityAdjuster line={line} />
          </div>

          <span className="font-serif italic text-brand-dark">
            <ProductPrice price={line.cost.totalAmount} />
          </span>
        </div>
      </div>
    </li>
  );
}

function CartLineQuantityAdjuster({line}) {
  return (
    <>
      <CartLineUpdateButton
        lines={[{id: line.id, quantity: line.quantity - 1}]}
      >
        <button
          className="p-2 h-full flex items-center hover:bg-brand-gray transition-colors disabled:opacity-30"
          disabled={line.quantity <= 1}
          type="submit"
        >
          <Minus size={12} />
        </button>
      </CartLineUpdateButton>

      <span className="font-sans text-xs w-8 text-center flex items-center justify-center h-full">
        {line.quantity}
      </span>

      <CartLineUpdateButton
        lines={[{id: line.id, quantity: line.quantity + 1}]}
      >
        <button
          className="p-2 h-full flex items-center hover:bg-brand-gray transition-colors"
          type="submit"
        >
          <Plus size={12} />
        </button>
      </CartLineUpdateButton>
    </>
  );
}

function CartLineRemoveButton({lineIds}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        className="text-neutral-400 hover:text-brand-accent transition-colors"
        type="submit"
      >
        <X size={16} />
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({children, lines}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}
