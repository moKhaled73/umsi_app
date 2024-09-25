function showLinks() {
  const links = document.querySelector(".links");
  links.style.display = "flex";
}
function hideLinks() {
  const links = document.querySelector(".links");
  links.style.display = "none";
}

function navigate() {
  window.location.href = "../model_page/heatmap.html";
}
function login() {
  window.location.href = "login.html";
}
function signup() {
  window.location.href = "sign.html";
}

/*
scroll
*/
let btn = document.getElementById("scroll");
window.onscroll = function () {
  if (scrollY >= 400) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
};

btn.onclick = function () {
  scroll({
    left: 0,
    top: 0,
    behavior: "smooth",
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const services = document.querySelector(".serv");
  const srv = document.querySelectorAll(".srv");
  const options = {
    root: null,
    threshold: 0.5,
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        srv.forEach((serv, index) => {
          setTimeout(() => {
            serv.classList.add("fade-in");
          }, index * 300);
        });
        observer.unobserve(entry.target);
      }
    });
  }, options);

  observer.observe(services);
});
/*-----------------------------------------*/
const boxes = document.querySelectorAll(".box");

const options = {
  root: null,
  threshold: 0.2,
  rootMargin: "-50px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("slide");
      observer.unobserve(entry.target);
    }
  });
}, options);

boxes.forEach((box) => {
  observer.observe(box);
});

/* theme Dark */
let themeContainer = document.querySelector(".theme-container");
let themeIcon = document.querySelector(".theme");

function changeIcon() {
  themeIcon.classList.remove("move");
  setTimeout(() => {
    themeIcon.classList.toggle("fa-moon");
    themeIcon.classList.toggle("fa-sun");
  }, 100);
  themeIcon.classList.add("move");
}

if (localStorage.getItem("theme")) {
  if (localStorage.getItem("theme") === "light") {
    document.body.dataset.theme = "light";
    themeIcon.classList.add("fa-moon");
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("move");
  } else if (localStorage.getItem("theme") === "dark") {
    document.body.dataset.theme = "dark";
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
    themeIcon.classList.add("move");
  }
}

themeContainer.addEventListener("click", () => {
  if (
    document.body.dataset.theme === "light" ||
    document.body.dataset.theme === undefined
  ) {
    console.log("light inside");
    document.body.dataset.theme = "dark";
    localStorage.setItem("theme", "dark");
  } else if (document.body.dataset.theme === "dark") {
    document.body.dataset.theme = "light";
    localStorage.setItem("theme", "light");
  }
  changeIcon();
});

// slider

const slider = document.querySelector(".home .container .slider");
const container = document.querySelector(".home .container .image");
const topImage = document.querySelector(".home .container .image .top-image");

slider.addEventListener("mousedown", (e) => {
  selectedSlider = e.target;
  document.addEventListener("mousemove", moveSlider);
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", moveSlider);
  });
});

function moveSlider(e) {
  const containerRect = container.getBoundingClientRect();
  let x = containerRect.right - e.clientX;

  // Ensure the slider does not go outside the container
  if (x < 0) {
    x = 0; // Prevent moving outside the left boundary
  } else if (x > containerRect.width) {
    x = containerRect.width;
  }

  // Set the position of the slider
  slider.style.right = `${x}px`;

  // Clip the top image based on the slider position
  topImage.style.clipPath = `inset(0 ${x}px 0 0)`;
}
