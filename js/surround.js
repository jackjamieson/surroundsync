var room = getRoomParam();

var widgetIframe = document.getElementById('p');//Get the player to interact with the Widget API.
var sound = SC.Widget(widgetIframe);//Create sound variable from the widget for js.

var flag = false;//"Allowed to play" flag
var unique = "";//Holds the room variable to connect two users.

//Connect to firebase.
var myRootRef = new Firebase('https://boiling-fire-1516.firebaseio.com/sync');
var newSync = new Firebase('https://boiling-fire-1516.firebaseio.com/sync');//Used in creating a new firebase location.

//Called when a new song is entered.  This will pre-load the song to avoid soundcloud delays.
function reload() {
    sound.bind(SC.Widget.Events.READY, function() {

        sound.play();

    });

    sound.bind(SC.Widget.Events.PLAY_PROGRESS, function(out) {
        if (out.currentPosition >= 300 && flag === false) {
            //Once the song is past 150ms pause it and set it back to 0.
            sound.pause();
            sound.seekTo(100);

        }

    });

}

//Will get the room parameter if there is one.
function getRoomParam() {
    if (window.location.href.indexOf('=') === -1) {
        //Not joining a room.
        } else {
        //A user was sent here, get the room param.
        togglePlayerDiv();
        var thisURL = window.location.href;
        var result = thisURL.substring(thisURL.lastIndexOf('=') + 1);
        return result;

    }
}

//Check the room parameter against Firebase location.
function checkRoom() {
    if (room !== undefined) {
        toggleCreateBtn();//Toggle the divs to make the disappear while playing.
        toggleNameInpt();
        toggleSngBtn();
        myRootRef = new Firebase('https://boiling-fire-1516.firebaseio.com/sync/' + room);

        var nameTextDiv = document.getElementById('ready1');//Ready message

        unique = room;

        //Execute this once
        myRootRef.once('value', function(snapshot) {

            var status1 = snapshot.val().status;
            var status2 = snapshot.val().status2;
            if (status1 == "Ready" && status2 == "Ready") {  //Check if the room has already had two people in it (2 max).
                nameTextDiv.innerHTML = "That room is full!";

            } else {
                var nextURL = snapshot.val().url;
                var roomName = snapshot.val().name;
                nameTextDiv.innerHTML = "Joined room \'" + roomName + "\'!";

                sound.load(nextURL + "&amp;auto_play=false&amp;hide_related=true&amp;visual=true&amp;show_comments=false&amp;sharing=false");//Include parameters on URL to make it look nicer.
                reload();

                togglePlayerDiv();
            }
        });

        sound.bind(SC.Widget.Events.SEEK, function() {
            //Instead of waiting for ready, fire the update when the player seeks(it has reloaded)
            myRootRef.update({
                'status2': "Ready"

            });
        });
    }
}

//Triggers the music player to begin playing.
function playMusic() {

    flag = true;
    //Allows the player to advance beyond 150ms during pre-loading.
    sound.play();
}

function togglePlayerDiv() {

    var playerDiv = document.getElementById('player');
    var displaySetting = playerDiv.style.display;
    playerDiv.style.display = 'block';

}

function toggleCreateBtn(){
    
    var btn = document.getElementById('go');
    var displaySetting = btn.style.display;
    btn.style.display = 'none';
}

function toggleNameInpt(){
    
    var name = document.getElementById('messagesDiv');
    var displaySetting = name.style.display;
    name.style.display = 'none';
}

function toggleSngBtn(){
    
    var song = document.getElementById('songinpt');
    var displaySetting = song.style.display;
    song.style.display = 'none';
}

// When the user clicks on Create Room, push a new unique ID to firebase
$('#go').click(function() {
    
        toggleCreateBtn();//Hide the buttons and divs.
        toggleNameInpt();
        toggleSngBtn();
        
        newSync = myRootRef.push();//Will create a new unqiue firebase location.

        var name = $('#nameInput').val();
        if(name === "")  //If the name is empty just use the unique name as the room name.
        {
            name = newSync.toString();
            name = name.substring(name.lastIndexOf('/') + 1);
        }

        var song = $('#chsong').val();

        //Set the firebase location's data - the room name, status of users, and song url.
        newSync.set({
            'name': name,
            'status': "Waiting",
            'status2': "Waiting",
            'url': song
        });
        var div = document.getElementById('ready1');

        div.innerHTML = "Room \'" + name + "\' is ready!";

        var url = newSync.toString();

        var thisURL = window.location.href;
        var divUrl = document.getElementById('outputURL');

        var result = url.substring(url.lastIndexOf('/') + 1);
        myRootRef = new Firebase('https://boiling-fire-1516.firebaseio.com/sync/' + result);//Assign the root reference to be the new room.

        divUrl.innerHTML = "Send this URL to your friend: " + "<a href=\"" + thisURL + "?s=" + result + "\">" + thisURL + "?s=" + result + "</a>";

        unique = result;

        myRootRef.once('value', function(snapshot) {
            if (snapshot.val() === null) {
                } else {
                if (myRootRef.toString() == "https://boiling-fire-1516.firebaseio.com/sync/" + unique) {
                    var nextURL = snapshot.val().url;
                    sound.load(nextURL + "&amp;auto_play=false&amp;hide_related=true&amp;visual=true&amp;show_comments=false&amp;sharing=false");
                    reload();

                    togglePlayerDiv();

                }
            }
        });

        //Update the firebase location that the first user is ready when the player loads.
        
        sound.bind(SC.Widget.Events.SEEK, function() {

            myRootRef.update({
                'status': "Ready"

            });
        });

    
});

//Will trigger when a child is changed in the firebase location, but will only enter and play if both are ready.
myRootRef.on('child_changed', function(playing) {
    if (playing.val().status == "Ready" && playing.val().status2 == "Ready" && myRootRef.toString() != "https://boiling-fire-1516.firebaseio.com/sync") {
        
        playMusic();
        Firebase.goOffline();
        myRootRef = new Firebase('https://boiling-fire-1516.firebaseio.com/sync');//Reset the user's room.

    }
});

checkRoom();