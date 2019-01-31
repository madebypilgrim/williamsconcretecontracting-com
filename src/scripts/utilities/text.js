const TAGS = 'h1,h2,h3,h4,h5,h6,p,strong,b,em,li,a,span,td';
const CHILD_TAGS = 'BR,IMG,EM';

/*
 * Superscript all registered trademarks
 * @return {void}
 */
export function superscript() {
  Array.from(document.querySelectorAll(TAGS)).forEach(el => {
    const childCheck = el.childNodes.length === 1 && CHILD_TAGS.includes(el.childNodes[0].nodeName);

    if (el.childNodes.length === 0 || childCheck) {
      el.innerHTML = el.innerHTML.split('®').join('<sup>&reg;</sup>');
    }
  });
}

/*
 * Remove all newline characters that are not stripped by server
 * https://stackoverflow.com/questions/41555397/strange-symbol-shows-up-on-website-l-sep/45822037
 * @return {void}
 */
export function newlines() {
  Array.from(document.querySelectorAll(TAGS)).forEach(el => {
    const childCheck = el.childNodes.length === 1 && CHILD_TAGS.includes(el.childNodes[0].nodeName);

    if (el.childNodes.length === 0 || childCheck) {
      el.innerHTML = el.innerHTML.split('&#8232;').join(' ');
    }
  });
}

