window.onload = function () {
    initDragElement();
};
const axios =  require('axios');
let vidList;
var currentTrack;
const fs = require("fs");
function exitPopup(el) {
    if (el.parentElement.parentElement.id == "songResults") {
        vidList = {};
        document.getElementById("myList").innerHTML = "";
    }
    if (el.parentElement.parentElement.id == "musicplayer") {
        currentTrack.pause();
        document.getElementById("playButton").innerHTML = "<i class=\"bi bi-play-fill\" style=\"font-size: xxx-large; color: white;\"></i>";
    }
    el.parentElement.parentElement.style.display = "none";
}

/* command line */
var modelviewer = [
    "model",
    "3d",
    "3D",
    "viewer",
    "viewport"
];
var notepad = [
    "notepad",
    "note",
    "write",
    "notebook",
    "document"
];
var music = ["music", "songs", "song", "player"];
var modelviewer_box = document.getElementById("modelviewer");
var notepad_box = document.getElementById("notepad");
var music_box = document.getElementById("musicplayer");
var musicList = [];
var index = 0;
function search(ele) {
    if (event.key === "Enter") {
        if (modelviewer.some((v) => ele.value.includes(v))) {
            if (modelviewer_box.style.display === "none") {
                modelviewer_box.style.display = "block";
            } else {
                modelviewer_box.style.display = "none";
            }
        }
        if (notepad.some((v) => ele.value.includes(v))) {
            if (notepad_box.parentElement.style.display === "none") {
                notepad_box.parentElement.style.display = "block";
            } else {
                notepad_box.parentElement.style.display = "none";
            }
        }
        if (music.some((v) => ele.value.includes(v))) {
            if (music_box.style.display === "none") {
                music_box.style.display = "block";
                loadMusic();
            } else {
                musicList = [];
                index = 0;
                currentTrack.pause();
                music_box.style.display = "none";
            }
        }

        ele.value = "";
    }
}

/* text editor */
const EditorJS = require('@editorjs/editorjs');
const editor = new EditorJS({
    holder: "notepad",
    autofocus: true,
    tools: {
        header: {
            class: Header,
            inlineToolbar: true
        },
        paragraph: {
            class: Paragraph,
            inlineToolbar: true
        },
        delimiter: Delimiter,
        embed: {
            class: Embed,
            config: {
                services : {
                    youtube: true
                }
            }
        },
        image: SimpleImage,
        raw: RawTool
    }
});

var key = "onlyVIPA";

function editorClear() {
    editor.isReady.then(() => {
        editor.clear();
    }).catch((reason) => {
        console.log(`Editor.js initialization failed because of ` + reason + ".");
    });
}

document.getElementById("load").addEventListener("change", function () {
    var fr = new FileReader();
    fr.onload = function () {
        var bytes = CryptoJS.AES.decrypt(fr.result, key);
        var editorData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        if (editorData.blocks.length == 0) {
            alert("Cannot load empty VIPA note file.");
            return;
        }
        editor.isReady.then(() => {
            editor.render(editorData);
        }).catch((reason) => {
            console.log(`Editor.js initialization failed because of ` + reason + ".");
        });
    };

    fr.readAsText(this.files[0]);
});

const {dialog} = require("@electron/remote");
function downloadObjectAsJson(exportObj, exportName) {
    
    var dataStr = JSON.stringify(exportObj);
    var ciphertext = CryptoJS.AES.encrypt(dataStr, key).toString();

    let entry = dialog.showSaveDialog({
        title: "Save your VIPA note",
        filters: [
            { name: 'VIPANOTE', extensions: ['vipanote'] },
        ]
    }).then((bob) => {
        fs.writeFile(bob.filePath, ciphertext, function(err){
            if(err) {
                return alert(err);
            }
            alert("saved");
        });
    })
}

// Save JSON
function saveJson() {
    editor.save().then((output) => {
        if (output.blocks.length == 0) {
            alert("Cannot save empty VIPA note file.");
        } else {
            downloadObjectAsJson(output, "CHANGETHIS");
        }
    }).catch((error) => {
        console.log("Saving failed: ", error);
    });
}

