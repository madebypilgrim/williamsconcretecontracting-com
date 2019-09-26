import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { throttle } from 'ui-utilities';

export default class {
    constructor({
        id,
    }) {
        const el = document.getElementById(id);
        const toggle = el.querySelector('[type="checkbox"]');

        const handleResize = throttle(() => {
            // Hack to remove locks on desktop breakpoints
            if (window.innerWidth > 1080) {
                toggle.checked = false;
                clearAllBodyScrollLocks();
            }
        }, 500);
        function handleToggle() {
            if (toggle.checked) {
                disableBodyScroll();
            } else {
                enableBodyScroll();
            }
        }

        window.addEventListener('resize', handleResize);
        toggle.addEventListener('change', handleToggle);
    }
}
