const Bull = require('bull');
const imageThumbnail = require('image-thumbnail');
const path = require('path');
const fs = require('fs');
const redisClient = require('./utils/redis');
const dbClient = require('./utils/db');

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const db = dbClient.getDB();
  const file = await db
    .collection('files')
    .findOne({ _id: db.ObjectId(fileId), userId: db.ObjectId(userId) });

  if (!file) {
    throw new Error('File not found');
  }

  const originalFilePath = path.join('/tmp/files_manager', fileId);
  if (!fs.existsSync(originalFilePath)) {
    throw new Error('File not found');
  }

  try {
    await Promise.all([
      imageThumbnail(originalFilePath, { width: 500, height: 500, responseType: 'base64' })
        .then((thumbnail) => {
          const thumbnailPath = `${originalFilePath}_500`;
          fs.writeFileSync(thumbnailPath, Buffer.from(thumbnail, 'base64'));
        }),
      imageThumbnail(originalFilePath, { width: 250, height: 250, responseType: 'base64' })
        .then((thumbnail) => {
          const thumbnailPath = `${originalFilePath}_250`;
          fs.writeFileSync(thumbnailPath, Buffer.from(thumbnail, 'base64'));
        }),
      imageThumbnail(originalFilePath, { width: 100, height: 100, responseType: 'base64' })
        .then((thumbnail) => {
          const thumbnailPath = `${originalFilePath}_100`;
          fs.writeFileSync(thumbnailPath, Buffer.from(thumbnail, 'base64'));
        }),
    ]);
  } catch (err) {
    console.error('Error generating thumbnails:', err);
  }
});

console.log('Worker started');
