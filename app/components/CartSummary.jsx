import {CartForm, Money} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();

  return (
    <div aria-labelledby={summaryId} className="w-full flex flex-col">
      <h4 id={summaryId} className="sr-only">
        Totali Carrello
      </h4>

      {/* SEZIONE SCONTI E GIFT CARD (Resa minimale e integrata col tuo stile) */}
      <div className="space-y-4 mb-8">
        <CartDiscounts
          discountCodes={cart?.discountCodes}
          discountsHeadingId={discountsHeadingId}
          discountCodeInputId={discountCodeInputId}
        />
        <CartGiftCard
          giftCardCodes={cart?.appliedGiftCards}
          giftCardHeadingId={giftCardHeadingId}
          giftCardInputId={giftCardInputId}
        />
      </div>

      {/* IL TUO CODICE STILISTICO: Subtotale */}
      <div className="flex justify-between items-end mb-6">
        <span className="font-sans uppercase text-xs tracking-widest font-bold text-brand-dark/60">
          Subtotale
        </span>
        <span className="font-serif italic text-2xl text-brand-dark">
          {cart?.cost?.subtotalAmount?.amount ? (
            <Money data={cart?.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </span>
      </div>

      {/* IL TUO CODICE STILISTICO: Testo Spedizione */}
      <p className="font-sans text-[10px] text-brand-dark/50 uppercase tracking-widest mb-6 text-center">
        Spedizione e tasse calcolate al checkout.
      </p>

      {/* Tasto Checkout */}
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

/**
 * @param {{checkoutUrl?: string}}
 */
function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;

  return (
    <a href={checkoutUrl} target="_self" className="block w-full">
      <button className="w-full bg-brand-dark text-brand-light py-5 font-sans uppercase text-xs tracking-[0.2em] font-bold hover:bg-brand-accent hover:text-brand-dark transition-colors duration-300">
        Procedi al Checkout
      </button>
    </a>
  );
}

/**
 * @param {{
 * discountCodes?: CartApiQueryFragment['discountCodes'];
 * discountsHeadingId: string;
 * discountCodeInputId: string;
 * }}
 */
function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
}) {
  const codes =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <section aria-label="Discounts" className="space-y-3">
      {/* Sconto Applicato */}
      <dl hidden={!codes.length}>
        <div>
          <dt id={discountsHeadingId} className="sr-only">
            Sconti
          </dt>
          <UpdateDiscountForm>
            <div
              className="flex items-center justify-between text-[10px] font-sans uppercase tracking-[0.2em] text-brand-dark/60"
              role="group"
              aria-labelledby={discountsHeadingId}
            >
              <code>{codes?.join(', ')}</code>
              <button
                type="submit"
                aria-label="Rimuovi sconto"
                className="hover:text-brand-accent transition-colors"
              >
                Rimuovi
              </button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Form di inserimento Sconto */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex items-center border-b border-brand-gray pb-2">
          <label htmlFor={discountCodeInputId} className="sr-only">
            Codice sconto
          </label>
          <input
            id={discountCodeInputId}
            type="text"
            name="discountCode"
            placeholder="Codice Sconto"
            className="bg-transparent border-none outline-none w-full font-sans text-[10px] uppercase tracking-[0.2em] placeholder:text-brand-dark/40 text-brand-dark focus:ring-0"
          />
          <button
            type="submit"
            aria-label="Applica codice sconto"
            className="font-sans text-[10px] uppercase tracking-[0.2em] text-brand-dark hover:text-brand-accent transition-colors ml-4 font-bold"
          >
            Applica
          </button>
        </div>
      </UpdateDiscountForm>
    </section>
  );
}

/**
 * @param {{
 * discountCodes?: string[];
 * children: React.ReactNode;
 * }}
 */
function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

/**
 * @param {{
 * giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
 * giftCardHeadingId: string;
 * giftCardInputId: string;
 * }}
 */
