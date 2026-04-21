import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';

export const meta = () => {
  return [{title: 'Profilo'}];
};

// --- LOGICA BACK-END INVARIATA ---
export async function loader({context}) {
  await context.customerAccount.handleAuthStatus();
  return {};
}

export async function action({request, context}) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Metodo non consentito'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer = {};
    const validInputKeys = ['firstName', 'lastName'];
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key] = value;
      }
    }

    // IL FIX È QUI: Rinominiamo 'data' in 'mutationData'
    const {data: mutationData, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!mutationData?.customerUpdate?.customer) {
      throw new Error("Errore durante l'aggiornamento del profilo.");
    }

    // Ora React Router è felice perché la sua funzione 'data' originale è intatta
    return data(
      {
        error: null,
        customer: mutationData.customerUpdate.customer,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    );
  } catch (error) {
    return data(
      {
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        customer: null,
      },
      {status: 400},
    );
  }
}

// --- FRONT-END AGGIORNATO AL DESIGN SYSTEM ---
export default function AccountProfile() {
  const accountContext = useOutletContext();
  const {state} = useNavigation();
  const action = useActionData();
  const customer = action?.customer ?? accountContext?.customer;

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h2 className="font-serif text-2xl uppercase tracking-tight mb-2">
          I tuoi dati
        </h2>
        <p className="text-sm text-brand-dark/60 font-sans">
          Aggiorna le informazioni del tuo profilo personale.
        </p>
      </div>

      <Form method="PUT" className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/60"
            >
              Nome
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Il tuo nome"
              defaultValue={customer.firstName ?? ''}
              minLength={2}
              className="w-full bg-transparent border-b border-brand-dark/20 py-3 text-sm font-sans focus:outline-none focus:border-brand-dark transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="text-[10px] uppercase tracking-widest font-bold text-brand-dark/60"
            >
              Cognome
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Il tuo cognome"
              defaultValue={customer.lastName ?? ''}
              minLength={2}
              className="w-full bg-transparent border-b border-brand-dark/20 py-3 text-sm font-sans focus:outline-none focus:border-brand-dark transition-colors"
            />
          </div>
        </div>

        {action?.error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
            {action.error}
          </div>
        )}

        <div className="pt-4 border-t border-brand-dark/10">
          <button
            type="submit"
            disabled={state !== 'idle'}
            className="bg-brand-dark text-brand-light px-8 py-4 uppercase text-xs tracking-widest font-bold hover:bg-brand-accent transition-colors disabled:opacity-50"
          >
            {state !== 'idle' ? 'Salvataggio...' : 'Aggiorna Profilo'}
          </button>
        </div>
      </Form>
    </div>
  );
}
