// src/types/media.ts

 export interface StoredFile {
   id: string // autoIncrement key
   name: string
   type: string
   lastModified: number
   size: number
   data: ArrayBuffer
   uploadedAt: string
   
 }; 
