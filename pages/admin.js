import React from 'react';
import jwt from 'jsonwebtoken';
import config from '../config';
import Cookies from 'js-cookie';
import Axios from 'axios';
import {Spinner, Table, Button} from 'react-bootstrap';

export async function getServerSideProps({ req, res }){
    const authHeader = req.headers['cookie']
    const token = authHeader && authHeader.split('token=')[1]
    if (token == null){
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        }
    }
    try{
        const user = await authenticateUser(token);
        if(!config.whitelistedAdmins.includes(user.name)){
            throw Error("Not an administrator");
        }
        return {
            props: {}
        }
    }
    catch(e){
        console.log(e)
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        }
    }
}

export default class Administration extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            hasLoaded: false,
            allInvites: []
        }   

        this.getInvites();
    }

    async generateNewInvite(){
        try{
            await Axios.post('/api/invites', {
                token: Cookies.get('token'),
                requestType: "create"
            });
            this.getInvites();
        }
        catch(err){
            console.log(err);
            let message;
            if(err.response){
                switch(Number(err.response.status)){
                    case 403:
                       message = "You are not logged in/authorized to make this request.";
                       break;
                    case 400:
                        message = "Incorrect type of request, please make sure you fill out all the fields.";
                        break;
                    default:
                        message = "Unknown error, contact Roan."
                }
                alert(message);
            }
        }  
    }

    async deleteInvite(e){
        e.preventDefault();
        if(!e.target.id.split('invite-')[1]){
            alert('ID not given.')
        }
        try{
            await Axios.post('/api/invites', {
                token: Cookies.get('token'),
                requestType: "delete",
                inviteId: e.target.id.split('invite-')[1]
            });
            this.getInvites();
            
        }
        catch(err){
            console.log(err);
            let message;
            if(err.response){
                switch(Number(err.response.status)){
                    case 403:
                       message = "You are not logged in/authorized to make this request.";
                       break;
                    case 400:
                        message = "Incorrect type of request, please make sure you fill out all the fields.";
                        break;
                    default:
                        message = "Unknown error, contact Roan."
                }
                alert(message);
            }
        }  
    }

    async getInvites(){
        try{
            const request = await Axios.post('/api/invites', {
                token: Cookies.get('token'),
                requestType: "get"
            });
            const response = JSON.parse(JSON.stringify(request));
            this.setState({
                hasLoaded: true,
                allInvites: response.data.allInvites
            })
            
        }
        catch(err){
            console.log(err);
            let message;
            if(err.response){
                switch(Number(err.response.status)){
                    case 403:
                       message = "You are not logged in/authorized to make this request.";
                       break;
                    case 400:
                        message = "Incorrect type of request, please make sure you fill out all the fields.";
                        break;
                    default:
                        message = "Unknown error, contact Roan."
                }
                alert(message);
            }
        }  

    }
    
    render(){
        const allInvites = this.state.allInvites.map(invite => (
        <tr>
            <td>{invite.inviteCode}</td>
            <td>{invite.createdAt}</td>
            <td>{invite.generatedBy}</td>
            <td>{invite.used ? "Yes" : "No"}</td>
            <td>{invite.usedBy == '' ? "No one" : invite.usedBy}</td>
            <td>
                <Button variant="danger" className='new-entry' id={`invite-${invite.id}`} onClick={this.deleteInvite.bind(this)} type="submit">
                    Delete Invite
                </Button>
            </td>
        </tr>
        ));

        return (
            <div id='invites' className='invite-section'>
                <div className='container text-center d-flex justify-content-center'>
                    <Button variant="success" className='new-entry' onClick={this.generateNewInvite.bind(this)} type="submit">
                        New Invite
                    </Button>
                </div>
                <div className='container text-center d-flex justify-content-center'> 
                    <Table id='admin-table' className='invite-section' striped bordered hover>
                    <thead>
                        <tr>
                            <th>INVITE CODE</th>
                            <th>CREATED AT</th>
                            <th>GENERATED BY</th>
                            <th>USED?</th>
                            <th>USED BY</th>
                            <th>DELETE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.hasLoaded ? allInvites : (<Spinner animation="border" role="status"/>)}
                    </tbody>
                    </Table>
                </div>
            </div>
        )
    }
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