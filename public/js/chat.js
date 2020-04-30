const socket = io();

//elemets

$messageForm = document.querySelector('#message-form');
$messageInput = $messageForm.querySelector('input');
$messageSendButton = $messageForm.querySelector('button');
$sendLocationButton = document.querySelector('#send-location');
$messages = document.querySelector('#messages');

//templates

const messageTemplate = document.querySelector('#message-template').innerHTML;
const linkMessageTemplate = document.querySelector('#link-message-template')
  .innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//scroll adjustment
const autoscroll = () => {
  //new message element
  const $newMessage = $messages.lastElementChild;

  //height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const $newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messages.offsetHeight;

  //height of messages container
  const containerHeight = $messages.scrollHeight;

  //how far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - $newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

//socket listen for messages
socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    createdBy: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

//socket listen for location
socket.on('location', (message) => {
  const html = Mustache.render(linkMessageTemplate, {
    createdBy: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

//listen the list of users in the room
socket.on('roomData', (message) => {
  const html = Mustache.render(sidebarTemplate, {
    room: message.room,
    users: message.users,
  });

  document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  $messageSendButton.setAttribute('disabled', 'disabled');
  const message = e.target.elements.message.value;

  socket.emit('newMessage', message, (error) => {
    $messageSendButton.removeAttribute('disabled');
    $messageInput.value = '';
    $messageInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log('Message Delivered!');
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('geolocation is not supported by your browser!');
  }
  $sendLocationButton.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute('disabled');
        console.log('Location Delivered!');
      }
    );
  });
});

//getting user data from the location search
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//sending data back to server
socket.emit('join', { username, room }, (error) => {
  if (error) {
    return alert(error);
  }
});
