// Using Node.js runtime to use Razorpay SDK
// export const config = { runtime: "edge" }; // COMMENTED OUT

function j(res: unknown, status = 200) {
  return new Response(JSON.stringify(res), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

// Node.js env getter
function getEnv(name: string): string | undefined {
  return typeof process !== "undefined" ? (process.env as any)?.[name] : undefined;
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

async function fetchPaymentStatus(paymentId: string) {
  const Razorpay = (await import('razorpay')).default;
  
  const { keyId, keySecret } = getRazorpayCredentials();

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const payment = await razorpay.payments.fetch(paymentId);
  return payment;
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return j({ ok: false, error: "Method not allowed" }, 405);
  }

  try {
    // Handle request body parsing for Vercel Node.js runtime
    let payload: any = {};
    try {
      // Try different methods to get request body
      if (typeof (req as any).json === 'function') {
        payload = await (req as any).json();
      } else if (typeof (req as any).body === 'object' && (req as any).body !== null) {
        payload = (req as any).body;
      } else if (typeof (req as any).body === 'string') {
        payload = JSON.parse((req as any).body);
      } else if (typeof (req as any).text === 'function') {
        const bodyText = await (req as any).text();
        if (bodyText) {
          payload = JSON.parse(bodyText);
        }
      } else {
        // For Vercel Node.js runtime, body might be in a different format
        // Try to read from stream
        const chunks: Uint8Array[] = [];
        const reader = (req as any).body?.getReader?.();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          const bodyText = new TextDecoder().decode(Buffer.concat(chunks));
          if (bodyText) {
            payload = JSON.parse(bodyText);
          }
        }
      }
    } catch (parseError: any) {
      console.error("Body parse error:", parseError);
      // If all parsing fails, return error
      return j({ ok: false, error: "Invalid request body", details: parseError?.message }, 400);
    }
    
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = payload || {};

    console.log("🔍 Verifying Razorpay payment:", { razorpay_payment_id, razorpay_order_id });

    if (!razorpay_payment_id) {
      return j({ ok: false, error: "Payment ID is required" }, 400);
    }

    const payment = await fetchPaymentStatus(razorpay_payment_id);

    // Check if payment is successful
    const isSuccess = payment.status === "captured" || payment.status === "authorized";

    if (!isSuccess) {
      return j({
        ok: false,
        success: false,
        status: payment.status,
        error: payment.error_description || `Payment status: ${payment.status}`,
      });
    }

    console.log("✅ Payment verified successfully:", payment.id);

    return j({
      ok: true,
      success: true,
      paymentId: payment.id,
      orderId: payment.order_id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
    });
  } catch (err: any) {
    console.error("💥 Verify payment error:", err);
    return j({ ok: false, error: String(err?.message || err) }, 500);
  }
}

