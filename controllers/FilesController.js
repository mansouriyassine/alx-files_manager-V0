const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class FilesController {
  static async getShow(req, res) {
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
      const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.status(200).json(file);
    } catch (error) {
      console.error('Error fetching file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    const { parentId = '0', page = '0' } = req.query;

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
      const skip = parseInt(page) * 20;
      const limit = 20;

      const query = { userId: ObjectId(userId), parentId: ObjectId(parentId) };
      const files = await dbClient.db.collection('files')
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray();

      return res.status(200).json(files);
    } catch (error) {
      console.error('Error fetching files:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async postUpload(req, res) {
    // Implementation from previous step
  }
}

module.exports = FilesController;
