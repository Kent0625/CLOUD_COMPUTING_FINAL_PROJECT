import ProductPage from "@/components/ProductPage";

export default function Product({ params }: { params: { id: string } }) {
  return (
    <main>
      <ProductPage params={params} />
    </main>
  );
}
