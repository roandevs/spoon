import React from 'react';
import config from '../../config';
import BrowseInbox from './BrowseInbox';
import BrowseEmails from './BrowseEmails';
import GenerateNewEmail from './GenerateNewEmail';
import ViewEmail from './ViewEmail';
import SendMail from './SendMail';
import Cookies from 'js-cookie';


import {
    Button,
    Dropdown
} from 'react-bootstrap'

const debugMode = false;
   

export default class Mailbox extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            allEmails: [],
            selectedEmailAddr: null,
            isLoading: true,
            isLoadingBody: true,
            from: '',
            subject: '',
            mainBody: '',
            allMail: {},
            view: 'browseEmails',
            pageNumber: 1,
            sendPingFuncID: null
        }
    }

    setAllEmails(emails){
        this.setState({
            allEmails: emails
        })
    }

    WsClose(){        
        this.props.switchIMAPAuthState();
        if(this.state.sendPingFuncID){
            clearTimeout(this.state.sendPingFuncID)
        }
        if(debugMode){
            alert("Lost connection with the mailbox server.. please refresh the page.");   
            console.log("Told client we are closing the connection");
        }
    }

    sendPing(){
        this.ws.send(JSON.stringify({
            requestType: "ping",
            token: Cookies.get('token')
        }))
        const funcID = setTimeout(this.sendPing.bind(this), 2000);
        this.setState({
            sendPingFuncID: funcID
        })
    }

    WsMessage(event){
        const data = JSON.parse(event.data);
        switch(data.responseType){
            case "unknownRequest":
                return alert('An unknown response was given back from the server, please contact Roan for support.');
            case "loginAuth":
                if(!data.successful){
                    alert("Logging with your mailbox has failed, please logout and try relogging in.");
                    window.location.href = '/logout';
                }
                this.props.switchIMAPAuthState();
                this.sendPing();
                break;
            case "receiveMailbox":
                this.setState({
                    isLoading: false,
                    view: 'browseInbox',
                    allMail: data.content
                })
                break;
            case "receiveBodyContent":
                this.setState({
                    isLoadingBody: false,
                    mainBody: data.content
                });
                break;
            case "pong":
                if(!data.successful){
                    this.ws.close();
                }
                else{
                    if(debugMode){
                        console.log("Received pong back from server")
                    }
                }
                break;
            default:
                alert("Unknown response type given, please contact Roan for more.")
        }
        if(debugMode){
            console.log(`Told client we got a message: ${event.data}`);
        }
    }

    WsOpen(){
        this.ws.send(JSON.stringify({
            requestType: 'loginAuth',
            selectedEmailAddr: this.state.selectedEmailAddr,
            token: Cookies.get('token'),
        }))
        if(debugMode){
            console.log("Telling client that we opened a websocket connection successfully")
        }
    }

    componentWillUnmount(){
        if(this.ws){
            this.ws.close();
        }
    }

    WsConnect(){
        if(debugMode){
            console.log("Client wants to connect to server")
        }

        if(!this.props.isIMAPAuthenticated){
            this.ws = new WebSocket(`wss://${config.webDomain}/mailbox`);
            this.ws.onopen = this.WsOpen.bind(this);
            this.ws.onmessage = this.WsMessage.bind(this);
            this.ws.onclose = this.WsClose.bind(this, null);
        }
    }

    switchEmailAddr(e){
        e.preventDefault();
        this.setState({
            isLoading: true,
            selectedEmailAddr: e.target.id.split('emailAddr-')[1]
        })
   

        this.ws.send(JSON.stringify({
            requestType: 'loginAuth',
            selectedEmailAddr: e.target.id.split('emailAddr-')[1],
            token: Cookies.get('token'),
        }))
    }

    showInbox(emailAddr){
        this.setState({
            selectedEmailAddr: emailAddr
        })
        this.WsConnect();
    }

    viewMail(e){
        e.preventDefault();
        if(!this.state.allMail[e.target.id.split('mail-')[1]].seen){
            this.ws.send(JSON.stringify({
                requestType: 'markSeen',
                messageUID: e.target.id.split('mail-')[1],
                token: Cookies.get('token'),
            }))
        }
        this.ws.send(JSON.stringify({
            requestType: 'getBody',
            messageUID: e.target.id.split('mail-')[1],
            token: Cookies.get('token'),
        }))
        this.setState({
            from: this.state.allMail[e.target.id.split('mail-')[1]].from,
            subject: this.state.allMail[e.target.id.split('mail-')[1]].subject,
            view: 'viewEmail',
        })
    }

    changePage(e){
        e.preventDefault();
        this.setState({
            pageNumber: Number(e.target.id)
        })
    }

    goBack(){
        this.setState({
            isLoadingBody: true,
            mainBody: '',
            view: 'browseInbox'
        })
    }

    deleteMail(e){
        e.preventDefault();
        this.ws.send(JSON.stringify({
            requestType: 'deleteMail',
            messageUID: e.target.id.split('mail-')[1],
            token: Cookies.get('token'),
        }))
        
    }

    markSeen(e){
        e.preventDefault();
        this.ws.send(JSON.stringify({
            requestType: 'markSeen',
            messageUID: e.target.id.split('mail-')[1],
            token: Cookies.get('token'),
        }))
    }
    

    render(){
        let mailboxView;
        switch(this.state.view){
            case "browseEmails":
                mailboxView=<BrowseEmails
                                showInbox={this.showInbox.bind(this)}
                                allEmails={this.state.allEmails}
                                setAllEmails={this.setAllEmails.bind(this)}
                            />
                break;
            case "browseInbox":
                mailboxView=<BrowseInbox 
                                allMail={this.state.allMail} 
                                isLoading={this.state.isLoading}
                                viewMail={this.viewMail.bind(this)}
                                pageNumber={this.state.pageNumber}
                                changePage={this.changePage.bind(this)}
                                deleteMail={this.deleteMail.bind(this)}
                                markSeen={this.markSeen.bind(this)}
                            />
                break;
            case 'viewEmail':
                mailboxView=<ViewEmail 
                                from={this.state.from}
                                subject={this.state.subject}
                                body={this.state.mainBody} 
                                isLoadingBody={this.state.isLoadingBody}
                            />
                break;
            default:
                mailboxView=<BrowseEmails
                                showInbox={this.showInbox.bind(this)}
                                allEmails={this.state.allEmails}
                                setAllEmails={this.setAllEmails.bind(this)}
                            />
        }

        const userEmails = this.state.allEmails.map(email => (
            <Dropdown.Item onClick={this.switchEmailAddr.bind(this)} id={`emailAddr-${email}`} href="#">{email}</Dropdown.Item>
        ));
        const goBackButton = this.state.view === 'viewEmail' ? (
        <Button className='remove-outline secondary-nav-btn' variant="danger"  onClick={this.goBack.bind(this)} type="submit">
            <BackIcon/>
        </Button>
        ) : null;
        const sendMailButton = this.state.view !== 'browseEmails' ? (<SendMail fromAddress={this.state.selectedEmailAddr}/>) : null;
        const selectAccount  = this.state.view != 'browseEmails' ? (
            (
                <Dropdown className='secondary-nav-btn'>
                <Dropdown.Toggle className='remove-outline' variant="success" id="dropdown-basic">
                    Switch Email
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Header>Select another email:</Dropdown.Header>
                    {userEmails}
                </Dropdown.Menu>
                </Dropdown>
            )
        ) : null;
        const loggedInMessage = this.state.view != 'browseEmails' ? (
            <div className='selected-notice'>
                <p>Logged in as {this.state.selectedEmailAddr}</p>
            </div>
        ) : null;
        return (
            <div className='container text-center d-flex justify-content-center'> 
                <div id='mailbox-view'>

                    <div className='container text-center d-flex justify-content-center'>
                        <div id='mail-nav-bar' className='container text-center d-flex justify-content-center'>
                            {selectAccount}
                            {sendMailButton}
                            {goBackButton}
                            <GenerateNewEmail setAllEmails={this.setAllEmails.bind(this)}/>
       
                        </div>
                    </div>
                    <div className='container text-center d-flex justify-content-center'>
                    {loggedInMessage}   
                    </div>
                    <div className='container text-center d-flex justify-content-center'>
                        {mailboxView}
                    </div>
                </div>
            </div>
        )
    }
}

function BackIcon(){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-90deg-left" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z"/>
        </svg>
    )
}