const { Builder, By } = require("selenium-webdriver");
const assert = require("assert");

describe("Login - Prueba Negativa", function () {
    this.timeout(30000);
    let driver;

    before(async () => {
        driver = await new Builder().forBrowser("chrome").build();
    });

    after(async () => {
        await driver.quit();
    });

    it("Debe mostrar mensaje de error si las credenciales son incorrectas", async () => {
        await driver.get("file:///C:/Users/nicol/OneDrive%20-%20Instituto%20Tecnológico%20de%20Las%20Américas%20(ITLA)/Universidad/UniversidadC3-2025/P03/Tarea%2304/views/login.html");

        await driver.findElement(By.id("username")).sendKeys("fakeUser");
        await driver.findElement(By.id("password")).sendKeys("wrongPass");
        await driver.findElement(By.css("button")).click();

        const errorMsg = await driver.findElement(By.id("loginError")).getText();

        assert.equal(errorMsg, "Usuario o contraseña incorrectos");
    });
});
