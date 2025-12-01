import { NextRequest, NextResponse } from 'next/server';
import { GitHubAPI } from '@/lib/github/api';

// Tipos para las peticiones
interface GitHubRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  content?: string;
  message?: string;
  sha?: string;
  token: string;
  owner: string;
  repo: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    const token = searchParams.get('token');
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    if (!path || !token || !owner || !repo) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const github = new GitHubAPI(token, owner, repo);
    const content = await github.readFile(path);

    return NextResponse.json({ content });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error reading file' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GitHubRequest = await request.json();
    const { path, content, message, token, owner, repo } = body;

    if (!path || !content || !message || !token || !owner || !repo) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const github = new GitHubAPI(token, owner, repo);
    await github.createFile(path, content, message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error creating file' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: GitHubRequest = await request.json();
    const { path, content, message, sha, token, owner, repo } = body;

    if (!path || !content || !message || !sha || !token || !owner || !repo) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const github = new GitHubAPI(token, owner, repo);
    await github.updateFile(path, content, message, sha);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error updating file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body: GitHubRequest = await request.json();
    const { path, message, sha, token, owner, repo } = body;

    if (!path || !message || !sha || !token || !owner || !repo) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const github = new GitHubAPI(token, owner, repo);
    await github.deleteFile(path, message, sha);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error deleting file' },
      { status: 500 }
    );
  }
}

