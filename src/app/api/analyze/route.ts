import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ANALYSIS_PROMPT = `Analyze this love story and identify meaningful coincidences and chance events that led to the couple meeting and forming a relationship. Break down each event into realistic probabilities while maintaining the sense of serendipity.

For each event, consider these key factors:

1. Location Context:
- City/area population and size
- Type of venue or location (e.g., popular spots vs. unusual places)
- Regular vs. special occasions
- Typical traffic or attendance patterns

2. Timing Elements:
- Time of day and day of week
- Seasonal factors
- Life stage compatibility
- Duration of opportunity

3. Personal Factors:
- Relationship status and readiness
- Common interests and activities
- Social circles and mutual connections
- Professional or educational paths

4. Decision Points:
- Routine choices vs. spontaneous decisions
- Alternative options available
- Typical behavioral patterns
- Key life choices

Calculate probabilities that reflect real-world likelihood while highlighting the special nature of each coincidence. For example:
- Meeting at a specific venue: Consider local population, venue capacity, and regular attendance
- Timing alignment: Factor in typical schedules and routines
- Shared interests: Use demographic data for common activities or preferences

Format your response as JSON with the following structure:
{
  "events": [
    {
      "circumstance": "string",
      "conditions": [
        {
          "description": "string",
          "oneInX": number (e.g., 365 means "1 in 365 chance")
        }
      ]
    }
  ],
  "finalOneInX": number (multiply all individual oneInX numbers),
  "summary": "string (highlight the special nature of these coincidences)"
}

Guidelines:
- Use realistic statistics and probabilities
- Consider common patterns in how people meet
- Balance unlikely coincidences with realistic scenarios
- Focus on meaningful connections rather than just mathematical improbability
- Maintain a sense of wonder while staying grounded in reality`;

export async function POST(req: Request) {
  try {
    const { audioData, text } = await req.json();
    
    let storyText: string;

    if (audioData) {
      // Convert base64 to File
      const base64Data = audioData.split(',')[1];
      const binaryData = Buffer.from(base64Data, 'base64');
      const audioFile = new File([binaryData], 'audio.webm', { type: 'audio/webm' });
      
      // Step 1: Transcribe audio using Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
      });

      storyText = transcription.text;
    } else {
      storyText = text;
    }

    // Step 2: Analyze the story using GPT-4o
    const analysis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: ANALYSIS_PROMPT
        },
        {
          role: "user",
          content: storyText
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = analysis.choices[0].message.content;
    if (!content) {
      throw new Error('No analysis content received');
    }

    // Parse the analysis
    const result = JSON.parse(content);

    return NextResponse.json({
      transcription: storyText,
      analysis: result
    });
  } catch (error) {
    console.error('Error processing story:', error);
    return NextResponse.json(
      { error: 'Failed to process story' },
      { status: 500 }
    );
  }
} 