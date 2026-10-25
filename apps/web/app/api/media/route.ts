import { NextResponse } from 'next/server';

// In-memory / initial media assets list for campaign assets
let mediaAssets = [
  {
    id: 'med_1',
    name: 'Festival Promotional Banner',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
    type: 'image/jpeg',
    channel: 'Telegram & Email',
    dimensions: '1200x600',
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'med_2',
    name: 'Product Launch Badge',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
    type: 'image/jpeg',
    channel: 'All Channels',
    dimensions: '800x800',
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
  {
    id: 'med_3',
    name: 'Company Logo Header',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    type: 'image/jpeg',
    channel: 'Email Header',
    dimensions: '600x200',
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: mediaAssets });
}

export async function POST(request: Request) {
  try {
    const { name, url, channel, dimensions } = await request.json();

    if (!name || !url) {
      return NextResponse.json(
        { success: false, error: 'Name and Image URL are required' },
        { status: 400 }
      );
    }

    const newAsset = {
      id: `med_${Date.now()}`,
      name: name.trim(),
      url: url.trim(),
      type: 'image/jpeg',
      channel: channel || 'All Channels',
      dimensions: dimensions || 'Custom',
      created_at: new Date().toISOString(),
    };

    mediaAssets = [newAsset, ...mediaAssets];

    return NextResponse.json({ success: true, data: newAsset }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save media asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing asset ID' }, { status: 400 });
    }

    mediaAssets = mediaAssets.filter((m) => m.id !== id);
    return NextResponse.json({ success: true, message: 'Media asset deleted' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
