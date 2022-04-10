const main = document.querySelector("main");
const items = document.querySelector(".items");
const total = document.querySelector(".total");
const historyLink = document.querySelector(".history-link");

let totalPrice = 0;
let booksArr;

async function initialLoad() {
  console.log("ini-loading");
  const response = await fetch(`/api/booking`);
  const parsedData = await response.json();
  let data = parsedData;

  if (data.error) {
    historyLink.classList.add("none");
    main.textContent = "";
    popup("return", data.message, () => {
      location.href = "/";
    });
    return null;
  } else {
    booksArr = data.data;
  }
  if (booksArr.length === 0) {
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

  if (res.ok) {
    popup("return", `成功刪除，訂單編號${id}`, () => {
      location.reload();
    });
  } else if (res.error) {
    popup("return", res.message, () => {
      location.reload();
    });
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

let fields = {
  number: {
    // css selector
    element: "#card-number",
    placeholder: "**** **** **** ****",
  },
  expirationDate: {
    // DOM object
    element: document.getElementById("card-expiration-date"),
    placeholder: "MM / YY",
  },
  ccv: {
    element: "#card-ccv",
    placeholder: "ccv",
  },
};

TPDirect.card.setup({
  fields: fields,
  styles: {
    // Style all elements
    input: {},
    // Styling ccv field
    "input.ccv": {
      "font-size": "16px",
    },
    // Styling expiration-date field
    "input.expiration-date": {
      "font-size": "16px",
    },
    // Styling card-number field
    "input.card-number": {
      "font-size": "16px",
    },
    // style focus state
    ":focus": {
      color: "#337788",
    },
    // style valid state
    ".valid": {
      color: "gray",
    },
    // style invalid state
    ".invalid": {
      color: "red",
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    "@media screen and (max-width: 400px)": {
      input: {
        color: "gray",
      },
    },
  },
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
      popup("success", "<h3>請輸入聯絡資訊</h3>");
      return;
    }

    if (result.status !== 0) {
      popup("success", "<h3>請確認信用卡資訊是否正確</h3>");

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
        let { total, orderNumber } = res.data.payment.message;
        popup(
          "return",
          `付款成功，共${total}筆，訂單編號：<a href="order/${orderNumber}" >${orderNumber}</a>`,
          () => {
            location.href = "/";
          }
        );
      } else if (res.error) {
        popup("return", res.message, () => {
          location.reload();
        });
      }
    }
  });
}
