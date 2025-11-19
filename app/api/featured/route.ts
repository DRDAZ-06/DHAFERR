import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync, promises as fs } from 'fs';
import { isAuthenticated } from '@/lib/auth';

const uploadsDir = join(process.cwd(), 'public', 'uploads');
const dataDir = join(process.cwd(), 'data');
const featuredFile = join(dataDir, 'featured.json');

export const dynamic = 'force-dynamic';

interface FeaturedSelection {
  fileName: string;
}

async function readSelection(): Promise<FeaturedSelection | null> {
  try {
    if (!existsSync(featuredFile)) {
      return null;
    }
    const raw = await fs.readFile(featuredFile, 'utf-8');
    const parsed = JSON.parse(raw);
    if (typeof parsed?.fileName === 'string') {
      return { fileName: parsed.fileName };
    }
    return null;
  } catch (error) {
    console.warn('Unable to read featured file selection:', error);
    return null;
  }
}

async function writeSelection(selection: FeaturedSelection) {
  if (!existsSync(dataDir)) {
    await fs.mkdir(dataDir, { recursive: true });
  }
  await fs.writeFile(featuredFile, JSON.stringify(selection, null, 2), 'utf-8');
}

async function buildFilePayload(fileName: string) {
  const safeName = fileName.replace(/\\/g, '/');
  if (safeName.includes('..') || safeName.includes('/')) {
    throw new Error('Invalid file name');
  }
  const filePath = join(uploadsDir, safeName);
  if (!existsSync(filePath)) {
    return null;
  }
  const stats = await fs.stat(filePath);
  return {
    name: safeName,
    size: stats.size,
    uploadDate: stats.mtime,
    url: `/uploads/${safeName}`,
  };
}

export async function GET() {
  try {
    const selection = await readSelection();
    if (!selection) {
      return NextResponse.json({ success: true, file: null });
    }

    const payload = await buildFilePayload(selection.fileName);
    if (!payload) {
      return NextResponse.json({ success: true, file: null });
    }

    return NextResponse.json({ success: true, file: payload });
  } catch (error) {
    console.error('Featured GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load featured file' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const fileName = body?.fileName;

    if (typeof fileName !== 'string' || !fileName.trim()) {
      return NextResponse.json(
        { success: false, message: 'fileName is required' },
        { status: 400 }
      );
    }

    const payload = await buildFilePayload(fileName.trim());
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'File not found in uploads directory' },
        { status: 404 }
      );
    }

    await writeSelection({ fileName: payload.name });

    return NextResponse.json({ success: true, file: payload });
  } catch (error) {
    console.error('Featured POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update featured file' },
      { status: 500 }
    );
  }
}
