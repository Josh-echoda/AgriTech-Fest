export async function paymentErrorMessage(error: unknown): Promise<string> {
  const fallback = 'Checkout could not connect to the payment service. Please try again or contact info@e360.africa.';
  if (!error || typeof error !== 'object') return fallback;
  const context = (error as { context?: unknown }).context;
  // HTTP errors carry a Response; fetch/relay errors may carry an Error or other value.
  if (!context || typeof context !== 'object' || !('json' in context) || typeof context.json !== 'function') return fallback;
  try {
    const detail: unknown = await context.json();
    if (detail && typeof detail === 'object' && 'error' in detail && typeof detail.error === 'string' && detail.error.trim()) return detail.error;
  } catch { /* Non-JSON responses must not obscure the original checkout failure. */ }
  return fallback;
}
