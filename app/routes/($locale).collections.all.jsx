import {useLoaderData, Link, data as json} from 'react-router';
import {useState, useMemo} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Image, Money} from '@shopify/hydrogen';

// ==========================================
// 1. IL CERVELLO (Server-Side)
// Qui peschiamo i prodotti VERI dal backoffice
// ==========================================
export async function loader({context}) {
  const {storefront} = context;

  // Chiamata GraphQL a Shopify per prendere i primi 100 prodotti del catalogo
  const {products} = await storefront.query(ALL_PRODUCTS_QUERY, {
    variables: {first: 100},
  });

  if (!products) {
    throw new Response('Nessun prodotto trovato', {status: 404});
  }

  return json({products: products.nodes});
}

// ==========================================
// 2. L'INTERFACCIA (Client-Side)
// Il tuo design, alimentato da dati veri
// ==========================================
export default function Archive() {
  // Ecco i prodotti veri estratti da Shopify!
  const {products} = useLoaderData();

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeShape, setActiveShape] = useState('all');
  const [activeColor, setActiveColor] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filtro adattato ai dati reali di Shopify (Usa i Tags e il ProductType)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Le categorie le mappiamo sul productType di Shopify o sui Tags
      const matchCategory =
        activeCategory === 'all' ||
        product.productType?.toLowerCase() === activeCategory.toLowerCase() ||
        product.tags.includes(activeCategory);

      // Forme e colori li cerchiamo all'interno dei Tags di Shopify
      const matchShape =
        activeShape === 'all' || product.tags.includes(activeShape);
      const matchColor =
        activeColor === 'all' || product.tags.includes(activeColor);

      return matchCategory && matchShape && matchColor;
    });
  }, [activeCategory, activeShape, activeColor, products]);

  const categories = [
    {id: 'all', label: 'Tutto il Catalogo'},
    {id: 'sunglasses', label: 'Occhiali da Sole'}, // Usa questo come Tag o ProductType su Shopify
    {id: 'optical', label: 'Occhiali da Vista'},
  ];

  const shapes = [
    {id: 'all', label: 'Qualsiasi'},
    {id: 'geometric', label: 'Geometrico'}, // Aggiungi tag "geometric" su Shopify
    {id: 'round', label: 'Tondo'},
    {id: 'square', label: 'Squadrato'},
  ];

  const colors = [
    {id: 'all', label: 'Qualsiasi'},
    {id: 'black', label: 'Nero'}, // Aggiungi tag "black" su Shopify
    {id: 'tortoise', label: 'Tartarugato'},
    {id: 'silver', label: 'Argento'},
  ];

  return (
    <section className="w-full min-h-screen bg-brand-light pb-24">
      {/* Header Area */}
      <div className="pt-24 pb-12 px-6 md:px-12 border-b border-brand-gray bg-brand-light">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.8}}
          >
            <span className="font-sans text-brand-accent uppercase tracking-[0.3em] text-xs font-bold">
              L&apos;Archivio
            </span>
            <h1 className="text-4xl md:text-7xl font-serif text-brand-dark uppercase tracking-tight mt-4">
              Esplora la{' '}
              <span className="italic font-light text-brand-dark/50">
                Collezione
              </span>
            </h1>
          </motion.div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 font-sans uppercase text-xs tracking-widest font-bold text-brand-dark border border-brand-dark px-6 py-3"
          >
            {showFilters ? <XIcon size={16} /> : <FilterIcon size={16} />}
            Filtra
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-12 flex flex-col md:flex-row gap-12 items-start">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {(showFilters ||
            (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
            <motion.aside
              initial={{opacity: 0, height: 0}}
              animate={{opacity: 1, height: 'auto'}}
              exit={{opacity: 0, height: 0}}
              className="w-full md:w-64 shrink-0 flex flex-col gap-12 md:sticky md:top-32 overflow-hidden"
            >
              <div className="space-y-4">
                <h3 className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-brand-dark border-b border-brand-gray pb-2">
                  Categoria
                </h3>
                <ul className="space-y-3">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setActiveCategory(cat.id)}
                        className={`font-sans text-sm uppercase tracking-widest text-left transition-colors duration-300 ${activeCategory === cat.id ? 'text-brand-accent font-bold' : 'text-brand-dark/60 hover:text-brand-dark'}`}
                      >
                        {cat.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-brand-dark border-b border-brand-gray pb-2">
                  Forma
                </h3>
                <ul className="space-y-3">
                  {shapes.map((shape) => (
                    <li key={shape.id}>
                      <button
                        onClick={() => setActiveShape(shape.id)}
                        className={`font-sans text-sm uppercase tracking-widest text-left transition-colors duration-300 ${activeShape === shape.id ? 'text-brand-accent font-bold' : 'text-brand-dark/60 hover:text-brand-dark'}`}
                      >
                        {shape.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-brand-dark border-b border-brand-gray pb-2">
                  Colore
                </h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setActiveColor(color.id)}
                      className={`font-sans text-[10px] uppercase tracking-widest px-3 py-1 border transition-colors duration-300 ${activeColor === color.id ? 'border-brand-accent bg-brand-accent/10 text-brand-dark' : 'border-brand-gray text-brand-dark/60 hover:border-brand-dark'}`}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          {filteredProducts.length === 0 ? (
            <div className="w-full py-24 flex flex-col items-center justify-center text-center space-y-4">
              <p className="font-serif text-2xl text-brand-dark italic">
                Nessun prodotto corrisponde ai tuoi criteri.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setActiveShape('all');
                  setActiveColor('all');
                }}
                className="font-sans text-xs uppercase tracking-widest text-brand-accent hover:text-brand-dark transition-colors"
              >
                Resetta Filtri
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.5, delay: index * 0.1}}
                  className="group flex flex-col gap-4"
                >
                  <Link
                    to={`/products/${product.handle}`}
                    className="relative overflow-hidden bg-brand-gray aspect-[4/5] block"
                  >
                    {product.featuredImage ? (
                      <Image
                        data={product.featuredImage}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1]"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-brand-gray/50 flex items-center justify-center font-serif italic text-brand-dark/30">
                        Nessuna Immagine
                      </div>
                    )}
                    <div className="absolute inset-0 bg-brand-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 bg-brand-dark text-brand-light px-6 py-3 font-sans uppercase text-[10px] font-bold tracking-widest hover:bg-brand-accent">
                        Scopri di più
                      </div>
                    </div>
                  </Link>

                  <div className="flex flex-col gap-1 font-sans uppercase">
                    <div className="flex justify-between items-start text-sm gap-4">
                      <Link
                        to={`/products/${product.handle}`}
                        className="text-brand-dark font-medium tracking-widest hover:text-brand-accent transition-colors truncate"
                      >
                        {product.title}
                      </Link>
                      <span className="text-brand-accent tracking-wider font-bold whitespace-nowrap">
                        <Money data={product.priceRange.minVariantPrice} />
                      </span>
                    </div>
                    {/* Mostra il tipo di prodotto. Se non c'è, mostra i tags */}
                    <span className="text-brand-dark/50 text-[10px] tracking-widest truncate">
                      {product.productType ||
                        product.tags.slice(0, 2).join(' // ')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// Icone Native per evitare crolli di Lucide
// ==========================================
const FilterIcon = ({size}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const XIcon = ({size}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ==========================================
// 3. LA QUERY GRAPHQL
// Quello che chiediamo al database di Shopify
// ==========================================
const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id
        title
        handle
        productType
        tags
        featuredImage {
          id
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;
