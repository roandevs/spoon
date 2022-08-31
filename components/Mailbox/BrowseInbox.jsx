import {
    Table,
    Spinner,
    Pagination,
    Button
} from 'react-bootstrap';

import React from 'react';

export default function Browse(props){
    let allMail = [];
    let paginationItems = [];
    let paginatedLimit = 6;

    const reverseOrderMail = reverseOrder(props.allMail)
    const paginatedMail = getPaginatedResult(reverseOrderMail, paginatedLimit);

    for (let number = 1; number <= Object.keys(paginatedMail).length; number++) {
        paginationItems.push(
            <Pagination.Item key={number} id={number} active={number === props.pageNumber} onClick={props.changePage.bind(this)}>
            {number}
            </Pagination.Item>,
        );
    }

    for(let mail in paginatedMail[props.pageNumber]){
        const colorScheme = paginatedMail[props.pageNumber][mail].seen ? 'darkgrey' : 'white';
        allMail.push(
            <tr className='table-row'>
            <td style={{ color: colorScheme }} id={`mail-${paginatedMail[props.pageNumber][mail].uid}`} onClick={props.viewMail}>{paginatedMail[props.pageNumber][mail].from}</td>
            <td style={{ color: colorScheme }} id={`mail-${paginatedMail[props.pageNumber][mail].uid}`} onClick={props.viewMail}>{paginatedMail[props.pageNumber][mail].subject}</td>
            <td style={{ color: colorScheme }} id={`mail-${paginatedMail[props.pageNumber][mail].uid}`} onClick={props.viewMail}>{paginatedMail[props.pageNumber][mail].date.split('+')[0]}</td>
            <td> 
            <div id='actions'>
            <Button id={`mail-${paginatedMail[props.pageNumber][mail].uid}`} onClick={props.deleteMail} className='action-btn remove-outline' variant="danger"><Trash id={`mail-${paginatedMail[props.pageNumber][mail].uid}`}/></Button>
            <Button id={`mail-${paginatedMail[props.pageNumber][mail].uid}`} onClick={props.markSeen} className=' action-btn mr-action-btn remove-outline' variant="primary"><Seen id={`mail-${paginatedMail[props.pageNumber][mail].uid}`}/></Button>

            </div>
            </td>
            </tr>
        )
    }
    
    const mailScene = allMail.length === 0 ? (
        <h3 className='no-content-msg'>No mail</h3>
    ) : allMail;

    const browseMailboxScene = props.isLoading ? (
        <div className='container text-center d-flex justify-content-center'>
            <Spinner animation="border" variant="light"/>
        </div>
    ) : mailScene;

    return (
        <div id='browse-mail'>
            <div className='container text-center d-flex justify-content-center'>
                <Table className='browse-table-style' style={{ color: 'darkgrey'}}>
                    <thead>
                        <tr>
                            <th>FROM</th>
                            <th>SUBJECT</th>
                            <th>RECEIVED</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {browseMailboxScene}
                        <Pagination id='pagination' size="sm">{paginationItems}</Pagination>
                    </tbody>
                </Table>
            </div>
        </div>
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

function Seen(props){
    return (
        <svg id={props.id} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
            <path id={props.id} d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
            <path id={props.id} d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
        </svg>
    )
}

function getPaginatedResult(emails, counter){
    let paginatedResults = {}
    let currentCounter = 0;
    let paginationLimit = currentCounter + counter;
    let page = 1;
    for(let email in emails){
        if(currentCounter === 0){
            paginatedResults[page] = [];
            paginatedResults[page].push(emails[email]);
        }
        else if(currentCounter === paginationLimit){
            page+=1
            paginationLimit = currentCounter + counter;
            paginatedResults[page] = [];
            paginatedResults[page].push(emails[email]);
        }
        else{
            paginatedResults[page].push(emails[email]);
        }
        currentCounter+=1;
    }
    return paginatedResults;
}

function reverseOrder(mail){
    let reverseMailObject = {}
    if(Object.keys(mail).length === 0){
        return {}
    }
    let reverseMailObjectKey = 1;
    for(let i=Object.keys(mail).length; i>0; i--){
        reverseMailObject[reverseMailObjectKey] = mail[i];
        reverseMailObjectKey++
    }
    return reverseMailObject;
}
