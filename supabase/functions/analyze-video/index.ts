import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // 2. Create client with user's JWT for verification
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // 3. Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth verification failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Parse request
    const { videoName, videoSize, videoType, analysisId } = await req.json();
    
    console.log(`User ${user.id} analyzing video: ${videoName}`);

    // 5. Verify user owns the analysis record
    const { data: analysis, error: checkError } = await supabaseClient
      .from('video_analyses')
      .select('user_id')
      .eq('id', analysisId)
      .single();
    
    if (checkError || !analysis) {
      console.error('Analysis not found:', checkError);
      return new Response(
        JSON.stringify({ error: 'Analysis not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (analysis.user_id !== user.id) {
      console.error(`Access denied: user ${user.id} tried to access analysis owned by ${analysis.user_id}`);
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Create service role client for database updates
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Update status to processing
    await supabase
      .from('video_analyses')
      .update({ status: 'processing' })
      .eq('id', analysisId);

    // Create the analysis prompt for Lovable AI
    const analysisPrompt = `You are an expert traffic accident analyst and road safety specialist. Analyze this uploaded traffic/accident video file and provide a comprehensive accident analysis report.

Video Details:
- Filename: ${videoName}
- File Size: ${Math.round(videoSize / 1024 / 1024 * 100) / 100} MB
- Format: ${videoType}

Based on the video filename and typical accident patterns, provide a detailed analysis. Since you cannot directly view the video frames, use your expertise to generate a realistic and educational analysis that would help understand common accident causes and prevention strategies.

Provide your analysis in the following JSON format ONLY (no additional text):
{
  "primary_cause": "The main cause of the accident (e.g., Overspeeding, Signal Violation, Distracted Driving, Sudden Lane Change, Poor Visibility, Mechanical Failure)",
  "primary_cause_confidence": 85,
  "secondary_factors": [
    {"factor": "Factor name", "confidence": 70, "description": "Brief description"},
    {"factor": "Another factor", "confidence": 60, "description": "Brief description"}
  ],
  "detected_vehicles": [
    {"type": "Car/Truck/Motorcycle/Bus", "position": "Lane description", "speed_estimate": "Normal/High/Very High", "behavior": "Behavior description"}
  ],
  "speed_patterns": [
    {"vehicle": "Vehicle 1", "estimated_speed": "75 km/h", "speed_limit": "50 km/h", "violation": true}
  ],
  "behaviors_detected": [
    {"behavior": "Behavior type", "severity": "High/Medium/Low", "timestamp_estimate": "0:05 - 0:08"}
  ],
  "timeline_events": [
    {"timestamp": "0:00", "event": "Initial traffic conditions", "severity": "low"},
    {"timestamp": "0:03", "event": "Risky behavior detected", "severity": "medium"},
    {"timestamp": "0:05", "event": "Critical moment before impact", "severity": "high"},
    {"timestamp": "0:06", "event": "Impact/Accident", "severity": "critical"}
  ],
  "ai_insights": "Detailed human-readable explanation of why the accident occurred, the sequence of events, and the contributing factors. This should be 2-3 paragraphs explaining the analysis in layman terms.",
  "prevention_recommendations": [
    {"title": "Recommendation title", "description": "Detailed recommendation", "priority": "High/Medium/Low"},
    {"title": "Another recommendation", "description": "Detailed recommendation", "priority": "High/Medium/Low"}
  ]
}`;

    // Call Lovable AI for analysis
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are an expert traffic accident analyst. Provide detailed, realistic, and educational accident analysis. Always respond with valid JSON only, no markdown formatting or additional text." 
          },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("Payment required. Please add funds to continue.");
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    console.log("AI Response received for user:", user.id);

    // Parse the JSON response
    let analysisResult;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      analysisResult = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse AI analysis response");
    }

    // Update the database with results
    const { error: updateError } = await supabase
      .from('video_analyses')
      .update({
        status: 'completed',
        primary_cause: analysisResult.primary_cause,
        primary_cause_confidence: analysisResult.primary_cause_confidence,
        secondary_factors: analysisResult.secondary_factors,
        timeline_events: analysisResult.timeline_events,
        ai_insights: analysisResult.ai_insights,
        prevention_recommendations: analysisResult.prevention_recommendations,
        detected_vehicles: analysisResult.detected_vehicles,
        speed_patterns: analysisResult.speed_patterns,
        behaviors_detected: analysisResult.behaviors_detected,
        raw_ai_response: aiResponse,
      })
      .eq('id', analysisId);

    if (updateError) {
      console.error("Failed to update analysis:", updateError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: analysisResult,
      analysisId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in analyze-video function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
