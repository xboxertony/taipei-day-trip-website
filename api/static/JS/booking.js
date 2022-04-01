const main = document.querySelector("main");
const items = document.querySelector(".items");
const total = document.querySelector(".total");
const historyLink = document.querySelector(".history-link");

let totalPrice = 0;
let booksArr;

// check();
// if (!isLogin) {
// historyLink.classList.add("none");
//   main.textContent = "未登入，3秒後即將導回首頁";
//   setTimeout(() => {
// location.href = "/";
//   }, 3000);
// }

async function initialLoad() {
  console.log("ini-loading");
  const response = await fetch(`/api/booking`);
  const parsedData = await response.json();
  let data = parsedData;

  if (data.error) {
    historyLink.classList.add("none");

    main.textContent = "";
    console.log(data.error);
    overlay.classList.remove("none");
    authContainer.classList.remove("none");
    loginInner.classList.add("none");
    signupInner.classList.add("none");
    messageInner.classList.remove("none");
    alertMessage.textContent = data.message;

    function backToBooking() {
      location.href = "/";
    }
    returnBtn.addEventListener("click", backToBooking);

    return null;
  } else {
    booksArr = data.data;
  }
  if (!booksArr) {
    main.textContent = `目前沒有待預定的行程`;
    return null;
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
      deleteAPI(bookingID);
    });
  });
}

async function deleteAPI(id) {
  const response = await fetch(`/api/booking/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const res = await response.json();
  const overlay = document.querySelector(".overlay");
  const authContainer = document.querySelector(".auth-container");

  const messageInner = document.querySelector(".message-inner");
  const alertMessage = document.querySelector(".alert");

  const loginInner = document.querySelector(".login-inner");
  if (res.ok) {
    loginInner.classList.add("none");

    overlay.classList.remove("none");
    authContainer.classList.remove("none");
    messageInner.classList.remove("none");
    alertMessage.textContent = `成功刪除，訂單編號${id}`;
    authClose[0].classList.add("none");

    function backToBooking() {
      location.reload();
    }
    returnBtn.addEventListener("click", backToBooking);
  } else if (res.error) {
    loginInner.classList.add("none");

    overlay.classList.remove("none");
    authContainer.classList.remove("none");
    messageInner.classList.remove("none");
    alertMessage.textContent = res.message;
  }
}

//---------------------------init loading-----------------------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialLoad);
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

//------------------------------------------------------------
TPDirect.setupSDK(
  123637,
  "app_g5Nn5pwqQazAXlYDgc3lq0tqfNSbOZEvzc3yIWLXqFXrjkulwm4QJVmiysVj",
  "sandbox"
);
var defaultCardViewStyle = {
  color: "rgb(0,0,0)",
  fontSize: "15px",
  lineHeight: "24px",
  fontWeight: "300",
  errorColor: "red",
  placeholderColor: "",
};

// isUsedCcv default true
const cardViewContainer = document.querySelector("#cardview-container");
const message = document.querySelector(".message");
TPDirect.card.setup("#cardview-container", defaultCardViewStyle);
var submitButton = document.querySelector("#submit-button");

TPDirect.card.onUpdate(function (update) {
  if (update.canGetPrime) {
    submitButton.removeAttribute("disabled");
  } else {
    submitButton.setAttribute("disabled", true);
  }

  if (update.hasError) {
    cardViewContainer.classList.add("error");
  } else {
    cardViewContainer.classList.remove("error");
  }

  if (update.status.number) {
    message.classList.remove("none");
    message.textContent = '"Please check your credit card number"';
  } else {
    message.classList.add("none");
  }
});

//--------------------------------pay-------------------------------

let orderData;
function onClick() {
  const inputName = document.querySelector(".input-name").value;
  const inputEmail = document.querySelector(".input-email").value;
  const inputTelephone = document.querySelector(".input-telephone").value;
  // 讓 button click 之後觸發 getPrime 方法
  TPDirect.card.getPrime(function (result) {
    if (!inputEmail || !inputName || !inputTelephone) {
      loginInner.classList.add("none");
      overlay.classList.remove("none");
      authContainer.classList.remove("none");
      messageInner.classList.remove("none");
      alertMessage.innerHTML = "<h3>請輸入聯絡資訊</h3>";
      return;
    }

    if (result.status !== 0) {
      loginInner.classList.add("none");
      overlay.classList.remove("none");
      authContainer.classList.remove("none");
      messageInner.classList.remove("none");
      alertMessage.innerHTML = "<h3>請確認信用卡資訊是否正確</h3>";
      return;
    }
    var inputPrime = result.card.prime;

    orderData = {
      prime: inputPrime,
      order: {
        price: totalPrice,
        trip: booksArr,
        contact: {
          name: inputName,
          email: inputEmail,
          phone: inputTelephone,
        },
      },
    };
    order();

    async function order() {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      const res = await response.json();
      if (res.data) {
        window.alert(res.data.payment.message);
        window.location.reload();
      } else if (res.error) {
        window.alert(res.message);
      }
    }
  });
}
