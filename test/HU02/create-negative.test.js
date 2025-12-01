const { Builder, By } = require("selenium-webdriver");

describe("Crear nota de texto - Negativa", function () {
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

    it("Debe mostrar alerta si la nota está vacía", async () => {
        await driver.findElement(By.id("saveBtnText")).click();

        const alert = await driver.switchTo().alert();
        const msg = await alert.getText();
        await alert.accept();

        if (msg !== "La nota está vacía") throw new Error("No mostró la alerta correcta");
    });
});
