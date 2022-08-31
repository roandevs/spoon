const config = require('../../config');
const axios = require('axios');
const {
    mailbox,
    account,
    forwardings,
    emailOwners
} = require('../../system/database');
const jwt = require("jsonwebtoken");



export default async function generateNewEmail(req, res) {
    if(req.method === 'POST'){
        if(!req.body.token){
            return res.status(400).json({
                message: 'You need to provide an auth token with this request.',
                successful: false
            });
        }
        try{
            req.user = await authenticateUser(req.body.token);
        }
        catch(e){
            console.log(e);
            return res.status(401).json({
                message: 'Your authentication token was invalid, please try relogging in.',
                successful: false
            });
        }   
        const emailExist = await mailbox.findOne({where: {
            username: `${req.body.newEmailAddress}@${config.emailDomain}`
        }});

        if(emailExist){
            return res.status(400).json({
                message: 'This email address has already been taken, please try another one.',
                successful: false
            });
        }
        const accountDetails = await account.findOne({where: {
            username: req.user.name
        }})

        await emailOwners.create({
            account_id: accountDetails.id,
            email_addr: `${req.body.newEmailAddress}@${config.emailDomain}`
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
            username: `${req.body.newEmailAddress}@${config.emailDomain}`,
            password: `{CRYPT}${accountDetails.password}`,
            name: req.body.newEmailAddress,
            storagebasedirectory: '/var/vmail',
            storagenode: 'vmail1',
            maildir: `${config.emailDomain}/${req.body.newEmailAddress}-${year}.${month}.${day}.${hour}.${minute}.${second}/`,
            quota: '1024',
            domain: config.emailDomain,
            active: '1',
            passwordlastchange: new Date(),
            created: new Date(),
        })

        await forwardings.create({
            id: null,
            address: `${req.body.newEmailAddress}@${config.emailDomain}`,
            forwarding: `${req.body.newEmailAddress}@${config.emailDomain}`,
            domain: config.emailDomain,
            dest_domain: config.emailDomain,
            is_forwarding: 1
        });

        const ip = (req.headers["X-Forwarded-For"] || req.headers["x-forwarded-for"] || '').split(',')[0] || req.client.remoteAddress;
        await axios.post(`http://toolbox.localhost/new_log`, {
            description: `spoon.roan.dev user ${req.user.name} created the email ${req.body.newEmailAddress}@${config.emailDomain} from the IP ${ip}`,
        });

        return res.send(JSON.stringify({
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