// Music player
const $ = require( "jquery" );
const os = require("os");
async function loadMusic() {
    
    if (!fs.existsSync(os.homedir()+"\\Music\\VIPAMUSIC"))
        {
            fs.mkdirSync(os.homedir()+"\\Music\\VIPAMUSIC");
        }
    else {
        let readDir = fs.readdirSync(os.homedir()+"\\Music\\VIPAMUSIC", {withFileTypes: true});
        musicList = [];
        readDir.forEach((item, idx) => {
            const extensions = [".mp3", ".aiff", ".wav", ".aac", ".ogg", ".wma", ".flac", ".alac"];
            if (extensions.includes(readDir[idx].name.substring(readDir[idx].name.indexOf("."))))
            {musicList.push(readDir[idx].name);}
        });
        if(!currentTrack && musicList.length!=0)
        {updateSong();}
    }
}

async function makePlaylist(n){
    
    if (!fs.existsSync(os.homedir()+"\\Music\\VIPAMUSIC\\playlists.json")) {fs.writeFileSync(os.homedir()+"\\Music\\VIPAMUSIC\\playlists.json", "{}");}
        
    var file = require(os.homedir()+"\\Music\\VIPAMUSIC\\playlists.json");
        const playlistTemplate = {
            name: n,
            songs: []
        };
        file.push(playlistTemplate);
        fs.writeFileSync(os.homedir()+"\\Music\\VIPAMUSIC\\playlists.json", JSON.stringify(file));
        showPlayLists();
}
const Dialogs = require("dialogs");
const d = Dialogs();
function mkplaylisthelper(){
    d.prompt("Enter a name for your playlist", name => {
        if (name!=null){makePlaylist(name);}
    })
}

function addSongToPlaylist(playlistIndex, fileName) {
    var file = require(os.homedir()+"\\Music\\VIPAMUSIC\\playlists.json");
    file[playlistIndex].songs.push(fileName);
    fs.writeFileSync(os.homedir()+"\\Music\\VIPAMUSIC\\playlists.json", JSON.stringify(file));
}
let whichSong = 0;

function delSong(){
    fs.unlinkSync(os.homedir()+"\\Music\\VIPAMUSIC\\"+musicList[whichSong]);
    updateLib();
}

async function addToPlayHandler()  {
    const playlists = await loadPlaylists();
    document.getElementById("addToPlayListList").innerHTML = "";
    document.getElementById("addToPlayListList").style.display = "none";
    if (playlists.length > 0) {
        playlists.forEach((playlist, idx) => {
            let li = document.createElement("li");
            let p = document.createElement("p");
            p.innerText = playlist.name;
            p.style.marginTop = "revert";
            li.appendChild(p);
            li.setAttribute("style", "songMenuChoice");
            li.id = "playListChoice";
            li.value = idx;
            li.setAttribute("onclick", "helper(this.value)");
            document.getElementById("addToPlayListList").appendChild(li);
        });
    } else {
        console.log("No playlists found.");
    }
    var menu = document.getElementById("addToPlayListList");
    menu.style.display = "block";
    menu.style.left = event.pageX + "px";
    menu.style.top = event.pageY + "px";
}

async function helper(ind) {
    addSongToPlaylist(ind, musicList[whichSong]);
    document.getElementById("addToPlayListList").innerHTML = "";
    document.getElementById("addToPlayListList").style.display = "none";
}
let selectedPlayList = 0;

function removeSongFromPlaylist() {
    var file = require(os.homedir()+"\\Music\\VIPAMUSIC\\playlists.json");
    file[selectedPlayList].songs.splice(musicList[whichSong], 1);
    fs.writeFileSync(os.homedir()+"\\Music\\VIPAMUSIC\\playlists.json", JSON.stringify(file));
    selectPlayList(selectedPlayList);
}

let pltoremove = 0;
function removePlaylist() {
    var file = require(os.homedir()+"\\Music\\VIPAMUSIC\\playlists.json");
    file.splice(pltoremove, 1);
    fs.writeFileSync(os.homedir()+"\\Music\\VIPAMUSIC\\playlists.json", JSON.stringify(file));
    showPlayLists(); // refreshes playlists
}

