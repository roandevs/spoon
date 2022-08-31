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

export default class GenerateNewFolder extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            showingCreateFolderPrompt: false,
            newFolderName: null,
            showError: false,
            errorMessage: '',
            processing: false
        }
    }

    switchCreateFolderPromptView(){
        this.setState({
            showingCreateFolderPrompt: !this.state.showingCreateFolderPrompt
        })
    }

    async generateFolder(e){
        e.preventDefault();
        this.setState({
            processing: true
        });
        try{
            const generate_folder_request = await Axios.post('/api/generate-new-folder', {
                token: Cookies.get('token'),
                newFolderName: this.state.newFolderName
            });
            const generate_folder_response = JSON.parse(JSON.stringify(generate_folder_request));
    
            this.setState({
                showError: false,
                processing: false
            });

            const get_folders_request = await Axios.post('/api/get-folders', {
                token: Cookies.get('token'),
            });
            const get_folders_response = JSON.parse(JSON.stringify(get_folders_request));
            this.props.setAllFolders(get_folders_response.data.userFolderRecords);
            this.props.showFolder(generate_folder_response.data.folderHash)
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
            newFolderName: e.target.value
        })
    }

    render(){
        const errorStatus = this.state.showError ? <Alert variant='danger' className='text-center'>{this.state.errorMessage}</Alert> : null;
        const status = this.state.processing ? <Alert variant='success' className='text-center'> <Spinner animation="border" size="sm" /></Alert> : errorStatus;
        return (
            <div id='generate-new-folder'>
                <>
                    <Modal show={this.state.showingCreateFolderPrompt} onHide={this.switchCreateFolderPromptView.bind(this)}>
                        <Modal.Header>
                            <Modal.Title>Generate a folder:</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {status}
                            <Form>
                                <Form.Group className='form-field' controlId="new-folder-field">
                                    <Form.Control onChange={this.updateField.bind(this)} type="text" placeholder="Folder Name" />
                                </Form.Group>
                                <Button variant="primary" className='form-field' onClick={this.generateFolder.bind(this)} type="submit">
                                    Create
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </>
                <Button className='remove-outline secondary-nav-btn' variant="success" onClick={this.switchCreateFolderPromptView.bind(this)} type="submit">
                    New Folder
                </Button>
            </div>
        )
    }
}