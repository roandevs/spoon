import React from 'react';
import Cookies from 'js-cookie'
import {
    Form, 
    Button,
    Alert,
    Spinner
} from 'react-bootstrap';
import Axios from 'axios';
import crypto from 'crypto';

export default class Register extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            username: '',
            password: '',
            inviteCode: '',
            processing: false,
            showError: false,
            errorMessage: ''
        }
    }

    async register(e){
        e.preventDefault();
        if(!this.state.username){
            return this.setState({
                showError: true,
                errorMessage: "Please provide a username to login with."
            });
        }
        if(!this.state.password){
            return this.setState({
                showError: true,
                errorMessage: "Please provide a password to login with."
            });
        }
        if(!this.state.inviteCode){
            return this.setState({
                showError: true,
                errorMessage: "Please provide an invite code upon registration."
            });
        }
        this.setState({
            processing: true
        });
        try{
            const randomKey = crypto.createHash('sha256').update(String(Math.random().toString(26).slice(2))).digest('base64').substr(0, 32);
            const request = await Axios.post('/api/register', {
                username: this.state.username,
                password: this.state.password,
                inviteCode: this.state.inviteCode,
                randomKey: randomKey
            });
            const response = JSON.parse(JSON.stringify(request));
            this.setState({
                showError: false,
                processing: false
            });
            Cookies.set('token', response.data.token);
            this.props.changeSceneAfterAuth();
        }
        catch(err){
            console.log(err);
            return this.setState({
                processing: false,
                showError: true,
                errorMessage: err.response.data.message
            });
        }


    }

    updateField(e){
        switch(e.target.id){
            case "register-username":
                this.setState({
                    username: e.target.value
                });
                break;
            case "register-password":
                this.setState({
                    password: e.target.value
                });
                break;
            case "register-invite-code":
                this.setState({
                    inviteCode: e.target.value
                });
                break;
            default:
                console.log("Unknown field given.")
        }

    }

    render(){
        const errorStatus = this.state.showError ? <Alert variant='danger' className='text-center'>{this.state.errorMessage}</Alert> : null;
        const status = this.state.processing ? <Alert variant='success' className='text-center'> <Spinner animation="border" size="sm" /></Alert> : errorStatus;
        return (
            <Form onSubmit={this.register.bind(this)}>
                {status}
                <Form.Group controlId="register-username" className='account-form-item'>
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" onChange={this.updateField.bind(this)} placeholder="" />
                </Form.Group>

                <Form.Group controlId="register-password" className='account-form-item'>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" onChange={this.updateField.bind(this)} placeholder="" />
                    
                </Form.Group>

                <Form.Group controlId="register-invite-code" className='account-form-item'>
                    <Form.Label>Invite Code</Form.Label>
                    <Form.Control type="text" onChange={this.updateField.bind(this)} placeholder="" />
                    <Form.Text className="text-muted">
                        This service is an invite only service. You must get a valid invite code from Roan or Jonas.
                    </Form.Text>
                </Form.Group>
                <Button variant="primary" type="submit" className='account-form-item'>
                    Register
                </Button>
            </Form>
        )
    }
}