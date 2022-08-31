import React from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import {
    Form,
    Button,
    Alert,
    Spinner
} from 'react-bootstrap'

export default class BrowseFolders extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            folderSelected: null,
            showError: false,
            processing: true,
            errorMessage: '',

        }
        this.getFolders();
    }

    async getFolders(){
        try{
            const request = await Axios.post('/api/get-folders', {
                token: Cookies.get('token'),
            });
            const response = JSON.parse(JSON.stringify(request));
            this.props.setAllFolders(response.data.userFolderRecords);
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

    updateFolderSelection(e){
        this.setState({
            folderSelected: e.target.id.split('hash-')[1]
        })
    }

    chooseFolder(e){
        e.preventDefault();
        if(!this.state.folderSelected){
            return this.setState({
                showError: true,
                errorMessage: 'You need to select an folder to access.'
            });
        }
        this.props.showFolder(this.state.folderSelected)
    }

    render(){
        const errorStatus = this.state.showError ? <Alert variant='danger' className='text-center'>{this.state.errorMessage}</Alert> : null;
        const status = this.state.processing ? <Alert variant='success' className='text-center'> <Spinner animation="border" size="sm" /></Alert> : errorStatus;
        const folderOptions = this.props.allFolders.map(folder => (
            <option onClick={this.updateFolderSelection.bind(this)} id={`hash-${folder.folderHash}`}>{folder.name}</option>
        ));

        return (
            <div id='browse-folders'>
                <h2 style={{color: 'darkgrey'}}>Choose which folder you want to use:</h2>
                {status}
                <Form onSubmit={this.chooseFolder.bind(this)}>
                    <Form.Group controlId="exampleForm.ControlSelect2">
                        <Form.Control as="select" id='folder-selector' multiple>
                            {folderOptions}
                        </Form.Control>
                    </Form.Group>
                    <Button variant="primary" type="submit" className='remove-outline' id='open-folder-btn'>
                        Open
                    </Button>
                </Form>
            </div>
            
        )
    }
}