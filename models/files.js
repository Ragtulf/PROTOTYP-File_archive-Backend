import mongoose from 'mongoose'

// Working model with arrays
export const File = mongoose.model('File', {
  fileUrl: {
    type: String,
  },
  fileId: {
    type: String,
  },
  uploadedBy: {
    type: String,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date, 
    default: Date.now,
  },
})