function CartGiftCard({giftCardCodes, giftCardHeadingId, giftCardInputId}) {
  const giftCardCodeInput = useRef(null);
  const removeButtonRefs = useRef(new Map());
  const previousCardIdsRef = useRef([]);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [removedCardIndex, setRemovedCardIndex] = useState(null);

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      if (giftCardCodeInput.current !== null) {
        giftCardCodeInput.current.value = '';
      }
    }
  }, [giftCardAddFetcher.data]);

  useEffect(() => {
    const currentCardIds = giftCardCodes?.map((card) => card.id) || [];

    if (removedCardIndex !== null && giftCardCodes) {
      const focusTargetIndex = Math.min(
        removedCardIndex,
        giftCardCodes.length - 1,
      );
      const focusTargetCard = giftCardCodes[focusTargetIndex];
      const focusButton = focusTargetCard
        ? removeButtonRefs.current.get(focusTargetCard.id)
        : null;

      if (focusButton) {
        focusButton.focus();
      } else if (giftCardCodeInput.current) {
        giftCardCodeInput.current.focus();
      }

      setRemovedCardIndex(null);
    }

    previousCardIdsRef.current = currentCardIds;
  }, [giftCardCodes, removedCardIndex]);

  const handleRemoveClick = (cardId) => {
    const index = previousCardIdsRef.current.indexOf(cardId);
    if (index !== -1) {
      setRemovedCardIndex(index);
    }
  };

  return (
    <section aria-label="Gift cards" className="space-y-3">
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl>
          <dt id={giftCardHeadingId} className="sr-only">
            Gift Card Applicate
          </dt>
          {giftCardCodes.map((giftCard) => (
            <dd
              key={giftCard.id}
              className="flex items-center justify-between text-[10px] font-sans uppercase tracking-[0.2em] text-brand-dark/60 mb-2"
            >
              <RemoveGiftCardForm
                giftCardId={giftCard.id}
                lastCharacters={giftCard.lastCharacters}
                onRemoveClick={() => handleRemoveClick(giftCard.id)}
                buttonRef={(el) => {
                  if (el) {
                    removeButtonRefs.current.set(giftCard.id, el);
                  } else {
                    removeButtonRefs.current.delete(giftCard.id);
                  }
                }}
              >
                <div className="flex gap-4 items-center">
                  <code>***{giftCard.lastCharacters}</code>
                  <Money data={giftCard.amountUsed} />
                </div>
              </RemoveGiftCardForm>
            </dd>
          ))}
        </dl>
      )}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <div className="flex items-center border-b border-brand-gray pb-2">
          <label htmlFor={giftCardInputId} className="sr-only">
            Codice Gift Card
          </label>
          <input
            id={giftCardInputId}
            type="text"
            name="giftCardCode"
            placeholder="Codice Gift Card"
            ref={giftCardCodeInput}
            className="bg-transparent border-none outline-none w-full font-sans text-[10px] uppercase tracking-[0.2em] placeholder:text-brand-dark/40 text-brand-dark focus:ring-0"
          />
          <button
            type="submit"
            disabled={giftCardAddFetcher.state !== 'idle'}
            aria-label="Applica codice gift card"
            className="font-sans text-[10px] uppercase tracking-[0.2em] text-brand-dark hover:text-brand-accent transition-colors ml-4 font-bold disabled:opacity-50"
          >
            Applica
          </button>
        </div>
      </AddGiftCardForm>
    </section>
  );
}

/**
 * @param {{
 * fetcherKey?: string;
 * children: React.ReactNode;
 * }}
 */
function AddGiftCardForm({fetcherKey, children}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

/**
 * @param {{
 * giftCardId: string;
 * lastCharacters: string;
 * children: React.ReactNode;
 * onRemoveClick?: () => void;
 * buttonRef?: (el: HTMLButtonElement | null) => void;
 * }}
 */
function RemoveGiftCardForm({
  giftCardId,
  lastCharacters,
  children,
  onRemoveClick,
  buttonRef,
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      <div className="flex items-center justify-between w-full">
        {children}
        <button
          type="submit"
          aria-label={`Rimuovi gift card che finisce con ${lastCharacters}`}
          onClick={onRemoveClick}
          ref={buttonRef}
          className="hover:text-brand-accent transition-colors"
        >
          Rimuovi
        </button>
      </div>
    </CartForm>
  );
}

/**
 * @typedef {{
 * cart: OptimisticCart<CartApiQueryFragment | null>;
 * layout: CartLayout;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
