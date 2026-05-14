const API_BASE_URL = "http://127.0.0.1:8000";
// When deployed to Render, we will use the proxy or environment variable
// process.env.NEXT_PUBLIC_API_URL || "/api"

/**
 * Robust fetch wrapper to handle Render's "sleeping" instances 
 * and network timeouts common in production.
 */
async function fetchWithTimeout(resource: string, options: any = {}) {
  const { timeout = 12000 } = options; // Increased to 12s for cold starts
  
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
      throw new Error('Our boutique is taking a moment to open. Please retry.');
    }
    throw error;
  }
}

/**
 * Fetch with retry logic for production stability
 */
async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetchWithTimeout(url);
      if (res.ok) return res;
      if (res.status !== 503 && res.status !== 504) break; // Don't retry on user errors
    } catch (e) {
      if (i === retries) throw e;
    }
    await new Promise(r => setTimeout(r, 2000 * (i + 1)));
  }
  return fetch(url); // Final attempt
}

export async function fetchProducts() {
  try {
    const res = await fetchWithRetry(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error("Our boutique is currently resting. Please refresh in a moment.");
    return res.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

export async function fetchProduct(id: number) {
  try {
    const res = await fetchWithRetry(`${API_BASE_URL}/products/${id}`);
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

export async function fetchAnalyticsSummary() {
  try {
    const res = await fetchWithRetry(`${API_BASE_URL}/analytics/summary`);
    if (!res.ok) throw new Error("Failed to fetch analytics summary.");
    return res.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

export async function fetchAnalyticsSales() {
  try {
    const res = await fetchWithRetry(`${API_BASE_URL}/analytics/sales`);
    if (!res.ok) throw new Error("Failed to fetch sales analytics.");
    return res.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

export async function fetchTopProducts() {
  try {
    const res = await fetchWithRetry(`${API_BASE_URL}/analytics/top-products`);
    if (!res.ok) throw new Error("Failed to fetch top products.");
    return res.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

