import React from 'react';
import {
    Table,
    Pagination,
    Spinner,
    Button,
    ProgressBar
} from 'react-bootstrap';

export default class BrowseFiles extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            
        }
    }

    render(){
        let allFiles = [];
        let paginationItems = [];
        let paginatedLimit = 6;

        const paginatedFiles = getPaginatedResult(this.props.allFiles, paginatedLimit);
        for (let number = 1; number <= Object.keys(paginatedFiles).length; number++) {
            paginationItems.push(
                <Pagination.Item key={number} id={number} active={number === this.props.pageNumber} onClick={this.props.changePage.bind(this)}>
                {number}
                </Pagination.Item>,
            );
        }
    
        for(let file in paginatedFiles[this.props.pageNumber]){
            allFiles.push(
                <tr className='table-row'>
                <td>{paginatedFiles[this.props.pageNumber][file].name}</td>
                <td>{this.props.bytesToSize(paginatedFiles[this.props.pageNumber][file].size)}</td>
                <td> 
                <div id='actions'>
                    <Button id={`filename-${paginatedFiles[this.props.pageNumber][file].name}`} onClick={this.props.downloadFile} className=' action-btn remove-outline' variant="primary"><DownloadBtn id={`filename-${paginatedFiles[this.props.pageNumber][file].name}`} /></Button>
                    <Button id={`filename-${paginatedFiles[this.props.pageNumber][file].name}`} onClick={this.props.deleteFile} className='action-btn mr-action-btn remove-outline' variant="danger"><Trash id={`filename-${paginatedFiles[this.props.pageNumber][file].name}`}/></Button>
                </div>
                </td>
                </tr>
            )
        }
        
        const fileScene = allFiles.length === 0 ? (
            <h3 className='no-content-msg'>No files in storage</h3>
        ) : allFiles;
    
        const browseFilesScene = this.props.isLoading ? (
            <div className='container text-center d-flex justify-content-center'>
                <Spinner animation="border" variant="light"/>
            </div>
        ) : fileScene;
        
        return (
            <div id='browse-files'>
                <div id='progress'>
                    <h5 id='progress-title'>Storage Used:</h5>
                <ProgressBar now={this.props.storageLeft} label={`${this.props.storageLeft}%`}/>
                </div>
                <div className='container text-center d-flex justify-content-center'>
                    <Table className='browse-table-style' style={{ color: 'darkgrey'}}>
                    <thead>
                        <tr>
                            <th>FILENAME</th>
                            <th>SIZE</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {browseFilesScene} 
                        <Pagination id='pagination' size="sm">{paginationItems}</Pagination>
       
                    </tbody>
                    </Table>
                </div>

            </div>
        )
    }
}

function DownloadBtn(props){
    return (
        <svg id={props.id} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
            <path id={props.id} d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
            <path id={props.id} d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
        </svg>
    )
}
function Trash(props){
    return (
        <svg id={props.id} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path id={props.id} d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path id={props.id} fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
        </svg>
    )
}

function getPaginatedResult(files, counter){
    let paginatedResults = {}
    let currentCounter = 0;
    let paginationLimit = currentCounter + counter;
    let page = 1;
    for(let file in files){
        if(currentCounter === 0){
            paginatedResults[page] = [];
            paginatedResults[page].push(files[file]);
        }
        else if(currentCounter === paginationLimit){
            page+=1
            paginationLimit = currentCounter + counter;
            paginatedResults[page] = [];
            paginatedResults[page].push(files[file]);
        }
        else{
            paginatedResults[page].push(files[file]);
        }
        currentCounter+=1;
    }
    return paginatedResults;
}