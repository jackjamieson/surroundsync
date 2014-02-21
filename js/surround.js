
        //SOUNDCLOUD
         //SC.initialize({
         //  client_id: '11d082453cb959a863745680d58d1b71'
         //});
         //var sound = "http://soundcloud.com/forss/sets/soulhack";
         // SC.oEmbed("http://soundcloud.com/forss/sets/soulhack", {color: "ff0066"},  document.getElementById("player"));
         //;

         //   SC.initialize({
         //     client_id: "11d082453cb959a863745680d58d1b71"
         // redirect_uri: "http://example.com/callback.html",
         //SC.stream("/tracks/293", function(sound){
         //sound.play();


         // });

         //var sound;

        var widgetIframe = document.getElementById('p');
        var sound = SC.Widget(widgetIframe);
        var flag = false;
        var reloaded = false;
        var unique = "empty";

        function reload() {

            sound.bind(SC.Widget.Events.READY, function () {

                console.log("READY");

                sound.play();


            });

            sound.bind(SC.Widget.Events.PLAY_PROGRESS, function (out) {
                if (out.currentPosition > 150 && flag === false) {
                    
                    sound.pause();
                    sound.seekTo(100);
                }

            });

        }
        reload();


         //FIREBASE SETUP
        var myRootRef = new Firebase('https://boiling-fire-1516.firebaseio.com/sync');
        var newSync = new Firebase('https://boiling-fire-1516.firebaseio.com/sync');
        var offset;

        //Get the offset times for each user's Firebase response turnaround.  Used in calculating difference to start music.
        var offsetRef = new Firebase("https://boiling-fire-1516.firebaseIO.com/.info/serverTimeOffset");
        offsetRef.on("value", function (snap) {
            offset = snap.val();//Used to calculate the difference between two users.
        });
         // When the user presses enter on the message input, write the message to firebase.
        $('#nameInput').keypress(function (e) {
            if (e.keyCode == 13) {
                //If user hits enter for a new room name.
                myRootRef = new Firebase('https://boiling-fire-1516.firebaseio.com/sync');
                newSync = myRootRef.push();

                var name = $('#nameInput').val();
                var ready = "Ready";
                var song = $('#chsong').val()

                //myRootRef.push({name:name, status:ready});
                newSync.set({
                    'name': name,
                    'name-2': "None",
                    'status': "Waiting",
                    'lag1': offset,
                    'lag2': 0,
                    'url': song
                });
                var div = document.getElementById('ready1');

                div.innerHTML = "Room \'" + name + "\' is ready!";
                $('#nameInput').val('');
                //console.log("success");
                var url = newSync.toString();


                var divUrl = document.getElementById('outputURL');

                var result = url.substring(url.lastIndexOf('/') + 1);
                myRootRef = new Firebase('https://boiling-fire-1516.firebaseio.com/sync/' + result);

                divUrl.innerHTML = "Send this code to your friend: " + result;
                
                unique = result;
                
            myRootRef.once('value', function (snapshot) {
            if (snapshot.val() === null) {
                // console.log("user is not ready");
            } else {
                //switch the time offsets?
                console.log(myRootRef.toString());
                //var stat = snapshot.val().status;
                if (myRootRef.toString() == "https://boiling-fire-1516.firebaseio.com/sync/" + unique) {
                    var nextURL = snapshot.val().url;
                    sound.load(nextURL);
                    reload();
                   

                    //sound.seekTo(offset * -1);
                    //sound.setVolume(0);
                    //sound.seekTo(Math.round((offset * -1)/2));
                    // sound.setVolume(100);
                    //console.log(Math.round((offset * -1) / 2));

                }
            }
            });
            
            sound.unbind(SC.Widget.Events.READY);
            sound.bind(SC.Widget.Events.READY, function () {
            
            myRootRef.update({
                    'status': "Ready"
                    
                });
            });
                
            }
        });

        $('#roomInput').keypress(function (e) {
            if (e.keyCode == 13) {
                //If user hits enter for a new room name.
                //var newSync = myRootRef.push();
                var name = $('#roomInput').val();
                myRootRef = new Firebase('https://boiling-fire-1516.firebaseio.com/sync/' + name);
                var connected = "Connected"
                var ready = "Ready";
                
                var nameTextDiv = document.getElementById('ready1');
                
                unique = name;
                //var nextURL;

                myRootRef.update({
                    'name-2': connected,
                    'lag2': offset
                });



                console.log("READY");
                
            myRootRef.once('value', function (snapshot) {
            if (snapshot.val() === null) {
                // console.log("user is not ready");
            } else {
                //switch the time offsets?
                console.log(myRootRef.toString());
                //var stat = snapshot.val().status;
                if (myRootRef.toString() == "https://boiling-fire-1516.firebaseio.com/sync/" + unique) {
                    var nextURL = snapshot.val().url;
                    var roomName = snapshot.val().name;
                    nameTextDiv.innerHTML = "Joined room \'" + roomName + "\'!";
                    sound.load(nextURL);
                    reload();
                   

                    //sound.seekTo(offset * -1);
                    //sound.setVolume(0);
                    //sound.seekTo(Math.round((offset * -1)/2));
                    // sound.setVolume(100);
                    //console.log(Math.round((offset * -1) / 2));

                }
            }
            });
            
            //sound.unbind(SC.Widget.Events.READY);
            sound.bind(SC.Widget.Events.SEEK, function () {
            //instead of waiting for ready 
            myRootRef.update({
                    'status2': "Ready"
                    
                });
            });

                $('#roomInput').val('');

            }
        });
        $('#chsong').keypress(function (e) {
            if (e.keyCode == 13) {
                //If user hits enter for a new room name.
                var newmusic = $('#chsong').val();
                sound.load(newmusic);
                reload();
            }
        });

         //Send the url to the friend.  When the friend goes to that url they will be in the same uniqune firebase location as this user.
         //Fire back to this user once the other user hits enter and set to play. SIMPLE.
         //FIREBASE READ

        myRootRef.on('child_changed', function (snapshot) {
            if (snapshot.val() === null) {
                // console.log("user is not ready");
            } else {
                if(snapshot.val().status == "Ready" && snapshot.val().status2 == "Ready" && myRootRef.toString() != "https://boiling-fire-1516.firebaseio.com/sync")
                {
                    
                      //  var myOffset = offset;

                    ///    var lag1 = snapshot.val().lag1;
                     //   var lag2 = snapshot.val().lag2;
                     //   var diff = lag1 - lag2;

                    //    if (myOffset == lag1) {
                   //         myOffset = lag2 * -1;
                   //     } else myOffset = lag1 * -1;

                    //    if (diff < 0)
                    //        diff = diff * -1;

                    //    setTimeout(playMusic(), diff);

                        playMusic();
                     //   console.log("Playing from " + diff);
                        myRootRef.remove();
                        Firebase.goOffline();

                    //});
                }
                //switch the time offsets?
                
                   

                    //sound.seekTo(offset * -1);
                    //sound.setVolume(0);
                    //sound.seekTo(Math.round((offset * -1)/2));
                    // sound.setVolume(100);
                    //console.log(Math.round((offset * -1) / 2));

                }

            });
            // var nname = snapshot.val();
            // //var sstatus = snapshot.val().status;
            // console.log('User ' + nname.name + ' ' + 'is ready');

            //sound.seekTo
            //sound.play();

        
        
        function playMusic() {

            flag = true;
            sound.play();
        }
    