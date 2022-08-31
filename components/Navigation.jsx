import Image from 'next/image';
import {Navbar, Nav} from 'react-bootstrap';

export default function Navigation(props){
    const logoutBtn = props.isLoggedIn ? (
        <Nav.Link className='nav-item' href="#"><div id='logout' onClick={props.action}>LOGOUT</div></Nav.Link>
    ) : null;
    return (
        <Navbar bg="transparent"  expand="lg">
            <Navbar.Brand id='brand' onClick={props.action} href="/">
            <Image
                src="/logo.png"
                id="landing"
                
                height={32}
                width={32}
            />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className='navbar-collapse collapse justify-content-between'>
            <Nav>
                <Nav.Link className='nav-item' href="#"><div id='mail' onClick={props.action}>MAIL</div></Nav.Link>
                <Image
                    src="/fang.png"
                    id='fang'
                    height={39.5}
                    width={1.8125}
                />
                <Nav.Link className='nav-item' href="#"><div id='cloud' onClick={props.action}>CLOUD</div></Nav.Link>
                <Image
                    src="/fang.png"
                    id='fang'
                    height={39.5}
                    width={1.8125}
                />
                <Nav.Link className='nav-item' href="#"><div id='vpn' onClick={props.action}>VPN</div></Nav.Link>

            </Nav>
            <Nav className='mr-auto'>
                {logoutBtn}
            </Nav>

            
            </Navbar.Collapse>           
        </Navbar>
    )
}