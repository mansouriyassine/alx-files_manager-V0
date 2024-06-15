const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class FilesController {
  static async postUpload(req, res) {
    const { name, type, data, parentId = 0, isPublic = false } = req.body;

    // Check if the user is authenticated
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve user ID from Redis
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input fields
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type or invalid type' });
    }

    if ((type === 'file' || type === 'image') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      // Check if parentId is valid if provided
      if (parentId !== 0) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: dbClient.ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      // Handle file data if type is 'file' or 'image'
      let localPath = null;
      if (type === 'file' || type === 'image') {
        // Get storing folder path
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

        // Decode base64 data
        const buffer = Buffer.from(data, 'base64');

        // Generate a unique filename using UUID
        const filename = uuidv4();
        localPath = path.join(folderPath, filename);

        // Write file to disk
        fs.writeFileSync(localPath, buffer);
      }

      // Create new file object
      const newFile = {
        userId: dbClient.ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: dbClient.ObjectId(parentId),
        localPath: type === 'file' || type === 'image' ? localPath : null
      };

      // Insert into DB
      const result = await dbClient.db.collection('files').insertOne(newFile);
      newFile.id = result.insertedId;

      // Return response
      return res.status(201).json(newFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
