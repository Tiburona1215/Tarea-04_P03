//camino feliz
const { Builder, By, until } = require("selenium-webdriver");

(async function loginSuccess() {
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        await driver.get("http://localhost/login.html");

        await driver.findElement(By.id("username")).sendKeys("admin");
        await driver.findElement(By.id("password")).sendKeys("1234");
        await driver.findElement(By.css("button")).click();

        await driver.wait(until.urlContains("index.html"), 3000);
        console.log("✔ Login exitoso (happy path)");
    } catch (err) {
        console.log("❌ Error", err);
    } finally {
        await driver.quit();
    }
})();

//prueba negatica
const { Builder, By } = require("selenium-webdriver");

(async function loginFail() {
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        await driver.get("http://localhost/login.html");

        await driver.findElement(By.id("username")).sendKeys("malo");
        await driver.findElement(By.id("password")).sendKeys("0000");
        await driver.findElement(By.css("button")).click();

        const error = await driver.findElement(By.id("loginError")).getText();

        if (error.includes("incorrectos")) {
            console.log("✔ Prueba negativa correcta");
        }
    } finally {
        await driver.quit();
    }
})();

//limite
(async function loginEmpty() {
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        await driver.get("http://localhost/login.html");
        await driver.findElement(By.css("button")).click();

        const error = await driver.findElement(By.id("loginError")).getText();
        console.log("✔ Límite: detectó campos vacíos");
    } finally {
        await driver.quit();
    }
})();