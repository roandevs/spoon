const config = require('../config');
const {
    redisGetValue, 
} = require('../system/redis');
const {
    account 
} = require('../system/database');
const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const wss = new WebSocket.Server({port: config.ports.imapWss}, () => {
    console.log(`Running IMAP websocket server on port ${config.ports.imapWss}`)
});

wss.on('connection', (ws) => {
    ws.on('close', async () => {
        if(ws['imap']){
            ws.imap.closeBox(true, () => {
                console.log('Closed box')
            });
            ws.imap.end();
        }
    })
    ws.on('message', async (message) => {
        const request = JSON.parse(message);
        switch(request.requestType){
            case "loginAuth":
                try{ 
                    const user = await authenticateUser(request.token);
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
                    
                    if(!request.selectedEmailAddr){
                        throw Error("No account given to login.")
                    }
                    
                    let imap = new Imap({
                        user: request.selectedEmailAddr,
                        password: decrypted.toString(),
                        host: config.mailserverDomain,
                        port: 993,
                        tls: true
                    });
                    imap.on('mail', async (numNewMsgs) => {
                        // send a visual flare saying YOU GOT NEW MAIL!!
                        try{
                            const mailbox = await getInitialMailbox(imap)
                            ws.send(JSON.stringify({
                                responseType: "receiveMailbox",
                                content: mailbox
                            }));
                        }
                        catch(e){
                            // SEND VISUAL ERROR TO CLIENT
                            console.log(e);
                        }
                    })
                    imap.once('ready', async function() {
                        try{
                            imap.openBox('INBOX', false, ((err, box) => {
                                if(err){
                                    console.log(err) // send visual ERROR
                                }
                            }));
                            const mailbox = await getInitialMailbox(imap);
                            ws.send(JSON.stringify({
                                responseType: "receiveMailbox",
                                content: mailbox
                            }));
                        }
                        catch(e){
                            console.log(e);
                            // SEND visual ERROR TO client
                        }
                    });
                       
    
                    imap.once('error', function(err) {
                        console.log(err);
                    });
                       
                    imap.once('end', function() {
                        console.log('Connection ended');
                    });
                    imap.connect();
                    ws['imap'] = imap;
                    ws.send(JSON.stringify({
                        responseType: "loginAuth",
                        successful: true
                    }));
                }
                catch(e){
                    console.log(e)
                    ws.send(JSON.stringify({
                        responseType: "loginAuth",
                        successful: false
                    }))
                }
                break;
            case "getBody":
                try{
                    if(!ws['imap']){
                        throw Error("Hasnt gone through login auth process in imap's websocket server.")
                    }
                    try{
                        const mailbox = await getMailContent(ws['imap'], request.messageUID);
                        ws.send(JSON.stringify({
                            responseType: "receiveBodyContent",
                            content: mailbox
                        }));
                    }
                    catch(e){
                        console.log(e);
                        //SEND VISUAL ERROR TO CLIENT SHOWING ERROR HAPPENED WHEN DOIN THIS 
                    }
                }
                catch(e){
                    console.log(e)
                    ws.send(JSON.stringify({
                        responseType: "loginAuth",
                        successful: false
                    }))
                }
                break;
            case "deleteMail":
                try{
                    if(!ws['imap']){
                        throw Error("Hasnt gone through login auth process in imap's websocket server.")
                    }
                    try{
                        await deleteMail(ws['imap'], request.messageUID);
                        ws['imap'].openBox('INBOX', false, ((err, box) => {
                            if(err){
                                console.log(err) // send visual ERROR
                            }
                        }));
                    }
                    catch(e){
                        console.log(e);
                        // SEND VISUAL ERROR TO CLIENT
                    }
                    try{
                        const mailbox = await getInitialMailbox(ws['imap']);
                        ws.send(JSON.stringify({
                            responseType: "receiveMailbox",
                            content: mailbox
                        }));
                    }
                    catch(e){
                        console.log(e);
                        // SEND VISUAL ERROR TO CLIENT
                    }
                    
                }
                catch(e){
                    console.log(e)
                    ws.send(JSON.stringify({
                        responseType: "loginAuth",
                        successful: false
                    }))
                }
                break;
            case "markSeen":
                try{
                    if(!ws['imap']){
                        throw Error("Hasnt gone through login auth process in imap's websocket server.")
                    }
                    try{
                        await markMailRead(ws['imap'], request.messageUID);
                        ws['imap'].openBox('INBOX', false, ((err, box) => {
                            if(err){
                                console.log(err) // send visual ERROR
                            }
                        }));
                    }
                    catch(e){
                        console.log(e)
                        //SEND VISUAL ERROR TO CLIENT
                    }
                    try{
                        const mailbox = await getInitialMailbox(ws['imap']);
                        ws.send(JSON.stringify({
                            responseType: "receiveMailbox",
                            content: mailbox
                        }));
                    }
                    catch(e){
                        console.log(e)
                        // SEND VISUAL ERROR TO CLIENT
                    }
              
                }
                catch(e){
                    console.log(e)
                    ws.send(JSON.stringify({
                        responseType: "loginAuth",
                        successful: false
                    }))
                }
                break;
            case "ping":
                try{
                    await authenticateUser(request.token);
                    ws.send(JSON.stringify({
                        responseType: "pong",
                        successful: true
                    }))
                }
                catch(e){
                    console.log(e)
                    ws.send(JSON.stringify({
                        responseType: "pong",
                        successful: false
                    }))
                }
                break;
            default:
                ws.send(JSON.stringify({
                    responseType: "unknownRequest",
                    successful: false
                }));
        }
    })
})


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