const ytmusic = require('youtube-music-api');
async function showSongList(ele) {
    if (event.key === "Enter") {
            let list = document.getElementById("myList");
            document.getElementById("songResults").style.display = "block";
            list.innerHTML = "";
            const api = new ytmusic();
            api.initalize().then(info => {
                    api.search(ele.value, 'song', 1).then(result => {
                        vidList = [...result.content];
                        vidList.forEach((item, idx) => {
                            let li = document.createElement("li");
                            let titleP = document.createElement("p");
                            titleP.innerText = item.name;
                            let artistP = document.createElement("p");
                            artistP.innerText = "By: " + item.artist.name;
                            artistP.style.fontStyle = "italic";
                            artistP.style.color = "#ffd967";
                            li.appendChild(titleP);
                            li.appendChild(artistP);
                            li.value = idx;
                            li.id = "songChoice";
                            let dwnButton = document.createElement("button");
                            dwnButton.innerText = "↓";
                            dwnButton.setAttribute("style", "background: black; color: white; border-radius: 25px; vertical-align: middle; font-family: emoji; position: relative; bottom: 1.5vh;");
                            li.appendChild(dwnButton);
                            dwnButton.setAttribute("onclick", "dwnSongSelected(this.parentElement.value, this)"); // VERY IMPORTANT THAT onclick GETS ADDED AFTER VALUE
                            list.appendChild(li);
                        });
                    })
                }
            );
    }
}

function showLib() {
    var songDisplayInfoId = ["songArt", "currentTrack", "currentArtist", "timeStamp"];
    songDisplayInfoId.forEach(element => {
        if (document.getElementById(element).style.marginLeft != "-50%")
            {
                document.getElementById(element).style.marginLeft = "-50%";
                document.getElementById("libButton").style.left = "2%";
                document.getElementById("playlistsButton").style.display = "block";
            }
        else {
                document.getElementById(element).style.marginLeft = "0%";
                document.getElementById("libButton").style.left = "5%";
                document.getElementById("playlistsButton").style.display = "none";
                document.getElementById("playListDisplay").style.display = "none";
            }
    });
    if (document.getElementById("library").style.display == "block") {
        document.getElementById("library").innerHTML = "";
        document.getElementById("library").style.display = "none";
    }
    else {
        updateLib();
        document.getElementById("library").style.display = "block";
    }
}

var fromPlaylist = false;
function updateLib() {
    if (!fromPlaylist)
    {loadMusic();}
    document.getElementById("library").innerHTML = "";
    let playListTitle = document.createElement("h4");
    playListTitle.innerText = "All Tracks";
    playListTitle.style.color = "#9cb5d8";
    playListTitle.id = "playListTitle";
    document.getElementById("library").appendChild(playListTitle);
    musicList.forEach((item, idx) => {
        let li = document.createElement("li");
        let titleP = document.createElement("p");
        let artistP = document.createElement("p");
        getSongInfo(idx).then((result)=>{
            titleP.innerText = result[1];
            artistP.innerText = "By: " + result[2];
        });
        artistP.style.fontStyle = "italic";
        artistP.style.color = "#ffd967";
        li.appendChild(titleP);
        li.appendChild(artistP);
        li.value = idx;
        li.id = "songChoice";
        li.setAttribute("onclick", "setSongFromList(this.value)");
        li.setAttribute("oncontextmenu", "songOptions(this.value, event)");
        document.getElementById("library").appendChild(li);
    });
}

document.body.addEventListener("click", closeSongMenu);
function closeSongMenu(event) {
    if (!document.getElementById("context-menu").contains(event.target)) {
        document.getElementById("context-menu").style.display = "none";
        document.getElementById("addToPlayListList").style.display = "none";
        document.getElementById("playlistscontext-menu").style.display = "none";
    }
  }

function songOptions(ind, event) {
    var menu = document.getElementById("context-menu");
    menu.style.display = "block";
    menu.style.left = event.pageX + "px";
    menu.style.top = event.pageY + "px";
    whichSong = ind;
}

function setSongFromList(ind) {
    index = ind;
    updateSong(ind);
    document.getElementById("playButton").innerHTML = "<i class=\"bi bi-pause-circle-fill\" style=\"font-size: xxx-large; color: white;\"></i>";
    currentTrack.play();
}

async function loadPlaylists() {
    try {
      const filePath = os.homedir() + "\\Music\\VIPAMUSIC\\playlists.json";
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const playlists = JSON.parse(fileContent);
        return playlists;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error loading playlists:", error);
      return [];
    }
  }

function handleClick(){ // all tracks
    fromPlaylist = false;
    updateLib();
    document.getElementById("removeFromPlayList").style.display = "none";
    document.getElementById("playListTitle").innerText = "All Tracks";
}

