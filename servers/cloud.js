const express = require('express');
const fileupload = require('express-fileupload');
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const {
    storage, 
    account 
} = require('../system/database');
const app = express();

app.use(fileupload())
app.use(bodyparser.urlencoded({extended : true}))
app.set('trust proxy', true)


app.get('/fetch/(:folderHash)/(:fileName)', async (request, response) => {
    const authHeader = request.headers['cookie']
    const token = authHeader && authHeader.split('token=')[1]
    if (token == null){
        return response.status(400).send(JSON.stringify({
            successful: false,
            message: "Invalid type of request, please provide an authentication token."
        }))
    }

    try{
        request.user = await authenticateUser(token);
    }
    catch(e){
        return response.status(401).send(JSON.stringify({
            successful: false,
            message: "You provided an invalid authentication token, please try relogging in."
        }))
    }
    if(!request.params.folderHash){
        return response.status(400).send(JSON.stringify({
            successful: false,
            message: "Invalid type of request, please provide a folder hash."
        }))
    }

    if(!request.params.fileName){
        return response.status(400).send(JSON.stringify({
            successful: false,
            message: "Invalid type of request, please provide a file name."
        }))
    }

    if(!fs.existsSync(path.join(`${config.spoonDir}`))){
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: "The external storage for spoon.pw is not mounted, please contact a developer to fix this."
        }))
    }

    if(!fs.existsSync(path.join(`${config.spoonDir}cloud/`))){
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: "The cloud storage directory is not mounted, please contact a developer to fix this."
        }))
    }

    if(!fs.existsSync(path.join(`${config.spoonDir}cloud/${request.params.folderHash}`))){
        try{
            await storage.destroy({
                where: {
                    folder_hash: request.params.folderHash
                }
            });
        }
        catch(e){
            console.log(e);
        }
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: 'The folder hash is invalid, please try contacting Roan for more help. ERROR REF: cloud/11'
        }))
    }

    const folderExists = await storage.findOne({
        include: [account],
        where: {
            folder_hash: request.params.folderHash
        }
    });

    if(!folderExists){
        try{
            fs.rmdirSync(path.join(`${config.spoonDir}cloud/${request.params.folderHash}`), { recursive: true });
        }
        catch(e){
            console.log(e);
        }
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: 'The folder hash is invalid, please try contacting Roan for more help. ERROR REF: cloud/12'
        }))

    }
    if(folderExists.account.username !== request.user.name){
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: 'The folder hash is invalid, please try contacting Roan for more help. ERROR REF: cloud/13'
        }))
    }

    if(!fs.existsSync(path.join(`${config.spoonDir}cloud/${request.params.folderHash}/${request.params.fileName}`))){
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: 'The file name given no longer exists in this directory, please try refreshing the page or contacting Roan for more help.'
        }))
    }

    response.download(path.join(`${config.spoonDir}cloud/${request.params.folderHash}/${request.params.fileName}`), request.params.fileName);
})

app.post('/delete', async (request, response) => {
    if(!request.body.token){
        return response.status(400).send(JSON.stringify({
            successful: false,
            message: "Invalid type of request, please provide an authentication token."
        }))
    }

    try{
        request.user = await authenticateUser(request.body.token);
    }
    
    catch(e){
        return response.status(401).send(JSON.stringify({
            successful: false,
            message: "You provided an invalid authentication token, please try relogging in."
        }))
    }

    if(!request.body.folderHash){
        return response.status(400).send(JSON.stringify({
            successful: false,
            message: "Invalid type of request, please provide a folder hash."
        }))
    }

    if(!request.body.fileName){
        return response.status(400).send(JSON.stringify({
            successful: false,
            message: "Invalid type of request, please provide a file name."
        }))
    }

    if(!fs.existsSync(path.join(`${config.spoonDir}`))){
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: "The external storage for spoon.pw is not mounted, please contact a developer to fix this."
        }))
    }

    if(!fs.existsSync(path.join(`${config.spoonDir}cloud/`))){
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: "The cloud storage directory is not mounted, please contact a developer to fix this."
        }))
    }

    if(!fs.existsSync(path.join(`${config.spoonDir}cloud/${request.body.folderHash}`))){
        try{
            await storage.destroy({
                where: {
                    folder_hash: request.body.folderHash
                }
            });
        }
        catch(e){
            console.log(e);
        }
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: 'The folder hash is invalid, please try contacting Roan for more help. ERROR REF: cloud/14'
        }))
    }

    const folderExists = await storage.findOne({
        include: [account],
        where: {
            folder_hash: request.body.folderHash
        }
    });

    if(!folderExists){
        try{
            fs.rmdirSync(path.join(`${config.spoonDir}cloud/${request.body.folderHash}`), { recursive: true });
        }
        catch(e){
            console.log(e);
        }
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: 'The folder hash is invalid, please try contacting Roan for more help. ERROR REF: cloud/15'
        }))

    }
    if(folderExists.account.username !== request.user.name){
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: 'The folder hash is invalid, please try contacting Roan for more help. ERROR REF: cloud/16'
        }))
    }

    if(!fs.existsSync(path.join(`${config.spoonDir}cloud/${request.body.folderHash}/${request.body.fileName}`))){
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: 'The file name given no longer exists in this directory, please try refreshing the page or contacting Roan for more help.'
        }))
    }

    fs.rmdirSync(path.join(`${config.spoonDir}cloud/${request.body.folderHash}/${request.body.fileName}`), { recursive: true });
    return response.status(200).send(JSON.stringify({
        successful: true,
    }))
})

