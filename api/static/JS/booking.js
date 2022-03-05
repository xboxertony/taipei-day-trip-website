const main = document.querySelector("main");
const items = document.querySelector(".items");
const total = document.querySelector(".total");

let totalPrice = 0;

async function initialLoad() {
  console.log("ini-loading");
  const response = await fetch(`http://13.208.55.153:3000/api/booking`);
  const parsedData = await response.json();
  let data = parsedData;
  let booksArr;

  if (data.error) {
    main.innerHTML = `<h1 style="text-align: center;" >${data.message}</h1>`;
  } else {
    booksArr = data.data;
    if (!booksArr) {
      main.textContent = "目前沒有任何待預訂的行程";
    }
  }

  booksArr.forEach((v) => loadBookings(v));
  total.textContent = `總價：新台幣 ${totalPrice} 元`;

  //--------------------delete booking------------------------------------

  const deleteBtn = document.querySelectorAll(".delete");
  deleteBtn.forEach((v) => {
    v.addEventListener("click", (e) => {
      let bookingID = parseInt(
        e.target.parentElement.lastChild.textContent.split("：")[1]
      );
      console.log(bookingID);
      deleteAPI(bookingID);
    });
  });
}

async function deleteAPI(id) {
  const response = await fetch(`http://13.208.55.153:3000/api/booking/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const res = await response.json();
  if (res.ok) {
    window.alert(`成功刪除，訂單編號${id}`);
  } else if (res.error) {
    window.alert(res.message);
  }
}

//---------------------------init loading-----------------------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialLoad());
} else {
  initialLoad();
}

function loadBookings(d) {
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

  const icon = document.createElement("img");
  icon.classList.add("delete");
  icon.src = "../static/Images/icon_delete.png";
  rightBox.appendChild(icon);

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
  totalPrice = totalPrice + d.price;

  const address = document.createElement("div");
  address.classList.add("address");
  rightBox.appendChild(address);
  address.innerHTML = `<b>地點：</b>${d.attraction.address}`;

  const bookingId = document.createElement("div");
  bookingId.classList.add("booking-id");
  rightBox.appendChild(bookingId);
  bookingId.innerHTML = `<b>預定編號：</b>${d.bookingId}`;
}
