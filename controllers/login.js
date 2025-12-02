function login() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    const dbUser = "admin";
    const dbPass = "1234";

    if (user === dbUser && pass === dbPass) {
        localStorage.setItem("logged", "true");
        window.location.href = "index.html";
    } else {
        document.getElementById("loginError").textContent = "Usuario o contraseña incorrectos";
    }
}

function logout() {
    localStorage.removeItem("logged");
    window.location.href = "login.html";
}

if (localStorage.getItem("logged") === "true") {
    window.location.href = "index.html";
}
