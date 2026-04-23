import {useLocation, useRouteLoaderData} from 'react-router';

// Aggiungiamo la prop className per gestirlo meglio nell'header
export function CountrySelector({className = '', showFullLabel = true}) {
  const location = useLocation();
  const rootData = useRouteLoaderData('root');

  if (!rootData?.localization?.availableCountries || !rootData?.locale)
    return null;

  const {availableCountries} = rootData.localization;
  const currentLocale = rootData.locale;

  const handleCountryChange = (event) => {
    const selectedCountryIso = event.target.value;
    const newLocalePrefix = `${currentLocale.language.toLowerCase()}-${selectedCountryIso.toLowerCase()}`;
    const pathParts = location.pathname.split('/');
    if (/^[a-zA-Z]{2}-[a-zA-Z]{2}$/.test(pathParts[1])) {
      pathParts.splice(1, 1);
    }
    const cleanPath = pathParts.join('/');
    window.location.href = `/${newLocalePrefix}${cleanPath}${location.search}`;
  };

  return (
    <div className={className}>
      <select
        className="w-full bg-transparent border-b border-current py-1 font-sans text-[10px] md:text-xs uppercase tracking-widest cursor-pointer focus:outline-none"
        defaultValue={currentLocale.country}
        onChange={handleCountryChange}
      >
        {availableCountries.map((country) => (
          <option
            key={country.isoCode}
            value={country.isoCode}
            className="text-brand-dark bg-brand-light"
          >
            {/* Se showFullLabel è true mostriamo il nome, altrimenti solo la valuta */}
            {showFullLabel
              ? `${country.name} (${country.currency.isoCode})`
              : country.currency.isoCode}
          </option>
        ))}
      </select>
    </div>
  );
}
