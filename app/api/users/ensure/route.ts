/**
 * POST /api/users/ensure
 * 
 * Ensures a user exists for the given wallet address.
 * If user doesn't exist, creates one.
 * 
 * Request body:
 * {
 *   walletAddress: string; // Base address (0x...)
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   user?: { id: string; wallet_address: string; display_name: string; ... };
 *   created?: boolean; // true if user was just created
 *   error?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export const runtime = 'edge';

interface EnsureUserRequest {
  walletAddress: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EnsureUserRequest = await request.json();

    // Validate wallet address
    if (!body.walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(body.walletAddress)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid wallet address format',
        },
        { status: 400 }
      );
    }

    const walletAddress = body.walletAddress.toLowerCase(); // Normalize to lowercase

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (user doesn't exist)
      console.error('Failed to fetch user:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${fetchError.message}`,
        },
        { status: 500 }
      );
    }

    // If user exists, return it
    if (existingUser) {
      return NextResponse.json({
        success: true,
        user: existingUser,
        created: false,
      });
    }

    // User doesn't exist, create one
    const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    const userData = {
      wallet_address: walletAddress,
      display_name: shortAddress, // Default display name
      is_founder: false,
      is_editor: false,
      is_contributor: true, // Everyone starts as contributor
      is_reader: true,
    };

    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (createError) {
      console.error('Failed to create user:', createError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create user: ${createError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      created: true,
    });

  } catch (error) {
    console.error('Error ensuring user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

