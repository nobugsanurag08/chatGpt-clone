import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    

    if (!process.env.OPENAI_API_KEY) {
      // Provide a more contextual demo response based on the user's message
      const lastMessage = messages[messages.length - 1]?.content || '';
      let demoResponse = 'Hello! I\'m your AI assistant. How can I help you today?';
      
      if (lastMessage.toLowerCase().includes('hello') || lastMessage.toLowerCase().includes('hi')) {
        demoResponse = 'Hello! Great to meet you! I\'m here to help with any questions you have. What would you like to know?';
      } else if (lastMessage.toLowerCase().includes('help')) {
        demoResponse = 'I\'d be happy to help! I can assist with coding, writing, analysis, creative tasks, and much more. What specific area would you like help with?';
      } else if (lastMessage.toLowerCase().includes('code') || lastMessage.toLowerCase().includes('programming')) {
        demoResponse = 'I can help with programming! I can write code, debug issues, explain concepts, and work with many languages like Python, JavaScript, React, and more. What would you like to work on?';
      } else if (lastMessage.toLowerCase().includes('write') || lastMessage.toLowerCase().includes('content')) {
        demoResponse = 'I can help with writing! Whether you need blog posts, emails, creative writing, technical documentation, or any other content, I\'m here to assist. What would you like to write about?';
      } else if (lastMessage.toLowerCase().includes('explain') || lastMessage.toLowerCase().includes('what is')) {
        demoResponse = 'I\'d be happy to explain! I can break down complex topics, provide detailed explanations, and help you understand various subjects. What would you like me to explain?';
      } else if (lastMessage.length > 0) {
        demoResponse = `I understand you're asking about "${lastMessage}". To get a real AI response, please configure your OpenAI API key. For now, I can help with general questions and provide guidance on various topics. What would you like to explore?`;
      }
      
      return new Response(JSON.stringify({
        message: demoResponse,
        demo: true,
        note: 'This is a demo response. Configure your OpenAI API key for real AI responses.'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convert messages to OpenAI format
    const openaiMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content || msg.text || ''
    }));


    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 429) {
        return new Response(JSON.stringify({
          message: 'Rate limit exceeded. Please wait a moment before trying again. This is a demo response: "Hello! I\'m your AI assistant. How can I help you today?"',
          rateLimited: true,
          errorDetails: errorText
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify({ 
      message: data.choices[0].message.content,
      usage: data.usage
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    let errorMessage = 'An unknown error occurred';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
      errorMessage = (error as any).message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
