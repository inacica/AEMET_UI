const { test, expect } = require('@playwright/test');
const { RequestApiKeyPage } = require('../pages/requestApiKey.page');
const axios = require('axios');
import MailSlurp  from 'mailslurp-client';

// this is the scraper from ZenRows for bypassing the Captcha
const url = process.env.URL_AEMET_REQUEST_API_KEY;
const apikey = process.env.SCRAPER_API_KEY;
axios({
    url: 'https://api.zenrows.com/v1/',
    method: 'GET',
    params: {
        'url': url,
        'apikey': apikey,
        'js_render': 'true',
        'premium_proxy': 'true',
    },
})
    .then(response => console.log(response.data))
    .catch(error => console.log(error));

test('User signs up and requests the API Key', async ({ page }) => {
    const apiKey = process.env.EMAIL_API_KEY;
    const mailslurp = new MailSlurp({ apiKey });

    const inbox = await mailslurp.createInbox();
    console.log(`Generated Email: ${inbox.emailAddress}  ${inbox.id}`);

    await page.goto(process.env.URL_AEMET);
    const requestApiKeyPage = new RequestApiKeyPage(page);
    await requestApiKeyPage.clickRequestApiKey();
    await requestApiKeyPage.enterEmail(inbox.emailAddress);
    await requestApiKeyPage.clickSend();

    const email = await mailslurp.waitForLatestEmail(inbox.id, 30000);
    console.log(`Received Email: ${email.subject}`);

    if (email.body) {
        const linkMatch = email.body.match(/href="([^"]+)"/);
        const confirmationLink = linkMatch ? linkMatch[1] : null;
        console.log(`Confirmation Link: ${confirmationLink}`);
        if (confirmationLink) {
            await page.goto(confirmationLink);
            await expect(page).toHaveTitle('Su API Key se ha generado correctamente, se le enviará en un correo.');
        } else {
            throw new Error('No confirmation link found in the email.');
        }
    }

    // Extracting the API_KEY from the new email that was sent:
    /* 
    const email2 = await mailslurp.waitForLatestEmail(inbox.id, 30000);
    console.log(`Received Email: ${email2.subject}`);
    const retrieveApiKey = email.body.match("a regular expression for extracting the API Key") // Now the retrieved Api Key can be used in further testing
    */

});


test('User inputs an invalid email', async ({ page }) => {
    // I get a browser message: "The key "width-device-width" is not recognized and ignored.". So, when running this test, the pop-up about invalid email is not displayed.
    // I've set the viewport in playwright.config and playing with the width, but that has no influence. I think the issue comes from how the popup was built, the HTML content used for that popup. 
    // In this case I would contact the developers and ask to review the development of that popup. 
     // Should find a solution for the browser message.
    const requestApiKeyPage = new RequestApiKeyPage(page);
    await requestApiKeyPage.clickRequestApiKey();
    await requestApiKeyPage.enterEmail('abc');
    await requestApiKeyPage.clickSend();
    page.on('dialog', async (dialog) => {
        console.log(dialog.message('La dirección de correo no es valida'));
        await dialog.accept();
    });    
});


test('User does not provide an email', async ({ page }) => {
    // I get a browser message: "The key "width-device-width" is not recognized and ignored.". So, when running this test, the pop-up about invalid email is not displayed. 
    // I've set the viewport in playwright.config and playing with the width, but that has no influence. I think the issue comes from how the popup was built, the HTML content used for that popup. 
    // In this case I would contact the developers and ask to review the development of that popup.
     // Should find a solution for the browser message.
    const requestApiKeyPage = new RequestApiKeyPage(page);
    await requestApiKeyPage.clickRequestApiKey();
    await requestApiKeyPage.clickSend();
    page.on('dialog', async (dialog) => {
        console.log(dialog.message("Debe rellenar el campo 'Email'"));
        await dialog.accept();
    });
});
