import React from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import {
    Form,
    Button,
    Alert,
    Spinner
} from 'react-bootstrap'

export default class BrowseAccounts extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            mailboxSelected: null,
            showError: false,
            processing: true,
            errorMessage: '',

        }
        this.getMailboxes();
    }

    async getMailboxes(){
        try{
            const request = await Axios.post('/api/get-email-accounts', {
                token: Cookies.get('token'),
            });
            const response = JSON.parse(JSON.stringify(request));
            this.props.setAllEmails(response.data.userEmailAddresses);
            this.setState({
                processing: false
            })
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

    updateMailboxSelection(e){
        this.setState({
            mailboxSelected: e.target.value
        })
    }

    chooseMailbox(e){
        e.preventDefault();
        if(!this.state.mailboxSelected){
            return this.setState({
                showError: true,
                errorMessage: 'You need to select an email address to use.'
            });
        }
        this.props.showInbox(this.state.mailboxSelected)
    }

    render(){
        const errorStatus = this.state.showError ? <Alert variant='danger' className='text-center'>{this.state.errorMessage}</Alert> : null;
        const status = this.state.processing ? <Alert variant='success' className='text-center'> <Spinner animation="border" size="sm" /></Alert> : errorStatus;
        const emailOptions = this.props.allEmails.map(email => (
            <option>{email}</option>
        ));
        return (
            <div id='browse-accounts'>
                <h2 style={{color: 'darkgrey'}}>Choose which mail account you want to use:</h2>
                {status}
                <Form onSubmit={this.chooseMailbox.bind(this)}>
                    <Form.Group controlId="exampleForm.ControlSelect2">
                        <Form.Label>Example multiple select</Form.Label>
                        <Form.Control as="select" id='email-selector' onChange={this.updateMailboxSelection.bind(this)} multiple>
                            {emailOptions}
                        </Form.Control>
                    </Form.Group>
                    <Button variant="primary" type="submit" className='remove-outline' id='open-mailbox-btn'>
                        Open
                    </Button>
                </Form>
            </div>
            
        )
    }
}