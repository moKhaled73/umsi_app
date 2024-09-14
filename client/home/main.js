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
function login() {

    window.location.href = "login.html"
}
function signup() {

    window.location.href = "sign.html"
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

/* theme Dark */
let themeIcon = document.querySelector(".theme");
let lightIcon = document.querySelector(".light");

themeIcon.onclick = function () {
    // تبديل الثيم بين الوضع الداكن والعادي
    document.body.classList.toggle("dark-theme");

    if (document.body.classList.contains("dark-theme")) {
        // إخفاء القمر وإظهار الشمس مع تحريك الشمس
        themeIcon.style.display = "none";
        lightIcon.style.display = "inline";

        // إضافة الحركة للشمس بعد ظهورها
        setTimeout(() => {
            lightIcon.classList.add("move");
        }, 100); // تأخير قصير لانتظار الشمس حتى تظهر
    } else {
        // إعادة الوضع العادي: إظهار القمر وإخفاء الشمس
        themeIcon.style.display = "inline";
        lightIcon.style.display = "none";
        lightIcon.classList.remove("move"); // إزالة الحركة عندما يتم إخفاء الشمس
    }
};

// السماح بالنقر على أيقونة الشمس للتبديل مرة أخرى مع تحريك القمر
lightIcon.onclick = function () {
    document.body.classList.remove("dark-theme");

    // إخفاء الشمس وإظهار القمر مع تحريك القمر
    lightIcon.style.display = "none";
    themeIcon.style.display = "inline";

    // إضافة الحركة للقمر
    setTimeout(() => {
        themeIcon.classList.add("move");
    }, 100);

    // إزالة الحركة عند إعادة الضغط
    themeIcon.classList.remove("move");
};