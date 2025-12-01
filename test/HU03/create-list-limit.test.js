const { Builder, By } = require("selenium-webdriver");
const assert = require("assert");

describe("Crear nota lista - Prueba de Límites", function () {
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

    it("Debe permitir crear lista con muchas tareas", async () => {
        await driver.findElement(By.id("listTypeBtn")).click();

        for (let i = 1; i <= 10; i++) {
            await driver.findElement(By.css(".list-item-input")).sendKeys(`Cosa ${i}`);
            await driver.findElement(By.css(".add-item-btn")).click();
        }

        await driver.findElement(By.id("saveBtnText")).click();

        const count = await driver.findElement(By.id("notesCount")).getText();
        assert.ok(parseInt(count) >= 1);
    });
});
