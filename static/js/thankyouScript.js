const checkPermission = async () => {
  let data = await fetch("/api/user").then((res) => res.json());
  if (data == null) {
    location.href = "/";
  }
};
checkPermission();

const renderMemberName = async () => {
  let data = await fetch("/api/user").then((res) => res.json());
  const userName = data.data.name;
  document.getElementById(
    "paymentResultTitle"
  ).textContent = `您好，${userName}，預訂的結果如下：`;
};

const renderOrderResult = async () => {
  let data = await fetch(
    `/api/orders/${window.location.search.split("?number=")[1]}`
  ).then((res) => res.json());
  document.getElementById("orderNumber").textContent = data.data.number;
  if (data.data.status == "paid") {
    document.getElementById("paymentStatus").textContent = "付款成功";
  } else {
    document.getElementById("paymentStatus").textContent = "付款失敗";
  }
};

const init = () => {
  renderMemberName();
  renderOrderResult();
};
init();
