const { Builder, By } = require("selenium-webdriver");
const assert = require("assert");
const fs = require("fs");

describe("Eliminar nota - Camino Feliz", function () {
    this.timeout(45000);
    let driver;

    before(async () => {
        driver = await new Builder().forBrowser("chrome").build();
        await driver.get("file:///C:/Users/nicol/OneDrive%20-%20Instituto%20Tecnológico%20de%20Las%20Américas%20(ITLA)/Universidad/UniversidadC3-2025/P03/Tarea%2304/views/login.html");
        await driver.findElement(By.id("username")).sendKeys("admin");
        await driver.findElement(By.id("password")).sendKeys("1234");
        await driver.findElement(By.css("button")).click();

        await driver.findElement(By.id("noteContent")).sendKeys("Eliminar esta");
        await driver.findElement(By.id("saveBtnText")).click();
    });

    after(async () => await driver.quit());

    afterEach(async function () {
        const testName = this.currentTest.title.replace(/\s+/g, "_");
        const screenshot = await driver.takeScreenshot();
        fs.writeFileSync(`snapshots/${testName}.png`, screenshot, "base64");
    });

    it("Debe eliminar una nota correctamente", async () => {
        await driver.findElement(By.css(".delete-btn")).click();

        const alert = await driver.switchTo().alert();
        await alert.accept();

        const count = await driver.findElement(By.id("notesCount")).getText();
        assert.equal(parseInt(count), 0);
    });
});
