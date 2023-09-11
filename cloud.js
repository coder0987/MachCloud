function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
window.onload = () => {
    loaded();
}
function loaded() {
    let username = getCookie('username');
    let accHandler = document.getElementById('accountHandler');
    if (username) {
        accHandler.innerHTML = 'Sign Out (' + username + ')';
        accHandler.href = 'https://sso.smach.us/?signOut=true&redirect=https://cloud.smach.us/';
    }
}

window.addEventListener('message', (event) => {
    if (event.origin !== 'https://sso.smach.us' && event.origin !== 'https://sso.samts.us') {console.log(event.origin); return;}
    if (event.data != 'signOut') {
        let [username,token,signUp] = event.data.split(':');
        console.log('Signed in as ' + username);
        document.cookie = 'username=' + username + ';secure';
        document.cookie = 'token=' + token + ';secure';
        let accHandler = document.getElementById('accountHandler');
        accHandler.innerHTML = 'Sign Out (' + username + ')';
        accHandler.href = 'https://sso.smach.us/?signOut=true&redirect=https://cloud.smach.us/';
    } else {
        document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
}, false);