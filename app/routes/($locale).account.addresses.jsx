import {
  data as remixData,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';

import {
  CREATE_ADDRESS_MUTATION,
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

export const meta = () => {
  return [{title: 'Indirizzi'}];
};

function clean(value) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function normalizePhoneNumber(value) {
  const phone = clean(value);
  if (!phone) return undefined;

  if (phone.startsWith('+')) return phone;

  const digits = phone.replace(/\s+/g, '');
  if (/^\d+$/.test(digits)) {
    if (digits.startsWith('39')) return `+${digits}`;
    return `+39${digits}`;
  }

  return phone;
}

function getAddressInput(formData) {
  return {
    firstName: clean(formData.get('firstName')),
    lastName: clean(formData.get('lastName')),
    company: clean(formData.get('company')),
    address1: clean(formData.get('address1')),
    address2: clean(formData.get('address2')),
    city: clean(formData.get('city')),
    zip: clean(formData.get('zip')),
    territoryCode: clean(formData.get('territoryCode'))?.toUpperCase() || 'IT',
    zoneCode: clean(formData.get('zoneCode')),
    phoneNumber: normalizePhoneNumber(formData.get('phoneNumber')),
  };
}

export async function action({request, context}) {
  const {customerAccount} = context;
  const formData = await request.formData();

  const actionType = formData.get('_action');
  const addressId = formData.get('addressId');
  const defaultAddress = formData.get('defaultAddress') === 'true';

  try {
    let result;

    switch (actionType) {
      case 'CREATE': {
        const address = getAddressInput(formData);

        result = await customerAccount.mutate(CREATE_ADDRESS_MUTATION, {
          variables: {
            address,
            defaultAddress,
            language: customerAccount.i18n.language,
          },
        });
        break;
      }

      case 'UPDATE': {
        if (!addressId || typeof addressId !== 'string') {
          throw new Error('ID indirizzo mancante');
        }

        const address = getAddressInput(formData);

        result = await customerAccount.mutate(UPDATE_ADDRESS_MUTATION, {
          variables: {
            addressId,
            address,
            defaultAddress,
            language: customerAccount.i18n.language,
          },
        });
        break;
      }

      case 'DELETE': {
        if (!addressId || typeof addressId !== 'string') {
          throw new Error('ID indirizzo mancante');
        }

        result = await customerAccount.mutate(DELETE_ADDRESS_MUTATION, {
          variables: {
            addressId,
            language: customerAccount.i18n.language,
          },
        });
        break;
      }

      default:
        throw new Error('Azione non valida');
    }

    if (result.errors?.length) {
      throw new Error(result.errors[0].message);
    }

    const mutationPayload =
      result.data?.customerAddressCreate ||
      result.data?.customerAddressUpdate ||
      result.data?.customerAddressDelete;

    if (mutationPayload?.userErrors?.length) {
      throw new Error(mutationPayload.userErrors[0].message);
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
  const isSubmitting = navigation.state !== 'idle';

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl uppercase tracking-tight">
          Indirizzi
        </h1>
        <p className="font-sans text-sm uppercase tracking-widest text-brand-dark40">
          Gestisci i tuoi indirizzi di spedizione e fatturazione.
        </p>
      </div>

      {actionData?.error ? (
        <div className="border border-red-500 px-4 py-3 text-sm">
          {actionData.error}
        </div>
      ) : null}

      <section className="border border-brand-dark20 p-6 md:p-8 space-y-6">
        <h2 className="font-sans text-sm uppercase tracking-widest font-bold">
          Nuovo indirizzo
        </h2>

        <Form method="post" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="hidden" name="_action" value="CREATE" />

          <div>
            <label className="block text-xs uppercase tracking-widest mb-2">
              Nome
              <input type="text" />
            </label>
            <input name="firstName" type="text" className="w-full border p-3" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-2">
              Cognome
              <input type="text" />
            </label>
            <input name="lastName" type="text" className="w-full border p-3" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest mb-2">
              <input type="text" />
              Azienda
            </label>
            <input name="company" type="text" className="w-full border p-3" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest mb-2">
              Indirizzo
              <input type="text" />
            </label>
            <input
              name="address1"
              type="text"
              required
              className="w-full border p-3"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest mb-2">
              Indirizzo 2
              <input type="text" />
            </label>
            <input name="address2" type="text" className="w-full border p-3" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-2">
              Città
              <input type="text" />
            </label>
            <input
              name="city"
              type="text"
              required
              className="w-full border p-3"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-2">
              CAP
              <input type="text" />
            </label>
            <input
              name="zip"
              type="text"
              required
              className="w-full border p-3"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-2">
              Provincia / Regione
              <input type="text" />
            </label>
            <input name="zoneCode" type="text" className="w-full border p-3" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-2">
              Paese
              <input type="text" />
            </label>
            <input
              name="territoryCode"
              type="text"
              defaultValue="IT"
              className="w-full border p-3 uppercase"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest mb-2">
              Telefono
              <input type="text" />
            </label>
            <input
              name="phoneNumber"
              type="tel"
              placeholder="+393331234567"
              className="w-full border p-3"
            />
          </div>

          <label className="md:col-span-2 flex items-center gap-3 text-sm">
            <input type="checkbox" name="defaultAddress" value="true" />
            Imposta come indirizzo predefinito
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="border px-6 py-3 uppercase text-xs tracking-widest"
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva indirizzo'}
            </button>
          </div>
        </Form>
      </section>

      <section className="space-y-6">
        <h2 className="font-sans text-sm uppercase tracking-widest font-bold">
          Indirizzi salvati
        </h2>

        {!addresses.length ? (
          <p className="text-sm text-brand-dark40">Nessun indirizzo salvato.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {addresses.map((address) => (
              <article
                key={address.id}
                className="border border-brand-dark20 p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-sans text-sm uppercase tracking-widest font-bold">
                      {address.firstName} {address.lastName}
                    </p>
                    {address.id === defaultAddressId ? (
                      <p className="text-xs uppercase tracking-widest text-brand-accent mt-2">
                        Predefinito
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  {address.company ? <p>{address.company}</p> : null}
                  {address.address1 ? <p>{address.address1}</p> : null}
                  {address.address2 ? <p>{address.address2}</p> : null}
                  <p>
                    {address.zip} {address.city}
                    {address.zoneCode ? `, ${address.zoneCode}` : ''}
                  </p>
                  <p>{address.territoryCode}</p>
                  {address.phoneNumber ? <p>{address.phoneNumber}</p> : null}
                </div>

                <details className="pt-2">
                  <summary className="cursor-pointer text-xs uppercase tracking-widest">
                    Modifica indirizzo
                  </summary>

                  <Form
                    method="post"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                  >
                    <input type="hidden" name="_action" value="UPDATE" />
                    <input type="hidden" name="addressId" value={address.id} />

                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-2">
                        Nome
                        <input type="text" />
                      </label>
                      <input
                        name="firstName"
                        type="text"
                        defaultValue={address.firstName ?? ''}
                        className="w-full border p-3"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-2">
                        Cognome
                        <input type="text" />
                      </label>
                      <input
                        name="lastName"
                        type="text"
                        defaultValue={address.lastName ?? ''}
                        className="w-full border p-3"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase tracking-widest mb-2">
                        Azienda
                        <input type="text" />
                      </label>
                      <input
                        name="company"
                        type="text"
                        defaultValue={address.company ?? ''}
                        className="w-full border p-3"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase tracking-widest mb-2">
                        Indirizzo
                        <input type="text" />
                      </label>
                      <input
                        name="address1"
                        type="text"
                        defaultValue={address.address1 ?? ''}
                        className="w-full border p-3"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase tracking-widest mb-2">
                        Indirizzo 2
                        <input type="text" />
                      </label>
                      <input
                        name="address2"
                        type="text"
                        defaultValue={address.address2 ?? ''}
                        className="w-full border p-3"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-2">
                        Città
                        <input type="text" />
                      </label>
                      <input
                        name="city"
                        type="text"
                        defaultValue={address.city ?? ''}
                        className="w-full border p-3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-2">
                        CAP
                        <input type="text" />
                      </label>
                      <input
                        name="zip"
                        type="text"
                        defaultValue={address.zip ?? ''}
                        className="w-full border p-3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-2">
                        Provincia / Regione
                        <input type="text" />
                      </label>
                      <input
                        name="zoneCode"
                        type="text"
                        defaultValue={address.zoneCode ?? ''}
                        className="w-full border p-3"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest mb-2">
                        Paese
                        <input type="text" />
                      </label>
                      <input
                        name="territoryCode"
                        type="text"
                        defaultValue={address.territoryCode ?? 'IT'}
                        className="w-full border p-3 uppercase"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase tracking-widest mb-2">
                        Telefono
                        <input type="text" />
                      </label>
                      <input
                        name="phoneNumber"
                        type="tel"
                        defaultValue={address.phoneNumber ?? ''}
                        className="w-full border p-3"
                      />
                    </div>

                    <label className="md:col-span-2 flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        name="defaultAddress"
                        value="true"
                        defaultChecked={address.id === defaultAddressId}
                      />
                      Imposta come indirizzo predefinito
                    </label>

                    <div className="md:col-span-2 flex gap-3">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="border px-6 py-3 uppercase text-xs tracking-widest"
                      >
                        Aggiorna
                      </button>
                    </div>
                  </Form>
                </details>

                <Form method="post">
                  <input type="hidden" name="_action" value="DELETE" />
                  <input type="hidden" name="addressId" value={address.id} />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-xs uppercase tracking-widest text-red-600"
                  >
                    Elimina indirizzo
                  </button>
                </Form>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
