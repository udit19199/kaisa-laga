import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VariantLandingPage } from "@/components/marketing/variant-landing-page";
import { getLandingConcept, landingConcepts } from "@/components/marketing/landing-variants";

export const dynamicParams = false;

export function generateStaticParams() {
  return landingConcepts.map((variant) => ({ slug: variant.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const variant = getLandingConcept(slug);

  if (!variant) {
    return {
      title: "Kaisa Laga Landing Gallery",
    };
  }

  return {
    title: `Kaisa Laga · ${variant.name}`,
    description: variant.dek,
  };
}

export default async function LandingVariantRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const variant = getLandingConcept(slug);

  if (!variant) {
    notFound();
  }

  return <VariantLandingPage variant={variant} />;
}
