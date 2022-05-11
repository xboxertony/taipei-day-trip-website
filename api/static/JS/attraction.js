let data;
let images = [];
let imagesNums;
let current = 0;
let url = window.location.href;
let id = url.split("/")[4];
let inputPrice;

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
const loading = document.querySelector(".loading");
const loadingTxt = document.querySelector(".loadingTxt");
const map = document.querySelector("iframe");
const inputTime = document.querySelector('input[name="time"]:checked');
const priceTag = document.querySelector(".price-tag");

if (inputTime) {
  inputPrice = inputTime.value === "morning" ? 2000 : 2500;
  priceTag.textContent = `新台幣 ${inputPrice} 元`;
}

function load(d) {
  title.textContent = d.name;
  name.textContent = d.name;
  info.textContent = `${d.category} at ${d.mrt}`;
  description.textContent = d.description;
  address.textContent = d.address;
  let addressStr = d.address.replace(/ /g, "");
  map.src = `https://maps.google.com.tw/maps?f=q&hl=zh-TW&geocode=&q=${addressStr}&z=16&output=embed&t=`;
  transport.textContent = d.transport;
  //-----------------------img preload-------------------------

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
        loading.classList.add("none");

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
        loading.classList.remove("none");
        loadingTxt.textContent = `${Math.round((num / arr.length) * 100)}%`;
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

forenoon.addEventListener("input", (e) => {
  inputPrice = 2000;
  priceTag.textContent = "新台幣 2000 元";
});

afternoon.addEventListener("input", (e) => {
  inputPrice = 2500;
  priceTag.textContent = "新台幣 2500 元";
});

const bookBtn = document.querySelector(".book-btn");

bookBtn.addEventListener("click", (e) => {
  const dateBox = document.querySelector(".date");
  const timeBox = document.querySelector(".time");
  const Date = document.querySelector(".input-date");
  const inputDate = Date.value;

  dateBox.style.backgroundColor = inputDate ? "" : "rgba(255, 128, 128, 0.3)";
  timeBox.style.backgroundColor = inputPrice ? "" : "rgba(255, 128, 128, 0.3)";

  if (!inputDate) {
    return null;
  } else if (!inputPrice) {
    return null;
  } else {
    book();
  }

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
      popup(
        "success",
        `訂購成功，${data.name}，${inputDate}-${inputTime.value}
        <br/>
        <a href="/booking" >前往購物車查看</a>
        `
      );
    } else if (res.error) {
      if (res.message === "沒登入") {
        authBtnLogin.click();
      } else {
        popup("return", res.message, () => {
          location.reload();
        });
      }
    }
  }
});