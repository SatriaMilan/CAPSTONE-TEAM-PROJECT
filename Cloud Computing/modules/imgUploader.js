const { Storage } = require('@google-cloud/storage');
const path = require('path');

const pathKey = path.resolve('./serviceaccountkey.json');

const gcs = new Storage({
    projectId: process.env.PROJECT_ID,
    keyFilename: pathKey
});

const bucketName = process.env.BUCKET_NAME;
const bucket = gcs.bucket(bucketName);

const uploadPhotos = async (file) => {
    if (!file) {
        throw new Error('No file provided for upload');
    }

    const now = new Date();
    const gcsname = now.toISOString().replace(/[-:]/g, "").split(".")[0];
    const gcsFileName = gcsname + path.extname(file.hapi.filename);

    const blob = bucket.file(gcsFileName);
    const stream = blob.createWriteStream({
        metadata: {
            contentType: file.hapi.headers['content-type'],
        },
    });

    return new Promise((resolve, reject) => {
        stream.on('error', (err) => {
            reject(err);
        });

        stream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFileName}`;
            resolve(publicUrl);
        });

        file.pipe(stream);
    });
};

module.exports = {
    uploadPhotos
};
