const socket = io();

const data = document.querySelector('#data')
const message = document.querySelector('input');
const $messageform = document.querySelector('form');
const $messagebutton = document.querySelector('button');
const $messages = document.querySelector('#message');
const $messagetemplate = document.querySelector('#message-template').innerHTML;
const $locationmessagetemplate = document.querySelector('#location-message-template').innerHTML;
const $sidebartemplate = document.querySelector('#sidebar-template').innerHTML;

const {Username, Room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
console.log(Username, Room);

const autoScrolling = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of the new message element
    const $newMessagesStyles = getComputedStyle($newMessage)
    const $newMessageMargin = parseInt($newMessagesStyles.marginBottom)
    const $newMessageHeight = $newMessage.offsetHeight + $newMessageMargin;
    console.log($newMessageHeight)
    //visible height 
    const visibleHeight = $messages.offsetHeight
    console.log(visibleHeight)
    //height of the message container 
    const containerHeight = $messages.scrollHeight
    console.log(containerHeight)
    //how far i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - $newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }

 }


 const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render($messagetemplate ,{
         Username: message.Username,
         message:message.text,
         createdAt:  moment(message.createdAt).format('h:mm a'),
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll()
})

socket.on('sendlocation', (url)=> {
    console.log(url.text);
    const html = Mustache.render($locationmessagetemplate , {
        Username: url.Username,
        url: url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll()
})

socket.on('roomData', ({room, users})=> {
    const html = Mustache.render($sidebartemplate , {
        users: users,
        room: room
    });
    document.querySelector('#sidebar').innerHTML = html;
})

$messageform.addEventListener('submit', (event) => {
    event.preventDefault();
    $messagebutton.setAttribute('disabled', 'disabled');
    socket.emit('sendMessage', message.value, (error)=> {
        $messagebutton.removeAttribute('disabled');
        message.value = '';
        message.focus();
        if (error) {
            return console.log(error);
        }
        console.log('message got delivered');
    });
})
const $locationbutton = document.querySelector('#location-data');
$locationbutton.addEventListener('click', () => {
    $locationbutton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition( (position) => {
        console.log(position);
        socket.emit('sendLocation', { latitude:position.coords.latitude, longitude:position.coords.longitude}, ()=> {
            console.log('location shared');
            $locationbutton.removeAttribute('disabled');
        });

    })
} )

socket.emit('join', {Username, Room}, (error)=> {
    if (error) {
        alert(error);
        location.href ='/'
    }
})