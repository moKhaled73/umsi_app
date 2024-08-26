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

function updataGenerateBtnText() {
  tabs.forEach((tab) => {
    if (tab.parentNode.classList.contains("active")) {
      if (tab.parentNode.lastElementChild.dataset.modelname === "heatmap") {
        generateBtn.innerHTML = "Generate Heatmap";
      } else if (
        tab.parentNode.lastElementChild.dataset.modelname === "scanpath"
      ) {
        generateBtn.innerHTML = "Generate Scanpath";
      }
    }
  });
}
updataGenerateBtnText();

// active tabs
tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    tabs.forEach((tab) => tab.parentNode.classList.remove("active"));
    e.target.parentNode.classList.add("active");
    updataGenerateBtnText();
  });
});

// add original image
function addImages() {
  upload.style.display = "none";
  images.style.display = "flex";
  tabs.forEach((tab) => {
    if (tab.parentNode.classList.contains("active")) {
      console.log(tab.parentNode.lastElementChild.dataset.modelname);
      if (tab.parentNode.lastElementChild.dataset.modelname === "heatmap") {
        // image one for heatmap 3s
        const image1 = document.createElement("div");
        const heatmapName3s = document.createElement("span");
        heatmapName3s.classList = "heatmap-name";
        heatmapName3s.innerHTML = "heatmap3s";
        image1.appendChild(heatmapName3s);
        image1.className = "image heatmap3s";
        const img1 = document.createElement("img");
        img1.className = "original-image";
        img1.src = URL.createObjectURL(selectedImage);
        image1.appendChild(img1);
        images.appendChild(image1);
        // image two for heatmap 7s
        const image2 = document.createElement("div");
        image2.className = "image heatmap7s";
        const heatmapName7s = document.createElement("span");
        heatmapName7s.classList = "heatmap-name";
        heatmapName7s.innerHTML = "heatmap7s";
        image2.appendChild(heatmapName7s);
        const img2 = document.createElement("img");
        img2.className = "original-image";
        img2.src = URL.createObjectURL(selectedImage);
        image2.appendChild(img2);
        images.appendChild(image2);
      } else {
        const image = document.createElement("div");
        image.className = "image";
        const img = document.createElement("img");
        img.className = "original-image";
        img.src = URL.createObjectURL(selectedImage);
        image.appendChild(img);
        images.appendChild(image);
      }
    }
  });
  closeBtn.style.display = "block";
}

// remove original image and heatmap
closeBtn.addEventListener("click", () => {
  images.innerHTML = "";
  images.style.display = "none";
  closeBtn.style.display = "none";
  upload.style.display = "flex";
  imageFile.value = "";
});

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

    // add heatmap3s
    const heatmapImg3s = document.createElement("img");
    heatmapImg3s.className = "heatmap-image";
    heatmapImg3s.src = imageUrl3s;
    document
      .querySelector(".container .images .heatmap3s")
      .appendChild(heatmapImg3s);

    // add heatmap7s
    const heatmapImg7s = document.createElement("img");
    heatmapImg7s.className = "heatmap-image";
    heatmapImg7s.src = imageUrl7s;
    document
      .querySelector(".container .images .heatmap7s")
      .appendChild(heatmapImg7s);

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
    addImages();
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
    tabs.forEach((tab) => {
      if (tab.parentNode.classList.contains("active")) {
        if (tab.parentNode.lastElementChild.dataset.modelname === "heatmap") {
          generateHeatmap();
        } else {
          // generateScanpath()
        }
      }
    });
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
