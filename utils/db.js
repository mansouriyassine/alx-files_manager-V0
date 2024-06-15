const { MongoClient, ObjectId } = require('mongodb');
const url = 'mongodb://localhost:27017';
const dbName = 'files_manager';

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.db = null;

    this.client.connect()
      .then(() => {
        this.db = this.client.db(dbName);
        console.log('MongoDB connected');
      })
      .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
      });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    try {
      const count = await this.db.collection('users').countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting users:', error.message);
      return -1;
    }
  }

  async nbFiles() {
    try {
      const count = await this.db.collection('files').countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting files:', error.message);
      return -1;
    }
  }
}

const dbClient = new DBClient();
module.exports = { dbClient, ObjectId };
