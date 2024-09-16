const links = document.querySelector(".links");
const tabs = document.querySelectorAll(".tabs li");

const error = document.querySelector(".model .error");
const container = document.querySelector(".container");
const upload = document.querySelector(".container .upload");
const imageFile = document.getElementById("image-file");
const images = document.querySelector(".container .images");
const closeBtn = document.querySelector(".container .close");
const generateBtn = document.querySelector("main .generate");

const dialog = document.querySelector(".dialog");

// api links
const HEATMAP3S_API_URL = "http://127.0.0.1:8000/heatmap3s/upload";
const HEATMAP7S_API_URL = "http://127.0.0.1:8000/heatmap7s/upload";
const SCANPATH_API_URL = "http://127.0.0.1:8000/scanpath/upload";

// get active tab from search params
const url = window.location.search;
const searchParams = new URLSearchParams(url);
const searchParamTab = searchParams.get("tab");

// global variable
let selectedImage = null;
let selectedHeatmap3s = null;
let selectedHeatmap7s = null;
let selectedScanpath = null;
let selectedTab = "heatmap";
let selectedSlider = null;
let loadingHeatmapState = false;
let loadingScanpathState = false;

const helpsContent = {
  heatmap3s: {
    title: "Heatmap 3s",
    desc: "This feature prioritizes fast response. It is designed to be most effective when speed is essential or the design is less elemental like landing page or banner designs that contain headers or mostly like that.",
  },
  heatmap7s: {
    title: "Heatmap 7s",
    desc: "This feature is provided for cases where the design is complex, when the user requires a deeper understanding of the design, or when multiple elements need to be thoroughly reviewed.",
  },
  scanpath: {
    title: "Scanpath",
    desc: "This feature shows the path that the user's eye will follow or the transitions that the eye will make. Therefore, it shows the interface designer how the user will receive the design.",
  },
};

// show or hide nav bar
function showLinks() {
  links.classList.remove("hide");
}
function hideLinks() {
  links.classList.add("hide");
}

// updated generate btn
function updataGenerateBtnText() {
  if (selectedTab === "heatmap") {
    if (selectedHeatmap3s) generateBtn.innerHTML = "Try again";
    else {
      if (loadingHeatmapState)
        generateBtn.innerHTML = `<span class='loading'></span>`;
      else generateBtn.innerHTML = `Generate Heatmap`;
    }
  } else if (selectedTab === "scanpath") {
    if (selectedScanpath) generateBtn.innerHTML = "Try again";
    else {
      if (loadingScanpathState)
        generateBtn.innerHTML = `<span class='loading'></span>`;
      else generateBtn.innerHTML = "Generate Scanpath";
    }
  }
}
updataGenerateBtnText();

function updateActiveTab(tab) {
  tabs.forEach((tab) => tab.classList.remove("active"));
  tab.classList.add("active");
  selectedTab = tab.dataset.modelname;
  updataGenerateBtnText();
  addOriginalImages();
  if (selectedHeatmap3s && selectedTab === "heatmap")
    addHeatmapOrScanpathImage("heatmap3s");

  if (selectedHeatmap7s && selectedTab === "heatmap")
    addHeatmapOrScanpathImage("heatmap7s");

  if (selectedScanpath && selectedTab === "scanpath") {
    addHeatmapOrScanpathImage("scanpath");
  }
}

// active tabs
tabs.forEach((tab) => {
  // update active tab when click and generate button and add original image
  tab.addEventListener("click", (e) => {
    updateActiveTab(e.target);
  });

  // update tab based on search params
  if (tab.dataset.modelname === searchParamTab) {
    updateActiveTab(tab);
  }
  if (tab.classList.contains("active")) {
    selectedTab = tab.dataset.modelname;
  }
});

// display help
function displayHelp(name) {
  // create container
  const container = document.createElement("div");
  container.className = "container";
  // create title and close btn
  const titleContainer = document.createElement("div");
  titleContainer.className = "title-container";
  const title = document.createElement("h4");
  title.innerHTML = helpsContent[`${name}`].title;
  const closeBtn = document.createElement("i");
  closeBtn.className = "close fa-solid fa-circle-xmark";
  titleContainer.appendChild(title);
  titleContainer.appendChild(closeBtn);
  container.appendChild(titleContainer);
  // create content
  const content = document.createElement("p");
  content.innerHTML = helpsContent[`${name}`].desc;
  container.appendChild(content);
  dialog.appendChild(container);
  dialog.style.display = "flex";
  closeBtn.addEventListener("click", () => {
    dialog.innerHTML = "";
    dialog.style.display = "none";
  });
  dialog.addEventListener("click", (e) => {
    dialog.innerHTML = "";
    dialog.style.display = "none";
  });
  container.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

// add one original image
function addOneOriginalImage(imageName, className) {
  // create image container for original image and image name
  const image = document.createElement("div");
  image.className = `image ${className}`;

  // create info dev
  const info = document.createElement("div");
  info.className = "info";

  // create span for image name and append to info
  const imageNameSpan = document.createElement("span");
  imageNameSpan.classList = "image-name";
  imageNameSpan.innerHTML = imageName;
  info.appendChild(imageNameSpan);

  // create help icon and append to info
  const helpIcon = document.createElement("i");
  helpIcon.className = "fa-solid fa-question";
  helpIcon.dataset.modelname = className;
  helpIcon.addEventListener("click", (e) =>
    displayHelp(e.target.dataset.modelname)
  );
  info.appendChild(helpIcon);

  // append info to image container
  image.appendChild(info);

  // create original image and append to image container
  const img = document.createElement("img");
  img.className = "original-image";
  img.src = URL.createObjectURL(selectedImage);
  img.draggable = false;
  img.onload = () => {
    if (img.naturalWidth >= img.naturalHeight) {
      image.style.width = "512px";
      image.style.height = `${(512 / img.naturalWidth) * img.naturalHeight}px`;
    } else {
      image.style.width = `${(512 / img.naturalHeight) * img.naturalWidth}px`;
      image.style.height = "512px";
    }
  };
  // append original image to image container
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
      const divider = document.createElement("span");
      divider.className = "divider";
      images.appendChild(divider);
      addOneOriginalImage("heatmap7s", "heatmap7s");
    } else if (selectedTab === "scanpath") {
      addOneOriginalImage("scanpath", "scanpath");
    }
    closeBtn.style.display = "block";
  }
}

