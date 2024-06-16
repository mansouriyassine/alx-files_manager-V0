import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.connected = false;
    this.readyPromise = new Promise((resolve, reject) => {
      this.client.on('error', (err) => {
        console.error(`Redis client not connected to the server: ${err.message}`);
        reject(err);
      });

      this.client.on('connect', () => {
        console.log('Redis client connected to the server');
        this.connected = true;
        resolve();
      });
    });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    await this.readyPromise;
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async set(key, value, duration) {
    await this.readyPromise;
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  async del(key) {
    await this.readyPromise;
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
export default redisClient;
