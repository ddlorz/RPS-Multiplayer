//Initialize firebase
//$(document).ready(function() {

    var config = {
        apiKey: "AIzaSyB18Sawudo5XNochSLpHbuXnsTe58BYyOc",
        authDomain: "rps-multiplayer-942bb.firebaseapp.com",
        databaseURL: "https://rps-multiplayer-942bb.firebaseio.com",
        projectId: "rps-multiplayer-942bb",
        storageBucket: "rps-multiplayer-942bb.appspot.com",
        messagingSenderId: "268631295473"
    };

    firebase.initializeApp(config);
    database = firebase.database();
    player1 = database.ref("player1");
    player2 = database.ref("player2");
    result = database.ref("result");
    chat = database.ref("chat");
    //End firebase initialization

    //Game main object
    //Contains global variables not available in database
    var RPS = {
        playerName: '',
        closedGame: false,
        player1Online: false,
        player1Play: '',    
        player1Result: 'LOSS', 
        player1Ready: false,   
        player1Score: 0,
        player2Online: false,
        player2Play: '',
        player2Result: 'LOSS',
        player2Ready: false,
        player2Score: 0,
        playerTag: '',
        playerSelect: '',
        arenaBadge: '',
        initialBadge: '',
        opponentTag: '',
        chatOnline: false,
        newGameBool: false,

        playerActivate: function(player, initialBadge, name) {
            player.update({active: true,
                            ready: false,
                            select: initialBadge,
                            name: name,
                            result: "LOSS"});
        },

        playerDeactivate: function(player) {
            player.child("active").onDisconnect().set(false);
            player.child("ready").onDisconnect().set(false);
        },

        playerResultUpdate: function(player1R, player2R) {
            player1.update({result: player1R});
            player2.update({result: player2R});
        },

        arenaDisplay: function(select, player) {
            var badge = '';
            switch (select) {
                case '-1':
                    badge = 'assets/images/player2.jpg';
                    break;
                case '0':
                    badge = 'assets/images/player1.jpg';
                    break;
                case '1':
                    badge = 'assets/images/rock.jpg';
                    break;
                case '2':
                    badge = 'assets/images/paper.jpg';
                    break;
                case '3':
                    badge = 'assets/images/scissors.jpg';
                    break;                    
            }
            
            if (player === player1) {
                $("#player1Arena").addClass('hide');
                $("#player1Arena").attr('src', badge); 
                $("#player1Arena").addClass('bounceInLeft');  
                $("#player1Arena").removeClass('hide');             
            }
            else if (player === player2) {
                $("#player2Arena").addClass('hide');
                $("#player2Arena").attr('src', badge);
                $("#player2Arena").addClass('bounceInRight');  
                $("#player2Arena").removeClass('hide');  
            }
        },

        newGame: function() {
            $("#player1Arena").attr('src', 'assets/images/player1.jpg');
            $("#player1Arena").removeClass('bounceInLeft');
            $("#player2Arena").attr('src', 'assets/images/player2.jpg');
            $("#player2Arena").removeClass('bounceInRight');
            $("#playButton").prop("disabled", false);
            $("#readyButton").prop("disabled", true);
            $("#readyButton").css("opacity", "1.0");
            $("#readyButton").text("Ready Signal");
            $('#playAgain').css('opacity', '1.0');
            $('#playAgain').text('Play Again?');  
            RPS.newGameBool = false;

        },

        gameReset: function() {
            result.update({finish: false});
            player1.update({select: '0',
                            ready: false,
                            newgame: false,
                            result: "LOSS"});
            player2.update({select: '-1',
                            ready: false,
                            newgame: false,
                            result: "LOSS"});     
        }, 

        displayScores: function() {
            console.log('display scores');
            player1.child('name').once('value', function(snapshot) {
                var player1name = snapshot.val();

                player2.child('name').once('value', function(snapshot) {
                    var player2name = snapshot.val();
                    var scoreOutput = "<strong>" + player1name + "</strong> : " + RPS.player1Score + " ---- " + RPS.player2Score + " : <strong>" + player2name + "</strong>";
                    chat.set({currentchat: scoreOutput}); 
                });
            });
            
        },

        opponentConnect: function(opponent) {
            RPS.opponentTag.child('active').on('value', function(snapshot) {
                if (!snapshot.val()) {
                    var DCtext = opponent + " has disconnected."
                    $("#chat").append(DCtext + "<br>");  
                }
                else if (snapshot.val()) {
                    var DCtext = opponent + " has connected."
                    $("#chat").append(DCtext + "<br>"); 
                }
            });
        },                    
    };        

    //Code to handle user login and logout
    //Sets user ID to player1 or player2 depending on availability otherwise none
    player1.once('value').then(function(snapshot) {       
        var players1Active = snapshot.val().active;

        if (players1Active) {
            player2.once('value').then(function(snapshot) {        
                var player2Active = snapshot.val().active;
                if (player2Active) {
                    RPS.player1Online = true;
                    RPS.player2Online = true;
                    RPS.closedGame = true;
                    console.log("A Game is Ongoing");
                    $("#playButton").prop("disabled", true);
                    $("#changeNameButton").prop("disabled", true);
                    $("#playerID").text("Game is Ongoing. Please try again later.")
                }
                else {                    
                    player2.update({score: 0,
                                    newgame: true});
                    //RPS.gameReset();             
                    RPS.playerTag = player2;
                    RPS.opponentTag = player1;
                    console.log('Player 2');
                    RPS.playerName = 'Player 2';
                    $("#playerID").text(RPS.playerName);
                    RPS.initialBadge = '-1';
                    RPS.playerActivate(RPS.playerTag, RPS.initialBadge, RPS.playerName);
                    player2Active = true;
                    RPS.players2Online = true;
                    RPS.playerDeactivate(RPS.playerTag);
                    RPS.opponentConnect('Player 1');

                    /*player1.child('ready').on('value', function(snapshot) {
                        player1.child('select').once('value', function(childsnapshot) {
                            //console.log(childsnapshot.val());
                            RPS.arenaDisplay(childsnapshot.val(), player1);
                            RPS.player1Ready = true;
                        });
                    });*/
                }
            });
        }
        else {
            player1.update({score: 0,
                            newgame: true});
            //RPS.gameReset();
            RPS.playerTag = player1;
            RPS.opponentTag = player2;            
            console.log('Player 1');
            RPS.playerName = 'Player 1';
            $("#playerID").text(RPS.playerName)
            RPS.initialBadge = '0';
            RPS.playerActivate(RPS.playerTag, RPS.initialBadge, RPS.playerName);       
            player1Active = true;
            RPS.player1Online = true;         
            RPS.playerDeactivate(RPS.playerTag);
            RPS.opponentConnect('Player 2');

            /*player2.child('ready').on('value', function(snapshot) {
                player2.child('select').once('value', function(childsnapshot) {
                    //console.log(childsnapshot.val());
                    RPS.arenaDisplay(childsnapshot.val(), player2);
                    RPS.player2Ready = true;
                });
            });*/
        }
    });   

    //Handles user RPS selection and toggles players readiness
    $(document).on("click", ".selection", function() {
        $("#playButton").prop("disabled", true);
        $("#readyButton").prop("disabled", false);
        $('#handSelection').iziModal('close');
        RPS.playerSelect = $(this).attr('value');
        //console.log(RPS.playerSelect);
        RPS.playerTag.update({select: RPS.playerSelect});
        RPS.arenaDisplay(RPS.playerSelect, RPS.playerTag);
   });
   
   //Handles user readiness. Extract opponents readiness and execute game as soon both are ready.
    $(document).on("click", "#readyButton", function() {    
        RPS.playerTag.update({ready: true});
        $("#readyButton").css("opacity", "0.5");
        $("#readyButton").text("Wating...");
        if (RPS.playerTag === player1) {
            player2.once('value').then(function(snapshot) {  
                if (snapshot.val().ready) {
                    //console.log("ready");    
                    RPS.player1Play = RPS.playerSelect;
                    RPS.player2Play = snapshot.val().select;
                    gameOn(RPS.player1Play, RPS.player2Play);            
                }
            });
        }
        else if (RPS.playerTag === player2) {
            player1.once('value').then(function(snapshot) {  
                if (snapshot.val().ready) {
                    //console.log("ready");    
                    RPS.player2Play = RPS.playerSelect;
                    RPS.player1Play = snapshot.val().select;
                    gameOn(RPS.player1Play, RPS.player2Play);              
                }
            });
        }    

        result.child('finish').on('value', function(snapshot) {   
            //console.log(snapshot.val());
            if (snapshot.val()) {
                RPS.playerTag.child('result').once('value', function(childsnapshot) {
                    //console.log(childsnapshot.val());
                    $('#gameResultText').text(childsnapshot.val()); 

                    setTimeout(function() {
                    $('#gameResult').iziModal('open');  
                    }, 500);

                    RPS.opponentTag.child('select').once('value', function(childchildsnapshot) {
                        RPS.arenaDisplay(childchildsnapshot.val(), RPS.opponentTag);
                    });                                            
                });                              
            }  
        });                        
    });

    //Process player1 and player2 select
    //Assign win, loss, or draw on player database
    function gameOn(player1G, player2G) {
        //console.log(player1G + " " + player2G);
        if ((parseInt(player2G) % 3) + 1 === parseInt(player1G)) {
            RPS.player1Result = "WIN";
            player1.child('score').once('value', function(snapshot) {
                RPS.player1Score = snapshot.val() + 1;
                player1.update({score: RPS.player1Score});
                RPS.displayScores();
            });
        }
        else if ((parseInt(player1G) % 3) + 1 === parseInt(player2G)) {
            RPS.player2Result = "WIN";
            player2.child('score').once('value', function(snapshot) {
                RPS.player2Score = snapshot.val() + 1;
                player2.update({score: RPS.player2Score});
                RPS.displayScores();
            });
        }
        else {RPS.player1Result = "DRAW"; RPS.player2Result = "DRAW";}

        //console.log(RPS.player1Result + " " + RPS.player2Result);
        RPS.playerResultUpdate(RPS.player1Result, RPS.player2Result);

        result.update({finish: true});     
    }

    //Play again function and restart game
    $(document).on("click", "#playAgain", function(event) {
        $('#playAgain').css('opacity', '0.5');   
        $('#playAgain').text('Waiting...');     
        //$('#playAgain').text('Waiting on ' + RPS.oppoent)
        RPS.newGameBool = true;
        RPS.playerTag.update({newgame: RPS.newGameBool});

        RPS.opponentTag.child("newgame").on('value', function(snapshot) {
            if (snapshot.val() && RPS.newGameBool) {
                RPS.gameReset();
                $("#gameResult").iziModal('close');
                RPS.playerActivate(RPS.playerTag, RPS.initialBadge, RPS.playerName);
                RPS.newGame();
            }
        });
        
    });

    $(document).on("click", "#submitNameChange", function(event){
        event.preventDefault();
        RPS.playerName = $("#nameInput").val();
        //console.log(RPS.playerName);
        if (RPS.playerName !== '') {
            $('#changeName').iziModal('close');
            $("#playerName").addClass('bounceInDown');
            $("#playerID").text(RPS.playerName);
            RPS.playerTag.update({name: RPS.playerName});
        }
    });

    //Handles player chat. When submitChat is clicked, input is stored in firebase
    $(document).on("click", "#submitChat", function(event) {
        event.preventDefault();        
        var userChatInput = RPS.playerName + " : " + $("#userChatInput").val();
        $("#userChatInput").val('');
        chat.set({currentchat: userChatInput});        
    });

    //Handles chat output. Listens to input change in firebase then posts it.
    chat.child("currentchat").on("value", function(snapshot) {
        if (RPS.chatOnline) {
            //console.log(snapshot.val());
            if (RPS.playerTag === player1) {
                var playerColor = 'blue';
            }
            else if (RPS.playerTag === player2) {
                var playerColor = 'red'
            }
            $("#chat").append(snapshot.val() + "<br>");
        }
        RPS.chatOnline = true;
    });    

    //Modal functions
    $(document).on('click', '#playButton', function (event) {
        event.preventDefault();
        player1.update({newgame: false});
        $('#handSelection').iziModal('open');
    });

    $(document).on('click', '#changeNameButton', function (event) {
        event.preventDefault();
        $("#playerName").removeClass('bounceInDown');
        $('#changeName').iziModal('open');
    });

    $("#handSelection").iziModal({
        title:'Select Hand',
        overlayClose: true,
        width: 600,
        autoOpen: false,
        overlayColor: 'rgba(0, 0, 0, 0.6)',
    });

    $("#gameResult").iziModal({
        overlayClose: false,
        width: 250,
        autoOpen: false,
        overlayColor: 'rgba(0, 0, 0, 0.6)',
    });

    $("#changeName").iziModal({
        title: 'Change Name',
        overlayClose: false,
        width: 300,
        autoOpen: false,
        overlayColor: 'rgba(0, 0, 0, 0.6)',
    });

//});
