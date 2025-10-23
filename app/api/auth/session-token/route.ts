import { NextRequest, NextResponse } from "next/server";
import { createSessionTokenAPI } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Extract user address and IP from request
    const userAddress = request.nextUrl.searchParams.get('address');
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     '127.0.0.1';

    // Generate session token for OnchainKit Fund components
    const { token, expiresAt } = await createSessionTokenAPI(userAddress || undefined, clientIp);
    
    return NextResponse.json({
      sessionToken: token,
      expiresAt: expiresAt.toISOString(),
      success: true
    });
  } catch (error) {
    console.error("Session token generation failed:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate session token",
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestPath, requestMethod, expiresIn } = body;
    
    // Generate custom session token with specific parameters
    const { generateSessionToken } = await import("@/lib/auth");
    
    const token = await generateSessionToken({
      requestMethod: requestMethod || "GET",
      requestPath: requestPath || "/platform/v2/evm/token-balances",
      expiresIn: expiresIn || 120
    });
    
    const expiresAt = new Date(Date.now() + (expiresIn || 120) * 1000);
    
    return NextResponse.json({
      sessionToken: token,
      expiresAt: expiresAt.toISOString(),
      success: true
    });
  } catch (error) {
    console.error("Custom session token generation failed:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate custom session token",
        success: false
      },
      { status: 500 }
    );
  }
}