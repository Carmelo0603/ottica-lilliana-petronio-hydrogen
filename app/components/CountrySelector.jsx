import {useLocation, useRouteLoaderData} from 'react-router';

export function CountrySelector() {
  const location = useLocation();
  // Peschiamo i dati direttamente dalla root! Niente props.
  const rootData = useRouteLoaderData('root');

  if (!rootData?.localization?.availableCountries || !rootData?.locale)
    return null;

  const {availableCountries} = rootData.localization;
  const currentLocale = rootData.locale;

  // Se c'è un solo paese, inutile mostrare la tendina
  if (availableCountries.length < 2) return null;

  const handleCountryChange = (event) => {
    const selectedCountryIso = event.target.value;

    // Il nuovo prefisso (es: en-us)
    const newLocalePrefix = `${currentLocale.language.toLowerCase()}-${selectedCountryIso.toLowerCase()}`;

    // Dividiamo il percorso attuale in pezzi
    // Esempio: "/en-it/collections/all" -> ["", "en-it", "collections", "all"]
    const pathParts = location.pathname.split('/');

    // Se il secondo elemento (indice 1) è un locale (formato xx-xx), lo rimuoviamo.
    // Usiamo una Regex per essere sicuri di non cancellare pezzi di URL reali
    if (/^[a-zA-Z]{2}-[a-zA-Z]{2}$/.test(pathParts[1])) {
      pathParts.splice(1, 1);
    }

    // Ricostruiamo il path pulito (es: /collections/all)
    const cleanPath = pathParts.join('/');

    // Generiamo l'URL finale
    const newUrl = `/${newLocalePrefix}${cleanPath}${location.search}`;

    // Refresh forzato per sincronizzare i dati del server
    window.location.href = newUrl;
  };

  return (
    <div className="space-y-4">
      <select
        className="w-full border border-brand-dark/40 text-brand-dark font-sans text-sm uppercase py-1 px-2 focus:outline-none focus:border-brand-accent transition-colors cursor-pointer"
        defaultValue={currentLocale.country}
        onChange={handleCountryChange}
      >
        {availableCountries.map((country) => (
          <option
            key={country.isoCode}
            value={country.isoCode}
            className="bg-brand-dark text-brand-light"
          >
            {country.name} ({country.currency.isoCode})
          </option>
        ))}
      </select>
    </div>
  );
}
