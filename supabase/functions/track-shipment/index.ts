import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TrackingResponse {
  id: string;
  status: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  created_at: string;
  updated_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tracking_id } = await req.json()
    
    if (!tracking_id) {
      return new Response(
        JSON.stringify({ error: 'Tracking ID is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First, check our local database using secure public tracking function
    const { data: localShipment, error: localError } = await supabase
      .rpc('track_shipment_public', { tracking_id })

    if (localError) {
      console.error('Local database error:', localError)
    }

    // If found locally, return it (limited data for security)
    if (localShipment && localShipment.length > 0) {
      return new Response(
        JSON.stringify(localShipment[0] as TrackingResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Try AfterShip API for real tracking
    const aftershipApiKey = Deno.env.get('AFTERSHIP_API_KEY')
    
    if (aftershipApiKey) {
      try {
        const aftershipResponse = await fetch(
          `https://api.aftership.com/v4/trackings/${tracking_id}`,
          {
            method: 'GET',
            headers: {
              'aftership-api-key': aftershipApiKey,
              'Content-Type': 'application/json',
            },
          }
        )

        if (aftershipResponse.ok) {
          const aftershipData = await aftershipResponse.json()
          const tracking = aftershipData.data?.tracking
          
          if (tracking) {
            // Map AfterShip data to our format
            const mappedData: TrackingResponse = {
              id: tracking.tracking_number,
              status: tracking.tag || 'Unknown',
              location: tracking.checkpoints?.[0]?.location || 'Unknown',
              coordinates: tracking.checkpoints?.[0]?.coordinates || null,
              created_at: tracking.created_at || new Date().toISOString(),
              updated_at: tracking.updated_at || new Date().toISOString(),
            }

            // Note: We don't save AfterShip data to local database anymore
            // to avoid user_id constraint issues. AfterShip data is returned directly.

            return new Response(
              JSON.stringify(mappedData),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        }
      } catch (aftershipError) {
        console.error('AfterShip API error:', aftershipError)
      }
    }

    // Not found in either database or AfterShip
    return new Response(
      JSON.stringify({ error: 'Shipment not found' }), 
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})