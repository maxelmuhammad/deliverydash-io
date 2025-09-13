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

    // Fetch tracking info from AfterShip API
    const response = await fetch(`https://api.aftership.com/v4/trackings/${tracking_id}`, {
      method: 'GET',
      headers: {
        'aftership-api-key': aftershipApiKey,
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

    return new Response(
      JSON.stringify(result),
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