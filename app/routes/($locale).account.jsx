import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error(
      'Cliente non trovato. Assicurati che il tunnel sia attivo.',
    );
  }

  return remixData(
    {customer: data.customer},
    {headers: {'Cache-Control': 'no-cache, no-store, must-revalidate'}},
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData();

  return (
    // SFONDO CHIARO - TESTO SCURO
    <div className="bg-brand-light text-brand-dark min-h-screen pt-24 pb-12 px-6 md:px-12 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-12 border-b border-brand-dark/10 pb-8">
          <h1 className="font-serif text-4xl md:text-6xl uppercase tracking-tight font-medium mb-8">
            {customer.firstName
              ? `Ciao, ${customer.firstName}`
              : 'Il tuo Account'}
          </h1>
          <nav className="flex flex-wrap gap-8">
            <AccountLink to="/account/orders">Ordini</AccountLink>
            <AccountLink to="/account/profile">Profilo</AccountLink>
            <AccountLink to="/account/addresses">Indirizzi</AccountLink>
            <div className="md:ml-auto">
              <LogoutButton />
            </div>
          </nav>
        </header>

        <main>
          {/* L'Outlet inietterà i contenuti delle sottopagine qui sotto */}
          <Outlet context={{customer}} />
        </main>
      </div>
    </div>
  );
}

function AccountLink({to, children}) {
  return (
    <NavLink
      to={to}
      className={({isActive}) =>
        `text-xs uppercase tracking-[0.2em] transition-all pb-2 border-b-2 ${
          isActive
            ? 'text-brand-dark border-brand-dark font-bold'
            : 'text-brand-dark/40 border-transparent hover:text-brand-dark'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function LogoutButton() {
  return (
    <Form method="POST" action="/account/logout">
      <button
        type="submit"
        className="text-xs uppercase tracking-[0.2em] text-brand-accent font-bold hover:underline"
      >
        Esci
      </button>
    </Form>
  );
}
