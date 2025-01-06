
global.atob = require("atob");
global.Blob = require('node-blob');
const uniqueFilename = require('unique-filename');
const save = require('save-file');
let mimeDb = require("mime-db");
const express = require("express");
let cors = require('cors');
const bodyParser = require("body-parser");
let b64toBlob = require('b64-to-blob');
let qrimg = require('qr-image');
const fs = require('fs');
let QRCode = require('qrcode');
const qrcode = require('qrcode-terminal');
const https = require('https');
const request = require('request');
const utf8 = require('utf8');
const app = express();
const PORT = 3886;
//app.use(bodyParser.urlencoded({ extended: false }),cors());
app.use(bodyParser.json(),cors());
app.listen(PORT, () => console.log(` Server running on port ${PORT}`))
const { Client, LocalAuth, Location, Chat } = require('./node_modules/whatsapp-web.js/index.js');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: "yosef",
    })
});


client.initialize();

let qrsfira = 0;
client.on('qr', qr => {

    qrcode.generate(qr, {small: true});

    console.log(qrsfira);

    qrsfira = qrsfira+1;

    app.get("/qr", (req, res) => {

        qrcode.generate(qr, function (qrcode) {

            QRCode.toDataURL(qr, function (err, urlme) {
                res.send('<img src="'+urlme+'" width="300" >');

            })

        });


    })


});


client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    qrsfira = 0;


});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
    //  client.sendMessage('972525754914@c.us', 'pon222g');

    app.get("/getbyphone", (req, res) => {
//let myArgs = process.argv;
        let phoneli = req.query.phone;
        phoneli = '972' + phoneli.substring(1)+ '@c.us';
        client.getChatById(phoneli).then(r => {

            r.fetchMessages({limit: 10}).then((message) => {

                // console.log(message);
                res.send(message);
                res.status(200).end(); // Responding is important
            });

        }).catch(err => console.log(err))

    });

    app.get("/status", (req, res) => {

        client.getState().then(k =>{

            res.send(k.valueOf());
            res.status(200).end();
        }).catch(err => console.log(err));

    });


});  // נמצא בתוך ההוק כשזה מוכן


app.get("/hook", (req, res) => {
     console.log(req.query.body); // Call your action on the request here
     console.log(req.query.phone);

    client.getState().then(k =>{

        if (k.valueOf() == 'CONNECTED')
        {
            client.sendMessage(req.query.phone+'@c.us', req.query.body);
            res.send('ok');
            res.status(200).end() // Responding is important
        }
        else
        {
            res.send('error');
            res.status(200).end()
        }


    }).catch(err => console.log(err));


})


app.get("/hookgroup", (req, res) => {
    //  console.log(req.query.body) // Call your action on the request here
    client.getState().then(k =>{


        if (k.valueOf() == 'CONNECTED')
        {
            client.sendMessage(req.query.phone, req.query.body);
            res.send('ok');
            res.status(200).end();
        }
        else
        {
            res.send('error');
            res.status(200).end();
        }
    }).catch(err => console.log(err));


});

