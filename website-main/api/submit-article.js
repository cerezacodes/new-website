// app/api/submit-article/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();

    const authorName = formData.get('authorName');
    const authorEmail = formData.get('authorEmail');
    const title = formData.get('title');
    const category = formData.get('category');
    const content = formData.get('content');
    const coverImage = formData.get('coverImage');

    // Basic validation check
    if (!authorName || !authorEmail || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Process the submission
    // Option A: Send an email notification using Resend / SendGrid
    // Option B: Save directly to your database (e.g., Supabase, MongoDB, Prisma)
    // Option C: Create a draft entry in a CMS (e.g., Sanity, Strapi, Notion API)

    console.log('Received submission:', { authorName, authorEmail, title, category });

    return NextResponse.json(
      { message: 'Article submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}