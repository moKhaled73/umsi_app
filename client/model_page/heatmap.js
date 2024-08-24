const links = document.querySelector(".links");
const tabs = document.querySelectorAll(".tabs li span");

const error = document.querySelector(".model .error");
const image = document.querySelector(".image");
const uploadFile = document.querySelector(".image .upload-file");
const imageContainer = document.querySelector(".image .image-container");
const closeBtn = document.querySelector(".image .close");
const imageFile = document.getElementById("image-file");
const generateBtn = document.querySelector("main .generate");
let selectedImage = null;

const helps = document.querySelectorAll(".tabs li .help");
const dialog = document.querySelector(".dialog");

const HEATMAP3S_API_URL = "http://127.0.0.1:8000/heatmap3s/upload";
const HEATMAP7S_API_URL = "http://127.0.0.1:8000/heatmap7s/upload";
const SCANPATH_API_URL = "http://127.0.0.1:8000/scanpath/upload";

const helpsContent = {
  heatmap3s: {
    title: "heatmap 3s",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab quia suscipit amet pariatur sequi vero",
  },
  heatamp7s: {
    title: "heatmap 7s",
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

// active tabs
function activeTabs() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      tabs.forEach((tab) => tab.parentNode.classList.remove("active"));
      e.target.parentNode.classList.add("active");
    });
  });
}
activeTabs();

// add original image
function addImage() {
  uploadFile.style.display = "none";
  imageContainer.style.display = "block";
  const originalImage = document.createElement("img");
  originalImage.className = "original-image";
  originalImage.src = URL.createObjectURL(selectedImage);
  imageContainer.appendChild(originalImage);
  image.appendChild(imageContainer);
  closeBtn.style.display = "block";
}

// remove original image
function removeImage() {
  closeBtn.addEventListener("click", (e) => {
    imageContainer.innerHTML = "";
    imageContainer.style.display = "none";
    closeBtn.style.display = "none";
    uploadFile.style.display = "flex";
  });
}
removeImage();

async function generateHeatmap() {
  generateBtn.innerHTML = "Generating...";
  try {
    const formData = new FormData();
    formData.append("file", selectedImage);
    const res = await fetch(HEATMAP3S_API_URL, {
      method: "post",
      body: formData,
    });

    const blob = await res.blob();
    const imageUrl = URL.createObjectURL(blob);
    const heatmapImage = document.createElement("img");
    heatmapImage.className = "heatmap-image";
    heatmapImage.src = imageUrl;
    imageContainer.appendChild(heatmapImage);
    generateBtn.innerHTML = "Generate";
  } catch (error) {
    generateBtn.innerHTML = "Generate";
    console.log(error);
  }
}

imageFile.addEventListener("change", (e) => {
  selectedImage = e.target.files[0];
  if (selectedImage.type.split("/")[0] !== "image") {
    error.style.display = "flex";
    error.lastElementChild.innerHTML = "images only allowed";
    setTimeout(() => {
      error.style.display = "none";
      error.lastElementChild.innerHTML = "";
    }, 3000);
  } else {
    addImage();
  }
});

generateBtn.addEventListener("click", () => {
  if (imageContainer.innerHTML === "") {
    error.style.display = "flex";
    error.lastElementChild.innerHTML = "please upload an image first";
    setTimeout(() => {
      error.style.display = "none";
      error.lastElementChild.innerHTML = "";
    }, 3000);
  } else {
    generateHeatmap();
  }
});

function showHelp() {
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
}
showHelp();

function adjustHeight() {
  if (image.offsetWidth < 512) {
    image.style.flexBasis = `${image.offsetWidth}px`;
    console.log(image.offsetHeight);
  }
}

// Run on page load
window.onload = adjustHeight;

// Run on window resize
window.onresize = adjustHeight;
