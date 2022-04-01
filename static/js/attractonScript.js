let windowUrl = new URL(`${window.location.href}`);
let url = `${windowUrl.protocol}//${windowUrl.host}/api/attractions/${
  windowUrl.pathname.split("/")[2]
}`;
let images;

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
  document.getElementById("spotPhoto").src = images[0];
  generateDots(images);
  let dots = document.getElementById("pageDots").children;
  dots[0].checked = true;
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

const calIndex = (increment) => {
  let pic = document.getElementById("spotPhoto");
  let currentIndex = images.indexOf(pic.src);
  let arrayLength = images.length;
  let nextIndex = (currentIndex + increment + arrayLength) % arrayLength;
  return nextIndex;
};

const checkedCurrentDot = (nextIndex) => {
  let dots = document.getElementById("pageDots").children;
  dots[nextIndex].checked = true;
};
const replaceImgSrc = (nextIndex) => {
  let pic = document.getElementById("spotPhoto");
  pic.src = images[nextIndex];
  checkedCurrentDot(nextIndex);
};

const clickDotChangeImg = (e) => {
  let dots = document.getElementById("pageDots").children;
  let index = Array.prototype.indexOf.call(dots, e.target);
  replaceImgSrc(index);
};

const nextImgBtn = () => {
  replaceImgSrc(calIndex(1));
};
const preImgBtn = () => {
  replaceImgSrc(calIndex(-1));
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
  // let isReservationResult = await isReservation();
  if (!isLoginResult) {
    popupModal();
  } else {
    sendReservation();
    location.href = "/booking";
    // if (isReservationResult == null) {
    //   sendReservation();
    //   location.href = "/booking";
    // } else {
    //   await fetch("/api/booking", { method: "DELETE" });
    //   sendReservation();
    //   location.href = "/booking";
    // }
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
