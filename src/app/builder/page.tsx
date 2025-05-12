'use client';

import '@grapesjs/studio-sdk/style';
import StudioEditor from '@grapesjs/studio-sdk/react';
import { useEffect, useState } from 'react';

export default function BuilderPage() {
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!editorInstance) return;
    
    try {
      setIsPublishing(true);
      setPublishedUrl(null);
      
      const html = editorInstance.getHtml();
      const css = editorInstance.getCss();
      const projectData = editorInstance.getProjectData();
      
      console.log('HTML:', html);
      console.log('CSS:', css);
      console.log('Project Data:', JSON.stringify(projectData, null, 2));
      
      const saveRes = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Hello World Site',
          html,
          css,
          projectData,
          userId: 'user-001',
        }),
      });
    
      const saved = await saveRes.json();
      console.log('Save response:', saved);
    
      const publishRes = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: saved.id }),
      });
    
      const published = await publishRes.json();
      console.log('Publish response:', published);
      
      setPublishedUrl(published.url);
      alert('✅ Published at: ' + published.url);
    } catch (error) {
      console.error('Publish error:', error);
      alert('❌ Failed to publish: ' + error);
    } finally {
      setIsPublishing(false);
    }
  };
  

  const handleSave = async () => {
    if (!editorInstance) return;

    const html = editorInstance.getHtml();
    const css = editorInstance.getCss();
    const projectData = editorInstance.getProjectData();

    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hello World Site',
        html,
        css,
        projectData,
        userId: 'user-001', // TODO: Replace with actual user ID from auth
      }),
    });

    const result = await response.json();
    console.log('Save result:', result);
    alert(response.ok ? 'Saved!' : 'Failed to save');
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-2 bg-gray-800 border-b flex justify-between items-center">
        <h1 className="text-lg font-bold">Deep Seer Builder</h1>
        <div className="flex items-center gap-2">
          {publishedUrl && (
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700"
            >
              View Site
            </a>
          )}
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className={`bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 ${
              isPublishing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <StudioEditor
          options={{
            licenseKey: 'starter',
            project: {
              type: 'web',
              default: {
                pages: [
                  {
                    name: 'Home',
                    component: '<h1>Hello World</h1>',
                  },
                ],
              },
            },
            onEditor: (editor: any) => {
              setEditorInstance(editor);
            },
          }}
        />
      </div>
    </div>
  );
}