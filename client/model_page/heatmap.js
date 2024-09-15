const links = document.querySelector(".links");
const tabs = document.querySelectorAll(".tabs li span");

const error = document.querySelector(".model .error");
const container = document.querySelector(".container");
const upload = document.querySelector(".container .upload");
const imageFile = document.getElementById("image-file");
const images = document.querySelector(".container .images");
const closeBtn = document.querySelector(".container .close");
const generateBtn = document.querySelector("main .generate");
let selectedImage = null;
let selectedTab = "heatmap";
let selectedSlider = null;

const helps = document.querySelectorAll(".tabs li .help");
const dialog = document.querySelector(".dialog");

const HEATMAP3S_API_URL = "http://127.0.0.1:8000/heatmap3s/upload";
const HEATMAP7S_API_URL = "http://127.0.0.1:8000/heatmap7s/upload";
const SCANPATH_API_URL = "http://127.0.0.1:8000/scanpath/upload";

const url = window.location.search;
const searchParams = new URLSearchParams(url);
const SPTab = searchParams.get("tab");

const helpsContent = {
  heatmap: {
    title: "heatmap",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab quia suscipit amet pariatur sequi vero",
  },
  scanpath: {
    title: "scanpath",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab quia suscipit amet pariatur sequi vero",
  },
};

// nav bar
function showLinks() {
  links.classList.remove("hide");
}
function hideLinks() {
  links.classList.add("hide");
}

// updated generate btn
function updataGenerateBtnText() {
  if (selectedTab === "heatmap") {
    generateBtn.innerHTML = `Generate Heatmap`;
  } else if (selectedTab === "scanpath") {
    generateBtn.innerHTML = "Generate Scanpath";
  }
}
updataGenerateBtnText();

// active tabs
tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    tabs.forEach((tab) => tab.parentNode.classList.remove("active"));
    e.target.parentNode.classList.add("active");
    selectedTab = e.target.parentNode.lastElementChild.dataset.modelname;
    updataGenerateBtnText();
    addOriginalImages();
  });
  if (tab.parentNode.lastElementChild.dataset.modelname === SPTab) {
    tabs.forEach((tab) => tab.parentNode.classList.remove("active"));
    tab.parentNode.classList.add("active");
    selectedTab = tab.parentNode.lastElementChild.dataset.modelname;
    updataGenerateBtnText();
    addOriginalImages();
  }
  if (tab.parentNode.classList.contains("active")) {
    selectedTab = tab.parentNode.lastElementChild.dataset.modelname;
  }
});

function addOneOriginalImage(imageName, className) {
  // create image container for original image and image name
  const image = document.createElement("div");
  image.className = `image ${className}`;

  // create info dev and show and hide button
  const info = document.createElement("div");
  info.className = "info";

  // create span for image name and append to image container
  const imageNameSpan = document.createElement("span");
  imageNameSpan.classList = "image-name";
  imageNameSpan.innerHTML = imageName;
  info.appendChild(imageNameSpan);

  image.appendChild(info);

  // create original image and append to image container
  const img = document.createElement("img");
  img.className = "original-image";
  img.src = URL.createObjectURL(selectedImage);
  img.draggable = false;
  img.onload = () => {
    console.log(img.naturalWidth, img.naturalHeight);
    if (img.naturalWidth >= img.naturalHeight) {
      image.style.width = "512px";
      image.style.height = `${(512 / img.naturalWidth) * img.naturalHeight}px`;
    } else {
      image.style.width = `${(512 / img.naturalHeight) * img.naturalWidth}px`;
      image.style.height = "512px";
    }
  };
  image.appendChild(img);

  // append image container to images container
  images.appendChild(image);
}

// add original image
function addOriginalImages() {
  if (selectedImage) {
    upload.style.display = "none";
    images.style.display = "flex";
    images.innerHTML = "";
    if (selectedTab === "heatmap") {
      addOneOriginalImage("heatmap3s", "heatmap3s");
      addOneOriginalImage("heatmap7s", "heatmap7s");
    } else if (selectedTab === "scanpath") {
      addOneOriginalImage("scanpath", "scanpath");
    }
    closeBtn.style.display = "block";
  }
}

// remove original image and heatmap
closeBtn.addEventListener("click", () => {
  images.innerHTML = "";
  images.style.display = "none";
  closeBtn.style.display = "none";
  upload.style.display = "flex";
  imageFile.value = "";
  selectedImage = "";
  updataGenerateBtnText();
});

function addHeatmapOrScanpathImage(imgUrl, classname) {
  const image = document.createElement("img");
  image.draggable = false;
  image.className =
    selectedTab === "heatmap"
      ? "result-image heatmap-image"
      : "result-image scanpath-image";
  image.src = imgUrl;

  const info = document.querySelector(`.container .images .${classname} .info`);
  // display and hide heatmap or scanpath
  const toggleImageIcon = document.createElement("i");
  toggleImageIcon.className = "fa-solid fa-eye";
  info.appendChild(toggleImageIcon);
  // downlaod heatmap or scanpaht
  const downloadIcon = document.createElement("i");
  downloadIcon.className = "fa-solid fa-download";
  info.appendChild(downloadIcon);

  const slider = document.createElement("img");
  slider.className = "slider";
  slider.src = "./move.png";
  slider.draggable = false;

  document
    .querySelector(`.container .images .${classname}`)
    .appendChild(slider);
  document.querySelector(`.container .images .${classname}`).appendChild(image);

  toggleImageIcon.addEventListener("click", (e) => {
    e.target.classList.toggle("fa-eye");
    e.target.classList.toggle("fa-eye-slash");
    e.target.parentNode.parentNode.lastElementChild.classList.toggle("hide");
  });

  downloadIcon.addEventListener("click", (e) => {
    const canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    // Load the original image
    const originalImage = document.createElement("img");
    originalImage.src = URL.createObjectURL(selectedImage);

    originalImage.onload = () => {
      // Set the canvas size based on the original image dimensions
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      // Draw the original image onto the canvas
      ctx.drawImage(
        originalImage,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight
      );

      // Set opacity for the heatmap
      ctx.globalAlpha = 0.5;

      ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);

      // Reset global alpha to default (1) after drawing
      ctx.globalAlpha = 1.0;

      // Create a download link for the merged image
      let link = document.createElement("a");
      link.download = "merged-image.png";
      link.href = canvas.toDataURL(); // Convert canvas to data URL
      link.click();
    };
  });
}