function updateContainerWhenCloseOrTryagain() {
  images.innerHTML = "";
  images.style.display = "none";
  closeBtn.style.display = "none";
  upload.style.display = "flex";
  imageFile.value = "";
  selectedImage = null;
  selectedHeatmap3s = null;
  selectedHeatmap7s = null;
  selectedScanpath = null;
  updataGenerateBtnText();
}

// remove original image and heatmap
closeBtn.addEventListener("click", () => {
  updateContainerWhenCloseOrTryagain();
});

// download reslut image
function downloadReslutImage(reslutImage, name) {
  const canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  // Load the original image
  const originalImage = document.createElement("img");
  originalImage.src = URL.createObjectURL(selectedImage);
  originalImage.onload = () => {
    // Set the canvas size based on the original image dimensions
    canvas.width = reslutImage.naturalWidth;
    canvas.height = reslutImage.naturalHeight;

    // Draw the original image onto the canvas
    ctx.drawImage(
      originalImage,
      0,
      0,
      reslutImage.naturalWidth,
      reslutImage.naturalHeight
    );

    // Set opacity for the heatmap
    if (/heatmap/.test(name)) ctx.globalAlpha = 0.5;

    ctx.drawImage(
      reslutImage,
      0,
      0,
      reslutImage.naturalWidth,
      reslutImage.naturalHeight
    );

    // Reset global alpha to default (1) after drawing
    ctx.globalAlpha = 1.0;

    // Create a download link for the merged image
    let link = document.createElement("a");
    link.download = `${name}.png`;
    link.href = canvas.toDataURL(); // Convert canvas to data URL
    link.click();
  };
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

function addHeatmapOrScanpathImage(classname) {
  const reslutImage = document.createElement("img");
  reslutImage.draggable = false;
  reslutImage.className =
    selectedTab === "heatmap"
      ? "result-image heatmap-image"
      : "result-image scanpath-image";
  reslutImage.src =
    classname === "heatmap3s"
      ? selectedHeatmap3s
      : classname === "heatmap7s"
      ? selectedHeatmap7s
      : selectedScanpath;

  const info = document.querySelector(`.container .images .${classname} .info`);

  // downlaod heatmap or scanpaht
  const downloadIcon = document.createElement("i");
  downloadIcon.className = "fa-solid fa-download";
  downloadIcon.addEventListener("click", (e) =>
    downloadReslutImage(reslutImage, classname)
  );
  info.appendChild(downloadIcon);

  // if adding heatmap add slider
  if (/heatmap/.test(classname)) {
    const slider = document.createElement("img");
    slider.className = "slider";
    slider.src = "./move.png";
    slider.draggable = false;
    slider.addEventListener("mousedown", (e) => {
      selectedSlider = e.target;
      document.addEventListener("mousemove", moveSlider);
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", moveSlider);
      });
    });
    document
      .querySelector(`.container .images .${classname}`)
      .appendChild(slider);
  }

  document
    .querySelector(`.container .images .${classname}`)
    .appendChild(reslutImage);
}

// call api and display heatmap
async function generateHeatmap() {
  loadingHeatmapState = true;
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
    selectedHeatmap3s = imageUrl3s;

    // call api for 7s
    const res7s = await fetch(HEATMAP7S_API_URL, {
      method: "post",
      body: formData,
    });
    const blob7s = await res7s.blob();
    const imageUrl7s = URL.createObjectURL(blob7s);
    selectedHeatmap7s = imageUrl7s;

    addHeatmapOrScanpathImage("heatmap3s");
    addHeatmapOrScanpathImage("heatmap7s");

    loadingHeatmapState = false;
    generateBtn.innerHTML = "Try again";
  } catch (error) {
    loadingHeatmapState = false;
    updataGenerateBtnText();
    console.log(error);
  }
}

// cal api and display scanpath
async function generateScanpath() {
  loadingScanpathState = true;
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
    selectedScanpath = scanpathUrl;

    addHeatmapOrScanpathImage("scanpath");

    loadingScanpathState = false;
    generateBtn.innerHTML = "Try again";
  } catch (error) {
    loadingScanpathState = false;
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

// generate heatmap or scan path when click on generate btn
generateBtn.addEventListener("click", () => {
  if (images.innerHTML === "") {
    displayError("please Upload an image first");
  } else if (generateBtn.innerHTML === "Try again") {
    updateContainerWhenCloseOrTryagain();
  } else {
    if (selectedTab === "heatmap") {
      generateHeatmap();
    } else if (selectedTab === "scanpath") {
      generateScanpath();
    }
  }
});

// theme handling
const themeContainer = document.querySelector(".theme-container");
const themeIcon = document.querySelector(".theme");

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
