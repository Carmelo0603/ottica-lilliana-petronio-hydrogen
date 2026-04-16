import {useLoaderData, data} from 'react-router';
import {motion} from 'framer-motion';

export async function loader({context}) {
  const {storefront} = context;

  // Peschiamo la PAGINA "contacts" dal CMS di Shopify
  const {page} = await storefront.query(CONTACT_PAGE_QUERY, {
    variables: {handle: 'contacts'},
  });

  if (!page) {
    // Se non hai creato la pagina nel backoffice, il server giustamente s'incazza
    throw new Response('Pagina Contatti non configurata su Shopify', {
      status: 404,
    });
  }

  return data({page});
}

export default function Contacts() {
  const {page} = useLoaderData();

  return (
    <section className="w-full min-h-screen bg-brand-light py-32 md:py-48 px-6 md:px-12 flex flex-col items-center justify-center">
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.8}}
        className="text-center space-y-12 max-w-2xl"
      >
        <div className="space-y-6">
          <span className="font-sans text-brand-accent uppercase tracking-[0.3em] text-xs font-bold">
            {page.title}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif text-brand-dark uppercase tracking-tight">
            Visione{' '}
            <span className="italic font-light text-brand-dark/50">
              Privata
            </span>
          </h1>
        </div>

        {/* Qui iniettiamo il contenuto HTML che scriverai nel backoffice di Shopify */}
        <div
          className="space-y-10 font-sans uppercase tracking-widest text-sm text-brand-dark/70 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{__html: page.body}}
        />
      </motion.div>
    </section>
  );
}

const CONTACT_PAGE_QUERY = `#graphql
  query ContactPage($handle: String!) {
    page(handle: $handle) {
      title
      body
    }
  }
`;
