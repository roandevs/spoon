import * as React from "react";
import Cookies from 'js-cookie';
export default function Logout() {
  React.useEffect(() => {
    Cookies.set('token', '');
    window.location.href = '/';
  }, []);
  return (<div></div>)
}