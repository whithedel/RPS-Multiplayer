

$(document).ready(function () {
    // initialize Firebase auth
    initFirebaseAuth();

    //handles signin on click function
    $('#loginBtn').on('click', signIn);

    //handles signout on click function
    $('#logoutBtn').on('click', signOut);

    //handles submit buttons
    $('#signUpBtn').on('click', handlesignUpBtnClick);

});

//Global variable 
var database = firebase.database();
var userListRef = database.ref(`userList`);
var gameRoomRef = database.ref(`gameRoom`);
var rock = 0;
var paper = 1;
var scissors = 2;
var player1score = 0;
var player2score = 0;

//function to handlesignUpBtnClick
function handlesignUpBtnClick() {
    event.preventDefault()
    var userName = $('#userName').val().trim();
    var email = userName + '@rhahekel.com';
    var password = $('#inputPassword1').val().trim();
    var password2 = $('#inputPassword2').val().trim();
    var hasError = false;
    if (validateForm(userName, password, password2)) {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
            hasError = true;
            // Handle Errors here.
            //var errorCode = error.code;
            var errorMessage = error.message;
            alertMessage(errorMessage);
        }).then(addToDatabase)

        //function to update the database 
        function addToDatabase() {
            if (!hasError) {
                var setUserListRef = database.ref(`userList`);
                setUserListRef.push({
                    "userName": userName,
                    "currentGames": ["null"],
                    "lastPlayed": "null",
                    "currentlyPlayingWith": ["null"],
                    "favoritePlayer": ["null"]
                })
            }
        }
    }
};



//function to handle the form and verify if the form filled properly or not 
function validateForm(userName, password, password2) {
    var validForm = true;
    var alphanumeric = /^[a-zA-Z0-9]+$/
    if (password !== password2) {
        validForm = false;
        alertMessage('Password does not match');
    }
    else if (!userName.match(alphanumeric)) {
        validForm = false;
        alertMessage('Username can only be alphanumeric');
    } else if (userName.lenght === 0) {
        validForm = false;

    } else if (password.lenght === 0) {
        validForm = false;

    }

    return validForm;
};


//function that allows users to be able to sign in 
function signIn() {
    event.preventDefault()
    var email = $('#emailInput').val().trim() + '@rhahekel.com';
    var password = $('#passwordInput').val().trim();
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        // var errorCode = error.code;
        var errorMessage = error.message;
        alertMessage(errorMessage);
        // ...
    });
};

//function that allows users to be able to sign out
function signOut() {
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
    }).catch(function (error) {
        // An error happened.
        var errorMessage = error.message;
        alertMessage(errorMessage);
    });
    location.reload();
};

// Triggers when the auth  **user** state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {

    if (user) {
        // User is signed in.
        //function to display all available Players
        displayUserAvailable(user);
        $('#userLogSection').hide();
        $('#logoutBtn').show();
        $('#loginDropdown').hide();
        $('#dropdownMenu1').hide();
        $(`#pickAuserSection`).show();
    } else {
        // No user is signed in. user is signout
        $('userListSection').show()
    }
};

// Initiate Firebase Auth.
function initFirebaseAuth() {
    // Listen to auth **user** state changes.
    firebase.auth().onAuthStateChanged(authStateObserver);
};

//function to alert messages when it encounters an error
function alertMessage(errorMessage) {
    $('#alertMessage').html(errorMessage)
    $('#alertMessage').show();
};


//functoin to display allUser available to play with
function displayUserAvailable(user) {
    userListRef.orderByChild(`userName`).on(`child_added`, function (data, prevChildKey) {
        var players = data.val();
        var databaseUsername = players.userName;
        var currentUser = user.email.split('@')[0];
        if (currentUser != databaseUsername) {
            var htmlText = `<li class="list-group-item">
                            <button value="${databaseUsername}" type="button" class="btn btn-primary btn-lg btn-block playerUserNameBtn" id="players-${databaseUsername}">
                                ${databaseUsername}
                            </button>
                        </li>`;
            $(`#userListSection`).append(htmlText);

            //setting up a listener on all buttons to manage this function *handlePlayerUserNameBtnClick* 
            $(`#players-${databaseUsername}`).on('click', function () {
                handlePlayerUserNameBtnClick(currentUser, databaseUsername);
            })
        }
    })
};

