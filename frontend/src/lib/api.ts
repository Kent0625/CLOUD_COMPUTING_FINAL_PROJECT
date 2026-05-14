const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchProducts() {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProduct(id: number) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function reserveProduct(id: number) {
  const res = await fetch(`${API_BASE_URL}/products/${id}/reserve`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reserve product");
  return res.json();
}

export async function checkoutProduct(id: number, zone: string) {
  const res = await fetch(`${API_BASE_URL}/products/${id}/checkout?delivery_zone=${zone}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to checkout");
  return res.json();
}
