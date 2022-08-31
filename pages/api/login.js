const config = require('../../config');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const {account} = require('../../system/database');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const {
    client, 
    redisGetValue, 
    redisExecMulti,
    redisSetValue
} = require('../../system/redis');


export default async function login(req, res) {
    if(req.method === 'POST'){
        if(!req.body.username){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a name',
                successful: false
            });
        }
        if(!req.body.password){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a password',
                successful: false
            });
        }   
        if(!req.body.randomKey){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a random key.',
                successful: false
            }); 
        }
        const potentialUsername = req.body.username.split(`@${config.emailDomain}`);
        const username = potentialUsername.length > 1 ? potentialUsername[0] : req.body.username;
        const userAccount = await account.findOne({where: {
            username: username
        }});
        if(!userAccount){
            return res.status(401).json({
                message: 'The username you gave was not found, please register an account or try another username.',
                successful: false
            });
        }
        const password = req.body.password;
        const ip = (req.headers["X-Forwarded-For"] || req.headers["x-forwarded-for"] || '').split(',')[0] || req.client.remoteAddress;
        const floodKey = `${ip}.flood`;
        const floodCount = client.get(floodKey);
    
        if(!await bcrypt.compare(password, userAccount.password)){
            if(floodCount){
                let multi = client.multi();
                multi.incr(floodKey);
                multi.expire(floodKey, 3600);
                const result = await redisExecMulti(multi);
                let count = result[0]
                if(count >= 5){
                    return res.status(429).json({
                        message: 'You have reached the maximum number of logins. Please wait for an hour or contact roan.',
                        successful: false
                    });
                }
            }
            else{
                client.setex(floodKey, 3600, 1);
            }
            return res.status(401).json({
                message: 'Your password is incorrect.',
                successful: false
            });
        }

        const failureCount = await redisGetValue(floodKey)
        if(failureCount){
            let maxAttemptsExceeded = Number(failureCount) >= 5
            if(maxAttemptsExceeded){
                return res.status(429).json({
                    message: 'You have reached the maximum number of logins. Please wait for an hour or contact roan.',
                    successful: false
                }); 
            }
            else{
                client.del(floodKey);
            }
        }
        const cipher = crypto.createCipheriv(algorithm, req.body.randomKey, config.iv);
        const encryptedPassword = Buffer.concat([cipher.update(req.body.password), cipher.final()]).toString('hex');
        await redisSetValue(`${username}.rndKey`, req.body.randomKey);
        await account.update({
            encr_session_password: encryptedPassword
        },
        {
            where: {
                username: username
            }
        }) 
        await axios.post(`http://toolbox.localhost/new_log`, {
            description: `spoon.roan.dev web login for user ${username} from the IP ${ip}`,
        })
        const token = jwt.sign({name: username}, config.webTokenSecret, {expiresIn: '24h'});
        return res.send(JSON.stringify({
            message: '',
            successful: true,
            token: token
        }))
    }
    return res.status(400).json({
        message: 'You sent an invalid type of request, please send a POST request.',
        successful: false
    });
}




