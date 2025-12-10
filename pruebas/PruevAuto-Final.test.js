const { Builder, By, until } = require("selenium-webdriver");
const assert = require("assert");
const fs = require("fs");
const path = require("path");

describe("Suite Completa de Pruebas - Blog de Notas", function () {
    this.timeout(60000);
    let driver;
    const loginUrl = "http://localhost:5500/views/login.html";
    const snapshotsDir = path.join(__dirname, "snapshots");

    before(async () => {
        if (!fs.existsSync(snapshotsDir)) {
            fs.mkdirSync(snapshotsDir, { recursive: true });
        }
        driver = await new Builder().forBrowser("chrome").build();
    });

    after(async () => {
        await driver.quit();
    });

    afterEach(async function () {
        const testName = this.currentTest.title.replace(/\s+/g, "_");
        const status = this.currentTest.state === "passed" ? "PASS" : "FAIL";
        const screenshot = await driver.takeScreenshot();
        const timestamp = Date.now();
        fs.writeFileSync(
            path.join(snapshotsDir, `${status}_${testName}_${timestamp}.png`),
            screenshot,
            "base64"
        );
    });

    describe("HU01 - Login", function () {
        
        it("Debe iniciar sesión correctamente con credenciales válidas", async function () {
            await driver.get(loginUrl);
            await driver.findElement(By.id("username")).sendKeys("admin");
            await driver.findElement(By.id("password")).sendKeys("1234");
            await driver.findElement(By.css("button")).click();
            
            await driver.wait(until.urlContains("index.html"), 5000);
            const url = await driver.getCurrentUrl();
            assert.ok(url.includes("index.html"), "No redirigió a index.html");
     
            await driver.executeScript("localStorage.clear()");
        });

        it("Debe mostrar error con credenciales incorrectas", async function () {
            await driver.get(loginUrl);
            await driver.findElement(By.id("username")).sendKeys("fakeUser");
            await driver.findElement(By.id("password")).sendKeys("wrongPass");
            await driver.findElement(By.css("button")).click();
            
            const errorMsg = await driver.findElement(By.id("loginError")).getText();
            assert.equal(errorMsg, "Usuario o contraseña incorrectos");
        });

        it("Debe mostrar error con campos vacíos", async function () {
            await driver.get(loginUrl);
            await driver.findElement(By.id("username")).clear();
            await driver.findElement(By.id("password")).clear();
            await driver.findElement(By.css("button")).click();
            
            const errorMsg = await driver.findElement(By.id("loginError")).getText();
            assert.equal(errorMsg, "Usuario o contraseña incorrectos");
        });
    });

    describe("HU02 - Crear Nota de Texto", function () {
        
        beforeEach(async function () {
            await driver.get(loginUrl);
            await driver.findElement(By.id("username")).sendKeys("admin");
            await driver.findElement(By.id("password")).sendKeys("1234");
            await driver.findElement(By.css("button")).click();
            await driver.wait(until.urlContains("index.html"), 5000);
        });

        afterEach(async function () {
            await driver.executeScript("localStorage.clear()");
        });

        it("Debe crear una nota de texto correctamente", async function () {
            await driver.findElement(By.id("noteContent")).sendKeys("Mi primera nota de prueba");
            await driver.findElement(By.id("saveBtnText")).click();
            
            const count = await driver.findElement(By.id("notesCount")).getText();
            assert.equal(parseInt(count), 1);
            
            const noteText = await driver.findElement(By.css(".note-text")).getText();
            assert.equal(noteText, "Mi primera nota de prueba");
        });

        it("Debe mostrar alerta si la nota está vacía", async function () {
            await driver.findElement(By.id("saveBtnText")).click();
            
            const alert = await driver.switchTo().alert();
            const msg = await alert.getText();
            await alert.accept();
            
            assert.equal(msg, "La nota está vacía");
        });

        it("Debe permitir crear nota con texto muy largo", async function () {
            const largeText = "Texto largo. ".repeat(200);
            await driver.findElement(By.id("noteContent")).sendKeys(largeText);
            await driver.findElement(By.id("saveBtnText")).click();
            
            const count = await driver.findElement(By.id("notesCount")).getText();
            assert.ok(parseInt(count) >= 1);
        });
    });

    describe("HU03 - Crear Nota de Lista", function () {
        
        beforeEach(async function () {
            await driver.get(loginUrl);
            await driver.findElement(By.id("username")).sendKeys("admin");
            await driver.findElement(By.id("password")).sendKeys("1234");
            await driver.findElement(By.css("button")).click();
            await driver.wait(until.urlContains("index.html"), 5000);
        });

        afterEach(async function () {
            await driver.executeScript("localStorage.clear()");
        });

        it("Debe crear una lista con tareas correctamente", async function () {
            await driver.findElement(By.id("listTypeBtn")).click();
            await driver.wait(until.elementLocated(By.css(".list-item-input")), 3000);
            
            const input = await driver.findElement(By.css(".list-item-input"));
            await input.sendKeys("Comprar leche");
            await driver.findElement(By.id("saveBtnText")).click();
            
            const count = await driver.findElement(By.id("notesCount")).getText();
            assert.equal(parseInt(count), 1);
        });

        it("Debe mostrar alerta si la lista está vacía", async function () {
            await driver.findElement(By.id("listTypeBtn")).click();
            await driver.findElement(By.id("saveBtnText")).click();
            
            const alert = await driver.switchTo().alert();
            const msg = await alert.getText();
            await alert.accept();
            
            assert.equal(msg, "Agrega al menos un elemento a la lista");
        });

        it("Debe permitir crear lista con múltiples tareas", async function () {
            await driver.findElement(By.id("listTypeBtn")).click();
            
            for (let i = 1; i <= 5; i++) {
                const inputs = await driver.findElements(By.css(".list-item-input"));
                await inputs[inputs.length - 1].sendKeys(`Tarea ${i}`);
                if (i < 5) {
                    await driver.findElement(By.css(".add-item-btn")).click();
                }
            }
            
            await driver.findElement(By.id("saveBtnText")).click();
            
            const count = await driver.findElement(By.id("notesCount")).getText();
            assert.ok(parseInt(count) >= 1);
        });
    });

    describe("HU04 - Editar Notas", function () {
        
        beforeEach(async function () {
            await driver.get(loginUrl);
            await driver.findElement(By.id("username")).sendKeys("admin");
            await driver.findElement(By.id("password")).sendKeys("1234");
            await driver.findElement(By.css("button")).click();
            await driver.wait(until.urlContains("index.html"), 5000);
            
            await driver.findElement(By.id("noteContent")).sendKeys("Nota original");
            await driver.findElement(By.id("saveBtnText")).click();
            await driver.sleep(500);
        });

        afterEach(async function () {
            await driver.executeScript("localStorage.clear()");
        });

        it("Debe editar una nota correctamente", async function () {
            await driver.findElement(By.css(".edit-btn")).click();
            
            const input = await driver.findElement(By.id("noteContent"));
            await input.clear();
            await input.sendKeys("Nota editada exitosamente");
            await driver.findElement(By.id("saveBtnText")).click();
            
            await driver.sleep(500);
            const noteText = await driver.findElement(By.css(".note-text")).getText();
            assert.equal(noteText, "Nota editada exitosamente");
        });

        it("Debe impedir guardar una nota vacía al editar", async function () {
            await driver.findElement(By.css(".edit-btn")).click();
            
            const input = await driver.findElement(By.id("noteContent"));
            await input.clear();
            await driver.findElement(By.id("saveBtnText")).click();
            
            const alert = await driver.switchTo().alert();
            const msg = await alert.getText();
            await alert.accept();
            
            assert.equal(msg, "La nota está vacía");
        });

        it("Debe cambiar el texto del botón al editar", async function () {
            await driver.findElement(By.css(".edit-btn")).click();
            
            const btnText = await driver.findElement(By.id("saveBtnText")).getText();
            assert.equal(btnText, "Actualizar Nota");
        });
    });

    describe("HU05 - Eliminar Notas", function () {
        
        beforeEach(async function () {
            await driver.get(loginUrl);
            await driver.findElement(By.id("username")).sendKeys("admin");
            await driver.findElement(By.id("password")).sendKeys("1234");
            await driver.findElement(By.css("button")).click();
            await driver.wait(until.urlContains("index.html"), 5000);
            
            await driver.findElement(By.id("noteContent")).sendKeys("Nota para eliminar");
            await driver.findElement(By.id("saveBtnText")).click();
            await driver.sleep(500);
        });

        afterEach(async function () {
            await driver.executeScript("localStorage.clear()");
        });

        it("Debe eliminar una nota correctamente", async function () {
            await driver.findElement(By.css(".delete-btn")).click();
            
            const alert = await driver.switchTo().alert();
            await alert.accept();
            
            const count = await driver.findElement(By.id("notesCount")).getText();
            assert.equal(parseInt(count), 0);
        });

        it("No debe eliminar la nota si se cancela", async function () {
            await driver.findElement(By.css(".delete-btn")).click();
            
            const alert = await driver.switchTo().alert();
            await alert.dismiss();
            
            const count = await driver.findElement(By.id("notesCount")).getText();
            assert.equal(parseInt(count), 1);
        });

        it("Debe eliminar múltiples notas correctamente", async function () {
            for (let i = 2; i <= 3; i++) {
                await driver.findElement(By.id("noteContent")).sendKeys(`Nota ${i}`);
                await driver.findElement(By.id("saveBtnText")).click();
                await driver.sleep(300);
            }
            
            let deleteButtons = await driver.findElements(By.css(".delete-btn"));
            for (const btn of deleteButtons) {
                await btn.click();
                const alert = await driver.switchTo().alert();
                await alert.accept();
                await driver.sleep(300);
            }
            
            const count = await driver.findElement(By.id("notesCount")).getText();
            assert.equal(parseInt(count), 0);
        });
    });

    describe("HU06 - Marcar Tareas Completadas", function () {
        
        beforeEach(async function () {
            await driver.get(loginUrl);
            await driver.findElement(By.id("username")).sendKeys("admin");
            await driver.findElement(By.id("password")).sendKeys("1234");
            await driver.findElement(By.css("button")).click();
            await driver.wait(until.urlContains("index.html"), 5000);
            
            // Crear una lista
            await driver.findElement(By.id("listTypeBtn")).click();
            const input = await driver.findElement(By.css(".list-item-input"));
            await input.sendKeys("Tarea de prueba");
            await driver.findElement(By.id("saveBtnText")).click();
            await driver.sleep(500);
        });

        afterEach(async function () {
            await driver.executeScript("localStorage.clear()");
        });

        it("Debe marcar una tarea como completada", async function () {
            const checkbox = await driver.findElement(By.css(".checkbox"));
            await checkbox.click();
            await driver.sleep(300);
            
            const isChecked = await checkbox.getAttribute("class");
            assert.ok(isChecked.includes("checked"));
        });

        it("Debe desmarcar una tarea completada", async function () {
            const checkbox = await driver.findElement(By.css(".checkbox"));
            
            await checkbox.click();
            await driver.sleep(300);
            
            await checkbox.click();
            await driver.sleep(300);
            
            const isChecked = await checkbox.getAttribute("class");
            assert.ok(!isChecked.includes("checked") || isChecked === "checkbox");
        });
    });

    describe("Flujo Completo E2E", function () {
        
        beforeEach(async function () {
            await driver.executeScript("localStorage.clear()");
        });

        it("Debe ejecutar un flujo completo de usuario", async function () {

            await driver.get(loginUrl);
            await driver.findElement(By.id("username")).sendKeys("admin");
            await driver.findElement(By.id("password")).sendKeys("1234");
            await driver.findElement(By.css("button")).click();
            await driver.wait(until.urlContains("index.html"), 5000);
            
            await driver.findElement(By.id("noteContent")).sendKeys("Primera nota");
            await driver.findElement(By.id("saveBtnText")).click();
            await driver.sleep(500);
            
            await driver.findElement(By.id("listTypeBtn")).click();
            const input = await driver.findElement(By.css(".list-item-input"));
            await input.sendKeys("Comprar pan");
            await driver.findElement(By.id("saveBtnText")).click();
            await driver.sleep(500);
            
            let count = await driver.findElement(By.id("notesCount")).getText();
            assert.equal(parseInt(count), 2);
            
            const editButtons = await driver.findElements(By.css(".edit-btn"));
            await editButtons[1].click();
            const noteContent = await driver.findElement(By.id("noteContent"));
            await noteContent.clear();
            await noteContent.sendKeys("Nota editada en flujo completo");
            await driver.findElement(By.id("saveBtnText")).click();
            await driver.sleep(500);
            
            const checkbox = await driver.findElement(By.css(".checkbox"));
            await checkbox.click();
            await driver.sleep(300);
            
            const deleteButtons = await driver.findElements(By.css(".delete-btn"));
            await deleteButtons[0].click();
            const alert = await driver.switchTo().alert();
            await alert.accept();
            await driver.sleep(500);
            
            count = await driver.findElement(By.id("notesCount")).getText();
            assert.equal(parseInt(count), 1);
            
            console.log("✓ Flujo completo ejecutado exitosamente");
        });
    });
});