//all the logics for handlePlayerUserNameBtnClick that will start and game and show the game state.
function handlePlayerUserNameBtnClick(currentUser, otherPlayer) {
    console.log(otherPlayer);
    $(`#gameScreen`).show();
    $(`#pickAuserSection`).hide();
    console.log(currentUser)
    //variables for this function
    var p1p2 = currentUser + '+' + otherPlayer;
    var p2p1 = otherPlayer + '+' + currentUser;
    var gameroomExist = false;
    var currentUserChoice = '';
    var otherPlayerChoice = '';
    var currentUserScore = 0;
    var otherPlayerScore = 0;
    var games = null;
    var p1choice = 'null';
    var p2choice = 'null';
    var p1score = '';
    var p2score = '';
    var gameKey = '';
    gameRoomRef.once('value', function (snapshot) {
        console.log(snapshot)
        games = Object.entries(snapshot.val());
        console.log(Object.keys(snapshot.val()))
        games.forEach(function (data, index) {
            console.log(data.namepair);

        })
        console.log(games)
        console.log(Object.values(snapshot.val()).lenght)
        for (var i = 0; i < games.length; i += 1) {
            console.log(games.lenght + i)
            var namePair = games[i][1].namepair;
            console.log(`namePair: ${namePair}; p1p2: ${p1p2}; p2p1: ${p2p1}`);
            if (namePair === p1p2 || namePair === p2p1) {
                gameKey = games[i][0];
                gameroomExist = true;
                console.log(gameroomExist + '1')
                p1choice = currentUser + '\'s choice';
                p2choice = otherPlayer + '\'s choice';
                p1score = currentUser + '\'s score';
                p2score = otherPlayer + '\'s score';

                currentUserScore = Object.values(snapshot.val())[i][p1score];
                otherPlayerScore = Object.values(snapshot.val())[i][p2score];
                console.log(Object.values(snapshot.val())[i][p1score])
                //handles the function to show players score
                badgesOfPlayersScore(currentUserScore, otherPlayerScore);
                console.log(Object.values(snapshot.val())[i][p1score])
                // var currentUserScore = Object.values(snapshot.val())[i][p1score];

                currentUserChoice = Object.values(snapshot.val())[i][p1choice];
                otherPlayerChoice = Object.values(snapshot.val())[i][p2choice];
                // //handle the function that runs the game logic
                // handleGameLogic(currentUserChoice, otherPlayerChoice, gameKey, p1choice, p2choice, p1score, p2score);
                gameRoomRef.on('value', function (snapshot) {

                    console.log(currentUserChoice, otherPlayerChoice);
                    console.log(currentUserScore, otherPlayerScore)
                    console.log(currentUser, otherPlayer)
                    // currentUserChoice = snapshot.val()
                    // otherPlayerChoice = 
                    if (currentUserChoice === `null` && otherPlayerChoice === `null`) {
                        $(`#action-message`).html('Make your move');
                        console.log(`im here 1234`)
                        $(document).on(`click`, `#r`, function () {
                            currentUserChoice = rock;
                            var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
                            currentUserChoiceRef.set(currentUserChoice);
                            $(`#action-message`).html('Waiting on second player to make their move');
                            handlePlayerUserNameBtnClick(currentUser, otherPlayer)
                        })
                        $(document).on(`click`, `#p`, function () {
                            currentUserChoice = paper;
                            var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
                            currentUserChoiceRef.set(currentUserChoice);
                            $(`#action-message`).html('Waiting on second player to make their move')
                            handlePlayerUserNameBtnClick(currentUser, otherPlayer)
                        })
                        $(document).on(`click`, `#s`, function () {
                            currentUserChoice = scissors;
                            var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
                            currentUserChoiceRef.set(currentUserChoice);
                            $(`#action-message`).html('Waiting on second player to make their move')
                            handlePlayerUserNameBtnClick(currentUser, otherPlayer)
                        })

                    } else if (currentUserChoice !== `null` && otherPlayerChoice === `null`) {
                        $(`#action-message`).html('Make your move');

                        $(document).on(`click`, `#r`, function () {
                            currentUserChoice = rock;
                            var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
                            currentUserChoiceRef.set(currentUserChoice);
                            $(`#action-message`).html('Waiting on second player to make their move')
                            handlePlayerUserNameBtnClick(currentUser, otherPlayer)
                        })
                        $(document).on(`click`, `#p`, function () {
                            currentUserChoice = paper;
                            var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
                            currentUserChoiceRef.set(currentUserChoice);
                            $(`#action-message`).html('Waiting on second player to make their move')
                            handlePlayerUserNameBtnClick(currentUser, otherPlayer)
                        })
                        $(document).on(`click`, `#s`, function () {
                            currentUserChoice = scissors;
                            var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
                            currentUserChoiceRef.set(currentUserChoice);
                            $(`#action-message`).html('Waiting on second player to make their move')
                            handlePlayerUserNameBtnClick(currentUser, otherPlayer)
                        })
                    } else if (currentUserChoice !== `null` && otherPlayerChoice !== `null`) {

                        if (currentUserChoice === otherPlayerChoice) {
                            console.log('hahahahahahahaahahahahahah')
                        } else if ((currentUserChoice - otherPlayerChoice + 3) % 3 === 1) {


                            handlePlayerUserNameBtnClick(currentUser, otherPlayer)
                            currentUserScore++;

                            var currentUserScoreRef = database.ref(`gameRoom/${gameKey}/${p1score}`)
                            currentUserScoreRef.set(currentUserScore).then(function () {
                                console.log('Gharvhel')
                                var player1ScoreRef = database.ref(`gameRoom/${gameKey}/${p1choice}`)
                                player1ScoreRef.set(`null`)
                                var player2ScoreRef = database.ref(`gameRoom/${gameKey}/${p2choice}`)
                                player2ScoreRef.set(`null`)
                            })


                            // var currentGameRef = database.ref(`gameRoom/${gameKey}`)
                            // currentGameRef.set({
                            //     [p1score]: p1score,
                            //     [p2score]: p2score,
                            //     [p1choice]: `null`,
                            //     [p2choice]: `null`
                            // })
                        } else {
                            // p2score++;
                            // var currentUserScoreRef = database.ref(`gameRoom/${gameKey}/${p2score}`)
                            // currentUserScoreRef.set(p2score)
                            // var player1ScoreRef = database.ref(`gameRoom/${gameKey}/${p1choice}`)
                            // player1ScoreRef.set(`null`)
                            // var player2ScoreRef = database.ref(`gameRoom/${gameKey}/${p2choice}`)
                            // player2ScoreRef.set(`null`)
                            // var currentUserScoreRef = database.ref(`gameRoom/${gameKey}/${p2score}`)
                            // currentUserScoreRef.set(player2score)
                        }



                    }
                })

            }
        }
    }).then(function () {
        if (!gameroomExist) {
            p1choice = currentUser + '\'s choice';
            p2choice = otherPlayer + '\'s choice';
            p1score = currentUser + '\'s score';
            p2score = otherPlayer + '\'s score';
            gameRoomRef.push({
                "namepair": `${currentUser}+${otherPlayer}`,
                [p1choice]: "null",
                [p2choice]: "null",
                [p1score]: '',
                [p2score]: '',
            }).then(function () {
                //handles the function to show players score
                badgesOfPlayersScore(currentUserScore, otherPlayerScore);

                // //handle the function that runs the game logic
                // handleGameLogic(currentUserChoice, otherPlayerChoice, gameKey, p1choice, p2choice, p1score, p1p2, p2p1, currentUser, p2score);

                handlePlayerUserNameBtnClick(currentUser, otherPlayer);
                gameRoomRef.on('value', function (snapshot) {
                    if (currentUserChoice === `null` && otherPlayerChoice === `null`) {
                        $(`#action-message`).html('Make your move');
                        console.log(`im here 1234`)
                        $(document).on(`click`, `#r`, function () {
                            currentUserChoice = rock;
                            var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
                            currentUserChoiceRef.set(currentUserChoice);
                            $(`#action-message`).html('Waiting on second player to make their move');
                        })
                        $(document).on(`click`, `#p`, function () {
                            currentUserChoice = paper;
                            var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
                            currentUserChoiceRef.set(currentUserChoice);
                            $(`#action-message`).html('Waiting on second player to make their move')
                        })
                        $(document).on(`click`, `#s`, function () {
                            currentUserChoice = scissors;
                            var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
                            currentUserChoiceRef.set(currentUserChoice);
                            $(`#action-message`).html('Waiting on second player to make their move')
                        })

                    } else if (currentUserChoice === `null` && otherPlayerChoice !== `null`) {
                        $(`#action-message`).html('Make your move');

                        $(document).on(`click`, `#r`, function () {
                            currentUserChoice = rock;
                            var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
                            currentUserChoiceRef.set(currentUserChoice);
                            $(`#action-message`).html('Waiting on second player to make their move')
                        })
                        $(document).on(`click`, `#p`, function () {
                            currentUserChoice = paper;
                            var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
                            currentUserChoiceRef.set(currentUserChoice);
                            $(`#action-message`).html('Waiting on second player to make their move')
                        })
                        $(document).on(`click`, `#s`, function () {
                            currentUserChoice = scissors;
                            var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
                            currentUserChoiceRef.set(currentUserChoice);
                            $(`#action-message`).html('Waiting on second player to make their move')
                        })
                    } else if (currentUserChoice !== `null` && otherPlayerChoice !== `null`) {


                        if (currentUserChoice === otherPlayerChoice) {

                        } else if ((currentUserChoice - otherPlayerChoice + 3) % 3 === 1) {
                            p1score + 1;
                            var currentUserScoreRef = database.ref(`gameRoom/${gameKey}/${p1score}`)
                            currentUserScoreRef.set(p1score)
                            var player1ScoreRef = database.ref(`gameRoom/${gameKey}/${p1choice}`)
                            player1ScoreRef.set(`null`)
                            var player2ScoreRef = database.ref(`gameRoom/${gameKey}/${p2choice}`)
                            player2ScoreRef.set(`null`)

                            // var currentGameRef = database.ref(`gameRoom/${gameKey}`)
                            // currentGameRef.set({
                            //     [p1score]: p1score,
                            //     [p2score]: p2score,
                            //     [p1choice]: `null`,
                            //     [p2choice]: `null`
                            // })
                        } else {
                            p2score + 1;
                            var currentUserScoreRef = database.ref(`gameRoom/${gameKey}/${p2score}`)
                            currentUserScoreRef.set(p2score)
                            var player1ScoreRef = database.ref(`gameRoom/${gameKey}/${p1choice}`)
                            player1ScoreRef.set(`null`)
                            var player2ScoreRef = database.ref(`gameRoom/${gameKey}/${p2choice}`)
                            player2ScoreRef.set(`null`)
                            // var currentUserScoreRef = database.ref(`gameRoom/${gameKey}/${p2score}`)
                            // currentUserScoreRef.set(player2score)
                        }


                    }
                })
            })

        }

    })
    //handles the function to show players name
    badgesOfPlayers(currentUser, otherPlayer);
};