async function showPlayLists() {
    if (document.getElementById("playListDisplay").style.display == "block")
        {document.getElementById("playListDisplay").style.display = "none";}
    else{
        document.getElementById("playListDisplay").style.display = "block";
    }

    document.getElementById("playListDisplay").innerHTML = "";
    const playlists = await loadPlaylists();
    let li = document.createElement("li");
    let p = document.createElement("p");
    p.innerText = "All Tracks";
    p.style.marginTop = "revert";
    p.style.color = "#ffd967";
    li.appendChild(p);
    li.id = "playListChoice";
    li.value = 999999;
    li.setAttribute("onclick", "handleClick()");
    li.setAttribute("oncontextmenu", "playlistmenuoptions(this)");
    document.getElementById("playListDisplay").appendChild(li);

        if (playlists.length > 0) {
            playlists.forEach((playlist, idx) => {
                let li = document.createElement("li");
                let p = document.createElement("p");
                p.innerText = playlist.name;
                p.style.marginTop = "revert";
                li.appendChild(p);
                li.id = "playListChoice";
                li.value = idx;
                li.setAttribute("onclick", "selectPlayList(this.value)");
                li.setAttribute("oncontextmenu", "playlistmenuoptions(this)");
                document.getElementById("playListDisplay").appendChild(li);
            });
        } else {
            console.log("No playlists found.");
        }
}

async function playlistmenuoptions(ele){
    if(ele.value==999999)
    {
        document.getElementById("delPlaylist").style.display = "none";
    }
    else {document.getElementById("delPlaylist").style.display = "block"; pltoremove = ele.value;}
    var menu = document.getElementById("playlistscontext-menu");
    menu.style.display = "block";
    menu.style.left = event.pageX + "px";
    menu.style.top = event.pageY + "px";
}


async function selectPlayList(idx){
    selectedPlayList = idx;
    fromPlaylist = true;
    musicList = [];
    const playlists = await loadPlaylists();
    const songs = playlists[idx].songs;
    musicList = songs;
    updateLib();
    document.getElementById("removeFromPlayList").style.display = "block";
    document.getElementById("playListTitle").innerText = playlists[idx].name;
}

const NodeID3 = require('node-id3')
const jsmedia = require('jsmediatags');
const ytdl = require('ytdl-core');
const { electron } = require('process');
async function dwnSongSelected(index, button) {
    if (fs.existsSync(os.homedir()+"\\Music\\VIPAMUSIC\\"+vidList[index].videoId+".mp3")) {
        button.innerText = "☑";
    }
    else {
        button.innerText = "";
        button.innerHTML = "<img src='./resources/files/images/spinner2.gif' width='15' height='15'></img>";
        // dwn song

        ytdl("https://www.youtube.com/watch?v="+vidList[index].videoId, { format: 'audio/mp3', filter: 'audioonly', quality: 'highestaudio' })
        .pipe(fs.createWriteStream(os.homedir()+"\\Music\\VIPAMUSIC\\"+vidList[index].videoId+".mp3"))
        .on('finish', async () => {
            const albumArtResponse = await axios.get(vidList[index].thumbnails[0].url.substring(0, vidList[index].thumbnails[0].url.indexOf("=")), { responseType: 'arraybuffer' });
            const albumArtBuffer = Buffer.from(albumArtResponse.data, 'binary');
            const tags = {
                title: vidList[index].name,
                artist: vidList[index].artist.name,
                image: {
                    mime: 'application/octet-stream',
                    type: { id: 3, name: 'front cover' },
                    description: 'Artwork',
                    imageBuffer: albumArtBuffer,
                }
            }
            const success = NodeID3.write(tags, os.homedir()+"\\Music\\VIPAMUSIC\\"+vidList[index].videoId+".mp3");
            if (success) {
                updateLib();
                button.innerText = "☑";
            }
            else {console.log(success);}
        })
        .on('error', (err) => {
            console.error('An error occurred during download:', err);
        });
    }
}

// async function sync() {
//     authorize();
// }

async function updateSong(ind) {
    var num = index;
    if (ind){num = ind;}
    getSongInfo(index).then((result)=>{
        document.getElementById("currentTrack").innerText = result[2];
        document.getElementById("currentArtist").innerText = result[1];
        document.getElementById("songArt").src = URL.createObjectURL(result[0]);
    });
    if (currentTrack && !currentTrack.paused){currentTrack.pause();}
    currentTrack = new Audio(os.homedir()+"\\Music\\VIPAMUSIC\\"+musicList[index]);
    currentTrack.setAttribute("onloadedmetadata","blob()");
}

