const fs = require('fs');
const { ObjectId } = require('mongodb');
const mime = require('mime-types');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class FilesController {
  // Existing methods...

  static async getFile(req, res) {
    const fileId = req.params.id;

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

    try {
      // Check if the file exists and is accessible
      const filter = { _id: ObjectId(fileId) };
      const file = await dbClient.db.collection('files').findOne(filter);

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Check if the file is public or the user is the owner
      if (!file.isPublic && file.userId.toString() !== userId) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Check if the file is a folder
      if (file.type === 'folder') {
        return res.status(400).json({ error: 'A folder doesn\'t have content' });
      }

      // Check if the file is locally present
      const localPath = file.localPath;
      if (!fs.existsSync(localPath)) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Get MIME type based on the file name
      const mimeType = mime.lookup(file.name);

      // Read the file content
      const fileContent = fs.readFileSync(localPath, 'utf-8');

      // Return the file content with the correct MIME type
      res.set('Content-Type', mimeType);
      return res.status(200).send(fileContent);
    } catch (error) {
      console.error('Error fetching file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putPublish(req, res) {
    // Existing method
  }

  static async putUnpublish(req, res) {
    // Existing method
  }

  static async getShow(req, res) {
    // Existing method
  }

  static async getIndex(req, res) {
    // Existing method
  }

  static async postUpload(req, res) {
    // Existing method
  }
}

module.exports = FilesController;
