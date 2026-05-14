import ProductPage from "@/components/ProductPage";

export default function Page({ params }: { params: { id: string } }) {
  return <ProductPage productId={params.id} />;
}
