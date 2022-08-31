import React from 'react';
import config from '../../config';
import Axios from 'axios';
import Cookies from 'js-cookie'
import {
    Button,
    InputGroup,
    Form,
    Modal,
    FormControl,
    Alert,
    Spinner
} from 'react-bootstrap';

export default class GenerateNewEmail extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            showingCreateMailPrompt: false,
            newEmailAddress: null,
            showError: false,
            errorMessage: '',
            processing: false
        }
    }

    switchCreateMailPromptView(){
        this.setState({
            showingCreateMailPrompt: !this.state.showingCreateMailPrompt
        })
    }

    async generateEmailAddress(e){
        e.preventDefault();
        this.setState({
            processing: true
        });
        try{
            await Axios.post('/api/generate-new-email', {
                token: Cookies.get('token'),
                newEmailAddress: this.state.newEmailAddress
            });
            this.setState({
                showError: false,
                processing: false
            });
            const request = await Axios.post('/api/get-email-accounts', {
                token: Cookies.get('token'),
            });
            const response = JSON.parse(JSON.stringify(request));
            this.props.setAllEmails(response.data.userEmailAddresses);
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
        this.setState({
            newEmailAddress: e.target.value
        })
    }

    render(){
        const errorStatus = this.state.showError ? <Alert variant='danger' className='text-center'>{this.state.errorMessage}</Alert> : null;
        const status = this.state.processing ? <Alert variant='success' className='text-center'> <Spinner animation="border" size="sm" /></Alert> : errorStatus;
        return (
            <div id='generate-new-mail'>
                <>
                    <Modal show={this.state.showingCreateMailPrompt} onHide={this.switchCreateMailPromptView.bind(this)}>
                        <Modal.Header>
                            <Modal.Title>Generate another @spoon.pw email address:</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {status}
                            <Form>
                                <Form.Group className='form-field' controlId="new-address-field">
                                    <InputGroup className="mb-3">
                                        <FormControl
                                            onChange={this.updateField.bind(this)}
                                            placeholder="Email address"
                                            aria-label="Email address"
                                            aria-describedby="basic-addon2"
                                        />
                                        <InputGroup.Append>
                                            <InputGroup.Text id="basic-addon2">@{config.emailDomain}</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                </Form.Group>
                                <Button variant="primary" className='form-field' onClick={this.generateEmailAddress.bind(this)} type="submit">
                                    Create
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </>
                <Button className='remove-outline secondary-nav-btn' variant="success" onClick={this.switchCreateMailPromptView.bind(this)} type="submit">
                    New Address
                </Button>
            </div>
        )
    }
}