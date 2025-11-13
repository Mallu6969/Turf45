// Using Edge runtime - works with direct HTTP calls (no SDK needed)
export const config = { runtime: "edge" };

function j(res: unknown, status = 200) {
  return new Response(JSON.stringify(res), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

// Edge-safe env getter
function getEnv(name: string): string | undefined {
  const fromDeno = (globalThis as any)?.Deno?.env?.get?.(name);
  const fromProcess = typeof process !== "undefined" ? (process.env as any)?.[name] : undefined;
  return fromDeno ?? fromProcess;
}

function need(name: string) {
  const v = getEnv(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function getRazorpayCredentials() {
  const mode = getEnv("RAZORPAY_MODE") || "test";
  const isLive = mode === "live";

  const keyId = isLive
    ? (getEnv("RAZORPAY_KEY_ID_LIVE") || getEnv("RAZORPAY_KEY_ID") || need("RAZORPAY_KEY_ID_LIVE"))
    : (getEnv("RAZORPAY_KEY_ID_TEST") || getEnv("RAZORPAY_KEY_ID") || need("RAZORPAY_KEY_ID_TEST"));

  const keySecret = isLive
    ? (getEnv("RAZORPAY_KEY_SECRET_LIVE") || getEnv("RAZORPAY_KEY_SECRET") || need("RAZORPAY_KEY_SECRET_LIVE"))
    : (getEnv("RAZORPAY_KEY_SECRET_TEST") || getEnv("RAZORPAY_KEY_SECRET") || need("RAZORPAY_KEY_SECRET_TEST"));

  return { keyId, keySecret, mode };
}

async function createRazorpayOrder(amount: number, receipt: string, notes?: Record<string, string>, signal?: AbortSignal) {
  const { keyId, keySecret } = getRazorpayCredentials();

  const amountInPaise = Math.round(Number(amount) * 100);
  if (amountInPaise < 100) {
    throw new Error("Amount must be at least ₹1.00 (100 paise)");
  }

  // Check if already aborted before making API call
  if (signal?.aborted) {
    throw new Error("Request aborted");
  }

  const orderOptions: any = {
    amount: amountInPaise,
    currency: "INR",
    receipt: receipt.substring(0, 40).trim(), // 40 char limit
  };

  // Validate and add notes if provided
  if (notes && typeof notes === 'object' && Object.keys(notes).length > 0) {
    const validNotes: Record<string, string> = {};
    for (const [key, value] of Object.entries(notes)) {
      if (key && value && typeof value === 'string' && value.length <= 256) {
        validNotes[key] = value;
      }
    }
    if (Object.keys(validNotes).length > 0) {
      orderOptions.notes = validNotes;
    }
  }

  // Use direct HTTP call instead of SDK to avoid connection keep-alive issues
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  
  const controller = new AbortController();
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }
  
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify(orderOptions),
    signal: controller.signal,
  });

  // Check if already aborted
  if (signal?.aborted || controller.signal.aborted) {
    throw new Error("Request aborted");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Razorpay API error: ${response.status} - ${errorText}`);
  }

  const order = await response.json();
  
  // Check again after API call
  if (signal?.aborted || controller.signal.aborted) {
    throw new Error("Request aborted");
  }
  
  return order;
}

export default async function handler(req: Request) {
  const startTime = Date.now();
  
  if (req.method !== "POST") {
    return j({ ok: false, error: "Method not allowed" }, 405);
  }

  try {
    // In Edge runtime, parse body from request
    const payload = await req.json().catch(() => ({}));
    const { amount, receipt, notes } = payload;

    console.log("💳 Creating Razorpay order:", { amount, receipt });

    if (!amount || Number(amount) <= 0) {
      return j({ ok: false, error: "Amount must be > 0" }, 400);
    }

    if (!receipt || typeof receipt !== 'string') {
      return j({ ok: false, error: "Receipt ID is required" }, 400);
    }

    // Add timeout wrapper for Razorpay API call (8 seconds max to avoid Vercel timeout)
    const abortController = new AbortController();
    let timeoutId: NodeJS.Timeout | null = null;
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        abortController.abort();
        reject(new Error("Request timeout: Razorpay API took too long"));
      }, 8000);
    });

    let order: any;
    try {
      // Race between the API call and timeout
      order = await Promise.race([
        createRazorpayOrder(amount, receipt, notes, abortController.signal),
        timeoutPromise,
      ]);
      
      // Clear timeout if we got here
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    } catch (err: any) {
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (abortController.signal.aborted || err?.message?.includes("aborted") || err?.message?.includes("timeout")) {
        throw new Error("Request timeout: Razorpay API took too long");
      }
      throw err;
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Razorpay order created: ${order.id} (${duration}ms)`);

    // Prepare response data
    const responseData = {
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    };

    // Return response immediately - ensure no async operations after this
    return j(responseData, 200);
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error(`💥 Create order error (${duration}ms):`, err);
    
    // Check if it's a timeout error
    if (err?.message?.includes("timeout") || duration > 9000) {
      return j({ 
        ok: false, 
        error: "Payment gateway timeout. Please try again.",
        timeout: true 
      }, 504);
    }
    
    return j({ ok: false, error: String(err?.message || err) }, 500);
  }
}

