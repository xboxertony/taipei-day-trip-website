let windowUrl = new URL(`${window.location.href}`);
let url = `${windowUrl.protocol}//${windowUrl.host}/api/attractions/${
  windowUrl.pathname.split("/")[2]
}`;
let images;
let index = 0;

const parseAttractionsInfo = (data) => {
  let attraction = data.data;
  let caption = attraction.name;
  let mrt = attraction.mrt;
  let category = attraction.category;
  let address = attraction.address;
  let description = attraction.description;
  let transport = attraction.transport;
  images = attraction.images;

  return { caption, mrt, category, address, description, transport };
};

const setRestrictedDate = () => {
  let today = new Date();
  let theDate = new Date();
  theDate.setDate(today.getDate() + 1);
  let dd = theDate.getDate();
  let mm = theDate.getMonth() + 1;
  let yyyy = theDate.getFullYear();

  if (dd < 10) {
    dd = "0" + dd;
  }

  if (mm < 10) {
    mm = "0" + mm;
  }

  theDate = yyyy + "-" + mm + "-" + dd;
  document.getElementById("inputDate").min = theDate;
};

const renderInfo = (attraction) => {
  let { caption, mrt, category, address, description, transport } =
    parseAttractionsInfo(attraction);
  document.getElementById("attractionTitle").textContent = caption;
  document.getElementById(
    "attractionCateAndMrt"
  ).textContent = `${category} at ${mrt}`;
  document.getElementById("description").textContent = description;
  document.getElementById("address").textContent = address;
  document.getElementById("transport").textContent = transport;
  for (let i = 0; i < images.length; i++) {
    const attractionImage = document.createElement("img");
    const imageContainer = document.createElement("div");
    document.querySelector(".slideshow-container").appendChild(imageContainer);
    imageContainer.setAttribute("class", "image-container");
    imageContainer.style.display = "none";
    imageContainer.appendChild(attractionImage);
    attractionImage.setAttribute("class", "spotPhoto");

    attractionImage.src = images[i];
  }
  document.querySelector(".image-container").style.display = "block";
  generateDots(images);
  let dots = document.getElementById("pageDots").children;
  dots[index].checked = true;
  setRestrictedDate();
};

const generateDots = (images) => {
  images.forEach((i) => addDot());
};

const addDot = () => {
  let dot = document
    .getElementById("pageDots")
    .appendChild(document.createElement("input"));
  dot.setAttribute("type", "radio");
  dot.setAttribute("class", "pageDot");
  dot.setAttribute("name", "dot");
  dot.addEventListener("click", clickDotChangeImg);
};

const calIndex = (index, increment) => {
  let imageContainers = document.querySelectorAll(".image-container");
  let arrayLength = imageContainers.length;
  let nextIndex = (index + increment + arrayLength) % arrayLength;
  return nextIndex;
};

const checkedCurrentDot = (nextIndex) => {
  let dots = document.getElementById("pageDots").children;
  dots[nextIndex].checked = true;
};
const replaceImgSrc = (nextIndex) => {
  let imageContainers = document.querySelectorAll(".image-container");
  imageContainers[index].style.display = "none";
  imageContainers[nextIndex].style.display = "block";
  checkedCurrentDot(nextIndex);
  index = nextIndex;
};

const clickDotChangeImg = (e) => {
  let dots = document.getElementById("pageDots").children;
  let dotIndex = Array.prototype.indexOf.call(dots, e.target);
  replaceImgSrc(dotIndex);
};

const nextImgBtn = () => {
  replaceImgSrc(calIndex(index, 1));
};
const preImgBtn = () => {
  replaceImgSrc(calIndex(index, -1));
};

const slideshow = () => {
  nextImgBtn();
  setTimeout(slideshow, 5000);
};

const changeTourFee = () => {
  if (document.getElementById("morningHelfBtn").checked) {
    document.getElementById("tourFee").textContent = "新台幣 2000 元";
    document.getElementById("tourPrice").value = "2000";
  } else {
    document.getElementById("tourFee").textContent = "新台幣 2500 元";
    document.getElementById("tourPrice").value = "2500";
  }
};

const sendReservation = async () => {
  document.getElementById("reservationId").value =
    windowUrl.pathname.split("/")[2];
  const formData = new FormData(bookingForm);
  await fetch(bookingForm.action, {
    body: JSON.stringify(Object.fromEntries(formData.entries())),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  }).then((res) => res.json());
};
const reserveTour = async (e) => {
  e.preventDefault();
  let isLoginResult = await isLogin();
  if (!isLoginResult) {
    popupModal();
  } else {
    sendReservation();
    location.href = "/booking";
  }
};
const bookingForm = document.getElementById("reservationFrom");
bookingForm.addEventListener("submit", reserveTour);
// init
fetch(url)
  .then((res) => res.json())
  .then(renderInfo)
  // .then(setTimeout(slideshow, 5000))
  .catch(console.log);

//TODO slideshow image loading need optimize