app.post('/upload', async (request, response) => {
    let uploadSize = 0;

    if(!request.body.token){
        return response.status(400).send(JSON.stringify({
            successful: false,
            message: "Invalid type of request, please provide an authentication token."
        }))
    }

    try{
        request.user = await authenticateUser(request.body.token);
    }
    catch(e){
        return response.status(401).send(JSON.stringify({
            successful: false,
            message: "You provided an invalid authentication token, please try relogging in."
        }))
    }
    
    if(!request.body.folderHash){
        return response.status(400).send(JSON.stringify({
            successful: false,
            message: "Invalid type of request, please provide a folder hash."
        }))
    }

    if(!request.files.allFiles){
        return response.status(400).send(JSON.stringify({
            successful: false,
            message: "Invalid type of request, please provide some files to upload."
        }))
    }
    
    if(!fs.existsSync(path.join(`${config.spoonDir}`))){
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: "The external storage for spoon.pw is not mounted, please contact a developer to fix this."
        }))
    }

    if(!fs.existsSync(path.join(`${config.spoonDir}cloud/`))){
        return response.status(500).send(JSON.stringify({
            successful: false,
            message: "The cloud storage directory is not mounted, please contact a developer to fix this."
        }))
    }

    const folderHashPath = path.join(`${config.spoonDir}cloud/${request.body.folderHash}`);

    if(!fs.existsSync(folderHashPath)){
        try{
            await storage.destroy({
                where: {
                    folder_hash: request.body.folderHash
                }
            });
        }
        catch(e){
            console.log(e);
        }

        return response.status(500).send(JSON.stringify({
            successful: false,
            message: 'The folder hash is invalid, please try contacting Roan for more help. ERROR REF: cloud/14'
        }))
    }

    const folderExists = await storage.findOne({
        include: [account],
        where: {
            folder_hash: request.body.folderHash
        }
    });

    if(!folderExists){
        try{
            fs.rmdirSync(folderHashPath, { recursive: true });
        }
        catch(e){
            console.log(e);
        }

        return response.status(400).send(JSON.stringify({
            successful: false,
            message: 'The folder hash is invalid, please try contacting Roan for more help. ERROR REF: cloud/15'
        }))
    }

    if(folderExists.account.username !== request.user.name){
        return response.status(403).send(JSON.stringify({
            successful: false,
            message: 'The folder hash is invalid, please try contacting Roan for more help. ERROR REF: cloud/16'
        }))
    }

    const userRecords = await account.findAll({
        include: [storage],
        where: {
            username: request.user.name
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
    if(!request.files.allFiles.length){ /* Only one file object given */
        if(request.files.allFiles.size+totalUsedStorage > Number(folderExists.account.storage_quota)){
            return response.status(413).send(JSON.stringify({
                successful: false,
                message: 'The file(s) you are uploading is bigger than your quota capacity.'
            }))
        }

        try{
            await uploadFile(request.files.allFiles, folderHashPath)
        }
        catch(e){
            console.log(e);
            return response.status(500).send(JSON.stringify({
                successful: false,
                message: 'An unexpected error occured when uploading your files, please try contacting Roan for more help. ERROR REF: cloud/17'
            }))
        }
    }

    else{
        request.files.allFiles.map(file => {
            uploadSize+=file.size
        });

        if(uploadSize+totalUsedStorage > Number(folderExists.account.storage_quota)){
            return response.status(413).send(JSON.stringify({
                successful: false,
                message: 'The file(s) you are uploading is bigger than your quota capacity.'
            }))
        }
        
        request.files.allFiles.map( async (file) => { /* Array of file objects given */
            try{
                await uploadFile(file, folderHashPath)
            }
            catch(e){
                console.log(e);
                return response.status(500).send(JSON.stringify({
                    successful: false,
                    message: 'An unexpected error occured when uploading your files, please try contacting Roan for more help. ERROR REF: cloud/18'
                }))

            }
        })
    }

    return response.status(200).send(JSON.stringify({
        successful: true,
    }))

})

app.listen(config.ports.cloudHttpApi, () => {
    console.log(`Cloud express api running on port ${config.ports.cloudHttpApi}`)
});



async function getFiles(dir) {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
}


async function uploadFile(fileObj, uploadPath){
    return new Promise((resolve, reject) => {
        fileObj.mv(path.join(uploadPath+`/${fileObj.name}`), (err) => {
            if (err) {
                reject(err);
            }
            else{
                return resolve();
            }
        })
    })
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
