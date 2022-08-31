import React from 'react';
import {
    Tabs,
    Tab,
    Modal
} from 'react-bootstrap';
import Login from './Login.jsx';
import Register from './Register.jsx';

export default class Account extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            activeTab: 'login-new'
        }
    }

    switchTab(tab){
        this.setState({
            activeTab: tab
        })
    }

    render(){
        return (
            <>
                <Modal id='account-modal' show={this.props.isShowingLogin} onHide={this.props.switchLoginPrompt}>
                    <Modal.Header id='modal-header'>
                        <div className='container text-center d-flex justify-content-center'>
                            <Modal.Title id='account-title'>ACCOUNT</Modal.Title>
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs className='account-nav-tab' activeKey={this.state.activeTab} onSelect={this.switchTab.bind(this)} id="uncontrolled-tab-example">
                            <Tab  eventKey='login-new' title='Login'>
                                <br />
                                <Login changeSceneAfterAuth={this.props.changeSceneAfterAuth}/>
                            </Tab>
                            <Tab eventKey='register-new' title='Register'>
                                <br />
                                <Register changeSceneAfterAuth={this.props.changeSceneAfterAuth}/>
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                </Modal>
            </>
        )
    }
}