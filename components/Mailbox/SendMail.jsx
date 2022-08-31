import { 
    Modal, 
    Form,
    Button,
    Spinner,
    Alert
} from "react-bootstrap";
import Axios from 'axios';
import React from 'react';
import Cookies from 'js-cookie';

export default class SendMail extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            showingSendMailPrompt: false,
            showError: false,
            errorMessage: '',
            processing: false,
            toAddress: '',
            subject: '',
            body: ''
        }
    }

    async sendMail(e){
        e.preventDefault();
        this.setState({
            processing: true
        });
        try{
            await Axios.post('/api/send-mail', {
                token: Cookies.get('token'),
                fromAddress: this.props.fromAddress,
                toAddress: this.state.toAddress,
                subject: this.state.subject,
                content: this.state.body,
            });
            this.setState({
                showError: false,
                processing: false
            });
            // show it is sent
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

    switchSendMailPromptView(){
        this.setState({
            showingSendMailPrompt: !this.state.showingSendMailPrompt
        })
    }

    updateField(e){
        switch(e.target.id){
            case "subject-field":
                this.setState({
                    subject: e.target.value
                })
                break;
            case "body-field":
                this.setState({
                    body: e.target.value
                })
                break;
            case "to-address-field":
                this.setState({
                    toAddress: e.target.value
                })
                break;
            default:
                console.log('Unknown field given.')
        }
    }

    render(){
        const errorStatus = this.state.showError ? <Alert variant='danger' className='text-center'>{this.state.errorMessage}</Alert> : null;
        const status = this.state.processing ? <Alert variant='success' className='text-center'> <Spinner animation="border" size="sm" /></Alert> : errorStatus;
        return (
            <div id='send-mail'>
                <>
                    <Modal show={this.state.showingSendMailPrompt} onHide={this.switchSendMailPromptView.bind(this)}>
                        <Modal.Header>
                        <Modal.Title>Send email:</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {status}
                            <Form>
                            <Form.Group className='form-field' controlId="to-address-field">
                                    <Form.Label>To</Form.Label>
                                    <Form.Control type='text' value={this.state.toAddress} placeholder='Email Address' onChange={this.updateField.bind(this)} />
                                </Form.Group>
                            <Form.Group className='form-field' controlId="subject-field">
                                    <Form.Label>Subject</Form.Label>
                                    <Form.Control type='text' value={this.state.subject} placeholder='Subject' onChange={this.updateField.bind(this)} />
                                </Form.Group>
                                <Form.Group className='form-field' controlId="body-field">
                                    <Form.Label>Message</Form.Label>
                                    <Form.Control  as="textarea" value={this.state.body} placeholder='Email' onChange={this.updateField.bind(this)} />
                                </Form.Group>
                                <Button variant="primary" className='form-field' onClick={this.sendMail.bind(this)} type="submit">
                                    Send
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </>
                <div id='new-email'>
                    <Button className='remove-outline secondary-nav-btn' variant="success" onClick={this.switchSendMailPromptView.bind(this)} type="submit">
                            <Envelope/>
                    </Button>
                </div>
            </div>
        )
    }
}

function Envelope(){
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.758 2.855L15 11.114v-5.73zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.73z"/>
        </svg>
    )
}