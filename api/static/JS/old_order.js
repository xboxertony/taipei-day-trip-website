const main = document.querySelector("main");
const items = document.querySelector(".items");

let url = window.location.href;
let id = url.split("/")[4];
let ordersArr = [];
const title = document.querySelector(".title");
const name = document.querySelector(".name");
const email = document.querySelector(".email");
const phone = document.querySelector(".phone");
const total = document.querySelector(".total");

async function initialLoad() {
  console.log("ini-loading");
  const response = await fetch(`/api/orders/${id}`);
  const parsedData = await response.json();
  let data = parsedData;

  if (data.error) {
    main.innerHTML = `<h1 style="text-align: center;" >${data.message}</h1>`;
  } else {
    ordersArr = data.data.trip;
  }

  ordersArr.forEach((v) => loadOrders(v));
  title.textContent = `以下為歷史訂單${id}的資訊`;
  total.innerHTML = `<b>總價：</b>${data.data.price}`;
  name.innerHTML = `<b>姓名：</b>${data.data.contact.name}`;
  email.innerHTML = `<b>信箱：</b>${data.data.contact.email}`;
  phone.innerHTML = `<b>聯絡電話：</b>${data.data.contact.phone}`;
}

//---------------------------init loading-----------------------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialLoad);
} else {
  initialLoad();
}

function loadOrders(d) {
  const attraction = document.createElement("div");
  attraction.classList.add("attraction");
  items.appendChild(attraction);

  const leftBox = document.createElement("div");
  leftBox.classList.add("left-box");
  attraction.appendChild(leftBox);

  const image = document.createElement("img");
  image.classList.add("attraction-image");
  image.src = d.attraction.image;
  leftBox.appendChild(image);

  const rightBox = document.createElement("div");
  rightBox.classList.add("right-box");
  attraction.appendChild(rightBox);

  const name = document.createElement("h4");
  name.classList.add("name");
  rightBox.appendChild(name);
  name.textContent = `台北一日遊：${d.attraction.name}`;

  const date = document.createElement("div");
  date.classList.add("date");
  rightBox.appendChild(date);
  date.innerHTML = `<b>日期：</b>${d.date}`;

  const time = document.createElement("div");
  time.classList.add("time");
  rightBox.appendChild(time);
  let str =
    d.time === "afternoon" ? "下午 2 點到晚上 9 點" : "早上 9 點到下午 4 點";
  time.innerHTML = `<b>時間：</b>${str}`;

  const price = document.createElement("div");
  price.classList.add("price");
  rightBox.appendChild(price);
  price.innerHTML = `<b>費用：</b>新台幣${d.price}元`;

  const address = document.createElement("div");
  address.classList.add("address");
  rightBox.appendChild(address);
  address.innerHTML = `<b>地點：</b>${d.attraction.address}`;

  const bookingId = document.createElement("div");
  bookingId.classList.add("booking-id");
  rightBox.appendChild(bookingId);
  bookingId.innerHTML = `<b>預定編號：</b>${d.bookingId}`;
}
