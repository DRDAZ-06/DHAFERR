import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Public endpoint to list files (no authentication needed for viewing on main page)
export async function GET(request: NextRequest) {
  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({
        success: true,
        files: []
      });
    }
    
    const files = await readdir(uploadsDir);
    
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
