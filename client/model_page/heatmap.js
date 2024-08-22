const links = document.querySelector(".links");
const tabs = document.querySelectorAll(".tabs li span");
const imageContainer = document.querySelector(".image-container");
const heatmap = document.querySelector(".heatmap");
const uploadFile = document.querySelector(".image-container .upload-file");
const closeBtn = document.querySelector(".image-container .close");
const imageFile = document.getElementById("image-file");
const helps = document.querySelectorAll(".tabs li .help");
const dialog = document.querySelector(".dialog");
const generateBtn = document.querySelector("main .generate");

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
function addImage(imageFile) {
  uploadFile.style.display = "none";
  const image = document.createElement("img");
  image.src = URL.createObjectURL(imageFile);
  image.className = "image";
  imageContainer.appendChild(image);
  closeBtn.style.display = "block";
}

// remove original image
function removeImage() {
  closeBtn.addEventListener("click", (e) => {
    const image = document.querySelector(".image-container .image");
    image.remove();
    closeBtn.style.display = "none";
    uploadFile.style.display = "flex";
  });
}

async function generateHeatmap(imageFile) {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    const res = await fetch(HEATMAP3S_API_URL, {
      method: "post",
      body: formData,
    });

    const blob = await res.blob();
    const imageUrl = URL.createObjectURL(blob);
    heatmap.innerHTML = "";
    const img = document.createElement("img");
    img.src = imageUrl;
    heatmap.appendChild(img);
  } catch (error) {
    console.log(error);
  }
}

function ulpoadImage() {
  imageFile.addEventListener("change", (e) => {
    addImage(e.target.files[0]);
    generateBtn.addEventListener("click", () => {
      generateHeatmap(e.target.files[0]);
    });
  });
}
removeImage();
ulpoadImage();

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
