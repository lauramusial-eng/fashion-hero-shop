import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { products, getProduct } from "@/data/products";
import { getSimilarProducts } from "@/lib/semantic-search";
import { ImageGallery } from "@/components/image-gallery";
import { ProductInfo } from "@/components/product-info";
import { ProductDetailsAccordion } from "@/components/product-details-accordion";
import { RelatedProducts } from "@/components/related-products";
import { RecentlyViewedSection } from "./recently-viewed-section";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    return { title: "Product Not Found — FashionHero" };
  }

  return {
    title: `${product.name} — FashionHero`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  const related = getSimilarProducts(product, products, 8);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Two-column layout: image 60% left, info 40% right */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8 md:gap-12">
        <ImageGallery
          images={product.images}
          productName={product.name}
          colorName={product.colors[0]?.name}
          colorHex={product.colors[0]?.hex}
        />
        <ProductInfo product={product} />
      </div>

      {/* Accordion details */}
      <div className="mt-12 max-w-2xl">
        <ProductDetailsAccordion product={product} />
      </div>

      {/* Related products */}
      <RelatedProducts products={related} />

      {/* Recently viewed */}
      <RecentlyViewedSection productId={product.id} />
    </main>
  );
}
