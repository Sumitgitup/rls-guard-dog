// supabase/functions/class-average/index.ts

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { MongoClient } from 'https://deno.land/x/mongo@v0.32.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { classroom_id } = await req.json()
    if (!classroom_id) {
      throw new Error('classroom_id is required')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let { data: progressRecords, error } = await supabaseAdmin
      .from('progress')
      .select('score')
      .eq('classroom_id', classroom_id)

    if (error) throw error

    // --- FIX IS HERE ---
    // If no records are found, supabase returns data as null.
    // We'll handle this by setting progressRecords to an empty array.
    if (!progressRecords) {
      progressRecords = []
    }

    const totalScore = progressRecords.reduce((sum: number, record: { score: number }) => sum + record.score, 0)
    const average = progressRecords.length > 0 ? totalScore / progressRecords.length : 0

    const MONGO_URI = Deno.env.get('MONGO_URI')
    if (!MONGO_URI) {
      throw new Error("MONGO_URI secret is not set in Supabase project.")
    }

    const client = new MongoClient()
    await client.connect(MONGO_URI)
    
    const db = client.database('school_analytics')
    const averagesCollection = db.collection('class_averages')

    await averagesCollection.updateOne(
      { classroom_id: classroom_id },
      { $set: { average_score: average, last_calculated: new Date() } },
      { upsert: true }
    )

    return new Response(
      JSON.stringify({ success: true, average_score: average }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
  return new Response(errorMessage, {
    status: 500,
    headers: corsHeaders,
  })
  }
})