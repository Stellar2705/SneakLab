const mongoose = require('mongoose');

let memoryServer = null;

/**
 * Connect strategy:
 *  - MONGO_URI set → connect to that instance (Atlas / local mongod)
 *  - MONGO_URI empty or "memory://" → spin up an in-memory MongoDB (zero-setup dev)
 */
module.exports.connectDB = async function connectDB() {
  let uri = (process.env.MONGO_URI || '').trim();

  if (!uri || uri === 'memory://') {
    // Pinned smaller binary for a fast first-time download (Windows zip ~140MB).
    process.env.MONGOMS_VERSION ||= '7.0.14';
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('sneaklab');
    console.log('🧠 In-memory MongoDB started (zero-setup mode)');
  }

  await mongoose.connect(uri);
  console.log(`✅ MongoDB Connected → ${uri.split('@').pop().split('/').slice(-2).join('')}`);
};

module.exports.disconnectDB = async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
};
