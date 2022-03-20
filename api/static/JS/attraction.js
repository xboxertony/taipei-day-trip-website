let data;
let images = [];
let imagesNums;
let current = 0;
let url = window.location.href;
let id = url.split("/")[4];

async function initialLoad() {
  console.log("ini-loading");
  const response = await fetch(`/api/attraction/${id}`);
  const parsedData = await response.json();
  data = parsedData.data;
  load(data);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialLoad);
} else {
  initialLoad();
}
//-----------------------loading content-------------------------------
const title = document.querySelector("title");
// const image = document.querySelector(".image");
const name = document.querySelector(".name");
const info = document.querySelector(".info");
//-------------------------------------------
const description = document.querySelector(".description");
const address = document.querySelector(".address");
const transport = document.querySelector(".transport");
const flowBox = document.querySelector(".flow-box");

const leftBox = document.querySelector(".left-box");
const rightFlow = document.querySelector(".btn-rightArrow");
const leftFlow = document.querySelector(".btn-leftArrow");
const loadingGIF = document.querySelector(".loading-gif");

function load(d) {
  title.textContent = d.name;
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
  let num = 0;
  images.map((v, i, arr) => {
    const img = document.createElement("img");
    img.addEventListener("load", (event) => {
      leftBox.appendChild(img);
      num = num + 1;

      if (num === arr.length) {
        loadingGIF.classList.add("none");

        const imgBoxes = document.querySelectorAll(".image");
        checkImage(imgBoxes, current);
        checkCurrent(current);

        leftFlow.addEventListener("click", () => {
          current = current - 1;
          checkImage(imgBoxes, current);
          checkCurrent(current);
        });

        rightFlow.addEventListener("click", (e) => {
          current = current + 1;
          checkImage(imgBoxes, current);

          checkCurrent(current);
        });
      } else {
        loadingGIF.classList.remove("none");
      }
    });

    img.src = v;
    img.classList.add("image");
    img.classList.add("fade");
    img.classList.add("none");
  });
}

//---------------------------image flow-------------------------

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

function checkImage(arr, c) {
  arr.forEach((v, i) => {
    if (i === c) {
      v.classList.remove("none");
    } else {
      v.classList.add("none");
    }
  });
}

//-------------------for price change------------------------
const forenoon = document.querySelector(".morning");
const afternoon = document.querySelector(".afternoon");
const priceTag = document.querySelector(".price-tag");

forenoon.addEventListener("input", (e) => {
  priceTag.textContent = "新台幣 2000 元";
});

afternoon.addEventListener("input", (e) => {
  priceTag.textContent = "新台幣 2500 元";
});

const bookBtn = document.querySelector(".book-btn");

bookBtn.addEventListener("click", (e) => {
  const Date = document.querySelector(".input-date");
  const inputTime = document.querySelector('input[name="time"]:checked');
  const inputDate = Date.value;
  let inputPrice;

  if (!inputDate) {
    window.alert("請選擇日期");
    return null;
  } else if (!inputTime) {
    window.alert("請選擇時間");
    return null;
  } else {
    inputPrice = inputTime.value === "morning" ? 2000 : 2500;

    book();
  }

  const overlay = document.querySelector(".overlay");
  const authContainer = document.querySelector(".auth-container");

  const messageInner = document.querySelector(".message-inner");
  const alertMessage = document.querySelector(".alert");

  const loginInner = document.querySelector(".login-inner");

  async function book() {
    const response = await fetch("/api/booking", {
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
      loginInner.classList.add("none");

      overlay.classList.remove("none");
      authContainer.classList.remove("none");
      messageInner.classList.remove("none");
      alertMessage.textContent = `訂購成功，${data.name}，${inputDate}-${inputTime.value}`;
    } else if (res.error) {
      loginInner.classList.add("none");

      overlay.classList.remove("none");
      authContainer.classList.remove("none");
      messageInner.classList.remove("none");
      alertMessage.textContent = res.message;
    }
  }
});
