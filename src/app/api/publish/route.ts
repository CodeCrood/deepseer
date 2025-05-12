import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import JSZip from 'jszip';
import fetch from 'node-fetch';

interface NetlifyResponse {
  deploy_ssl_url: string;
}

export async function POST(req: NextRequest) {
  try {
    const { projectId } = await req.json();

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // ✅ Use saved HTML and CSS directly
    const html = project.html
  .replace(/<\/?body[^>]*>/gi, '') // remove <body> and </body>
  .trim();

    const css = project.css;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    ${css}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

    console.log('📦 Final HTML:', htmlContent);

    // ✅ Zip it up as index.html
    const zip = new JSZip();
    zip.folder('site')?.file('index.html', htmlContent);

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // ✅ Deploy to Netlify
    const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/deploys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NETLIFY_TOKEN}`,
        'Content-Type': 'application/zip',
      },
      body: zipBuffer,
    });

    if (!deployRes.ok) {
      const error = await deployRes.text();
      throw new Error(`Netlify deploy failed: ${error}`);
    }

    const result = await deployRes.json() as NetlifyResponse;
    console.log('✅ Deployed to:', result.deploy_ssl_url);

    return NextResponse.json({ url: result.deploy_ssl_url }, { status: 200 });
  } catch (err: any) {
    console.error('❌ Publish failed:', err);
    return NextResponse.json({ error: 'Publish failed', detail: err.message }, { status: 500 });
  }
}
