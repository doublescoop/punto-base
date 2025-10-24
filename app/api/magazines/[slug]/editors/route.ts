/**
 * POST /api/magazines/[slug]/editors
 * 
 * Creates magazine editor relationships for team members
 * 
 * Request body:
 * {
 *   editors: Array<{
 *     walletAddress: string;
 *     nickname?: string;
 *   }>;
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   editors?: Array<MagazineEditor>;
 *   error?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

// Removed 'edge' runtime - causes issues with Supabase
// export const runtime = 'edge';

interface CreateEditorsRequest {
  editors: Array<{
    walletAddress: string;
    nickname?: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: CreateEditorsRequest = await request.json();

    // Validate required fields
    if (!body.editors || !Array.isArray(body.editors) || body.editors.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one editor is required',
        },
        { status: 400 }
      );
    }

    // Validate each editor has required wallet address
    for (const editor of body.editors) {
      if (!editor.walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(editor.walletAddress)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid wallet address format for editor',
          },
          { status: 400 }
        );
      }
    }

    // Get magazine by slug
    const { data: magazine, error: magazineError } = await supabaseAdmin
      .from('magazines')
      .select('id')
      .eq('slug', slug)
      .single();

    if (magazineError || !magazine) {
      return NextResponse.json(
        {
          success: false,
          error: 'Magazine not found',
        },
        { status: 404 }
      );
    }

    // Ensure all editor users exist and get their IDs
    const editorUserIds: string[] = [];
    
    for (const editor of body.editors) {
      const normalizedWallet = editor.walletAddress.toLowerCase();
      
      // Ensure user exists
      const ensureUserResponse = await fetch(`${request.nextUrl.origin}/api/users/ensure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: normalizedWallet }),
      });
      
      const ensureUserData = await ensureUserResponse.json();
      
      if (!ensureUserData.success || !ensureUserData.user) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to ensure user exists for wallet: ${editor.walletAddress}`,
          },
          { status: 500 }
        );
      }
      
      editorUserIds.push(ensureUserData.user.id);
    }

    // Create magazine editor records
    const editorsData = body.editors.map((editor, index) => ({
      magazine_id: magazine.id,
      user_id: editorUserIds[index],
      nickname: editor.nickname || null,
    }));

    const { data: createdEditors, error: editorsError } = await supabaseAdmin
      .from('magazine_editors')
      .insert(editorsData)
      .select();

    if (editorsError) {
      console.error('Failed to create magazine editors:', editorsError);
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${editorsError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      editors: createdEditors,
      editorsCreated: createdEditors.length,
    });

  } catch (error) {
    console.error('Error creating magazine editors:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}