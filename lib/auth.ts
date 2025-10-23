import { generateJwt } from "@coinbase/cdp-sdk/auth";

export interface JWTGenerationOptions {
  requestMethod?: string;
  requestHost?: string;
  requestPath?: string;
  expiresIn?: number;
}

/**
 * Generates a JWT token for OnchainKit Fund components authentication
 * Used for FundCard and FundButton components that require session tokens
 */
export async function generateSessionToken(options: JWTGenerationOptions = {}): Promise<string> {
  try {
    const {
      requestMethod = "GET",
      requestHost = "api.cdp.coinbase.com",
      requestPath = "/platform/v2/evm/token-balances",
      expiresIn = 120
    } = options;

    const token = await generateJwt({
      apiKeyId: process.env.KEY_NAME!,
      apiKeySecret: process.env.KEY_SECRET!,
      requestMethod,
      requestHost, 
      requestPath,
      expiresIn
    });

    return token;
  } catch (error) {
    console.error("Failed to generate JWT token:", error);
    throw new Error("JWT generation failed");
  }
}

/**
 * Generates a JWT token specifically for Onramp/Offramp operations
 * This is used for FundCard and funding operations
 */
export async function generateOnrampToken(): Promise<string> {
  return generateSessionToken({
    requestMethod: "POST",
    requestHost: "api.developer.coinbase.com", 
    requestPath: "/onramp/v1/token",
    expiresIn: 300 // 5 minutes for onramp operations
  });
}

/**
 * Get a valid public IP for development/production
 */
async function getPublicIp(): Promise<string> {
  // In development, use a known public IP immediately
  if (process.env.NODE_ENV === 'development') {
    return '8.8.8.8'; // Google DNS - always works for development
  }
  
  try {
    // For production, get the actual public IP
    const response = await fetch('https://api.ipify.org?format=text', { 
      timeout: 5000 
    });
    if (response.ok) {
      const ip = await response.text();
      return ip.trim();
    }
  } catch (error) {
    console.warn('Failed to get public IP:', error);
  }
  
  // Fallback
  return '8.8.8.8';
}

/**
 * Generates a proper onramp session token by calling Coinbase API
 * This is the correct way to get session tokens for FundCard
 */
export async function createOnrampSessionToken(userAddress?: string, clientIp?: string): Promise<string> {
  try {
    // Generate JWT for API authentication
    const authToken = await generateOnrampToken();
    
    // Handle IP address - no private IPs allowed
    let validClientIp = clientIp;
    
    // Check if IP is private/local and get public IP instead
    if (!validClientIp || 
        validClientIp === '127.0.0.1' || 
        validClientIp === 'localhost' ||
        validClientIp.startsWith('192.168.') ||
        validClientIp.startsWith('10.') ||
        validClientIp.startsWith('172.')) {
      validClientIp = await getPublicIp();
    }
    
    console.log(`Using IP for onramp: ${validClientIp}`);
    
    // Call Coinbase Onramp API to get session token
    const response = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addresses: userAddress ? [{
          address: userAddress,
          blockchains: ["base", "ethereum"]
        }] : [],
        assets: ["USDC", "ETH"],
        clientIp: validClientIp
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Onramp session token error:', errorData);
      throw new Error(`Onramp API error: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Failed to create onramp session token:", error);
    throw new Error("Onramp session token generation failed");
  }
}

/**
 * Server-side API route helper for generating session tokens
 * Call this from your API routes to provide tokens to client components
 */
export async function createSessionTokenAPI(userAddress?: string, clientIp?: string): Promise<{ token: string; expiresAt: Date }> {
  const token = await createOnrampSessionToken(userAddress, clientIp);
  const expiresAt = new Date(Date.now() + 300 * 1000); // 5 minutes from now
  
  return {
    token,
    expiresAt
  };
}