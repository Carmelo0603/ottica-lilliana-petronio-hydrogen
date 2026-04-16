import {motion} from 'framer-motion';
import {ArrowUpRight} from 'lucide-react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen'; // Strumenti magici di Shopify

export const CatalogPreview = ({products}) => {
  // Se Shopify non ci manda prodotti (magari la collezione è vuota), non rompiamo tutto
  if (!products || !products.nodes) return null;

  return (
    <section className="py-24 bg-brand-light">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-4 max-w-2xl">
            <span className="font-sans text-brand-accent uppercase tracking-[0.3em] text-xs font-bold">
              Selezione Curata
            </span>
            <h2 className="text-4xl md:text-6xl font-serif text-brand-dark uppercase tracking-tight leading-[1.1]">
              Modelli{' '}
              <span className="italic text-brand-dark/50 font-light">
                Iconici
              </span>
            </h2>
          </div>
          <Link
            to="/collections/all"
            className="group flex items-center gap-3 text-brand-dark hover:text-brand-accent transition-colors duration-300 font-sans uppercase text-xs tracking-[0.2em] font-medium border-b border-brand-gray pb-2"
          >
            Esplora Archivio
            <ArrowUpRight
              size={16}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {products.nodes.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({product, index}) => {
  // Prendiamo la prima variante e l'immagine principale
  const variant = product.variants.nodes[0];

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true}}
      transition={{duration: 0.6, delay: index * 0.1}}
      className="group"
    >
      <Link to={`/products/${product.handle}`} className="block space-y-6">
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-gray/30 clip-diagonal transition-all duration-500 group-hover:shadow-2xl">
          {product.featuredImage && (
            <Image
              data={product.featuredImage}
              aspectRatio="4/5"
              sizes="(min-width: 45em) 33vw, 100vw"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/5 transition-colors duration-500" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-serif text-xl md:text-2xl text-brand-dark uppercase tracking-tight group-hover:text-brand-accent transition-colors duration-300">
              {product.title}
            </h3>
            <span className="font-sans text-sm font-medium text-brand-dark">
              {/* Money gestisce automaticamente valuta e formattazione */}
              <Money data={variant.price} />
            </span>
          </div>
          <p className="text-brand-dark/40 font-sans text-[10px] uppercase tracking-[0.2em]">
            {product.vendor}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};
