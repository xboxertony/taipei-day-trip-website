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
  let { contactName, contactEmail, contactPhone } = await getContact();
  document.getElementById("memberName").textContent = memberName;
  document.getElementById("memberEmail").textContent = memberEmail;
  document.getElementById("contactName__member").textContent = contactName;
  document.getElementById("contactEmail__member").textContent = contactEmail;
  document.getElementById("contactPhone__member").textContent = contactPhone;
};

const renderOrders = async () => {
  let data = await fetch("/api/orders").then((res) => res.json());
  if (data == null) {
    let noOrderText = document.createElement("p");
    noOrderText.setAttribute("id", "noOrderText");
    noOrderText.textContent = "尚未建立訂單";
  } else {
    console.log(data);
    const table = document.getElementById("orderTable");
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
renderOrders();

const toggleEditPasswordDiv = () => {
  let editPasswordDiv = document.getElementById("editPassword");
  if (editPasswordDiv.style.visibility == "hidden") {
    editPasswordDiv.style.visibility = "visible";
  } else {
    editPasswordDiv.style.visibility = "hidden";
  }
};
const toggleEditContactDiv = () => {
  let editContactDiv = document.getElementById("editContactDiv");
  if (editContactDiv.style.visibility == "hidden") {
    editContactDiv.style.visibility = "visible";
  } else {
    editContactDiv.style.visibility = "hidden";
  }
};
const sendEditPassword = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  await fetch("/api/user/password", {
    body: JSON.stringify(Object.fromEntries(formData.entries())),
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  })
    .then((res) => res.json())
    .catch(console.log);
};
document
  .getElementById("editPasswordForm")
  .addEventListener("submit", sendEditPassword);

const sendEditContact = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  await fetch("/api/user/contact", {
    body: JSON.stringify(Object.fromEntries(formData.entries())),
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  })
    .then((res) => res.json())
    .catch(console.log);
};
document
  .getElementById("editContactForm")
  .addEventListener("submit", sendEditContact);
