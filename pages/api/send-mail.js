const config = require('../../config');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const {account} = require('../../system/database');
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const {
    redisGetValue, 
} = require('../../system/redis');


export default async function sendMail(req, res) {
    if(req.method === 'POST'){
        if(!req.body.token){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide an auth token',
                successful: false
            });
        }
        if(!req.body.fromAddress){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a from address.',
                successful: false
            });

        }
        if(!req.body.toAddress){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide an email address to send to.',
                successful: false
            });

        }
        if(!req.body.subject){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide an email subject',
                successful: false
            });
        }   
        if(!req.body.content){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide an email body/content.',
                successful: false
            }); 
        }

        try{
            const user = await authenticateUser(req.body.token);
            const rndKey = await redisGetValue(`${user.name}.rndKey`);
            const userDetails = await account.findOne({
                where: {
                    username: user.name
                }
            })
            if(!rndKey){
                throw Error("No random key stored in memory, user didn't go through web login process.")
            }
            if(!userDetails.encr_session_password){
                throw Error("No encrypted password stored in database, user didn't go through web login process.")
            }

            const decipher = crypto.createDecipheriv(algorithm, rndKey, config.iv);
            const decrypted = Buffer.concat([decipher.update(Buffer.from(userDetails.encr_session_password, 'hex')), decipher.final()]);

            const transporter = nodemailer.createTransport({ 
                host: config.mailserverDomain,
                port: 587,
                secure: false,
                auth: {
                     user: req.body.fromAddress,
                     pass: decrypted.toString()
                } 
            });

            transporter.sendMail({
                from: req.body.fromAddress, 
                to: req.body.toAddress, 
                subject: req.body.subject, 
                text: req.body.content, 
            });
        }
        catch(e){
            console.log(e);
            return res.status(401).json({
                message: 'There was an error when authorizing your request, please try relogging in or contacting Roan for more.',
                successful: false
            }); 
        }
        
        return res.send(JSON.stringify({
            message: '',
            successful: true
        }))
    }
    return res.status(400).json({
        message: 'You sent an invalid type of request, please send a POST request.',
        successful: false
    });
}

async function authenticateUser(token){
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.webTokenSecret, (err, user) => {
            if (err) {
                reject(err);
            }
            else{
                return resolve(user);
            }
        })
    });  
}

