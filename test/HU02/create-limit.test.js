const { Builder, By } = require("selenium-webdriver");
const assert = require("assert");

describe("Crear nota de texto - Prueba de Límites", function () {
    this.timeout(40000);
    let driver;

    before(async () => {
        driver = await new Builder().forBrowser("chrome").build();
        await driver.get("file:///C:/Users/nicol/OneDrive%20-%20Instituto%20Tecnológico%20de%20Las%20Américas%20(ITLA)/Universidad/UniversidadC3-2025/P03/Tarea%2304/views/login.html");
        await driver.findElement(By.id("username")).sendKeys("admin");
        await driver.findElement(By.id("password")).sendKeys("1234");
        await driver.findElement(By.css("button")).click();
    });

    after(async () => await driver.quit());

    it("Debe permitir guardar una nota con texto muy largo", async () => {
        const largo = "Hola, ".repeat(1600);
        await driver.findElement(By.id("noteContent")).sendKeys(largo);
        await driver.findElement(By.id("saveBtnText")).click();

        const count = await driver.findElement(By.id("notesCount")).getText();
        assert.ok(parseInt(count) >= 1);
    });
});
