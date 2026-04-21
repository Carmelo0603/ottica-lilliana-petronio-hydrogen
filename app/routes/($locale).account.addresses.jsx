import {
  data as remixData,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';

export const meta = () => {
  return [{title: 'Indirizzi'}];
};

/**
 * Action per gestire Creazione, Modifica, Eliminazione e Indirizzo Predefinito
 */
export async function action({request, context}) {
  const {customerAccount} = context;
  const formData = await request.formData();
  const actionType = formData.get('_action');
  const addressId = formData.get('addressId');

  // Pulizia dei dati del form
  const address = {
    firstName: formData.get('firstName') || '',
    lastName: formData.get('lastName') || '',
    address1: formData.get('address1') || '',
    address2: formData.get('address2') || '',
    city: formData.get('city') || '',
    zip: formData.get('zip') || '',
    countryCode: formData.get('countryCode')?.toUpperCase() || 'IT',
    phone: formData.get('phone') || '',
  };

  try {
    let result;

    switch (actionType) {
      case 'CREATE':
        result = await customerAccount.mutate(
          CUSTOMER_ADDRESS_CREATE_MUTATION,
          {
            variables: {address},
          },
        );
        break;
      case 'UPDATE':
        result = await customerAccount.mutate(
          CUSTOMER_ADDRESS_UPDATE_MUTATION,
          {
            variables: {addressId, address},
          },
        );
        break;
      case 'DELETE':
        result = await customerAccount.mutate(
          CUSTOMER_ADDRESS_DELETE_MUTATION,
          {
            variables: {addressId},
          },
        );
        break;
      case 'DEFAULT':
        result = await customerAccount.mutate(
          CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
          {
            variables: {addressId},
          },
        );
        break;
      default:
        throw new Error('Azione non valida');
    }

    if (result.errors?.length) {
      throw new Error(result.errors[0].message);
    }

    return remixData({error: null, success: true});
  } catch (error) {
    return remixData(
      {
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        success: false,
      },
      {status: 400},
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext();
  const actionData = useActionData();
  const navigation = useNavigation();

  const addresses = customer?.addresses?.nodes || [];
  const defaultAddressId = customer?.defaultAddress?.id;

  return (
    <div className="max-w-4xl">
      <header className="mb-12">
        <h2 className="font-serif text-2xl uppercase tracking-tight mb-2">
          I tuoi indirizzi
        </h2>
        <p className="text-sm text-brand-dark/60">
          Gestisci le tue sedi di spedizione e fatturazione.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card Creazione */}
        <div className="border border-dashed border-brand-dark/20 p-8 flex flex-col bg-white/10">
          <h3 className="text-[10px] uppercase tracking-widest font-bold mb-6">
            Nuovo Indirizzo
          </h3>
          <AddressForm action="CREATE" buttonText="Aggiungi" />
        </div>

        {/* Lista Indirizzi */}
        {addresses.map((address) => (
          <div
            key={address.id}
            className="border border-brand-dark/10 p-8 relative bg-white/30"
          >
            {address.id === defaultAddressId && (
              <span className="absolute top-4 right-4 text-[9px] uppercase tracking-widest font-bold bg-brand-dark text-brand-light px-2 py-1">
                Predefinito
              </span>
            )}

            <div className="space-y-1 mb-8 text-sm">
              <p className="font-bold uppercase">
                {address.firstName} {address.lastName}
              </p>
              <p className="text-brand-dark/70">{address.address1}</p>
              <p className="text-brand-dark/70">
                {address.zip}, {address.city} ({address.countryCode})
              </p>
            </div>

            <div className="space-y-6 pt-6 border-t border-brand-dark/5">
              <AddressForm
                action="UPDATE"
                address={address}
                buttonText="Aggiorna"
              />

              <div className="flex gap-4">
                {address.id !== defaultAddressId && (
                  <Form method="POST" className="inline">
                    <input type="hidden" name="_action" value="DEFAULT" />
                    <input type="hidden" name="addressId" value={address.id} />
                    <button
                      type="submit"
                      className="text-[10px] uppercase tracking-widest font-bold hover:underline"
                    >
                      Imposta predefinito
                    </button>
                  </Form>
                )}

                <Form method="POST" className="inline">
                  <input type="hidden" name="_action" value="DELETE" />
                  <input type="hidden" name="addressId" value={address.id} />
                  <button
                    type="submit"
                    className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:underline"
                  >
                    Elimina
                  </button>
                </Form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressForm({action, address, buttonText}) {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== 'idle';

  return (
    <Form method="POST" className="space-y-4">
      <input type="hidden" name="_action" value={action} />
      {address?.id && (
        <input type="hidden" name="addressId" value={address.id} />
      )}

      <div className="grid grid-cols-2 gap-4">
        <AddressInput
          name="firstName"
          label="Nome"
          defaultValue={address?.firstName}
        />
        <AddressInput
          name="lastName"
          label="Cognome"
          defaultValue={address?.lastName}
        />
      </div>
      <AddressInput
        name="address1"
        label="Via"
        defaultValue={address?.address1}
      />
      <div className="grid grid-cols-2 gap-4">
        <AddressInput name="city" label="Città" defaultValue={address?.city} />
        <AddressInput name="zip" label="CAP" defaultValue={address?.zip} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand-dark text-brand-light py-2 uppercase text-[9px] tracking-widest font-bold hover:bg-brand-accent transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Salvataggio...' : buttonText}
      </button>

      {actionData?.error && (
        <p className="text-[9px] text-red-500 uppercase font-bold">
          {actionData.error}
        </p>
      )}
    </Form>
  );
}

function AddressInput({name, label, defaultValue}) {
  return (
    <div className="flex flex-col">
      <label className="text-[8px] uppercase tracking-widest font-bold text-brand-dark/40">
        {label}
      </label>
      <input
        name={name}
        type="text"
        defaultValue={defaultValue || ''}
        required
        className="bg-transparent border-b border-brand-dark/10 py-1 text-xs focus:outline-none focus:border-brand-dark transition-colors"
      />
    </div>
  );
}

// --- MUTATIONS GRAPHQL (Definite qui per evitare errori di export) ---

const CUSTOMER_ADDRESS_CREATE_MUTATION = `#graphql
  mutation customerAddressCreate($address: CustomerAddressInput!) {
    customerAddressCreate(address: $address) {
      customerAddress { id }
      userErrors { field message }
    }
  }
`;

const CUSTOMER_ADDRESS_UPDATE_MUTATION = `#graphql
  mutation customerAddressUpdate($addressId: ID!, $address: CustomerAddressInput!) {
    customerAddressUpdate(addressId: $addressId, address: $address) {
      customerAddress { id }
      userErrors { field message }
    }
  }
`;

const CUSTOMER_ADDRESS_DELETE_MUTATION = `#graphql
  mutation customerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors { field message }
    }
  }
`;

const CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION = `#graphql
  mutation customerDefaultAddressUpdate($addressId: ID!) {
    customerDefaultAddressUpdate(addressId: $addressId) {
      customer { id }
      userErrors { field message }
    }
  }
`;
