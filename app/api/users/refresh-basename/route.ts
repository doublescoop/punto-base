/**
 * POST /api/users/refresh-basename
 * 
 * Updates a user's display_name with their current Basename
 * Useful when users register new Basenames after account creation
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
 *   updated?: boolean; // true if display_name was changed
 *   previousName?: string; // previous display_name
 *   error?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { resolveBasename } from '@/lib/basenames';

export const runtime = 'edge';

interface RefreshBasenameRequest {
  walletAddress: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RefreshBasenameRequest = await request.json();

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

    if (fetchError) {
      console.error('Failed to fetch user:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: fetchError.code === 'PGRST116' 
            ? 'User not found' 
            : `Database error: ${fetchError.message}`,
        },
        { status: fetchError.code === 'PGRST116' ? 404 : 500 }
      );
    }

    // Resolve current Basename
    let newDisplayName: string;
    try {
      newDisplayName = await resolveBasename(walletAddress);
      console.log(`Refreshed Basename for ${walletAddress}: ${newDisplayName}`);
    } catch (error) {
      console.warn('Failed to resolve Basename during refresh:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to resolve Basename',
        },
        { status: 500 }
      );
    }

    const previousName = existingUser.display_name;
    const updated = previousName !== newDisplayName;

    // Update user's display name if it changed
    if (updated) {
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          display_name: newDisplayName,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update user:', updateError);
        return NextResponse.json(
          {
            success: false,
            error: `Failed to update user: ${updateError.message}`,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        user: updatedUser,
        updated: true,
        previousName,
      });
    } else {
      // No update needed
      return NextResponse.json({
        success: true,
        user: existingUser,
        updated: false,
        previousName,
      });
    }

  } catch (error) {
    console.error('Error refreshing basename:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}