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

const helps = document.querySelectorAll(".tabs li .help");
const dialog = document.querySelector(".dialog");

const HEATMAP3S_API_URL = "http://127.0.0.1:8000/heatmap3s/upload";
const HEATMAP7S_API_URL = "http://127.0.0.1:8000/heatmap7s/upload";
const SCANPATH_API_URL = "http://127.0.0.1:8000/scanpath/upload";

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
    generateBtn.innerHTML = "Generate Heatmap";
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
  if (tab.parentNode.classList.contains("active")) {
    selectedTab = tab.parentNode.lastElementChild.dataset.modelname;
  }
});

function addOneOriginalImage(imageName, className) {
  const image = document.createElement("div");
  const imageNameSpan = document.createElement("span");
  imageNameSpan.classList = "image-name";
  imageNameSpan.innerHTML = imageName;
  image.appendChild(imageNameSpan);
  image.className = `image ${className}`;
  const img = document.createElement("img");
  img.className = "original-image";
  img.src = URL.createObjectURL(selectedImage);
  image.appendChild(img);
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
});

function addOneHeatmapImage(imgUrl, classname) {
  const heatmapImg3s = document.createElement("img");
  heatmapImg3s.className = "heatmap-image";
  heatmapImg3s.src = imgUrl;
  document
    .querySelector(`.container .images .${classname}`)
    .appendChild(heatmapImg3s);
}

// add heatmap images
function addHeatmapImages(imageUrl3s, imageUrl7s) {
  addOneHeatmapImage(imageUrl3s, "heatmap3s");
  addOneHeatmapImage(imageUrl7s, "heatmap7s");
}

// call api and display heatmap
async function generateHeatmap() {
  generateBtn.innerHTML = "Generating...";
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

    addHeatmapImages(imageUrl3s, imageUrl7s);

    generateBtn.innerHTML = "Try again";
  } catch (error) {
    generateBtn.innerHTML = "Generate";
    console.log(error);
  }
}

async function generateScanpath() {
  generateBtn.innerHTML = "Generating...";
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

    const scanpathImage = document.createElement("img");
    scanpathImage.className = "scanpath-image";
    scanpathImage.src = scanpathUrl;

    document
      .querySelector(`.container .images .scanpath`)
      .appendChild(scanpathImage);

    generateBtn.innerHTML = "Try again";
  } catch (error) {
    generateBtn.innerHTML = "Generate";
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

function adjustHeight() {
  if (container.offsetWidth < 512) {
    container.style.flexBasis = `${container.offsetWidth}px`;
  } else {
    container.style.flexBasis = "512px";
    container.style.minWidth = "512px";
  }
}
// Run on page load
window.onload = adjustHeight;

// Run on window resize
window.onresize = adjustHeight;
