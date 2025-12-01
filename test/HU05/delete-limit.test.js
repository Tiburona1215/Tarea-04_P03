const { Builder, By } = require("selenium-webdriver");
const assert = require("assert");

describe("Eliminar nota - Prueba de Límites", function () {
    this.timeout(50000);
    let driver;

    before(async () => {
        driver = await new Builder().forBrowser("chrome").build();
        await driver.get("file:///C:/Users/nicol/OneDrive%20-%20Instituto%20Tecnológico%20de%20Las%20Américas%20(ITLA)/Universidad/UniversidadC3-2025/P03/Tarea%2304/views/login.html");
        await driver.findElement(By.id("username")).sendKeys("admin");
        await driver.findElement(By.id("password")).sendKeys("1234");
        await driver.findElement(By.css("button")).click();

        for (let i = 1; i <= 5; i++) {
            await driver.findElement(By.id("noteContent")).sendKeys(`Nota ${i}`);
            await driver.findElement(By.id("saveBtnText")).click();
        }
    });

    after(async () => await driver.quit());

    it("Debe permitir borrar múltiples notas sin errores", async () => {
        let deleteButtons = await driver.findElements(By.css(".delete-btn"));

        for (const btn of deleteButtons) {
            await btn.click();
            let alert = await driver.switchTo().alert();
            await alert.accept();
        }

        const count = await driver.findElement(By.id("notesCount")).getText();
        assert.equal(parseInt(count), 0);
    });
});
