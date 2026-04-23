import {
  data as remixData,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {X} from 'lucide-react';
import {
  CREATE_ADDRESS_MUTATION,
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

export const meta = () => {
  return [{title: 'Indirizzi'}];
};

// ─────────────────────────────────────────────────────────────
// Configurazione campi — unica fonte di verità per entrambi i form.
// Aggiungere, rimuovere o rinominare un campo richiede di toccare
// solo questo array.
// ─────────────────────────────────────────────────────────────
// ADDRESS_FIELDS — aggiorna required sui campi praticamente necessari
const ADDRESS_FIELDS = [
  {
    name: 'firstName',
    label: 'Nome',
    autoComplete: 'shipping given-name',
    colSpan: 1,
    required: true, // ← obbligatorio
  },
  {
    name: 'lastName',
    label: 'Cognome',
    autoComplete: 'shipping family-name',
    colSpan: 1,
    required: true, // ← obbligatorio
  },
  {
    name: 'company',
    label: 'Azienda',
    autoComplete: 'shipping organization',
    colSpan: 2,
    // facoltativo
  },
  {
    name: 'address1',
    label: 'Indirizzo',
    autoComplete: 'shipping address-line1',
    colSpan: 2,
    required: true, // ← obbligatorio
  },
  {
    name: 'address2',
    label: 'Indirizzo 2',
    autoComplete: 'shipping address-line2',
    colSpan: 2,
    // facoltativo
  },
  {
    name: 'city',
    label: 'Città',
    autoComplete: 'shipping address-level2',
    colSpan: 1,
    required: true, // ← obbligatorio
  },
  {
    name: 'zip',
    label: 'CAP',
    autoComplete: 'shipping postal-code',
    colSpan: 1,
    required: true, // ← obbligatorio
  },
  {
    name: 'zoneCode',
    label: 'Provincia / Regione',
    autoComplete: 'shipping address-level1',
    colSpan: 1,
    // facoltativo per Italia, obbligatorio per altri paesi lato Shopify
  },
  {
    name: 'territoryCode',
    label: 'Paese',
    autoComplete: 'shipping country',
    colSpan: 1,
    defaultValue: 'IT',
    inputClassName: 'uppercase',
    required: true, // ← obbligatorio
  },
  {
    name: 'phoneNumber',
    label: 'Telefono',
    autoComplete: 'shipping tel',
    type: 'tel',
    placeholder: '+393331234567',
    colSpan: 2,
    // facoltativo
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers — invariati rispetto alla versione precedente
// ─────────────────────────────────────────────────────────────
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
  const input = {
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

  // Validazione server-side — difesa in caso il client bypassi il required HTML
  const requiredFields = {
    firstName: 'Nome',
    lastName: 'Cognome',
    address1: 'Indirizzo',
    city: 'Città',
    zip: 'CAP',
    territoryCode: 'Paese',
  };

  for (const [field, label] of Object.entries(requiredFields)) {
    if (!input[field]) {
      throw new Error(`Il campo "${label}" è obbligatorio.`);
    }
  }

  return input;
}

// ─────────────────────────────────────────────────────────────
// Action
// ─────────────────────────────────────────────────────────────
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
        result = await customerAccount.mutate(CREATE_ADDRESS_MUTATION, {
          variables: {
            address: getAddressInput(formData),
            defaultAddress,
            language: customerAccount.i18n.language,
          },
        });
        break;
      }
      case 'UPDATE': {
        if (!addressId || typeof addressId !== 'string')
          throw new Error('ID indirizzo mancante');
        result = await customerAccount.mutate(UPDATE_ADDRESS_MUTATION, {
          variables: {
            addressId,
            address: getAddressInput(formData),
            defaultAddress,
            language: customerAccount.i18n.language,
          },
        });
        break;
      }
      case 'DELETE': {
        if (!addressId || typeof addressId !== 'string')
          throw new Error('ID indirizzo mancante');
        result = await customerAccount.mutate(DELETE_ADDRESS_MUTATION, {
          variables: {addressId, language: customerAccount.i18n.language},
        });
        break;
      }
      default:
        throw new Error('Azione non valida');
    }

    if (result.errors?.length) throw new Error(result.errors[0].message);

    const mutationPayload =
      result.data?.customerAddressCreate ||
      result.data?.customerAddressUpdate ||
      result.data?.customerAddressDelete;

    if (mutationPayload?.userErrors?.length)
      throw new Error(mutationPayload.userErrors[0].message);

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

// ─────────────────────────────────────────────────────────────
// Componente riutilizzabile AddressForm
// Usato sia per la creazione che per la modifica.
// `address` è null → form di creazione
// `address` è un oggetto → form di modifica con defaultValues
// ─────────────────────────────────────────────────────────────
function AddressForm({
  address = null,
  defaultAddressId,
  isSubmitting,
  onCancel,
}) {
  const isEdit = Boolean(address);

  return (
    <Form method="post" className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="hidden"
        name="_action"
        value={isEdit ? 'UPDATE' : 'CREATE'}
      />
      {isEdit && <input type="hidden" name="addressId" value={address.id} />}

      {ADDRESS_FIELDS.map((field) => (
        <div
          key={field.name}
          className={field.colSpan === 2 ? 'md:col-span-2' : ''}
        >
          <label className="block text-xs uppercase tracking-widest mb-2">
            {field.label}
            {/* Input vuoto richiesto da jsx-a11y label-has-associated-control */}
            <input
              type="text"
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            />
          </label>
          <input
            name={field.name}
            type={field.type || 'text'}
            required={field.required}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete}
            defaultValue={
              isEdit
                ? (address[field.name] ?? field.defaultValue ?? '')
                : (field.defaultValue ?? '')
            }
            className={`w-full border p-3 bg-transparent focus:outline-none focus:border-brand-dark transition-colors ${field.inputClassName || ''}`}
          />
        </div>
      ))}

      <label className="md:col-span-2 flex items-center gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          name="defaultAddress"
          value="true"
          defaultChecked={isEdit ? address.id === defaultAddressId : false}
        />
        Imposta come indirizzo predefinito
      </label>

      <div className="md:col-span-2 flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="border border-brand-dark px-6 py-3 uppercase text-xs tracking-widest hover:bg-brand-dark hover:text-brand-light transition-colors disabled:opacity-50"
        >
          {isSubmitting
            ? 'Salvataggio...'
            : isEdit
              ? 'Aggiorna indirizzo'
              : 'Salva indirizzo'}
        </button>

        {isEdit && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs uppercase tracking-widest text-brand-dark/50 hover:text-brand-dark transition-colors"
          >
            Annulla
          </button>
        )}
      </div>
    </Form>
  );
}

