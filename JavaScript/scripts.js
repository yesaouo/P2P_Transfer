const urlParams = new URLSearchParams(window.location.search);
const remotePeerId = urlParams.get("id");
// 建立 PeerJS 對象
const peer = new Peer();
var connections = [];
var fileExtension = "txt";
const qrcode = document.getElementById('qrcode');
const sendTxt = document.getElementById('sendTxt');
const sendBtn = document.getElementById('sendBtn');
const stikBtn = document.getElementById('stikBtn');
const chatCon = document.getElementById('chat-con');
const dialogSticker = document.getElementById('dialogSticker');
const dialogTextarea = document.getElementById('dialogTextarea');
const multiText = document.getElementById('multiText');
const multiSendBtn = document.getElementById('multiSendBtn');
const multiExitBtn = document.getElementById('multiExitBtn');
const hasConnect = 'Type a message'
const notConnect = 'Enter remote Peer ID or scan the QR code'

peer.on('open', (id) => {
    document.getElementById('chat-title').innerHTML = id;
    let url = window.location.protocol + "//" + window.location.host + location.pathname + "?id=" + id;
    console.log(url);
    new QRCode(qrcode, {
        text: url,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
    });
    if(remotePeerId != null) {
        const conn = peer.connect(remotePeerId);
        conn.on('open', () => {connectRemote(remotePeerId);});
    }
});
// 新的連接建立時
peer.on('connection', (conn) => {
    // 如果不存在相同的連接，則新增到陣列
    if (connections.indexOf(conn.peer) === -1) {
        connections.push(conn.peer);
        qrcode.style.display = 'none';
        sendTxt.placeholder = hasConnect;
    }
    // 斷開連接時
    conn.on('close', function() {
        var index = connections.indexOf(conn.peer);
        if (index !== -1) {
            connections.splice(index, 1);
            if(connections.length === 0) {
                qrcode.style.display = 'block';
                sendTxt.placeholder = notConnect;
            }
        }
    });
    // 收到資料時
    conn.on('data', (data) => {
        console.log(`Received data from ${conn.peer}: ${data}`);
        if (data.data instanceof ArrayBuffer) {
            console.log('Received an ArrayBuffer');
            const blob = new Blob([data.data], {type: 'application/octet-stream'});
            const url = URL.createObjectURL(blob);
            chatCon.innerHTML += 
                `<div class="chat-item item-left rela">
                    <span class="abs uname">${conn.peer}</span>
                    <span class="fl message">
                        <a href="${url}" download="${data.name}">${data.name}</a>
                    </span>
                </div>`;
        } else if (data.data instanceof Blob) {
            console.log('Received a blob');
            const url = URL.createObjectURL(data.data);
            chatCon.innerHTML += 
                `<div class="chat-item item-left rela">
                    <span class="abs uname">${conn.peer}</span>
                    <span class="fl message">
                        <a href="${url}" download="${data.name}">${data.name}</a>
                    </span>
                </div>`;
        } else {
            console.log('Received a text:', data);
            chatCon.innerHTML += 
                `<div class="chat-item item-left rela">
                    <span class="abs uname">${conn.peer}</span>
                    <span class="fl message">${data}</span>
                </div>`;
        }
        ScrollText();
    });
    console.log("當前連接的 Peer ID：", connections);
});
peer.on('error', (error) => {console.error(error);});

function sendMsg() {
    var txt = sendTxt.value;
    sendTxt.value = "";
    if(sendTxt.placeholder == notConnect) {
        peer.connect(txt).on('open', () => {connectRemote(txt);});
    }else if(sendTxt.placeholder == hasConnect){
        if(txt == "") {return;}
        if(txt.startsWith("/.")) {
            fileExtension = txt.substring(2);
            if(fileExtension == "") {fileExtension = "txt"};
            dialogTextarea.showModal();
        }else{
            if(txt.startsWith('/sticker')) {txt = `<img src="stickers${txt}.png" width="100px">`};
            chatCon.innerHTML += 
                `<div class="chat-item item-right">
                    <span class="abs uname">me</span>
                    <span class="message fr">${txt}</span>
                </div>`;
            ScrollText();
            for (var i = 0; i < connections.length; i++) {
                const conn = peer.connect(connections[i]);
                conn.on('open', () => {
                    console.log('Sending text to remote peer...');
                    conn.send(txt);
                });
            }
        }
    }else{
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        sendFile(file.name, file);
    }
}
function sendFile(name, file) {
    const url = URL.createObjectURL(file);
    chatCon.innerHTML += 
        `<div class="chat-item item-right">
            <span class="abs uname">me</span>
            <span class="message fr">
                <a href="${url}" download="${name}">${name}</a>
            </span>
        </div>`;
    ScrollText();
    for (var i = 0; i < connections.length; i++) {
        const conn = peer.connect(connections[i]);
        conn.on('open', () => {
            console.log('Sending file to remote peer...');
            conn.send({ name: name, data: file });
        });
    }
    sendTxt.disabled = false;
    sendTxt.placeholder = connections.length > 0 ? hasConnect : notConnect;
}
function fileChange() {
    var file = document.getElementById('file-input').files[0];
    if (file) {
        if(connections.length > 0) {
            sendTxt.disabled = true;
            sendTxt.placeholder = `Upload ${file.name}`;
        }
    } else {
        sendTxt.disabled = false;
        sendTxt.placeholder = connections.length > 0 ? hasConnect : notConnect;
    }
}
function connectRemote(remotePeerId) {
    if (connections.indexOf(remotePeerId) === -1) {
        connections.push(remotePeerId);
        qrcode.style.display = 'none';
        sendTxt.placeholder = hasConnect;
        console.log('Connected to ', remotePeerId);
    }
}
function ScrollText() {
    let h = document.getElementById('chat-wrap');
    h.scrollTo(0, h.scrollHeight);
}
function Keydown(e) {
    if(e.keyCode==13) {sendMsg();}
}
document.addEventListener('keydown', Keydown, false);
sendBtn.onclick = function() {sendMsg();}
stikBtn.onclick = function() {dialogSticker.showModal();}
multiSendBtn.onclick = function() {
    const blob = new Blob([multiText.value], {type: `text/${fileExtension},charset=UTF-8`});
    sendFile(`text.${fileExtension}`, blob);
    dialogTextarea.close();
}
multiExitBtn.onclick = function() {dialogTextarea.close();}
document.onclick = function(e) {
    if(e.target.id == 'dialogSticker') {dialogSticker.close();}
    else if(e.target.id.indexOf('sticker') == 0) {
        sendTxt.value = `/${e.target.id}`;
        sendMsg();
        dialogSticker.close();
    }
}
window.onload = function() {
    var str='';
    for(var i=0;i<40;i++) {str += `<img src="stickers/sticker${i}.png" class="stickers" id="sticker${i}">`;}
    dialogSticker.innerHTML = str;
};