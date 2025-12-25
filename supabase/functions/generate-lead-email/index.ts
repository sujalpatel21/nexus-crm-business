import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a professional sales representative writing follow-up emails. 
Generate a personalized, professional follow-up email based on the lead's information.
The email should be warm, concise, and action-oriented.
Do not use placeholder brackets like [Your Name] - write a complete email.
Keep the email under 200 words.`;

    const userPrompt = `Generate a follow-up email for this lead:
- Name: ${lead.name}
- Email: ${lead.email || 'Not provided'}
- Status: ${lead.status}
- City: ${lead.city || 'Not provided'}
- Source: ${lead.source || 'Not provided'}
- Notes: ${lead.notes || 'No notes available'}

Based on their status "${lead.status}", write an appropriate follow-up:
- "new": Welcome email introducing our services
- "contacted": Follow-up checking if they have questions
- "qualified": Email discussing next steps and scheduling a call
- "converted": Thank you email and onboarding information
- "lost": Re-engagement email with a special offer`;

    console.log("Generating email for lead:", lead.name);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const emailContent = data.choices?.[0]?.message?.content;

    if (!emailContent) {
      throw new Error("No email content generated");
    }

    console.log("Email generated successfully for:", lead.name);

    return new Response(
      JSON.stringify({ email: emailContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error generating email:", error);
    const message = error instanceof Error ? error.message : "Failed to generate email";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