function moveSlider(e) {
  const slider = selectedSlider;
  const container = selectedSlider.parentNode;
  const topImage = selectedSlider.parentNode.lastElementChild;

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

// call api and display heatmap
async function generateHeatmap() {
  generateBtn.innerHTML = `<span class='loading'></span>`;
  try {
    const formData = new FormData();
    formData.append("file", selectedImage);

    // call api for 3s
    const res3s = await fetch(HEATMAP3S_API_URL, {
      method: "post",
      body: formData,
    });
    const blob3s = await res3s.blob();
    const imageUrl3s = URL.createObjectURL(blob3s);

    // call api for 7s
    const res7s = await fetch(HEATMAP7S_API_URL, {
      method: "post",
      body: formData,
    });
    const blob7s = await res7s.blob();
    const imageUrl7s = URL.createObjectURL(blob7s);

    addHeatmapOrScanpathImage(imageUrl3s, "heatmap3s");
    addHeatmapOrScanpathImage(imageUrl7s, "heatmap7s");

    document
      .querySelectorAll(".container .images .image .slider")
      .forEach((slider) => {
        slider.addEventListener("mousedown", (e) => {
          selectedSlider = e.target;
          document.addEventListener("mousemove", moveSlider);
          document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", moveSlider);
          });
        });
      });

    generateBtn.innerHTML = "Try again";
  } catch (error) {
    updataGenerateBtnText();
    console.log(error);
  }
}

async function generateScanpath() {
  generateBtn.innerHTML = `<span class='loading'></span>`;
  try {
    const formData = new FormData();
    formData.append("file", selectedImage);

    // call api for 3s
    const res = await fetch(SCANPATH_API_URL, {
      method: "post",
      body: formData,
    });
    const blob = await res.blob();
    const scanpathUrl = URL.createObjectURL(blob);

    addHeatmapOrScanpathImage(scanpathUrl, "scanpath");

    generateBtn.innerHTML = "Try again";
  } catch (error) {
    updataGenerateBtnText();
    console.log(error);
  }
}

// display error function
const displayError = (err) => {
  error.style.display = "flex";
  error.lastElementChild.innerHTML = err;
  setTimeout(() => {
    error.style.display = "none";
    error.lastElementChild.innerHTML = "";
  }, 3000);
};

// image selection handler
imageFile.addEventListener("change", (e) => {
  selectedImage = e.target.files[0];
  if (selectedImage.type.split("/")[0] !== "image") {
    displayError("images only allowed");
  } else {
    addOriginalImages();
  }
});

generateBtn.addEventListener("click", () => {
  if (images.innerHTML === "") {
    displayError("please Upload an image first");
  } else if (generateBtn.innerHTML === "Try again") {
    images.innerHTML = "";
    images.style.display = "none";
    closeBtn.style.display = "none";
    upload.style.display = "flex";
    imageFile.value = "";
    updataGenerateBtnText();
  } else {
    if (selectedTab === "heatmap") {
      generateHeatmap();
    } else if (selectedTab === "scanpath") {
      generateScanpath();
    }
  }
});

helps.forEach((help) =>
  help.addEventListener("click", (e) => {
    const content = document.createElement("div");
    content.classList = "content";
    const title = document.createElement("div");
    title.classList = "title";
    const h4 = document.createElement("h4");
    h4.innerHTML = helpsContent[`${e.currentTarget.dataset.modelname}`].title;
    const close = document.createElement("i");
    close.classList = "close fa-solid fa-circle-xmark";
    title.appendChild(h4);
    title.appendChild(close);
    content.appendChild(title);
    const p = document.createElement("p");
    p.innerHTML = helpsContent[`${e.currentTarget.dataset.modelname}`].desc;
    content.appendChild(p);
    dialog.appendChild(content);
    dialog.style.display = "flex";
    close.addEventListener("click", () => {
      dialog.innerHTML = "";
      dialog.style.display = "none";
    });
  })
);

// function adjustHeight() {
//   if (container.offsetWidth < 512) {
//     container.style.flexBasis = `${container.offsetWidth}px`;
//   } else {
//     container.style.flexBasis = "512px";
//     container.style.minWidth = "512px";
//   }
// }
// // Run on page load
// window.onload = adjustHeight;

// // Run on window resize
// window.onresize = adjustHeight;

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
    document.body.dataset.theme = "dark";
    localStorage.setItem("theme", "dark");
  } else if (document.body.dataset.theme === "dark") {
    document.body.dataset.theme = "light";
    localStorage.setItem("theme", "light");
  }
  changeIcon();
});
