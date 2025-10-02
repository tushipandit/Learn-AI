import { KiteConnect } from "kiteconnect";

const apiKey = "#";
const apiSecret = "#";

// This will hold the access token once session is generated
let accessToken: string | null = null;

// Create Kite instance
const kc = new KiteConnect({ api_key: apiKey });

/**
 * Step 1: Get Login URL
 */
export async function getAuthorize() {
  try {
    const loginUrl = kc.getLoginURL();
    console.log(loginUrl);
    return loginUrl;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Step 2: Generate session using the request token (from login redirect)
 */
export async function generateSession(requestToken: string) {
  try {
    const response = await kc.generateSession(requestToken, apiSecret);
    accessToken = response.access_token;
    kc.setAccessToken(accessToken);
    console.log("✅ Session generated. Access token:", accessToken);
  } catch (err) {
    console.error("❌ Error generating session:", err);
    throw err;
  }
}

/**
 * Step 3: Place order (make sure session is active)
 */
export async function placeOrder(
  tradingsymbol: string,
  quantity: number,
  type: "BUY" | "SELL"
) {
  try {
    if (!accessToken) {
      throw new Error("No access token. Please generate session first.");
    }

    const order = await kc.placeOrder("regular", {
      exchange: "NSE",
      tradingsymbol,
      transaction_type: type,
      quantity,
      product: "CNC",
      order_type: "MARKET",
    });

    console.log("✅ Order placed successfully:", order);

    // Optional: Fetch user profile after order
    await getProfile();
  } catch (err) {
    console.error("❌ Error placing order:", err);
    throw err;
  }
}

/**
 * Step 4: Fetch user profile (optional)
 */
export async function getProfile() {
  try {
    if (!accessToken) {
      throw new Error("No access token. Please generate session first.");
    }

    const profile = await kc.getProfile();
    console.log("👤 Profile info:", profile);
    return profile;
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    throw err;
  }
}
