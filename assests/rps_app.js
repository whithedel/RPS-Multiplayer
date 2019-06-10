


$(document).ready(function () {
    // initialize Firebase
    initFirebaseAuth();

    //handles signin on click function
    $('#loginBtn').on('click', signIn);

    //handles signout on click function
    $('#logoutBtn').on('click', signOut);

    //handles submit buttons
    $('#signUpBtn').on('click', handlesignUpBtnClick);

    //handles what happens when you click on a player button
    $(`.playerUserNameBtn`).on(`click`, handlePlayerUserNameBtnClick);


});

//function to handlesignUpBtnClick
function handlesignUpBtnClick() {
    event.preventDefault()
    var userName = $('#userName').val().trim();
    var email = userName + '@rhahekel.com';
    var password = $('#inputPassword1').val().trim();
    var password2 = $('#inputPassword2').val().trim();
    var hasError = false;
    console.log(1, hasError);
    if (validateForm(userName, password, password2)) {
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
            hasError = true;
            console.log(2, hasError);
            // Handle Errors here.
            //var errorCode = error.code;
            var errorMessage = error.message;
            alertMessage(errorMessage);
        }).then(addToDatabase)

        //function to update the database 
        function addToDatabase() {
            if (!hasError) {
                console.log(3, hasError);
                database = firebase.database();
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
    console.log(email)
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        // var errorCode = error.code;
        var errorMessage = error.message;
        alertMessage(errorMessage);
        // ...
    });
    //   $('#loginDropdown').hide();
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
        // $('#gameScreen').show();
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
}

//function to alert messages when it encounters an error
function alertMessage(errorMessage) {
    $('#alertMessage').html(errorMessage)
    $('#alertMessage').show();
}


//functoin to display allUser available to play with
function displayUserAvailable(user) {
    var database = firebase.database();
    var userListRef = database.ref(`userList`)
    userListRef.orderByChild(`userName`).on(`child_added`, function (data, prevChildKey) {
        var players = data.val();
        var databaseUsername = players.userName;
        var currentUser = user.email.split('@')[0];
        if (currentUser != databaseUsername) {
            var htmlText = `<li class="list-group-item">
                            <button type="button" class="btn btn-primary btn-lg btn-block playerUserNameBtn">
                                ${databaseUsername}
                            </button>
                        </li>`;
            $(`#userListSection`).append(htmlText);
        }
    })
};



