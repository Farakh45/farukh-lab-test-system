/**
 * Test helper: use MONGODB_URI if set (e.g. CI), otherwise start in-memory MongoDB
 * so tests run locally without a real MongoDB instance.
 */
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function getMongoUriForTest() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  if (global.__MONGO_MEMORY_URI__) {
    return global.__MONGO_MEMORY_URI__;
  }
  // Use cache inside project so it works in restricted/sandbox environments
  const downloadDir = path.join(__dirname, '..', '.cache', 'mongodb-binaries');
  if (!process.env.MONGOMS_DOWNLOAD_DIR) {
    process.env.MONGOMS_DOWNLOAD_DIR = downloadDir;
  }
  const mongod = await MongoMemoryServer.create();
  global.__MONGO_MEMORY_URI__ = mongod.getUri();
  global.__MONGO_INSTANCE__ = mongod;
  return global.__MONGO_MEMORY_URI__;
}

module.exports = { getMongoUriForTest };