//function to loop through the gameRoom data
function gameRoomDataLoop() {

}


//function that shows players name on html
function badgesOfPlayers(currentUser, otherPlayer) {
    $(`#user-label`).html(currentUser);
    $(`#computer-label`).html(otherPlayer);
};

//function that shows players Score on html
function badgesOfPlayersScore(currentUserScore, otherPlayerScore) {
    $(`#user-score`).html(currentUserScore);
    $(`#computer-score`).html(otherPlayerScore);
};


//function to handle the game logic 
// function handleGameLogic(currentUserChoice, otherPlayerChoice, gameKey, p1choice, p2choice, p1score, p1p2, p2p1, currentUser, p2score) {
//     gameRoomRef.once(`value`, function (snapshot) {
//         console.log(snapshot.val())
//         console.log(`im here 1`)
//         console.log(gameKey)
//         var games = Object.values(snapshot.val());

//         if (currentUserChoice === `null` && otherPlayerChoice === `null`) {
//             $(`#action-message`).html('Make your move');
//             console.log(`im here 1234`)
//             $(document).on(`click`, `#r`, function () {
//                 currentUserChoice = rock;
//                 var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
//                 currentUserChoiceRef.set(currentUserChoice);
//                 $(`#action-message`).html('Waiting on second player to make their move');
//             })
//             $(document).on(`click`, `#p`, function () {
//                 currentUserChoice = paper;
//                 var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
//                 currentUserChoiceRef.set(currentUserChoice);
//                 $(`#action-message`).html('Waiting on second player to make their move')
//             })
//             $(document).on(`click`, `#s`, function () {
//                 currentUserChoice = scissors;
//                 var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
//                 currentUserChoiceRef.set(currentUserChoice);
//                 $(`#action-message`).html('Waiting on second player to make their move')
//             })

