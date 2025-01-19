function registerUser() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    eel.register(username, password)(function(response) {
        if (response === "Регистрация успешна") {
            window.location.href = "work.html"; 
        } else {
            alert(response); 
        }
    });
}

function loginUser() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    eel.login(username, password)(function(response) {
        if (response === "Вход выполнен успешно") {
            window.location.replace("work.html"); 
        } else {
            alert(response); 
        }
    });
}

document.getElementById('registration-form').addEventListener('submit', function(event) {
    event.preventDefault();
    registerUser();
});

document.getElementById('login-button').addEventListener('click', loginUser);