async function markMailRead(imap, uid){
    return new Promise((resolve, reject) => {
        let mailbox = imap.seq.fetch(uid, { 
            bodies: ''
        });
        mailbox.on('message', function(msg, seqno) {
            msg.once('attributes', (attr) => {
                if(attr.flags.includes('\\Seen')){
                    imap.seq.delFlags(seqno, 'Seen', ((err) => {
                        if(err){
                            return reject(err);
                        }
                        else{
                            imap.closeBox(true, () => {
                                return resolve();
                            })
                        }
                    }))
                }
                else{
                    imap.seq.addFlags(seqno, 'Seen', (err) => {
                        if(err){
                            return reject(err);
                        }
                        else{
                            imap.closeBox(true, () => {
                                return resolve();
                            })
                        }
                    })
                }
            })
        })

        mailbox.once('error', (err) => {
            return reject(err);
        })
    });
}

async function deleteMail(imap, uid){
    return new Promise((resolve, reject) => {
        let mailbox = imap.seq.fetch(uid, { 
            bodies: ''
        });
        mailbox.on('message', function(msg, seqno) {
            imap.seq.addFlags(seqno, 'Deleted', (err) => {
                if(err){
                    return reject(err);
                }
                else{
                    imap.closeBox(true, () => {
                        return resolve();
                    })
                }
            })
        })
        mailbox.once('error' ,(err) => {
            return reject(err)
        })
    });
}

async function getInitialMailbox(imap){
    return new Promise(async (resolve, reject) => {
        let allMail = {};
        imap.openBox('INBOX', false, ((err, box) => {
            if (err) reject(err);
            if(box.messages.total === 0){
                return resolve(allMail)
            }
            var mailbox = imap.seq.fetch(`1:${box.messages.total}`, { 
                bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)','TEXT'],
                struct: true });
            mailbox.on('message', function(msg, seqno) {
                msg.on('body', function(stream, info) {
                    var buffer = '', count = 0;
                    stream.on('data', function(chunk) {
                        count += chunk.length;
                        buffer += chunk.toString('utf8');
                    });
                    stream.once('end', function() {
                        if (info.which !== 'TEXT'){
                            const mailDetails = Imap.parseHeader(buffer)
                            const subject = mailDetails.subject ? mailDetails.subject[0] : '(no subject)'
                            allMail[seqno] = {}
                            allMail[seqno]['uid'] = seqno;
                            allMail[seqno]['date'] = mailDetails.date[0];
                            allMail[seqno]['from'] = mailDetails.from[0];
                            allMail[seqno]['subject'] = subject;
                            allMail[seqno]['to'] = mailDetails.to[0];
                        }         
                    });
                })

                msg.once('attributes', (attr) => {
                    allMail[seqno]['seen'] = attr.flags.includes('\\Seen')
                })
            });
            mailbox.once('error', function(err) {
                console.log('Fetch error: ' + err);
                return reject(err)
            });
            mailbox.once('end', function() {
                return resolve(allMail);
            });
        }));
    })
}


async function getMailContent(imap, uid){
    return new Promise((resolve, reject) => {
        let givenStreamContent;
        imap.openBox('INBOX', false, ((err, box) => {
            if (err) reject(err);
            var mailbox = imap.seq.fetch(uid, { 
                bodies: ''
            });
            mailbox.on('message', (msg, seqno) => {
                msg.on('body', async (stream, info) => {
                    givenStreamContent = stream;
                });

                msg.once('end', async () => {
                    const emailContent = await parseMessage(givenStreamContent)
                    return resolve(emailContent)
                })
            });
            mailbox.once('error', function(err) {
                console.log('Fetch error: ' + err);
                return reject(err)
            });
        }));
    })
}

async function parseMessage(stream){
    return new Promise((resolve, reject) => {
        simpleParser(stream, (err, mail) => {
            if(!mail.html){
                if(!mail.textAsHtml){
                    return resolve('');
                }
                else{
                    return resolve(mail.textAsHtml)
                }
            }                
            else{
                return resolve(mail.html)
            }
        });
    })
}






