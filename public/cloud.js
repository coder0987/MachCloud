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
        document.getElementById('postSignIn').removeAttribute('hidden');
        document.getElementById('preSignIn').setAttribute('hidden','hidden');
        fetch('/signIn', {
            method: 'POST',
            credentials: 'include'
        });
        //Get starting dir contents
        fetchDir('/userdata/' + username.toLowerCase() + '/');

    }
}

async function fetchDir(path) {
    const manifest = await fetch(path, {
        method: 'GET',
        credentials: 'include'
    });
    const manifestJSON = manifest.json();
    loadFolder(manifestJSON, path);
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
        document.getElementById('postSignIn').removeAttribute('hidden');
        document.getElementById('preSignIn').setAttribute('hidden','hidden');
        fetch('/signIn', {
            method: 'POST',
            credentials: 'include'
        });
    } else {
        let accHandler = document.getElementById('accountHandler');
        accHandler.innerHTML = 'Sign In';
        accHandler.href = 'https://sso.smach.us/?redirect=https://cloud.smach.us/';
        document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.getElementById('preSignIn').removeAttribute('hidden');
        document.getElementById('postSignIn').setAttribute('hidden','hidden');
    }
}, false);

function loadFolder(manifest, path) {
    manifest = JSON.parse(manifest);
    let baseFolder = document.getElementById('baseFolder');
    for (let i in manifest) {
        let fileItem = document.createElement('a');
        fileItem.href = manifest[i];
        fileItem.innerHTML = manifest[i];
        fileItem.classList.add('col');
        baseFolder.appendChild(fileItem);
    }
}