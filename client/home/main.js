function showLinks() {
    const links = document.querySelector(".links");
    links.style.display = 'flex';
}
function hideLinks() {
    const links = document.querySelector(".links");
    links.style.display = 'none';
}

function navigate() {

    window.location.href = "../model_page/heatmap.html"
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

document.addEventListener('DOMContentLoaded', () => {
    const services = document.querySelector('.serv');
    const srv = document.querySelectorAll('.srv');
    const options = {
        root: null,
        threshold: 0.5,
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                srv.forEach((serv, index) => {
                    setTimeout(() => {
                        serv.classList.add('fade-in');
                    }, index * 300);
                });
                observer.unobserve(entry.target);
            }
        });
    }, options);

    observer.observe(services);
});
/*-----------------------------------------*/
const boxes = document.querySelectorAll('.box');

const options = {
    root: null, 
    threshold: 0.2, 
    rootMargin: '-50px' 
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('slide');
            observer.unobserve(entry.target); 
        }
    });
}, options);

boxes.forEach(box => {
    observer.observe(box);
});
