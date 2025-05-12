import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, html, css, projectData, userId } = await request.json();

    const project = await prisma.project.create({
      data: {
        name,
        html,
        css,
        projectData,
        userId
      }
    });

    return NextResponse.json(project, { status: 200 });

  } catch (error) {
    console.error('Failed to save project:', error);
    return NextResponse.json(
      { error: 'Failed to save project' },
      { status: 500 }
    );
  }
}