import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const aftershipApiKey = Deno.env.get('AFTERSHIP_API_KEY')
    
    if (!aftershipApiKey) {
      return new Response(
        JSON.stringify({ error: 'AfterShip API key not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch tracking info from AfterShip API using tracking number query
    const url = new URL('https://api.aftership.com/v4/trackings')
    url.searchParams.set('tracking_numbers', tracking_id)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'aftership-api-key': aftershipApiKey!,
        'Content-Type': 'application/json',
      }
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('AfterShip API error:', result)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tracking info', details: result }), 
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Normalize AfterShip response -> UI-friendly shape
    const tracking = result?.data?.trackings?.[0]
    if (!tracking) {
      return new Response(
        JSON.stringify({ error: 'Tracking not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const checkpoints = Array.isArray(tracking.checkpoints) ? tracking.checkpoints : []
    const latest = checkpoints.length ? checkpoints[checkpoints.length - 1] : null
    const tagRaw = tracking.tag ?? tracking.status ?? 'Unknown'
    const tagDisplay = typeof tagRaw === 'string'
      ? tagRaw.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
      : 'Unknown'

    const normalized = {
      data: {
        tracking: {
          tracking_number: tracking.tracking_number ?? tracking_id,
          tag: tagDisplay,
          status: tagDisplay,
          location: latest?.location || latest?.city || tracking.origin_country_iso3 || 'Unknown',
          checkpoints: checkpoints.map((cp: any) => ({
            location: cp.location || cp.city || cp.state || cp.country_name || 'Unknown',
            coordinates: cp.coordinates ?? null,
            message: cp.message ?? cp.tag ?? '',
            checkpoint_time: cp.checkpoint_time ?? cp.created_at ?? null,
          })),
          created_at: tracking.created_at ?? new Date().toISOString(),
          updated_at: tracking.updated_at ?? new Date().toISOString(),
        }
      }
    }

    return new Response(
      JSON.stringify(normalized),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})