const config = require('../../config');
const axios = require('axios');
const {
    account,
    storage
} = require('../../system/database');
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');

/* ERROR REF 12: LIKELY THAT IN THE CREATION EVENT, THE TIME IT TOOK AFTER FINDING A FREE HASH 
AND CHECKING IF THE IT EXISTS, SOMEONE ELSE REGISTERED THAT EXACT SAME HASH */

export default async function generateNewFolder(req, res) {
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

        if(!fs.existsSync(path.join(`${config.spoonDir}`))){
            return res.status(500).send(JSON.stringify({
                successful: false,
                message: "The external storage for spoon.pw is not mounted, please contact a developer to fix this."
            }))
        }

        if(!fs.existsSync(path.join(`${config.spoonDir}cloud/`))){
            return res.status(500).send(JSON.stringify({
                successful: false,
                message: "The cloud storage directory is not mounted, please contact a developer to fix this."
            }))
        }

        const accountDetails = await account.findOne({where: {
            username: req.user.name
        }});

        let availableHash = null;

        while(!availableHash){
            let potentialHash = Math.random().toString(26).slice(2);
            const result = await storage.findOne({
                where: {
                    folder_hash: potentialHash
                }
            })
            if(!result && !fs.existsSync(path.join(`${config.spoonDir}cloud/${potentialHash}`))){
                availableHash = potentialHash;
            }
        }

        try{
            await storage.create({
                account_id: accountDetails.id,
                name: req.body.newFolderName,
                folder_hash: availableHash
            });
        }
        catch(e){
            return res.status(500).json({
                message: 'An unexpected error occured when creating your storage record, please contact Roan for more help. ERROR REF: generate-new-folder/12.',
                successful: false
            });
        }

        fs.mkdirSync(path.join(`${config.spoonDir}cloud/${availableHash}`))

        return res.send(JSON.stringify({
            successful: true,
            folderHash: availableHash
        }));
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



