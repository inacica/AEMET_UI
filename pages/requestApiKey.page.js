const { expect } = require('@playwright/test');

exports.RequestApiKeyPage = class RequestApiKeyPage {
    constructor(page) {
        this.page = page;
        this.requestApiKeyButton = page.getByRole('button', { name: 'Solicitar' });
        this.email = page.locator('#email');
        this.sendButton = page.locator('#enviar');
    }

    async clickRequestApiKey() {
        await this.requestApiKeyButton.click();
    }

    async enterEmail(email) {
        await this.email.fill(email);
    }

    async clickSend() {
        await this.sendButton.click();
    }

}