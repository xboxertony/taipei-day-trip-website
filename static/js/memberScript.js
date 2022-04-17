const checkPermission = async () => {
  let data = await fetch("/api/user").then((res) => res.json());
  if (data == null) {
    location.href = "/";
  }
};
checkPermission();

const getMember = async () => {
  let data = await fetch("/api/user").then((res) => res.json());
  const memberName = data.data.name;
  const memberEmail = data.data.email;
  return { memberName, memberEmail };
};

const getContact = async () => {
  let data = await fetch("/api/user/contact").then((res) => res.json());
  const contactName = data.contact.name;
  const contactEmail = data.contact.email;
  const contactPhone = data.contact.phone;
  return { contactName, contactEmail, contactPhone };
};

const renderUserData = async () => {
  let { memberName, memberEmail } = await getMember();
  document.getElementById("memberName").textContent = memberName;
  document.getElementById("memberEmail").textContent = memberEmail;
};
const renderUserContact = async () => {
  let { contactName, contactEmail, contactPhone } = await getContact();
  document.getElementById("contactName__member").textContent = contactName;
  document.getElementById("contactEmail__member").textContent = contactEmail;
  document.getElementById("contactPhone__member").textContent = contactPhone;
};

const renderOrders = async () => {
  let data = await fetch("/api/orders").then((res) => res.json());
  if (data == null) {
    let noOrderText = document.createElement("p");
    noOrderText.setAttribute("id", "noOrderText");
    noOrderText.style.fontWeight = "normal";
    document.getElementById("memberOrderInfo").appendChild(noOrderText);
    noOrderText.textContent = "尚未建立訂單";
  } else {
    let tableTitles = [
      "訂單編號",
      "訂單日期",
      "訂單金額",
      "付款狀態",
      "行程地點",
      "行程日期",
      "行程時間",
    ];
    const table = document.createElement("table");
    table.setAttribute("id", "orderTable");
    document.getElementById("memberOrderInfo").appendChild(table);
    const trHead = document.createElement("tr");
    table.appendChild(trHead);
    for (let i = 0; i < tableTitles.length; i++) {
      let th = document.createElement("th");
      th.textContent = tableTitles[i];
      trHead.appendChild(th);
    }
    for (let i = 0; i < data.length; i++) {
      let tr = document.createElement("tr");
      for (let j = 0; j < data[i].length; j++) {
        let td = document.createElement("td");
        td.textContent = data[i][j];
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
  }
};

renderUserData();
renderUserContact();
renderOrders();

const toggleEditPasswordDiv = () => {
  let editPasswordDiv = document.getElementById("editPasswordForm");
  if (editPasswordDiv.style.maxHeight) {
    editPasswordDiv.style.maxHeight = null;
  } else {
    editPasswordDiv.style.maxHeight = editPasswordDiv.scrollHeight + "px";
  }
};
const toggleEditContactDiv = () => {
  let editContactDiv = document.getElementById("editContactForm");
  if (editContactDiv.style.maxHeight) {
    editContactDiv.style.maxHeight = null;
  } else {
    editContactDiv.style.maxHeight = editContactDiv.scrollHeight + "px";
  }
};
const countDown = (resultmsg) => {
  let timeleft = 3;
  let timer = setInterval(() => {
    if (timeleft <= 0) {
      clearInterval(timer);
      logout();
    } else {
      resultmsg.textContent = "修改成功，請 " + timeleft + " 秒後重新登入";
    }
    timeleft -= 1;
  }, 1000);
};
const sendEditPassword = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  let data = await fetch("/api/user/password", {
    body: JSON.stringify(Object.fromEntries(formData.entries())),
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  })
    .then((res) => res.json())
    .catch(console.log);
  if (data.ok) {
    let resultmsg = document.getElementById("editPasswordResult");
    countDown(resultmsg);
  } else {
    document.getElementById("editPasswordResult").textContent = data.message;
  }
};
document
  .getElementById("editPasswordForm")
  .addEventListener("submit", sendEditPassword);

const sendEditContact = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  let data = await fetch("/api/user/contact", {
    body: JSON.stringify(Object.fromEntries(formData.entries())),
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  })
    .then((res) => res.json())
    .catch(console.log);
  if (data.ok) {
    renderUserContact();
    toggleEditContactDiv();
  }
};
document
  .getElementById("editContactForm")
  .addEventListener("submit", sendEditContact);
