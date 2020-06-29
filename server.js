import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import cloudinaryFramework from 'cloudinary'
import multer from 'multer'
import cloudinaryStorage from 'multer-storage-cloudinary'
import cors from 'cors'
import mongoose from 'mongoose'
import { File } from './models/files'

dotenv.config()

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/prototyp-techtest"
  mongoose.connect(mongoUrl, 
    { useNewUrlParser: true, 
      useUnifiedTopology: true })
  mongoose.Promise = Promise

  // Cloudinary to store images.
const cloudinary = cloudinaryFramework.v2; 
  cloudinary.config({
    cloud_name: 'dnqxxs1yn',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })

const storage = cloudinaryStorage({
    cloudinary,
    params: {
      folder: 'files',
      allowedFormats: ['jpg', 'pdf'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    },
  })
const parser = multer({ storage })

// Port
const port = process.env.PORT || 8080
const app = express()

// Middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

// Routes
app.get('/', (req, res) => {
  res.send('Hello Prototyp!')
})

// GET request to get all file uploads
app.get('/fileuploads', async (req, res) => {
  try {
    const fileList = await File.find().sort({ createdAt:'desc' }).exec()
    res.json(fileList)
  } catch (err) {
    res.status(400).json({ message: "Not working!" })
  }
})

// POST request to upload file info
app.post('/fileuploads', async (req, res) => {
  const { uploadedBy, description } = req.body
  try {
    const file = await new File({ uploadedBy, description }).save()
    res.status(201).json(file)
  } catch (err) {
    res.status(400).json({ errors: err.errors })
  } 
})

// POST request to append image to uploaded file info
app.post('/fileuploads/:id', parser.single('file'), async (req, res) => {
  const { id } = req.params
  try {
    const updatedFile = await File.findOneAndUpdate(
      { _id: id },
      { fileUrl: req.file.path, fileId: req.file.filename},
      { new: true}
    )
    res.json(updatedFile)
  } catch (err) {
    res.status(400).json({ message: "Nothing works"})
  }
})

// DELETE request to delete object from database
app.delete('/fileuploads/:id', async (req, res) => {
  const { id } = req.params
  try {
    const updatedFile = await File.findOneAndRemove(
      { _id: id }
    )
    res.status(204).json(updatedFile)
  } catch (err) {
    res.status(400).json({ message: "Nothing works"})
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
