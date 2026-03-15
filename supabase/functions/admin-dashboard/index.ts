// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('57793860c23cb801640462e95cc645cc42ff0716116233f9a934bb14627239ee') ?? '',
      Deno.env.get('4e6e1da01d292b3e4eb8e7415167ef693f8fbca63d622802e107059f762af2ce') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verify user authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    // Create a Supabase admin client to fetch all data bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get('57793860c23cb801640462e95cc645cc42ff0716116233f9a934bb14627239ee') ?? '',
      Deno.env.get('e30615d755cf3d474ad0af741e935e7a505ca641d27726add2b72ec6d0454574') ?? ''
    )

    // Check if the user is an admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      // Try both id and user_id depending on schema
      .or(`id.eq.${user.id},user_id.eq.${user.id}`)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch dashboard stats
    const { count: totalUsers } = await supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true })
    const { count: totalVideos } = await supabaseAdmin.from('videos').select('*', { count: 'exact', head: true })
    const { count: totalReports } = await supabaseAdmin.from('video_reports').select('*', { count: 'exact', head: true }).catch(() => ({ count: 0 })) // Optional fallback if table might not exist

    // Total views logic (summing views from videos)
    const { data: videosForViews } = await supabaseAdmin.from('videos').select('views')
    const totalViews = videosForViews?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0

    // Fetch users (latest 50)
    const { data: users } = await supabaseAdmin
      .from('user_profiles')
      .select('id, user_email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    // Map user_email to email for frontend compatibility if needed, or assume frontend relies on what we give
    const mappedUsers = users?.map(u => ({ ...u, email: (u as any).user_email || 'user@example.com' })) || []

    // Fetch videos (latest 50)
    const { data: videos } = await supabaseAdmin
      .from('videos')
      .select('id, title, user_id, views, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    const mappedVideos = videos?.map(v => ({ ...v, uploader: v.user_id })) || []

    // Fetch reports (latest 50)
    const { data: reports } = await supabaseAdmin
      .from('video_reports')
      .select('id, video_id, reason, status, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
      .catch(() => ({ data: [] }))

    const mappedReports = reports?.map(r => ({ ...r, videoId: (r as any).video_id })) || []

    // Response structure expected by the frontend Admin component
    const responseData = {
      stats: {
        totalUsers: totalUsers || 0,
        totalVideos: totalVideos || 0,
        totalReports: totalReports || 0,
        totalViews: totalViews
      },
      users: mappedUsers,
      videos: mappedVideos,
      reports: mappedReports
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
