const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');
const Queue = require('bull');
const userQueue = new Queue('userQueue');

class UserController {
  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const user = await dbClient.db.collection('users').findOne({ _id: dbClient.ObjectId(userId) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.status(200).json({ id: user._id, email: user.email });
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async postUser(req, res) {
    try {
      const { email, password } = req.body;

      // Create user in the database
      const newUser = new User({ email, password });
      await newUser.save();

      // Queue job to send welcome email
      await userQueue.add({ userId: newUser._id });

      res.status(201).json(newUser);
    } catch (err) {
      console.error('Error creating user:', err);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
}

module.exports = UserController;
