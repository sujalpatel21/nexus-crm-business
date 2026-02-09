import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
    leadId: string;
    leadName: string;
    leadEmail: string;
    templateId?: string;
    customSubject?: string;
    customBody?: string;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { leadId, leadName, leadEmail, templateId, customSubject, customBody }: EmailRequest = await req.json()

        // Validate required fields
        if (!leadId || !leadName || !leadEmail) {
            throw new Error('Missing required fields: leadId, leadName, leadEmail')
        }

        // Get Gmail credentials from environment
        const gmailUser = Deno.env.get('GMAIL_USER')
        const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD')

        if (!gmailUser || !gmailPassword) {
            throw new Error('Gmail credentials not configured')
        }

        // Prepare email content
        let subject = customSubject || 'Exploring AI Business Assistant Solutions for Your Business'
        let body = customBody || `Hello ${leadName},

I am Sujal, and I specialize in building custom AI Business Assistant Platforms tailored to business needs.

I'd love to learn more about what type of AI Business Assistant you're looking for and how I can help build the perfect solution for your business.

Looking forward to hearing from you!

Best regards,
Sujal`

        // Replace template variables
        body = body.replace(/\{\{leadName\}\}/g, leadName)
        subject = subject.replace(/\{\{leadName\}\}/g, leadName)

        // Create SMTP client
        const client = new SmtpClient();

        await client.connectTLS({
            hostname: "smtp.gmail.com",
            port: 465,
            username: gmailUser,
            password: gmailPassword,
        });

        // Send email
        await client.send({
            from: gmailUser,
            to: leadEmail,
            subject: subject,
            content: body,
        });

        await client.close();

        // Return success response
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Email sent successfully',
                leadId,
                recipient: leadEmail,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        console.error('Error sending email:', error)

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            },
        )
    }
})
