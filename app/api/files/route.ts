import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET - List all uploaded files
export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({
        success: true,
        files: []
      });
    }
    
    const files = await readdir(uploadsDir);
    
    // Filter out .gitkeep and get file stats
    const fileList = await Promise.all(
      files
        .filter(file => file !== '.gitkeep')
        .map(async (file) => {
          const filePath = join(uploadsDir, file);
          const stats = await stat(filePath);
          
          return {
            name: file,
            size: stats.size,
            uploadDate: stats.mtime,
            url: `/uploads/${file}`
          };
        })
    );
    
    // Sort by upload date (newest first)
    fileList.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
    
    return NextResponse.json({
      success: true,
      files: fileList
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list files' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a file
export async function DELETE(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');
    
    if (!fileName) {
      return NextResponse.json(
        { success: false, message: 'File name is required' },
        { status: 400 }
      );
    }
    
    // Security: prevent directory traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return NextResponse.json(
        { success: false, message: 'Invalid file name' },
        { status: 400 }
      );
    }
    
    const filePath = join(process.cwd(), 'public', 'uploads', fileName);
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }
    
    await unlink(filePath);
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