async function getSongInfo(ind) {
    return new Promise((resolve) => {
        jsmedia.read(os.homedir()+"\\Music\\VIPAMUSIC\\"+musicList[ind], {
            onSuccess: function(tag) {
                var data, type;
                if (tag.tags.picture)
                {data = tag.tags.picture.data;
                type = tag.tags.picture.type;}
                const byteArray = new Uint8Array(data);
                const blob = new Blob([byteArray], { type });
                resolve([blob, tag.tags.title, tag.tags.artist]);
            },
            onError: function(error) {
            console.log(':(', error.type, error.info);
            }
        });
    });
}

function fancyTimeFormat(duration) {   
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}
var sliderCanMove = false;
function blob() {

    // seek
currentTrack.ontimeupdate = function(){
    var percentage = ( currentTrack.currentTime / currentTrack.duration ) * 100;
    document.getElementById("timeStamp").innerText = fancyTimeFormat(currentTrack.currentTime)+" / "+fancyTimeFormat(currentTrack.duration);
    $("#custom-seekbar span").css("width", percentage+"%");
  };
  
  $("#custom-seekbar").hover(function(){
      $(this).find("span").addClass("hover");
  }, function(){
      $(this).find("span").removeClass("hover");
  })
  
  $("#custom-seekbar").on("mousedown", function(){
      sliderCanMove = true;
      
  });
  
  $(window).on("mousemove", function(e){
      if(sliderCanMove){
            var offset = $("#custom-seekbar").offset();
              var left = ((e.clientX + offset.left));
              var totalWidth = $("#custom-seekbar").width();
              var percentage = ( left / totalWidth );
              var currentTrackTime = currentTrack.duration * percentage;
              currentTrack.currentTime = currentTrackTime;
      }
  });
  
  $(window).on("mouseup", function(){
      sliderCanMove = false;
  });
  
  $("#custom-seekbar").on("click", function(e){
      var offset = $(this).offset();
      var left = (e.pageX - offset.left);
      var totalWidth = $("#custom-seekbar").width();
      var percentage = ( left / totalWidth );
      var currentTrackTime = currentTrack.duration * percentage;
      currentTrack.currentTime = currentTrackTime;
  });//click()
  // seek end
}


function pausePlay(ele) {
    if (currentTrack.paused)
    {
        currentTrack.play();
        ele.innerHTML = "<i class=\"bi bi-pause-circle-fill\" style=\"font-size: xxx-large; color: white;\"></i>";
    }
    else {
        currentTrack.pause();
        ele.innerHTML = "<i class=\"bi bi-play-fill\" style=\"font-size: xxx-large; color: white;\"></i>";
    }
}

function next() {
    if (index!=musicList.length-1)
    {
        index++;
        currentTrack.pause();
        updateSong();
        currentTrack.play();
    }
    else {index=0;
        currentTrack.pause();
        updateSong();
        currentTrack.play();}
}
function back() {
    if (index>=1)
    {
        index--;
        currentTrack.pause();
        updateSong();
        currentTrack.play();
    }
    else {index=musicList.length-1;
        currentTrack.pause();
        updateSong();
        currentTrack.play();}
}

/* drag boxes */
function initDragElement() {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    var popups = document.getElementsByClassName("popup");
    var elmnt = null;
    var currentZIndex = 100; // TODO reset z index when a threshold is passed

    for (var i = 0; i < popups.length; i++) {
        var popup = popups[i];
        var header = getHeader(popup);

        popup.onmousedown = function () {
            this.style.zIndex = "" + ++ currentZIndex;
        };

        if (header) {
            header.parentPopup = popup;
            header.onmousedown = dragMouseDown;
        }
    }

    function dragMouseDown(e) {
        elmnt = this.parentPopup;
        elmnt.style.zIndex = "" + ++ currentZIndex;

        e = e || window.event;
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        if (! elmnt) {
            return;
        }

        e = e || window.event;
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = elmnt.offsetTop - pos2 + "px";
        elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
    }

    function closeDragElement() { /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }

    function getHeader(element) {
        var headerItems = element.getElementsByClassName("popup-header");

        if (headerItems.length === 1) {
            return headerItems[0];
        }

        return null;
    }
}