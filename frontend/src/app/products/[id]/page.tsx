import ProductPage from "@/components/ProductPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ProductPage productId={resolvedParams.id} />;
}
