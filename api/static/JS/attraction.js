// http://13.208.55.153:3000/api/attraction/1
let data;
let images = [];
let imagesNums;
let current = 0;
let url = window.location.href;
let id = url.split("/")[4];

async function initialLoad() {
  console.log("ini-loading");
  const response = await fetch(
    `http://13.208.55.153:3000/api/attraction/${id}`
  );
  const parsedData = await response.json();
  data = parsedData.data;
  load(data);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialLoad());
} else {
  initialLoad();
}
//-----------------------------------------------------------------
const title = document.querySelector("title");
const image = document.querySelector(".image");
const name = document.querySelector(".name");
const info = document.querySelector(".info");
//-------------------------------------------
const description = document.querySelector(".description");
const address = document.querySelector(".address");
const transport = document.querySelector(".transport");
const flowBox = document.querySelector(".flow-box");

function load(d) {
  title.textContent = d.name;
  image.src = `${d.image[0]}`;
  name.textContent = d.name;
  info.textContent = `${d.category} at ${d.mrt}`;
  description.textContent = d.description;
  address.textContent = d.address;
  transport.textContent = d.transport;

  //-----------------------------------------------------

  images = d.image;
  imagesNums = images.length;
  for (let i = 0; i < imagesNums; i++) {
    const flow = document.createElement("img");
    flow.classList.add("flow");
    flow.src = "../static/Images/circle Ncurrent.png";
    flowBox.appendChild(flow);
  }

  checkCurrent(current);
}

//-------------------------------------------------------
const rightFlow = document.querySelector(".btn-rightArrow");
const leftFlow = document.querySelector(".btn-leftArrow");

leftFlow.addEventListener("click", (e) => {
  current = current - 1;
  image.src = `${images[current]}`;
  checkCurrent(current);
});

rightFlow.addEventListener("click", (e) => {
  current = current + 1;
  image.src = `${images[current]}`;
  checkCurrent(current);
});

function checkCurrent(c) {
  if (c === 0) {
    leftFlow.classList.add("none");
  } else {
    leftFlow.classList.remove("none");
  }

  if (c === imagesNums - 1) {
    rightFlow.classList.add("none");
  } else {
    rightFlow.classList.remove("none");
  }

  for (let i = 0; i < flowBox.children.length; i++) {
    if (i === c) {
      flowBox.children[i].src = "../static/Images/circle current.png";
    } else {
      flowBox.children[i].src = "../static/Images/circle Ncurrent.png";
    }
  }
}

//-------------------for price change------------------------
const forenoon = document.querySelector(".morning");
const afternoon = document.querySelector(".afternoon");
const priceTag = document.querySelector(".price-tag");

forenoon.addEventListener("input", (e) => {
  priceTag.textContent = "新台幣2000元";
});

afternoon.addEventListener("input", (e) => {
  priceTag.textContent = "新台幣2500元";
});

const bookBtn = document.querySelector(".book-btn");

bookBtn.addEventListener("click", (e) => {
  const Date = document.querySelector(".input-date");
  const inputTime = document.querySelector('input[name="time"]:checked');
  const inputDate = Date.value;
  let inputPrice;
  console.log(inputTime);

  if (!inputDate) {
    window.alert("請選擇日期");
    return null;
  } else if (!inputTime) {
    window.alert("請選擇時間");
    return null;
  } else {
    console.log("booking");
    inputPrice = inputTime.value === "morning" ? 2000 : 2500;

    book();
  }

  async function book() {
    const response = await fetch("http://13.208.55.153:3000/api/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attractionId: id,
        date: inputDate,
        time: inputTime.value,
        price: inputPrice,
      }),
    });
    const res = await response.json();
    if (res.ok) {
      overlay.classList.add("none");
      window.alert(`訂購成功，${data.name}，${inputDate}-${inputTime.value}`);
    } else if (res.error) {
      window.alert(res.message);
    }
  }
});
