// src/types/media.ts

 export interface StoredFile {
   id: string 
   name: string
   type: string
   lastModified: number
   size: number
  data: Blob
   uploadedAt: string
   album?: string
   year?: number
   duration?: number // in seconds
 }; 
