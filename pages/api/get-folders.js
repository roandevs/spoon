const config = require('../../config');
const path = require('path');
const fs = require('fs');
const {
    storage, 
    account
} = require('../../system/database');
const jwt = require("jsonwebtoken");



export default async function getFolders(req, res) {
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

        let userFolderRecords = [];

        const folders = await account.findOne({
            include: [storage],
            where: {
                username: req.user.name
            }
        })
        
        folders.storages.map(async (folder) => {
            if(!fs.existsSync(path.join(`${config.spoonDir}cloud/${folder.folder_hash}`))){
                await storage.destroy({
                    where: {
                        folder_hash: folder.folder_hash
                    }
                });
            }
            else{
                userFolderRecords.push({
                    'name': folder.name,
                    'folderHash': folder.folder_hash
                })
            }
        })

        return res.send(JSON.stringify({
            userFolderRecords: userFolderRecords,
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



