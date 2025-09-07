import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function uploadImageLocally(fileBuffer: Buffer, fileName: string): Promise<string> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })
    
    // Generate unique filename
    const fileExtension = fileName.split('.').pop() || 'jpg'
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    
    // Save file
    const filePath = join(uploadsDir, uniqueFileName)
    await writeFile(filePath, fileBuffer)
    
    // Return public URL
    return `/uploads/${uniqueFileName}`
  } catch (error) {
    console.error('Local image upload failed:', error)
    throw error
  }
}
