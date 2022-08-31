const config = require('../../config');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const {
    inviteCodes,
    mailbox,
    account,
    forwardings,
    emailOwners
} = require('../../system/database');
const {
    redisSetValue
} = require('../../system/redis');


export default async function register(req, res) {
    if(req.method === 'POST'){
        if(!req.body.username){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a name.',
                successful: false
            });
        }
        if(!req.body.password){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a password.',
                successful: false
            });
        }        
        if(!req.body.inviteCode){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide an invite code.',
                successful: false
            });
        }    

        if(!req.body.randomKey){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide an randomly generated key.',
                successful: false
            });

        }

        const inviteExist = await inviteCodes.findOne({
            where: {
                invite_code: req.body.inviteCode
            }
        })

        if(!inviteExist){
            return res.status(401).json({
                message: 'This invite code is not valid, please contact Roan or Jonas for more.',
                successful: false
            });
        }
        if(inviteExist.used){
            return res.status(401).json({
                message: 'This invite code has already been used, please contact Roan or Jonas for more.',
                successful: false
            });
        }

        const userExist = await account.findOne({where: {
            username: req.body.username
        }});
        
        const emailExist = await mailbox.findOne({where: {
            username: `${req.body.username}@${config.emailDomain}`
        }});

        if(userExist || emailExist){
            return res.status(400).json({
                message: 'This username has already been taken, please try another one.',
                successful: false
            });
        }

        const password = await bcrypt.hash(req.body.password, 12);
        const cipher = crypto.createCipheriv(algorithm, req.body.randomKey, config.iv);
        const encryptedPassword = Buffer.concat([cipher.update(req.body.password), cipher.final()]).toString('hex');
        
        await redisSetValue(`${req.body.username}.rndKey`, req.body.randomKey);

        const userAccount = await account.create({
            id: null,
            username: req.body.username,
            password: password,
            created_at: new Date(),
            encr_session_password: encryptedPassword,
            vip: false,
            active: true,
            storage_quota: '1073741824'
        });

        await emailOwners.create({
            account_id: userAccount.id,
            email_addr: `${req.body.username}@${config.emailDomain}`
        });

        const dateNow = new Date();
        const dateToString = dateNow.toLocaleDateString().split('/');
        const timeToString = dateNow.toLocaleTimeString().split(':');

        const year = dateToString[2]
        const month = dateToString[1]
        const day = dateToString[0];

        const hour = timeToString[0];
        const minute = timeToString[1];
        const second = timeToString[2];

        await mailbox.create({
            username: `${req.body.username}@${config.emailDomain}`,
            password: `{CRYPT}${password}`,
            name: req.body.username,
            storagebasedirectory: '/var/vmail',
            storagenode: 'vmail1',
            maildir: `${config.emailDomain}/${req.body.username}-${year}.${month}.${day}.${hour}.${minute}.${second}/`,
            quota: '1024',
            domain: config.emailDomain,
            active: '1',
            passwordlastchange: new Date(),
            created: new Date(),
        })

        await forwardings.create({
            id: null,
            address: `${req.body.username}@${config.emailDomain}`,
            forwarding: `${req.body.username}@${config.emailDomain}`,
            domain: config.emailDomain,
            dest_domain: config.emailDomain,
            is_forwarding: 1
        });

        await inviteCodes.update({
            used: true,
            used_by: req.body.username
        },
        {
            where: {
                invite_code: req.body.inviteCode
            }
        })
        
        const ip = (req.headers["X-Forwarded-For"] || req.headers["x-forwarded-for"] || '').split(',')[0] || req.client.remoteAddress;
        await axios.post(`http://toolbox.localhost/new_log`, {
            description: `spoon.pw web registration for user ${req.body.username} from the IP ${ip}`,
        });
        
        const token = jwt.sign({name: req.body.username}, config.webTokenSecret, {expiresIn: '24h'});
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