//         } else if (currentUserChoice === `null` && otherPlayerChoice !== `null`) {
//             $(`#action-message`).html('Make your move');

//             $(document).on(`click`, `#r`, function () {
//                 currentUserChoice = rock;
//                 var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
//                 currentUserChoiceRef.set(currentUserChoice);
//                 $(`#action-message`).html('Waiting on second player to make their move')
//             })
//             $(document).on(`click`, `#p`, function () {
//                 currentUserChoice = paper;
//                 var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
//                 currentUserChoiceRef.set(currentUserChoice);
//                 $(`#action-message`).html('Waiting on second player to make their move')
//             })
//             $(document).on(`click`, `#s`, function () {
//                 currentUserChoice = scissors;
//                 var currentUserChoiceRef = database.ref(`gameRoom/${gameKey}/${p1choice}`);
//                 currentUserChoiceRef.set(currentUserChoice);
//                 $(`#action-message`).html('Waiting on second player to make their move')
//             })
//         }
//     }).then(function (){
//         gameRoomRef.on(`child_added`, function (data, prevChildKey) {
//             var currentUserPick = false;
//             var otherPlayerPick = false;
//             console.log('hey how are you')
//             console.log(data.val().namepair)
//             var databaseUsername = data.val().namepair.split('+')[1];
//             var player2 = data.val().namepair.split('+')[0];
//             console.log(player2,databaseUsername)
//             console.log(currentUserChoice, otherPlayerChoice)
//             if (currentUserChoice !== `null` && otherPlayerChoice !== `null`) {

