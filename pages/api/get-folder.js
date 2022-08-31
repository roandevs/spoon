const config = require('../../config');

const fs = require('fs');
const path = require('path');
const jwt = require("jsonwebtoken");
const {
    storage,
    account
} = require('../../system/database');


export default async function getFolder(req, res) {
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

        if(!req.body.folderHash){
            return res.status(400).json({
                message: 'You sent an invalid type of request, please provide a folder hash.',
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

        if(!fs.existsSync(path.join(`${config.spoonDir}cloud/${req.body.folderHash}`))){
            try{
                await storage.destroy({
                    where: {
                        folder_hash: req.body.folderHash
                    }
                });
            }
            catch(e){
                console.log(e);
            }
            return res.status(500).send(JSON.stringify({
                successful: false,
                message: 'The folder hash is invalid, please try contacting Roan for more help. ERROR REF: get-folder/16'
            }))
        }

        const folderExists = await storage.findOne({
            include: [account],
            where: {
                folder_hash: req.body.folderHash
            }
        });

        if(!folderExists){
            try{
                fs.rmdirSync(path.join(`${config.spoonDir}cloud/${req.body.folderHash}`), { recursive: true });
            }
            catch(e){
                console.log(e);
            }
            return res.status(400).send(JSON.stringify({
                successful: false,
                message: "The folder hash is invalid, please try contacting Roan for more help. ERROR REF: get-folder/14" 
            }))
        }
        if(folderExists.account.username !== req.user.name){
            return res.status(403).send(JSON.stringify({
                successful: false,
                message: "The folder hash is invalid, please try contacting Roan for more help. ERROR REF: get-folder/15"
            }))
        }

        const userRecords = await account.findAll({
            include: [storage],
            where: {
                username: req.user.name
            }
        })
    
        let totalUsedStorage = 0;
        for(let record in userRecords){
            for(let userStorage in userRecords[record].storages){
                const allFiles = await getFiles(path.join(`${config.spoonDir}cloud/${userRecords[record].storages[userStorage].folder_hash}`))
                for(let file in allFiles){
                    const stats = fs.statSync(path.join(allFiles[file]));
                    totalUsedStorage+=stats.size
                }
            }
        }
        
        const allFiles = await getFiles(path.join(`${config.spoonDir}cloud/${req.body.folderHash}`))
        let allFilesSorted = []
        for(let file in allFiles){
            const stats = fs.statSync(path.join(allFiles[file]));
            allFilesSorted.push({
                'name': allFiles[file].split(path.join(`${config.spoonDir}cloud/${req.body.folderHash}`))[1],
                'size': stats.size
            })
        }

        return res.send(JSON.stringify({
            folderName: folderExists.name,
            storageLimit: folderExists.account.storage_quota,
            totalUsedStorage: totalUsedStorage,
            allFiles: allFilesSorted,
            successful: true
        }))
    }
    return res.status(400).json({
        message: 'You sent an invalid type of request, please send a POST request.',
        successful: false
    });
}

async function getFiles(dir) {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
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



