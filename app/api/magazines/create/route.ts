/**
 * POST /api/magazines/create
 * 
 * Creates a new magazine from a scraped event
 * 
 * Request body:
 * {
 *   name: string;
 *   slug: string;
 *   description: string;
 *   founderId: string;
 *   eventUrl?: string;
 *   eventData?: SocialLayerEvent;
 *   defaultBountyAmount?: number; // USDC cents, default 1000 ($10)
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   magazine?: Magazine;
 *   error?: string;
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { Magazine } from '@/types/schema';

export const runtime = 'edge';

interface CreateMagazineRequest {
  name: string;
  slug: string;
  description: string;
  founderId: string;
  eventUrl?: string;
  eventData?: Record<string, unknown>;
  defaultBountyAmount?: number;
  coverImageUrl?: string;
  logoUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMagazineRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.slug || !body.description || !body.founderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, slug, description, founderId',
        },
        { status: 400 }
      );
    }

    // Validate slug format (lowercase, alphanumeric, hyphens only)
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug must be lowercase alphanumeric with hyphens only',
        },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const { data: existingMagazine } = await supabaseAdmin
      .from('magazines')
      .select('id')
      .eq('slug', body.slug)
      .single();

    if (existingMagazine) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug is already taken',
        },
        { status: 409 }
      );
    }

    // Create magazine
    const magazineData = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      founder_id: body.founderId,
      cover_image: body.coverImageUrl || null,
      logo_image: body.logoUrl || null,
      theme_id: 'default',
      accent_colors: ['#000000', '#ffffff'],
      treasury_address: '', // Will be set when Safe is created
      default_bounty_amount: body.defaultBountyAmount || 1000, // $10 default
    };

    const { data: magazine, error } = await supabaseAdmin
      .from('magazines')
      .insert(magazineData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create magazine:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${error.message}`,
        },
        { status: 500 }
      );
    }

    // Return magazine data directly (types now match database)
    const responseMagazine: Magazine = magazine;

    return NextResponse.json({
      success: true,
      magazine: responseMagazine,
    });

  } catch (error) {
    console.error('Error creating magazine:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

