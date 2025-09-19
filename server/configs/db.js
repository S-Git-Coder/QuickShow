import mongoose from "mongoose";

// Track connection + a singleton promise to avoid racing connections
let isConnected = false;
let connectPromise = null;

// Increase the model buffering timeout (default 10000ms) so short spikes don't fail
mongoose.set('bufferTimeoutMS', 30000);
mongoose.set('strictQuery', false);

const buildMongoUri = () => {
    const uri = process.env.MONGODB_URI || '';
    // If user already provided DB name, don't append /quickshow again
    return /\/[A-Za-z0-9_-]+(\?|$)/.test(uri.split('?')[0]) ? uri : `${uri.replace(/\/$/, '')}/quickshow`;
};

const connectDB = async () => {
    if (isConnected) return mongoose.connection;
    if (connectPromise) return connectPromise;

    const uri = buildMongoUri();
    console.log('[DB] Connecting to', uri.replace(/:\/\/.*@/, '://***:***@'));

    const options = {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 60000,
        family: 4,
        retryReads: true,
        retryWrites: true
    };

    connectPromise = mongoose.connect(uri, options)
        .then(conn => {
            isConnected = true;
            console.log('[DB] Connected');
            return conn;
        })
        .catch(err => {
            isConnected = false;
            connectPromise = null;
            console.error('[DB] Initial connect error:', err.message);
            throw err;
        });

    // Attach listeners once
    if (!mongoose.connection.listeners('error').length) {
        mongoose.connection.on('error', err => {
            isConnected = false;
            console.error('[DB] connection error:', err.message);
        });
        mongoose.connection.on('disconnected', () => {
            isConnected = false;
            console.warn('[DB] disconnected');
        });
    }

    return connectPromise;
};

export const ensureDb = async () => {
    if (isConnected) return;
    try {
        await connectDB();
    } catch (e) {
        // Surface concise error; controllers can decide how to respond
        throw new Error('Database not reachable: ' + e.message);
    }
};

export default connectDB;