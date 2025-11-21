import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { Resend } from 'npm:resend@3.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface FeedbackRequest {
  type: 'bug' | 'feature';
  subject: string;
  description: string;
  browserInfo: string;
  captchaAnswer: number;
  captchaQuestion: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { type, subject, description, browserInfo, captchaAnswer, captchaQuestion }: FeedbackRequest = await req.json();

    if (!type || !subject || !description || captchaAnswer === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const [num1Str, num2Str] = captchaQuestion.split('+').map(s => s.trim());
    const expectedAnswer = parseInt(num1Str) + parseInt(num2Str);

    if (captchaAnswer !== expectedAnswer) {
      return new Response(
        JSON.stringify({ error: 'Invalid captcha answer' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentSubmissions, error: checkError } = await supabase
      .from('feedback_submissions')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo);

    if (checkError) {
      console.error('Error checking submissions:', checkError);
    } else if (recentSubmissions && recentSubmissions.length >= 3) {
      return new Response(
        JSON.stringify({ error: 'Too many submissions. Please wait before submitting again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: insertError } = await supabase
      .from('feedback_submissions')
      .insert({
        user_id: user.id,
        type,
        subject,
        description,
        email: user.email,
        user_agent: browserInfo,
      });

    if (insertError) {
      console.error('Error inserting feedback:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit feedback' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const recipientEmail = Deno.env.get('FEEDBACK_EMAIL');

    console.log('Resend API Key present:', !!resendApiKey);
    console.log('Recipient Email:', recipientEmail);

    if (resendApiKey && recipientEmail) {
      try {
        console.log('Attempting to send email...');
        const resend = new Resend(resendApiKey);

        const emailType = type === 'bug' ? 'Bug Report' : 'Feature Request';

        const result = await resend.emails.send({
          from: 'Uptime Monitor <onboarding@resend.dev>',
          to: 'drake.dev.0411@gmail.com',
          subject: `[${emailType}] ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">New ${emailType}</h2>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Type:</strong> ${emailType}</p>
                <p style="margin: 5px 0;"><strong>From:</strong> ${user.email}</p>
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
              </div>
              <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                <h3 style="margin-top: 0;">Description:</h3>
                <p style="white-space: pre-wrap;">${description}</p>
              </div>
              <div style="margin-top: 20px; padding: 10px; background: #f9f9f9; border-radius: 5px; font-size: 12px; color: #666;">
                <p style="margin: 5px 0;"><strong>Browser Info:</strong> ${browserInfo}</p>
                <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>
            </div>
          `,
        });
        console.log('Email sent successfully:', result);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        console.error('Email error details:', JSON.stringify(emailError, null, 2));
      }
    } else {
      console.log('Skipping email - missing config');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Feedback submitted successfully. We will review it soon!'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing feedback:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});