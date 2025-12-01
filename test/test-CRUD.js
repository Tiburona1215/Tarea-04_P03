//Crear nota
(async function createNote() {
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        await driver.get("http://localhost/login.html");
        await driver.findElement(By.id("username")).sendKeys("admin");
        await driver.findElement(By.id("password")).sendKeys("1234");
        await driver.findElement(By.css("button")).click();

        await driver.wait(until.urlContains("index.html"), 2000);

        await driver.findElement(By.id("noteContent")).sendKeys("Mi primera nota");
        await driver.findElement(By.id("saveBtnText")).click();

        const count = await driver.findElement(By.id("notesCount")).getText();

        console.log("✔ Nota creada correctamente. Total:", count);
    } finally {
        await driver.quit();
    }
})();

//editar y eliminar nota
(async function deleteNoteTest() {
    let driver = await new Builder().forBrowser("chrome").build();

    try {
        await driver.get("http://localhost/login.html");
        await driver.findElement(By.id("username")).sendKeys("admin");
        await driver.findElement(By.id("password")).sendKeys("1234");
        await driver.findElement(By.css("button")).click();

        await driver.wait(until.urlContains("index.html"), 2000);

        const deleteButtons = await driver.findElements(By.css(".delete-btn"));

        if (deleteButtons.length === 0) {
            console.log("✔ Límite: no hay notas para eliminar");
            return;
        }

        await deleteButtons[0].click();
        await driver.switchTo().alert().accept();

        console.log("✔ Nota eliminada (happy path)");
    } finally {
        await driver.quit();
    }
})();
