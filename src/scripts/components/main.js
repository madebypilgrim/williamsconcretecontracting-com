import { scroll } from 'ui-utilities';

const ANIMATION_DURATION = 500; // miliseconds

export default class {
    constructor({
        // id,
        lockedClass,
        loadingClass,
        unloadingClass,
        actions,
    }) {
        // Elements and class variables
        // const el = document.getElementById(id);
        const links = Array.from(document.querySelectorAll('a'))
            .filter(l => (
                !l.href.startsWith('tel:')
                && !l.href.startsWith('mailto:')
                && (l.getAttribute('target') || 'self') === 'self'
            ));

        // Event handler functions
        function handleLockScroll() {
            document.body.classList.add(lockedClass);
        }
        function handleUnlockScroll() {
            document.body.classList.remove(lockedClass);
        }
        function handleLink(e) {
            e.preventDefault();

            const link = e.currentTarget;

            function cb() {
                scroll.top(document.body, 0, () => {
                    window.location = link.href;
                });
            }

            // Animate page unload
            document.body.classList.add(unloadingClass);
            setTimeout(cb, ANIMATION_DURATION);
        }

        // Add event listeners
        window.addEventListener(actions.lockScroll, handleLockScroll);
        window.addEventListener(actions.unlockScroll, handleUnlockScroll);
        links.forEach(l => { l.addEventListener('click', handleLink); });

        // Animate page load
        // This needs to fire on delay to make sure initial state is rendered in browsers
        setTimeout(() => {
            document.body.classList.add(loadingClass);
        }, 300);
    }
}