// ─────────────────────────────────────────────────────────────
// Drawer di modifica — slide-in da destra con AnimatePresence
// ─────────────────────────────────────────────────────────────
function EditDrawer({address, defaultAddressId, isSubmitting, onClose}) {
  return (
    <AnimatePresence>
      {address && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={onClose}
            className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-[60]"
          />

          {/* Pannello */}
          <motion.div
            key="drawer"
            initial={{x: '100%'}}
            animate={{x: 0}}
            exit={{x: '100%'}}
            transition={{type: 'spring', damping: 28, stiffness: 220}}
            className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-brand-light shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-brand-gray/30">
              <span className="font-sans text-xs uppercase tracking-[0.4em] font-bold">
                Modifica indirizzo
              </span>
              <button
                onClick={onClose}
                className="text-brand-dark/50 hover:text-brand-dark transition-colors p-1"
                aria-label="Chiudi"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenuto scrollabile */}
            <div className="flex-1 overflow-y-auto p-8">
              <AddressForm
                address={address}
                defaultAddressId={defaultAddressId}
                isSubmitting={isSubmitting}
                onCancel={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────
// Pagina principale
// ─────────────────────────────────────────────────────────────
export default function Addresses() {
  const {customer} = useOutletContext();
  const actionData = useActionData();
  const navigation = useNavigation();

  const addresses = customer?.addresses?.nodes || [];
  const defaultAddressId = customer?.defaultAddress?.id;
  const isSubmitting = navigation.state !== 'idle';

  // Indirizzo attualmente in modifica (null = nessun drawer aperto)
  const [editingAddress, setEditingAddress] = useState(null);

  // Chiude il drawer anche dopo una submit andata a buon fine
  const handleClose = () => setEditingAddress(null);

  return (
    <div className="space-y-10">
      {/* Titolo */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl uppercase tracking-tight">
          Indirizzi
        </h1>
        <p className="font-sans text-sm uppercase tracking-widest text-brand-dark/40">
          Gestisci i tuoi indirizzi di spedizione e fatturazione.
        </p>
      </div>

      {/* Errore globale */}
      {actionData?.error && (
        <div className="border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionData.error}
        </div>
      )}

      {/* Form nuovo indirizzo */}
      <section className="border border-brand-dark/20 p-6 md:p-8 space-y-6">
        <h2 className="font-sans text-sm uppercase tracking-widest font-bold">
          Nuovo indirizzo
        </h2>
        <AddressForm
          defaultAddressId={defaultAddressId}
          isSubmitting={isSubmitting}
        />
      </section>

      {/* Lista indirizzi salvati */}
      <section className="space-y-6">
        <h2 className="font-sans text-sm uppercase tracking-widest font-bold">
          Indirizzi salvati
        </h2>

        {!addresses.length ? (
          <p className="text-sm text-brand-dark/40">
            Nessun indirizzo salvato.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {addresses.map((address) => (
              <article
                key={address.id}
                className="border border-brand-dark/10 p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-brand-dark/30 transition-colors"
              >
                {/* Dati indirizzo */}
                <div className="space-y-1 text-sm flex-1">
                  <p className="font-sans text-xs uppercase tracking-widest font-bold mb-2">
                    {address.firstName} {address.lastName}
                    {address.id === defaultAddressId && (
                      <span className="ml-3 text-brand-accent">
                        · Predefinito
                      </span>
                    )}
                  </p>
                  {address.company && <p>{address.company}</p>}
                  {address.address1 && <p>{address.address1}</p>}
                  {address.address2 && <p>{address.address2}</p>}
                  <p>
                    {address.zip} {address.city}
                    {address.zoneCode ? `, ${address.zoneCode}` : ''}
                  </p>
                  <p>{address.territoryCode}</p>
                  {address.phoneNumber && <p>{address.phoneNumber}</p>}
                </div>

                {/* Azioni */}
                <div className="flex items-center gap-6 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingAddress(address)}
                    className="text-xs uppercase tracking-widest hover:text-brand-accent transition-colors"
                  >
                    Modifica
                  </button>

                  <Form method="post">
                    <input type="hidden" name="_action" value="DELETE" />
                    <input type="hidden" name="addressId" value={address.id} />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-xs uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
                    >
                      Elimina
                    </button>
                  </Form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Drawer di modifica — montato fuori dal flusso, animato */}
      <EditDrawer
        address={editingAddress}
        defaultAddressId={defaultAddressId}
        isSubmitting={isSubmitting}
        onClose={handleClose}
      />
    </div>
  );
}
