const main = document.querySelector("main");
async function initialLoad() {
  console.log("ini-loading");
  const response = await fetch(`/api/orders`);
  const parsedData = await response.json();
  let data = parsedData;

  if (data.error) {
    location.href = "/";
  } else {
    ordersArr = data.data;
  }
  if (ordersArr.length === 0) {
    main.textContent = `歷史訂單為空`;
    return null;
  }

  ordersArr.forEach((v) => loadOrders(v));
}

//---------------------------init loading-----------------------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialLoad);
} else {
  initialLoad();
}

function loadOrders(i) {
  anchor = document.createElement("a");
  anchor.href = `/order/${i}`;

  order = document.createElement("div");
  order.classList.add("order");
  order.textContent = i;
  anchor.appendChild(order);
  main.appendChild(anchor);
}
