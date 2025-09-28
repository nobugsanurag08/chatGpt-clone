import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadFile(buffer, 'chatgpt-clone') as { secure_url: string; public_id: string };
      
      return {
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        url: result.secure_url,
        size: file.size,
        publicId: result.public_id
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
