// JavaScript Document

document.addEventListener('DOMContentLoaded', function () {	
const toggle = document.getElementById('toggle-input');

function updateUI(theme) {
    toggle.checked = theme === 'light';
}

toggle.addEventListener('click', () => {
    const theme = toggle.checked ? 'light' : 'dark';
    setTheme(theme, true);
    updateUI(theme);
});

const osPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const preferredTheme = localStorage.getItem('preferred-theme') || osPreference;

setTheme(preferredTheme, false);
updateUI(preferredTheme);


function setTheme(theme, persist = false) {
    const on = theme;
    const off = theme === 'light' ? 'dark' : 'light'

    const htmlEl = document.documentElement;
    htmlEl.classList.add(on);
    htmlEl.classList.remove(off);

    if (persist) {
        localStorage.setItem('preferred-theme', theme);
    }
}

});  	