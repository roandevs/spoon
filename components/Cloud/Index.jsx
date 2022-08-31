import React from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { 
    Alert, 
    Spinner,
    Button,
    Dropdown
} from 'react-bootstrap';

import GenerateNewFolder from './GenerateNewFolder';
import BrowseFolders from './BrowseFolders';
import BrowseFiles from './BrowseFiles';
import UploadFiles from './UploadFiles';

export default class Cloud extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            storageLeft: 0,
            totalUsedStorage: 0,
            storageLimit: 0,
            folderSelected: null,
            isLoading: false,
            processing: false,
            showError: false,
            errorMessage: null,
            allFolders: [],
            allFiles: [],
            view: 'browseFolders',
            pageNumber: 1,
            progress: null,
            uploadingFile: false,
            folderName: null
        }
    }

    handleChangeStatus(data, status) { 
        const { meta, file } = data
        console.log(status, meta, file) 
    }

    bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        const measurement = sizes[i] === -2 ? 'Bytes' : sizes[i]
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + measurement;
    }

    async handleSubmit(files, givenFiles){
        this.setState({
            processing: true
        })
        let uploadSize = 0;
        givenFiles.map(givenFile => (
            uploadSize+=givenFile.file.size
        ));
        // if(this.state.totalUsedStorage+uploadSize > Number(this.state.storageLimit)){
        //     return this.setState({
        //         showError: true,
        //         processing: false,
        //         uploadingFile: false,
        //         errorMessage: `The file(s) you are uploading (${this.bytesToSize(uploadSize)}) exceeds your capacity limit of ${this.bytesToSize(this.state.storageLimit)} storage. Please remove some files to be able to upload`
        //     })
        // }
        const url = '/cloud/upload';
        const formData = new FormData();
        formData.append('token',Cookies.get('token'))
        formData.append('folderHash',this.state.folderSelected);
        givenFiles.map(givenFile => (
            formData.append('allFiles',givenFile.file)
        ));
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            },
            onUploadProgress: (data) => {
                //Set the progress value to show the progress bar
                this.setState({
                    progress: Math.round((100 * data.loaded) / data.total)
                })
            },
        }
        try{
            this.setState({
                uploadingFile: true
            })
            await Axios.post(url, formData,config);
            this.setState({
                uploadingFile: false
            })
            this.showFolder(this.state.folderSelected);
    
        }
        catch(err){
            console.log(err);
            return this.setState({
                processing: false,
                showError: true,
                uploadingFile: false,
                errorMessage: err.response.data.message
            });
        }
    }

    setAllFolders(folders){
        this.setState({
            allFolders: folders
        })
    }

    showUploadScene(e){
        e.preventDefault();
        this.setState({
            view: 'uploadFiles'
        })
    }

    async showFolder(folderHash){
        this.setState({
            folderSelected: folderHash,
            isLoading: true
        })
        try{
            const request = await Axios.post('/api/get-folder', {
                token: Cookies.get('token'),
                folderHash: folderHash
            });
            const response = JSON.parse(JSON.stringify(request));

            const usedUpStorage = Math.round(response.data.totalUsedStorage/(response.data.storageLimit/100))
            this.setState({
                storageLimit: response.data.storageLimit,
                totalUsedStorage: response.data.totalUsedStorage,
                allFiles: response.data.allFiles,
                folderName: response.data.folderName,
                isLoading: false, 
                storageLeft: usedUpStorage,
                view: 'browseFiles'
            });
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

    changePage(e){
        e.preventDefault();
        this.setState({
            pageNumber: Number(e.target.id)
        })
    }

    async downloadFile(e){
        try{
            const fileName = e.target.id.split('filename-')[1];

            const link = document.createElement('a');
            link.href = `/cloud/fetch/${this.state.folderSelected}/${fileName}`;
            link.setAttribute('download', fileName.replace(fileName[0], ''));
            document.body.appendChild(link);
            link.click();
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

    async deleteFile(e){
        try{
            const formData = new FormData(); /* ExpressJS picks up body data with FormData */
            formData.append('token',Cookies.get('token'));
            formData.append('folderHash',this.state.folderSelected);
            formData.append('fileName',e.target.id.split('filename-')[1]);
            await Axios.post('/cloud/delete', formData,{});
            this.showFolder(this.state.folderSelected);
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

    goBack(e){
        e.preventDefault();
        this.setState({
            view: 'browseFiles'
            
        })
    }

    switchFolder(e){
        e.preventDefault();
        this.showFolder(e.target.id.split('hash-')[1]);
    }



    render(){
        let view;

        const errorStatus = this.state.showError ? <Alert variant='danger' className='text-center'>{this.state.errorMessage}</Alert> : null;
        const loadingWithProgress = this.state.uploadingFile ? (
            <Alert variant='success' className='text-center'> <Spinner animation="border" size="sm" />  Uploading {this.state.progress}%</Alert>
        ) : <Alert variant='success' className='text-center'> <Spinner animation="border" size="sm" /></Alert>;
        const status = this.state.processing ? loadingWithProgress : errorStatus;
        
        switch(this.state.view){
            case "browseFolders":
                view=(
                    <div className='container text-center d-flex justify-content-center'> 
                        <BrowseFolders 
                            showFolder={this.showFolder.bind(this)} 
                            allFolders={this.state.allFolders} 
                            setAllFolders={this.setAllFolders.bind(this)}
                        />
                    </div>
                )
                break;
            case "browseFiles":
                view=(
                <div className='container text-center d-flex justify-content-center'> 
                    <BrowseFiles 
                        allFiles={this.state.allFiles} 
                        storageLeft={this.state.storageLeft}
                        pageNumber={this.state.pageNumber} 
                        isLoading={this.state.isLoading}   
                        bytesToSize={this.bytesToSize.bind(this)}
                        changePage={this.changePage.bind(this)}
                        downloadFile={this.downloadFile.bind(this)}
                        deleteFile={this.deleteFile.bind(this)} 
                    />
                </div>
                )
                break;
            case "uploadFiles":
                view=<UploadFiles
                handleChangeStatus={this.handleChangeStatus.bind(this)}
                handleSubmit={this.handleSubmit.bind(this)}
                />
                break;
            default:
                view=(
                    <div className='container text-center d-flex justify-content-center'> 
                        <BrowseFolders 
                            showFolder={this.showFolder.bind(this)} 
                            allFolders={this.state.allFolders} 
                            setAllFolders={this.setAllFolders.bind(this)}
                        />
                    </div>
                )
        }

        const userFolders = this.state.allFolders.map(folder => (
            <Dropdown.Item onClick={this.switchFolder.bind(this)} id={`hash-${folder.folderHash}`} href="#">{folder.name}</Dropdown.Item>
        ));

        const uploadFilesBtn = this.state.view !== 'browseFolders' ? (
            <Button className='remove-outline secondary-nav-btn' variant="success"  onClick={this.showUploadScene.bind(this)} type="submit">
                Upload
            </Button>
        ) : null;

        const goBackBtn = this.state.view === 'uploadFiles' ? (
            <Button className='remove-outline secondary-nav-btn' variant="danger"  onClick={this.goBack.bind(this)} type="submit">
                Go Back
            </Button>
        ) : null;

        const selectAccount = this.state.view != 'browseFolders' ? (
            (
                <Dropdown className='secondary-nav-btn'>
                <Dropdown.Toggle className='remove-outline' variant="success" id="dropdown-basic">
                    Switch Folder
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Header>Select another folder:</Dropdown.Header>
                    {userFolders}
                </Dropdown.Menu>
                </Dropdown>
            )
        ) : null;
        const selectedFolderNotice = this.state.view != 'browseFolders' ? (
            <div className='selected-notice move-down'>
                <p>Currently selected folder: {this.state.folderName}</p>
            </div>
        ) : null;
        return (
            <div id='cloud'>
                 <div className='container text-center d-flex justify-content-center'> 
                    {status}
                </div>

                <div className='container text-center d-flex justify-content-center'> 
                    {selectAccount}
                    <GenerateNewFolder showFolder={this.showFolder.bind(this)}  setAllFolders={this.setAllFolders.bind(this)}/>
                    {uploadFilesBtn}
                    {goBackBtn}
                </div>
                <div className='container text-center d-flex justify-content-center'>
                {selectedFolderNotice}
                </div>
                
                {view}
    
            </div>

        )
    }
}
