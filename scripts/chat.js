// const socket = io('https://service-5183.something.gg:2000');
const socket = io('http://95.217.118.106:2000');

const msgForm = document.getElementById('send_container');
const msgInput = document.getElementById('msg_input');
const msgContainer = document.getElementById('msg_container');

const name = prompt('enter your nickname in the Valkyrie network!', `Anonymous${Math.floor(Math.random() * 9009)}`);
appendMessage(`${name} joined the Valkyrie network!`);
socket.emit('new_user', name);

socket.on('text_message', data => {
    appendMessage(`${data.name}: ${data.message}`);
});

socket.on('user_connected', name => {
    appendMessage(`${name} connected`);
});

socket.on('user_disconnected', name => {
    appendMessage(`${name} disconnected`);
});

msgForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = msgInput.value;
    appendMessage(`${name}: ${message}`);

    socket.emit('send_message', message);
    msgInput.value = '';
});

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    msgContainer.append(messageElement);
};