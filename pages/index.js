import React from 'react';
import Navigation from '../components/Navigation';
import Account from '../components/Account/Index.jsx';
import Mailbox from '../components/Mailbox/Index.jsx';
import Cloud from '../components/Cloud/Index.jsx'
import Image from 'next/image';
import Cookies from 'js-cookie';

export default class LandingPage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isShowingLogin: false,
            isIMAPAuthenticated: false,
            isLoggedIn: Cookies.get('token'),
            scene: 'landing',
            switchTo: ''
        }
    }

    switchIMAPAuthState(e){
        this.setState({
            isIMAPAuthenticated: !this.state.isIMAPAuthenticated
        });
    }

    switchLoginPrompt(e){
        let target = e ? e.target.id : ''
        this.setState({
            isShowingLogin: !this.state.isShowingLogin,
            switchTo: target
        })
    }

    changeScene(e){
        e.preventDefault();
        if(e.target.id === 'logout'){
            return window.location.href = '/logout';
        }
    
        this.setState({
            scene: e.target.id
        })
    }

    changeSceneAfterAuth(e){
        this.setState({
            isShowingLogin: !this.state.isShowingLogin,
            scene: this.state.switchTo,
            isLoggedIn: true
        })
    }

    render(){
        let view;
        switch(this.state.scene){
            case 'landing':
                view=<Landing/>
                break;
            case 'mail':
                view=<Mailbox isIMAPAuthenticated={this.state.isIMAPAuthenticated} switchIMAPAuthState={this.switchIMAPAuthState.bind(this)}/>
                break;
            case 'cloud':
                view=<Cloud/>
                break;
            case 'vpn':
                view=<h1 style={{color: 'white'}}>VPN stuff goes here</h1>
                break;
            default: 
                alert("Unknown scene given check logs");
                console.log(this.state.scene);
        }
        const action = this.state.isLoggedIn ? this.changeScene.bind(this) : this.switchLoginPrompt.bind(this);

        return (
            <div id='spoon-home'>
                <div id='custom-navbar'>
                    <Navigation action={action} isLoggedIn={this.state.isLoggedIn} />
                </div>
                <Account 
                    isShowingLogin={this.state.isShowingLogin} 
                    changeSceneAfterAuth={this.changeSceneAfterAuth.bind(this)} 
                    switchLoginPrompt={this.switchLoginPrompt.bind(this)}
                />
                {view}
            </div>
        )
    }
}


function Landing(){
    return (
        <div id='landing'>
            <div id='header'>
                <h2>WELCOME TO SPOON</h2>
                <h5>A shiny clean fresh service for email, cloud storage and VPN all in one. </h5>
            </div>
            <div id='spoon-icon'> 
                <Image
                    src="/spoon.png"
                    height={315}
                    width={256}
                />
            </div>
        </div>
    )
}