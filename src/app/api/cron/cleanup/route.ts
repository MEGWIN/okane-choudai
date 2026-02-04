import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Security Check: Verify Cron Secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const supabase = await createClient()

  try {
    // 1. Find expired posts
    const { data: expiredPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, image_url')
      .lt('expires_at', new Date().toISOString())

    if (fetchError) throw fetchError
    if (!expiredPosts || expiredPosts.length === 0) {
      return NextResponse.json({ message: 'No expired posts to clean up' })
    }

    // 2. Delete images from Storage
    const filesToDelete = expiredPosts.map(post => post.image_url)
    if (filesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('posts')
        .remove(filesToDelete)
      
      if (storageError) console.error('Storage cleanup error:', storageError)
    }

    // 3. Delete records from Database
    const idsToDelete = expiredPosts.map(post => post.id)
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .in('id', idsToDelete)

    if (deleteError) throw deleteError

    return NextResponse.json({
      message: 'Cleanup successful',
      deleted_count: idsToDelete.length,
      deleted_files: filesToDelete
    })

  } catch (error: any) {
    console.error('Cleanup Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
