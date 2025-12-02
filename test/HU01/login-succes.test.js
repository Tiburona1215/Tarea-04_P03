const { Builder, By, until } = require("selenium-webdriver");
const assert = require("assert");
const fs = require("fs");

describe("Login - Camino Feliz", function () {
    this.timeout(30000);
    let driver;

    before(async () => {
        driver = await new Builder().forBrowser("chrome").build();
    });

    after(async () => {
        await driver.quit();
    });

    afterEach(async function () {
        const testName = this.currentTest.title.replace(/\s+/g, "_");
        const screenshot = await driver.takeScreenshot();
        if (!fs.existsSync("snapshots")) {
            fs.mkdirSync("snapshots");
        }
        fs.writeFileSync(`snapshots/${testName}.png`, screenshot, "base64");
    });

    it("Debe iniciar sesión correctamente con admin1234", async () => {
        await driver.get("file:///C:/Users/nicol/OneDrive%20-%20Instituto%20Tecnológico%20de%20Las%20Américas%20(ITLA)/Universidad/UniversidadC3-2025/P03/Tarea%2304/views/login.html");

        await driver.findElement(By.id("username")).sendKeys("admin");
        await driver.findElement(By.id("password")).sendKeys("1234");
        await driver.findElement(By.css("button")).click();

        await driver.wait(until.urlContains("index.html"), 5500);

        const url = await driver.getCurrentUrl();
        assert.ok(url.includes("index.html"));
    });
});
