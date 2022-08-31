import {
    ListGroup,
    Spinner
} from 'react-bootstrap';


export default function ViewMail(props){
    const mailboxScene = props.isLoadingBody ? (
        <div className='container text-center d-flex justify-content-center'>
            <Spinner animation="border" variant="light" />
        </div>
    ) : (
        <div className='container text-center d-flex justify-content-center'>
            <iframe id='mail-portal' src={"data:text/html,"+encodeURIComponent(props.body)}/>
        </div>
    );
    return (
        <div id='mailbox-scene'>
            <ListGroup>
                <ListGroup.Item className='text-left'><b>FROM: {props.from}</b> </ListGroup.Item>
                <ListGroup.Item className='text-left'><b>SUBJECT: {props.subject}</b> </ListGroup.Item>
                <ListGroup.Item>{mailboxScene}</ListGroup.Item>
            </ListGroup>
        </div>

    )
}