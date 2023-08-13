var exitPopup, search, editorClear, downloadObjectAsJson, saveJson, loadMusic, makePlaylist, mkplaylisthelper, addSongToPlaylist, delSong, addToPlayHandler, helper, removeSongFromPlaylist, removePlaylist, showSongList, showLib, updateLib, closeSongMenu, songOptions, setSongFromList, loadPlaylists, handleClick, showPlayLists, playlistmenuoptions, selectPlayList, dwnSongSelected, updateSong, getSongInfo, fancyTimeFormat, blob, pausePlay, next, back, initDragElement, sliderCanMove, fromPlaylist, key, index, musicList, music_box, notepad_box, modelviewer_box, music, notepad, modelviewer, currentTrack;
(function () {
  var $$0 = {
    enumerable: false,
    configurable: true,
    writable: true
  };
  var _$0 = this;
  var _$1 = _$0.ReferenceError;
  var _$2 = _$1.prototype;
  var _$3 = _$0.Object;
  var _$4 = _$3.defineProperty;
  var _c = function (el) {
    if (el.parentElement.parentElement.id == "songResults") {
      vidList = {};
      document.getElementById("myList").innerHTML = "";
    }
    if (el.parentElement.parentElement.id == "musicplayer") {
      currentTrack.pause();
      document.getElementById("playButton").innerHTML = "<i class=\"bi bi-play-fill\" style=\"font-size: xxx-large; color: white;\"></i>";
    }
    el.parentElement.parentElement.style.display = "none";
  };
  var _d = function (ele) {
    if (event.key === "Enter") {
      if (modelviewer.some(v => ele.value.includes(v))) {
        if (modelviewer_box.style.display === "none") {
          modelviewer_box.style.display = "block";
        } else {
          modelviewer_box.style.display = "none";
        }
      }
      if (notepad.some(v => ele.value.includes(v))) {
        if (notepad_box.parentElement.style.display === "none") {
          notepad_box.parentElement.style.display = "block";
        } else {
          notepad_box.parentElement.style.display = "none";
        }
      }
      if (music.some(v => ele.value.includes(v))) {
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
  };
  var _e = function () {
    editor.isReady.then(() => {
      editor.clear();
    }).catch(reason => {
      console.log(`Editor.js initialization failed because of ` + reason + ".");
    });
  };
  var _f = function (exportObj, exportName) {
    var dataStr = JSON.stringify(exportObj);
    var ciphertext = CryptoJS.AES.encrypt(dataStr, key).toString();
    let entry = dialog.showSaveDialog({
      title: "Save your VIPA note",
      filters: [{
        name: 'VIPANOTE',
        extensions: ['vipanote']
      }]
    }).then(bob => {
      fs.writeFile(bob.filePath, ciphertext, function (err) {
        if (err) {
          return alert(err);
        }
        alert("saved");
      });
    });
  };
  var _g = function () {
    editor.save().then(output => {
      if (output.blocks.length == 0) {
        alert("Cannot save empty VIPA note file.");
      } else {
        downloadObjectAsJson(output, "CHANGETHIS");
      }
    }).catch(error => {
      console.log("Saving failed: ", error);
    });
  };
  var _h = function () {
    if (!fs.existsSync(os.homedir() + "\\Music\\VIPAMUSIC")) {
      fs.mkdirSync(os.homedir() + "\\Music\\VIPAMUSIC");
    } else {
      let readDir = fs.readdirSync(os.homedir() + "\\Music\\VIPAMUSIC", {
        withFileTypes: true
      });
      musicList = [];
      readDir.forEach((item, idx) => {
        const extensions = [".mp3", ".aiff", ".wav", ".aac", ".ogg", ".wma", ".flac", ".alac"];
        if (extensions.includes(readDir[idx].name.substring(readDir[idx].name.indexOf(".")))) {
          musicList.push(readDir[idx].name);
        }
      });
      if (!currentTrack && musicList.length != 0) {
        updateSong();
      }
    }
  };
  var _i = function (n) {
    if (!fs.existsSync(os.homedir() + "\\Music\\VIPAMUSIC\\playlists.json")) {
      fs.writeFileSync(os.homedir() + "\\Music\\VIPAMUSIC\\playlists.json", "{}");
    }
    var file = require(os.homedir() + "\\Music\\VIPAMUSIC\\playlists.json");
    const playlistTemplate = {
      name: n,
      songs: []
    };
    file.push(playlistTemplate);
    fs.writeFileSync(os.homedir() + "\\Music\\VIPAMUSIC\\playlists.json", JSON.stringify(file));
    showPlayLists();
  };
  var _j = function () {
    d.prompt("Enter a name for your playlist", name => {
      if (name != null) {
        makePlaylist(name);
      }
    });
  };
  var _k = function (playlistIndex, fileName) {
    var file = require(os.homedir() + "\\Music\\VIPAMUSIC\\playlists.json");
    file[playlistIndex].songs.push(fileName);
    fs.writeFileSync(os.homedir() + "\\Music\\VIPAMUSIC\\playlists.json", JSON.stringify(file));
  };
  var _l = function () {
    fs.unlinkSync(os.homedir() + "\\Music\\VIPAMUSIC\\" + musicList[whichSong]);
    updateLib();
  };
  var _m = function () {
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
  };
  var _n = function (ind) {
    addSongToPlaylist(ind, musicList[whichSong]);
    document.getElementById("addToPlayListList").innerHTML = "";
    document.getElementById("addToPlayListList").style.display = "none";
  };
  var _o = function () {
    var file = require(os.homedir() + "\\Music\\VIPAMUSIC\\playlists.json");
    file[selectedPlayList].songs.splice(musicList[whichSong], 1);
    fs.writeFileSync(os.homedir() + "\\Music\\VIPAMUSIC\\playlists.json", JSON.stringify(file));
    selectPlayList(selectedPlayList);
  };
  var _p = function () {
    var file = require(os.homedir() + "\\Music\\VIPAMUSIC\\playlists.json");
    file.splice(pltoremove, 1);
    fs.writeFileSync(os.homedir() + "\\Music\\VIPAMUSIC\\playlists.json", JSON.stringify(file));
    showPlayLists(); // refreshes playlists
  };
  var _q = function (ele) {
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
        });
      });
    }
  };
  var _r = function () {
    var songDisplayInfoId = ["songArt", "currentTrack", "currentArtist", "timeStamp"];
    songDisplayInfoId.forEach(element => {
      if (document.getElementById(element).style.marginLeft != "-50%") {
        document.getElementById(element).style.marginLeft = "-50%";
        document.getElementById("libButton").style.left = "2%";
        document.getElementById("playlistsButton").style.display = "block";
      } else {
        document.getElementById(element).style.marginLeft = "0%";
        document.getElementById("libButton").style.left = "5%";
        document.getElementById("playlistsButton").style.display = "none";
        document.getElementById("playListDisplay").style.display = "none";
      }
    });
    if (document.getElementById("library").style.display == "block") {
      document.getElementById("library").innerHTML = "";
      document.getElementById("library").style.display = "none";
    } else {
      updateLib();
      document.getElementById("library").style.display = "block";
    }
  };
  var _s = function () {
    if (!fromPlaylist) {
      loadMusic();
    }
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
      getSongInfo(idx).then(result => {
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
  };
  var _t = function (event) {
    if (!document.getElementById("context-menu").contains(event.target)) {
      document.getElementById("context-menu").style.display = "none";
      document.getElementById("addToPlayListList").style.display = "none";
      document.getElementById("playlistscontext-menu").style.display = "none";
    }
  };
  var _u = function (ind, event) {
    var menu = document.getElementById("context-menu");
    menu.style.display = "block";
    menu.style.left = event.pageX + "px";
    menu.style.top = event.pageY + "px";
    whichSong = ind;
  };
  var _v = function (ind) {
    index = ind;
    updateSong(ind);
    document.getElementById("playButton").innerHTML = "<i class=\"bi bi-pause-circle-fill\" style=\"font-size: xxx-large; color: white;\"></i>";
    currentTrack.play();
  };
  var _w = function () {
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
  };
  var _x = function () {
    // all tracks
    fromPlaylist = false;
    updateLib();
    document.getElementById("removeFromPlayList").style.display = "none";
    document.getElementById("playListTitle").innerText = "All Tracks";
  };
  var _y = function () {
    if (document.getElementById("playListDisplay").style.display == "block") {
      document.getElementById("playListDisplay").style.display = "none";
    } else {
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
  };
  var _z = function (ele) {
    if (ele.value == 999999) {
      document.getElementById("delPlaylist").style.display = "none";
    } else {
      document.getElementById("delPlaylist").style.display = "block";
      pltoremove = ele.value;
    }
    var menu = document.getElementById("playlistscontext-menu");
    menu.style.display = "block";
    menu.style.left = event.pageX + "px";
    menu.style.top = event.pageY + "px";
  };
  var _10 = function (idx) {
    selectedPlayList = idx;
    fromPlaylist = true;
    musicList = [];
    const playlists = await loadPlaylists();
    const songs = playlists[idx].songs;
    musicList = songs;
    updateLib();
    document.getElementById("removeFromPlayList").style.display = "block";
    document.getElementById("playListTitle").innerText = playlists[idx].name;
  };
  var _11 = function (index, button) {
    if (fs.existsSync(os.homedir() + "\\Music\\VIPAMUSIC\\" + vidList[index].videoId + ".mp3")) {
      button.innerText = "☑";
    } else {
      button.innerText = "";
      button.innerHTML = "<img src='./resources/files/images/spinner2.gif' width='15' height='15'></img>"; // dwn song
      ytdl("https://www.youtube.com/watch?v=" + vidList[index].videoId, {
        format: 'audio/mp3',
        filter: 'audioonly',
        quality: 'highestaudio'
      }).pipe(fs.createWriteStream(os.homedir() + "\\Music\\VIPAMUSIC\\" + vidList[index].videoId + ".mp3")).on('finish', async () => {
        const albumArtResponse = await axios.get(vidList[index].thumbnails[0].url.substring(0, vidList[index].thumbnails[0].url.indexOf("=")), {
          responseType: 'arraybuffer'
        });
        const albumArtBuffer = Buffer.from(albumArtResponse.data, 'binary');
        const tags = {
          title: vidList[index].name,
          artist: vidList[index].artist.name,
          image: {
            mime: 'application/octet-stream',
            type: {
              id: 3,
              name: 'front cover'
            },
            description: 'Artwork',
            imageBuffer: albumArtBuffer
          }
        };
        const success = NodeID3.write(tags, os.homedir() + "\\Music\\VIPAMUSIC\\" + vidList[index].videoId + ".mp3");
        if (success) {
          updateLib();
          button.innerText = "☑";
        } else {
          console.log(success);
        }
      }).on('error', err => {
        console.error('An error occurred during download:', err);
      });
    }
  };
  var _12 = function (ind) {
    var num = index;
    if (ind) {
      num = ind;
    }
    getSongInfo(index).then(result => {
      document.getElementById("currentTrack").innerText = result[2];
      document.getElementById("currentArtist").innerText = result[1];
      document.getElementById("songArt").src = URL.createObjectURL(result[0]);
    });
    if (currentTrack && !currentTrack.paused) {
      currentTrack.pause();
    }
    currentTrack = new Audio(os.homedir() + "\\Music\\VIPAMUSIC\\" + musicList[index]);
    currentTrack.setAttribute("onloadedmetadata", "blob()");
  };
  var _13 = function (ind) {
    return new Promise(resolve => {
      jsmedia.read(os.homedir() + "\\Music\\VIPAMUSIC\\" + musicList[ind], {
        onSuccess: function (tag) {
          var data, type;
          if (tag.tags.picture) {
            data = tag.tags.picture.data;
            type = tag.tags.picture.type;
          }
          const byteArray = new Uint8Array(data);
          const blob = new Blob([byteArray], {
            type
          });
          resolve([blob, tag.tags.title, tag.tags.artist]);
        },
        onError: function (error) {
          console.log(':(', error.type, error.info);
        }
      });
    });
  };
  var _14 = function (duration) {
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~(duration % 3600 / 60);
    var secs = ~~duration % 60; // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";
    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
  };
  var _15 = function () {
    // seek
    currentTrack.ontimeupdate = function () {
      var percentage = currentTrack.currentTime / currentTrack.duration * 100;
      document.getElementById("timeStamp").innerText = fancyTimeFormat(currentTrack.currentTime) + " / " + fancyTimeFormat(currentTrack.duration);
      $("#custom-seekbar span").css("width", percentage + "%");
    };
    $("#custom-seekbar").hover(function () {
      $(this).find("span").addClass("hover");
    }, function () {
      $(this).find("span").removeClass("hover");
    });
    $("#custom-seekbar").on("mousedown", function () {
      sliderCanMove = true;
    });
    $(window).on("mousemove", function (e) {
      if (sliderCanMove) {
        var offset = $("#custom-seekbar").offset();
        var left = e.clientX + offset.left;
        var totalWidth = $("#custom-seekbar").width();
        var percentage = left / totalWidth;
        var currentTrackTime = currentTrack.duration * percentage;
        currentTrack.currentTime = currentTrackTime;
      }
    });
    $(window).on("mouseup", function () {
      sliderCanMove = false;
    });
    $("#custom-seekbar").on("click", function (e) {
      var offset = $(this).offset();
      var left = e.pageX - offset.left;
      var totalWidth = $("#custom-seekbar").width();
      var percentage = left / totalWidth;
      var currentTrackTime = currentTrack.duration * percentage;
      currentTrack.currentTime = currentTrackTime;
    }); //click()
    // seek end
  };
  var _16 = function (ele) {
    if (currentTrack.paused) {
      currentTrack.play();
      ele.innerHTML = "<i class=\"bi bi-pause-circle-fill\" style=\"font-size: xxx-large; color: white;\"></i>";
    } else {
      currentTrack.pause();
      ele.innerHTML = "<i class=\"bi bi-play-fill\" style=\"font-size: xxx-large; color: white;\"></i>";
    }
  };
  var _17 = function () {
    if (index != musicList.length - 1) {
      index++;
      currentTrack.pause();
      updateSong();
      currentTrack.play();
    } else {
      index = 0;
      currentTrack.pause();
      updateSong();
      currentTrack.play();
    }
  };
  var _18 = function () {
    if (index >= 1) {
      index--;
      currentTrack.pause();
      updateSong();
      currentTrack.play();
    } else {
      index = musicList.length - 1;
      currentTrack.pause();
      updateSong();
      currentTrack.play();
    }
  };
  var _19 = function () {
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
        this.style.zIndex = "" + ++currentZIndex;
      };
      if (header) {
        header.parentPopup = popup;
        header.onmousedown = dragMouseDown;
      }
    }
    function dragMouseDown(e) {
      elmnt = this.parentPopup;
      elmnt.style.zIndex = "" + ++currentZIndex;
      e = e || window.event; // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement; // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
      if (!elmnt) {
        return;
      }
      e = e || window.event; // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY; // set the element's new position:
      elmnt.style.top = elmnt.offsetTop - pos2 + "px";
      elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
    }
    function closeDragElement() {
      /* stop moving when mouse button is released:*/
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
  };
  var _1A = function () {
    initDragElement();
  };
  var __constructor = function () {};
  _$0.exitPopup = _c;
  _$0.search = _d;
  _$0.editorClear = _e;
  _$0.downloadObjectAsJson = _f;
  _$0.saveJson = _g;
  _$0.loadMusic = _h;
  _$0.makePlaylist = _i;
  _$0.mkplaylisthelper = _j;
  _$0.addSongToPlaylist = _k;
  _$0.delSong = _l;
  _$0.addToPlayHandler = _m;
  _$0.helper = _n;
  _$0.removeSongFromPlaylist = _o;
  _$0.removePlaylist = _p;
  _$0.showSongList = _q;
  _$0.showLib = _r;
  _$0.updateLib = _s;
  _$0.closeSongMenu = _t;
  _$0.songOptions = _u;
  _$0.setSongFromList = _v;
  _$0.loadPlaylists = _w;
  _$0.handleClick = _x;
  _$0.showPlayLists = _y;
  _$0.playlistmenuoptions = _z;
  _$0.selectPlayList = _10;
  _$0.dwnSongSelected = _11;
  _$0.updateSong = _12;
  _$0.getSongInfo = _13;
  _$0.fancyTimeFormat = _14;
  _$0.blob = _15;
  _$0.pausePlay = _16;
  _$0.next = _17;
  _$0.back = _18;
  _$0.initDragElement = _19;
  _$0.onload = _1A;
  var _1B = _$2;
  var _Z = (__constructor.prototype = _1B, new __constructor());
  $$0.value = "require is not defined", _$4(_Z, "message", $$0);
  $$0.value = "ReferenceError: require is not defined\n    at ./resources/index.js:4:16", _$4(_Z, "stack", $$0);
  throw _Z;
}).call(this);