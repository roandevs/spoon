const config = require('../../config');

const {
    emailOwners, 
    account
} = require('../../system/database');
const jwt = require("jsonwebtoken");



export default async function getEmailAccounts(req, res) {
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
        let userEmailAddresses = [];
        const emails = await account.findOne({
            include: [emailOwners],
            where: {
                username: req.user.name
            }
        })
        for(let email_addr in emails.email_owners){
            userEmailAddresses.push(emails.email_owners[email_addr].email_addr)
        }
        return res.send(JSON.stringify({
            userEmailAddresses: userEmailAddresses,
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



