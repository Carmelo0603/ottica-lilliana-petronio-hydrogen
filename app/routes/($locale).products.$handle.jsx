import {useLoaderData} from 'react-router';
import {useState} from 'react';
import {motion} from 'framer-motion';
import {Image, Money, CartForm} from '@shopify/hydrogen';
import {Plus} from 'lucide-react';
import {Link} from 'react-router';

// ------------------------------------------------------------------
// LOADER: Peschiamo i dati dal server di Shopify
// ------------------------------------------------------------------
export async function loader({params, context}) {
  const {handle} = params;
  const {storefront} = context;

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {
      handle,
      // Passiamo il contesto internazionale a Shopify!
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  if (!product) {
    throw new Response(null, {status: 404});
  }

  return {product};
}

// ------------------------------------------------------------------
// COMPONENTE PRINCIPALE
// ------------------------------------------------------------------
export default function Product() {
  const {product} = useLoaderData();
  const [activeImage, setActiveImage] = useState(0);

  const selectedVariant = product.variants.nodes[0];
  const images = product.images.nodes;

  return (
    <section className="min-h-screen bg-brand-light pt-14 md:pt-10 pb-24 px-12">
      {/* IL TASTO ORA È DENTRO IL CONTENITORE PRINCIPALE, SUBITO SOPRA L'IMMAGINE */}
      <div className="mt-20 z-50">
        <Link
          to="/collections/all"
          className="inline-flex items-center gap-2 font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] text-brand-dark/50 hover:text-brand-accent transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform duration-300"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span className="border-b border-transparent group-hover:border-brand-accent transition-colors pb-0.5">
            Torna al Catalogo
          </span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        {/* Gallery */}
        <div className="w-full lg:w-3/5 space-y-6">
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8}}
            className="w-full aspect-square md:aspect-[4/3] bg-brand-gray overflow-hidden"
          >
            {images[activeImage] && (
              <Image
                data={images[activeImage]}
                className="w-full h-full object-cover"
                sizes="(min-width: 45em) 50vw, 100vw"
              />
            )}
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(idx)}
                className={`w-24 h-24 flex-shrink-0 bg-brand-gray overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-brand-accent' : 'border-transparent'}`}
              >
                <Image
                  data={img}
                  className="w-full h-full object-cover"
                  sizes="100px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="w-full lg:w-2/5">
          <div className="sticky top-32">
            <motion.div
              initial={{opacity: 0, x: 20}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.8, delay: 0.2}}
            >
              <div className="flex flex-col mb-6">
                <span className="text-brand-dark/40 font-sans text-[10px] uppercase tracking-[0.3em] mb-2">
                  {product.vendor}
                </span>
                <div className="flex justify-between items-start">
                  <h1 className="text-4xl md:text-5xl font-serif text-brand-dark uppercase tracking-tight leading-none">
                    {product.title}
                  </h1>
                  <Money
                    data={selectedVariant.price}
                    className="text-2xl font-serif italic text-brand-dark"
                  />
                </div>
              </div>

              {/* Badge Dinamici basati sui TAGS di Shopify */}
              <div className="flex flex-wrap gap-3 mb-8">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-sans text-[9px] uppercase tracking-widest text-brand-dark/60 bg-brand-gray px-3 py-1 border border-brand-dark/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div
                className="font-sans text-brand-dark/80 uppercase tracking-widest leading-relaxed text-sm mb-12"
                dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
              />

              {/* Tasto Acquista (Reale Shopify) */}
              <AddToCartButton
                variantId={selectedVariant.id}
                available={selectedVariant.availableForSale}
              />

              {/* Specifiche (Prese dai Tag o dai Metafield se implementati) */}
              <div className="space-y-6 border-t border-brand-gray pt-8">
                <h3 className="font-sans text-xs uppercase tracking-widest font-bold text-brand-dark">
                  Protocollo Tecnico
                </h3>
                <ul className="space-y-3">
                  {product.tags
                    .filter((t) => t.includes(':'))
                    .map((spec, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 font-sans text-sm uppercase tracking-wider text-brand-dark/70"
                      >
                        <div className="w-1 h-1 bg-brand-accent rounded-full" />
                        {spec.replace(':', ': ')}
                      </li>
                    ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Componente Bottone Carrello
function AddToCartButton({variantId, available}) {
  return (
    <CartForm
      route="/cart"
      inputs={{lines: [{merchandiseId: variantId, quantity: 1}]}}
      action={CartForm.ACTIONS.LinesAdd}
    >
      <button
        type="submit"
        disabled={!available}
        className="w-full group bg-brand-dark text-brand-light flex items-center justify-between px-8 py-5 hover:bg-brand-accent hover:text-brand-dark disabled:bg-gray-300 disabled:text-gray-500 transition-colors duration-500 mb-12"
      >
        <span className="font-sans uppercase text-xs tracking-[0.2em] font-bold">
          {available ? 'Aggiungi al Carrello' : 'Esaurito'}
        </span>
        <Plus
          size={18}
          className="group-hover:rotate-90 transition-transform duration-500"
        />
      </button>
    </CartForm>
  );
}

// QUERY GRAPHQL
const PRODUCT_QUERY = `#graphql
  query Product(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      tags
      images(first: 5) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }
      variants(first: 1) {
        nodes {
          id
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;
