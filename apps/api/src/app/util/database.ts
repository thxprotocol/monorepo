import mongoose, { Schema } from 'mongoose';
import { logger } from './logger';
import { v4 } from 'uuid';

const addLoggingMiddleware = () => {
    // Log all queries
    mongoose.set('debug', (collectionName: string, method: string, query: any, doc: any) => {
        logger.debug('Mongoose Query', {
            collection: collectionName,
            method,
            query,
            doc,
            timestamp: new Date().toISOString(),
        });
    });

    // Add pre-save middleware to all schemas
    mongoose.plugin((schema: Schema) => {
        schema.pre('save', function (this: any, next) {
            logger.info('Document Save', {
                collection: this.$model().collection.collectionName,
                operation: this.isNew ? 'insert' : 'update',
                documentId: this._id,
                timestamp: new Date().toISOString(),
            });
            next();
        });

        // Add pre-deleteOne middleware instead of remove (remove is deprecated)
        schema.pre('deleteOne', function (this: any, next) {
            logger.info('Document Delete', {
                collection: this.$model().collection.collectionName,
                documentId: this._id,
                timestamp: new Date().toISOString(),
            });
            next();
        });
    });
};

const connect = async (url: string) => {
    mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    });

    mongoose.connection.on('reconnectFailed', () => {
        logger.error('Unable to reconnect to MongoDB');
        process.exit();
    });

    mongoose.connection.on('open', () => {
        logger.info(`MongoDB successfully connected to ${url.split('@')[1]}`);
        addLoggingMiddleware();
    });

    mongoose.connection.on('close', () => {
        logger.info(`MongoDB successfully closed connection`);
    });

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(url);
    }
};

const truncate = async () => {
    if (mongoose.connection.readyState !== 0) {
        const { collections } = mongoose.connection;
        const promises = Object.keys(collections).map((collection) => {
            return mongoose.connection.collection(collection).deleteMany({});
        });
        await Promise.all(promises);
    }
};

const readyState = () => {
    return mongoose.connection.readyState;
};

const disconnect = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
};

const createUUID = () => {
    return v4();
};

export default {
    connect,
    truncate,
    disconnect,
    readyState,
    connection: mongoose.connection,
    createUUID,
};
