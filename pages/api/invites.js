const config = require('../../config');
const {
    inviteCodes, 
    account
} = require('../../system/database');
const jwt = require("jsonwebtoken");

export default async function invitesAPI(req, res) {
    if(req.method === 'POST'){
        if(!req.body.requestType){
            return res.status(400).json({
                successful: false
            });
        }
        switch(req.body.requestType){
            case "create":

                try{
                    req.user = await authenticateUser(req.body.token);
                }
                catch(e){
                    console.log(e);
                    return res.status(401).json({
                        successful: false
                    });
                }

                if(!config.whitelistedAdmins.includes(req.user.name)){
                    throw Error("Not an administrator");
                }

                let invite = null;

                while(!invite){
                    let potentialInvite = Math.random().toString(26).slice(2);
                    const result = await inviteCodes.findOne({
                        where: {
                            invite_code: invite
                        }
                    })
                    if(!result){
                        invite = potentialInvite;
                    }
                }

                const userAccount = await account.findOne({where: {username: req.user.name}});

                const newInvite = await inviteCodes.create({
                    invite_code: invite,
                    generated_by: userAccount.id
                });
                return res.send(JSON.stringify({
                    "inviteCode": newInvite.invite_code,
                }));   

            case "delete":
                try{
                    const user = await authenticateUser(req.body.token);
                    if(!config.whitelistedAdmins.includes(user.name)){
                        throw Error("Not an administrator");
                    }
                }
                catch(e){
                    console.log(e);
                    return res.status(401).json({
                        successful: false
                    });
                }   
                await inviteCodes.destroy({
                    where: {
                        id: Number(req.body.inviteId)
                    }
                })
                return res.send(JSON.stringify({
                    success: true,
                }))
            case "get":
                try{
                    const user = await authenticateUser(req.body.token);
                    if(!config.whitelistedAdmins.includes(user.name)){
                        throw Error("Not an administrator");
                    }
                }
                catch(e){
                    console.log(e);
                    return res.status(401).json({
                        successful: false
                    });
                }   
                let allInvitesRecords = []
                const allInvites = await inviteCodes.findAll({
                    include: [account],
                });
                
                for(let invite in allInvites){
                    console.log(allInvites[invite].account.username)
                    allInvitesRecords.push({
                        "id": allInvites[invite].id,
                        "inviteCode":  allInvites[invite].invite_code,
                        "createdAt": allInvites[invite].created_at,
                        "generatedBy": allInvites[invite].account.username,
                        "used": allInvites[invite].used,
                        "usedBy": allInvites[invite].used_by
                    })
                }
                return res.send(JSON.stringify({
                    allInvites: allInvitesRecords,
                }))

            default:
                break;
        }
        
    }
    return res.status(400).json({
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

