const { Builder, By } = require("selenium-webdriver");
const assert = require("assert");

describe("Editar nota - Camino Feliz", function () {
    this.timeout(45000);
    let driver;

    before(async () => {
        driver = await new Builder().forBrowser("chrome").build();
        await driver.get("file:///C:/Users/nicol/OneDrive%20-%20Instituto%20Tecnológico%20de%20Las%20Américas%20(ITLA)/Universidad/UniversidadC3-2025/P03/Tarea%2304/views/login.html");
        await driver.findElement(By.id("username")).sendKeys("admin");
        await driver.findElement(By.id("password")).sendKeys("1234");
        await driver.findElement(By.css("button")).click();

        await driver.findElement(By.id("noteContent")).sendKeys("Nota inicial");
        await driver.findElement(By.id("saveBtnText")).click();
    });

    after(async () => await driver.quit());

    it("Debe editar una nota correctamente", async () => {
        await driver.findElement(By.css(".edit-btn")).click();

        const input = await driver.findElement(By.id("noteContent"));
        await input.clear();
        await input.sendKeys("Nota editada");

        await driver.findElement(By.id("saveBtnText")).click();

        const cardText = await driver.findElement(By.css(".note-text")).getText();
        assert.equal(cardText, "Nota editada");
    });
});
