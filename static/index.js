const symbols = '01'; 
const container = document.body;

function createSymbol() {
    const symbol = document.createElement('span');
    symbol.classList.add('symbol');
    symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    symbol.style.left = Math.random() * 100 + 'vw';
    symbol.style.animationDuration = (Math.random() * 5 + 10) + 's'; 
    symbol.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(symbol);

    setTimeout(() => {
        symbol.remove();
    }, 20000);
}

function startMatrix() {
    setInterval(createSymbol, 10); 
}

eel.expose(startMatrix);

window.onload = startMatrix;

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