//                 if (currentUserChoice === otherPlayerChoice) {

//                 } else if ((currentUserChoice - otherPlayerChoice + 3) % 3 === 1) {
//                     player1score++;
//                     var currentUserScoreRef = database.ref(`gameRoom/${gameKey}/${p1score}`)
//                     currentUserScoreRef.set(player1score)
//                     var player1ScoreRef = database.ref(`gameRoom/${gameKey}/${p1choice}`)
//                     player1ScoreRef.set(`null`)
//                     var player2ScoreRef = database.ref(`gameRoom/${gameKey}/${p2choice}`)
//                     player2ScoreRef.set(`null`)

//                     // var currentGameRef = database.ref(`gameRoom/${gameKey}`)
//                     // currentGameRef.set({
//                     //     [p1score]: p1score,
//                     //     [p2score]: p2score,
//                     //     [p1choice]: `null`,
//                     //     [p2choice]: `null`
//                     // })
//                 } else {
//                     player2score++;
//                     var currentUserScoreRef = database.ref(`gameRoom/${gameKey}/${p1score}`)
//                     currentUserScoreRef.set(player1score)
//                     var player1ScoreRef = database.ref(`gameRoom/${gameKey}/${p1choice}`)
//                     player1ScoreRef.set(`null`)
//                     var player2ScoreRef = database.ref(`gameRoom/${gameKey}/${p2choice}`)
//                     player2ScoreRef.set(`null`)
//                     // var currentUserScoreRef = database.ref(`gameRoom/${gameKey}/${p2score}`)
//                     // currentUserScoreRef.set(player2score)
//                 }

//             }

//             // games.forEach(function (data) {
//             //     console.log(data.namepair.split('+')[0])
//             //     var namePair = data.namePair
//             //     if (namePair === p1p2 || namePair === p2p1) {
//             //         if (currentUser) {
//             //             console.log(otherPlayerChoice);
//             //         }
//             //     }
//             // })
//             // currentUserChoice = 'null';
//             // otherPlayerChoice = 'null';
//         })


//     })



// }