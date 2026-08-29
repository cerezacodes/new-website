// app/submit/page.js OR pages/submit.js
import ArticleSubmissionForm from '@/components/ArticleSubmissionForm';

export default function SubmitPage() {
  return (
    <main style={{ padding: '40px 20px', minHeight: '80vh' }}>
      <ArticleSubmissionForm />
    </main>
  );
}

// Example navigation link using Next.js Link
import Link from 'next/link';

<Link href="/submit">
  Submit Article
</Link>