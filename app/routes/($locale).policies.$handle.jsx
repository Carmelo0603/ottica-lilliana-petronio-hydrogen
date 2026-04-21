import {useLoaderData} from 'react-router';

/**
 * Route: /policies/:handle
 *
 * Renderizza una singola policy di Shopify (privacy, rimborsi, spedizione,
 * termini di servizio). Il contenuto è gestito dal cliente nell'admin Shopify
 * in Impostazioni → Policy — nessun intervento di sviluppo necessario.
 *
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  const {handle} = params;
  const {storefront} = context;

  const data = await storefront.query(POLICY_QUERY);
  const {shop} = data;

  // Mappa handle → oggetto policy
  const policyMap = {
    'privacy-policy': shop.privacyPolicy,
    'refund-policy': shop.refundPolicy,
    'shipping-policy': shop.shippingPolicy,
    'terms-of-service': shop.termsOfService,
  };

  const policy = policyMap[handle];

  if (!policy) {
    throw new Response('Policy non trovata', {status: 404});
  }

  return {policy};
}

export default function PolicyPage() {
  const {policy} = useLoaderData();

  return (
    <main className="w-full min-h-screen bg-brand-light pb-24">
      {/* Header */}
      <header className="pt-32 pb-16 px-6 md:px-12 border-b border-brand-gray/30">
        <div className="max-w-[860px] mx-auto">
          <span className="font-sans text-brand-accent uppercase tracking-[0.4em] text-[10px] font-bold">
            Informazioni Legali
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-brand-dark uppercase tracking-tighter mt-4 italic lowercase">
            {policy.title}
          </h1>
        </div>
      </header>

      {/* Corpo della policy — HTML generato da Shopify */}
      <article className="max-w-[860px] mx-auto px-6 md:px-12 mt-16 policy-body">
        <div dangerouslySetInnerHTML={{__html: policy.body}} />
      </article>
    </main>
  );
}

/*
 * Recupera tutte le policy in un'unica query.
 * L'handle nell'URL decide quale viene mostrata.
 */
const POLICY_QUERY = `#graphql
  query ShopPolicies {
    shop {
      privacyPolicy   { title handle body }
      refundPolicy    { title handle body }
      shippingPolicy  { title handle body }
      termsOfService  { title handle body }
    }
  }
`;

/** @typedef {import('./+types/policies.$handle').Route} Route */
