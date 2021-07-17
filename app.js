const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const {ApolloServer} = require('apollo-server-express');
const cors = require('cors');

// Sharp can't install on the production server :(
//const sharp = require('sharp');
const jimp = require('jimp');


const schema = require('./schema');
const {keyValidation} = require('./middleware');
const {connection} = require('./mysqlconfig');
const {createImagePaths} = require('./schema/images');

const app = express();
const port = process.env.PORT || 4000;
const gqlPath = '/graphql';

// create a write stream (in append mode)
const accessLog = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const server = new ApolloServer({
    schema,
    introspection: true,
    playground: process.env.NODE_ENV !== 'production',
    context : ({req}) => req,
});

server.applyMiddleware({app, gqlPath});
app.use(cors());
app.use(morgan('combined', { stream: accessLog }));
// TODO: I don't know what this does, other than allow https protocol to be set on requests.
app.enable('trust proxy');

// Example request
// http://localhost:4000/api/images?key=1234&group=2
app.get('/api/images', keyValidation, (req, res) => {
    if (!res.locals || res.locals.id === undefined) throw new Error("Invalid api key");
    const {group} = req.query;
    const groupFilter = group === undefined
        ? ''
        : `AND r.group_id = ${group}`
    const sql = `
        SELECT images.filename, images.title, images.description, r.group_id, g.label as group_label
        FROM images
        JOIN image_group_relationship r ON images.id = r.image_id
        JOIN image_groups g ON r.group_id  = g.id
        WHERE g.user_id = ${res.locals.id}
        ${groupFilter}`;
    connection.query(sql, 
        (err, results, fields) => {
            if (err) throw err;

            results.forEach(value => createImagePaths(value, req));
            res.send(results);
        });
    
});

app.get('/uploads/:size/:filename', async (req, res) => {
    const {size, filename} = req.params;
    const filepath = `./uploads/${filename}`;
    const sizedFilePath = `./uploads/${size}/${filename}`
    if (!fs.existsSync(filepath)) {
        res.writeHead(404, { 
            "Content-Type": "text/plain" });
        res.end("404 Not Found");
        return;
    }

    if (fs.existsSync(sizedFilePath)) {
        res.sendFile(`${__dirname}/${sizedFilePath}`);
        return;
    }

    // Extracting file extension
    const ext = path.extname(filename);
    let contentType = 'text/plain';
    // Set the content type
    if (ext === ".png") { contentType = jimp.MIME_PNG; }
    else if (ext === ".jpg" || ext === ".jpeg") { contentType = jimp.MIME_JPEG; }
    res.writeHead(200, {"Content-Type": contentType});
    // TODO: move so it can be imported
    const imageSize = {
        "large": { width: 1200, height: jimp.AUTO },
        "medium": { width: 800, height: jimp.AUTO },
        "small": { width: 400, height: jimp.AUTO }
    }
    
    /*  SHARP 1sec
    const buffer = await sharp(`${filepath}`)
        .resize(imageSize[size].width)
        .toBuffer();
    */

    /*  JIMP 34sec  */
    try {
        const image = await jimp.read(`${filepath}`);
        const final = await image.resize(imageSize[size].width, imageSize[size].height);
        await final.write(sizedFilePath);
        const buffer = await final.getBufferAsync(jimp.MIME_JPEG);
        res.end(buffer);
    } catch (err) {
        accessLog.write(err.message);
        throw new Error(err.message);
    }

    
});

app.listen(port, (err) => {
    accessLog.write(`\nServer connected on port: ${process.env.PORT}\n`);
    console.log(`🚀  Server (${process.env.NODE_ENV}) ready at http://localhost:${port}${gqlPath}`);
});