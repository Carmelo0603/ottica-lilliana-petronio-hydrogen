import {Link, useLoaderData} from 'react-router';
import {
  Money,
  flattenConnection,
  getPaginationVariables,
} from '@shopify/hydrogen';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {buildOrderSearchQuery, parseOrderFilters} from '~/lib/orderFilters';

export const meta = () => {
  return [{title: 'Ordini'}];
};

// --------------------------------------------------------
// IL BACK-END: Ripristinato con tutti i parametri di ricerca
// --------------------------------------------------------
export async function loader({request, context}) {
  const {customerAccount} = context;

  // Paginazione e filtri richiesti dalla query
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      // Importante: Passiamo la lingua per non avere traduzioni sballate
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Ordini non trovati');
  }

  return {customer: data.customer, filters};
}

// --------------------------------------------------------
// IL FRONT-END: La UI di design pulita su sfondo chiaro
// --------------------------------------------------------
export default function OrdersIndex() {
  const {customer} = useLoaderData();
  const orders = flattenConnection(customer.orders);

  if (!orders.length) {
    return (
      <div className="py-12 border-t border-brand-dark/10">
        <p className="text-brand-dark/60 uppercase text-sm tracking-widest">
          Non hai ancora effettuato ordini.
        </p>
        <Link
          to="/collections/all"
          className="inline-block mt-6 px-8 py-4 bg-brand-dark text-brand-light uppercase text-xs tracking-widest font-bold hover:bg-brand-accent transition-colors"
        >
          Inizia lo shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-brand-dark/10 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-brand-dark/30 transition-colors bg-white/50"
          >
            <div className="space-y-2">
              <span className="text-[10px] text-brand-dark/40 uppercase tracking-widest font-bold">
                Ordine {order.number}
              </span>
              <h3 className="text-xl font-serif">
                {new Date(order.processedAt).toLocaleDateString('it-IT')}
              </h3>
            </div>
            <div className="flex gap-12">
              <div className="text-center">
                <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest mb-1">
                  Stato
                </p>
                <p className="text-xs uppercase font-bold">
                  {order.financialStatus}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-brand-dark/40 uppercase tracking-widest mb-1">
                  Totale
                </p>
                <p className="text-xs font-bold">
                  <Money data={order.totalPrice} />
                </p>
              </div>
            </div>
            <Link
              to={`/account/orders/${btoa(order.id)}`}
              className="px-6 py-3 border border-brand-dark text-brand-dark uppercase text-[10px] tracking-widest font-bold hover:bg-brand-dark hover:text-brand-light transition-all"
            >
              Dettagli
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
