import { load } from 'recaptcha-v3';

const { RECAPTCHA_SITE_KEY } = process.env;

export default class {
    constructor({
        id,
    }) {
        const el = document.getElementById(id);
        const form = el.querySelector('form');

        // Load reCAPTCHA object from key
        load(RECAPTCHA_SITE_KEY).then(r => {
            function handleSubmit(e) {
                e.preventDefault();

                // Get reCAPTCHA score token
                r.execute('form').then(token => {
                    // Create hidden input in form to pass reCAPTCHA score token to server
                    const input = document.createElement('input');

                    input.setAttribute('type', 'hidden');
                    input.setAttribute('name', 'token');
                    input.setAttribute('value', token);

                    form.appendChild(input);
                    form.submit();
                });
            }

            form.addEventListener('submit', handleSubmit);
        });
    }
}
