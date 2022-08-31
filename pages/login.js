import Account from '../components/Account/Index.jsx';

export default function login(){
    return(
        <Account 
        isShowingLogin={true} 
        switchLoginPrompt={(() => {return true})}
        changeSceneAfterAuth={changeSceneAfterAuth} 
        /> 
    )
}

function changeSceneAfterAuth(){
    window.location.href = '/'
}