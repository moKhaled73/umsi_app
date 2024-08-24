function showLinks() {
    const links = document.querySelector(".links");
    links.style.display = 'flex';
}
function hideLinks() {
    const links = document.querySelector(".links");
    links.style.display = 'none';
}
/*
scroll
*/
let btn = document.getElementById('scroll');
window.onscroll = function () {
    if (scrollY >= 400) {
        btn.style.display = 'block';

    }
    else {
        btn.style.display = 'none';

    }
}

btn.onclick = function () {
    scroll({
        left: 0,
        top: 0,
        behavior: 'smooth'
    })
}