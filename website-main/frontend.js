import React, { useState } from 'react';

export default function ArticleSubmissionForm() {
  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: '',
    title: '',
    category: 'culture',
    content: '',
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    // Prepare multipart form data to handle both text and files
    const data = new FormData();
    data.append('authorName', formData.authorName);
    data.append('authorEmail', formData.authorEmail);
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('content', formData.content);
    if (file) {
      data.append('coverImage', file);
    }

    try {
      const response = await fetch('/api/submit-article', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        throw new Error('Failed to submit article. Please try again.');
      }

      setStatus({ loading: false, success: true, error: null });
      setFormData({ authorName: '', authorEmail: '', title: '', category: 'culture', content: '' });
      setFile(null);
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message });
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', padding: '20px' }}>
      <h2>Submit Your Article</h2>
      {status.success && (
        <p style={{ color: 'green' }}>Thank you! Your article has been submitted for review.</p>
      )}
      {status.error && <p style={{ color: 'red' }}>{status.error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="authorName">Author Name *</label>
          <input
            type="text"
            id="authorName"
            name="authorName"
            required
            value={formData.authorName}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div>
          <label htmlFor="authorEmail">Author Email *</label>
          <input
            type="email"
            id="authorEmail"
            name="authorEmail"
            required
            value={formData.authorEmail}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div>
          <label htmlFor="title">Article Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          >
            <option value="culture">Culture</option>
            <option value="opinion">Opinion</option>
            <option value="reviews">Reviews</option>
            <option value="news">News</option>
          </select>
        </div>

        <div>
          <label htmlFor="coverImage">Cover Image (Optional)</label>
          <input
            type="file"
            id="coverImage"
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: '100%', marginTop: '4px' }}
          />
        </div>

        <div>
          <label htmlFor="content">Article Content *</label>
          <textarea
            id="content"
            name="content"
            rows={10}
            required
            value={formData.content}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            placeholder="Write or paste your submission here..."
          />
        </div>

        <button
          type="submit"
          disabled={status.loading}
          style={{ padding: '12px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {status.loading ? 'Submitting...' : 'Submit Draft'}
        </button>
      </form>
    </div>
  );
}