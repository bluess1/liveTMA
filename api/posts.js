import { put, list, del } from '@vercel/blob';

export const config = {
  api: { bodyParser: { sizeLimit: '4.5mb' } }
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { blobs } = await list({ prefix: 'meta/' });
    const posts = await Promise.all(
      blobs.map(async (b) => {
        const r = await fetch(b.url);
        return r.json();
      })
    );
    posts.sort((a, b) => b.ts - a.ts);
    return res.status(200).json(posts);
  }

  if (req.method === 'POST') {
    const { caption, type, mediaBase64, mediaMime } = req.body || {};
    if (!caption && !mediaBase64) {
      return res.status(400).json({ error: 'Empty post' });
    }
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    let mediaUrl = null;
    let mediaPath = null;
    if (mediaBase64) {
      const buffer = Buffer.from(mediaBase64, 'base64');
      const ext = mediaMime && mediaMime.includes('/') ? mediaMime.split('/')[1].split(';')[0] : 'bin';
      const path = `media/${id}.${ext}`;
      const blob = await put(path, buffer, {
        access: 'public',
        contentType: mediaMime || 'application/octet-stream',
        addRandomSuffix: false
      });
      mediaUrl = blob.url;
      mediaPath = blob.pathname;
    }

    const post = {
      id,
      caption: caption || '',
      type: type || 'text',
      mediaUrl,
      mediaPath,
      ts: Date.now()
    };
    await put(`meta/${id}.json`, JSON.stringify(post), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false
    });
    return res.status(200).json(post);
  }

  if (req.method === 'DELETE') {
    const { id, mediaPath } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    await del(`meta/${id}.json`);
    if (mediaPath) {
      try { await del(mediaPath); } catch (e) {}
    }
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
