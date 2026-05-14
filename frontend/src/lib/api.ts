const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Robust fetch wrapper to handle Render's "sleeping" instances 
 * and network timeouts common in production.
 */
async function fetchWithTimeout(resource: string, options: any = {}) {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The server might be waking up.');
    }
    throw error;
  }
}

export async function fetchProducts() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error("Our boutique is currently resting. Please refresh in a moment.");
    return res.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

export async function fetchProduct(id: number) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error("This piece is currently unavailable.");
    return res.json();
  } catch (err) {
    throw err;
  }
}

export async function reserveProduct(id: number) {
  const res = await fetchWithTimeout(`${API_BASE_URL}/products/${id}/reserve`, {
    method: "POST",
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Unable to reserve this piece.");
  }
  return res.json();
}

export async function checkoutProduct(id: number, zone: string) {
  const res = await fetchWithTimeout(`${API_BASE_URL}/products/${id}/checkout?delivery_zone=${zone}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Secure checkout failed. Please try again.");
  return res.json();
}
