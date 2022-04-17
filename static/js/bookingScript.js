const checkPermission = async () => {
  let data = await fetch("/api/user").then((res) => res.json());
  if (data == null) {
    location.href = "/";
  }
};
checkPermission();

const deleteReservation = async () => {
  await fetch("/api/booking", { method: "DELETE" });
  reloadPage();
};
const isReservation = async () => {
  let result = await fetch("/api/booking").then((res) => res.json());
  return result;
};

const useContactInfo = async () => {
  if (document.getElementById("checkTick").style.display == "none") {
    document.getElementById("checkTick").style.display = "block";
    let data = await fetch("/api/user/contact").then((res) => res.json());
    const contactName = data.contact.name;
    const contactEmail = data.contact.email;
    const contactPhone = data.contact.phone;
    document.getElementById("contactPersonInput").value = contactName;
    document.getElementById("contactEmailInput").value = contactEmail;
    document.getElementById("contactNumberInput").value = contactPhone;
  } else {
    document.getElementById("checkTick").style.display = "none";
    document.getElementById("contactPersonInput").value = "";
    document.getElementById("contactEmailInput").value = "";
    document.getElementById("contactNumberInput").value = "";
  }
};

const whichRender = async (data) => {
  let result = await isReservation();
  if (result == null) {
    renderNoneBoonking();
  } else renderBookingPage(data);
};

const renderNoneBoonking = () => {
  document.getElementById("tourImgAndInfo").style.display = "none";
  document.getElementById("paymentInfo").style.display = "none";
  document.getElementById("underBooking").style.display = "none";
  const noTourText = document
    .getElementById("bookingInfo")
    .appendChild(document.createElement("p"));
  noTourText.textContent = "目前沒有任何待預訂的行程";
  noTourText.setAttribute("id", "bookinTitleNoReservation");
  document
    .getElementById("bookingFooter")
    .setAttribute("id", "noBookingFooter");
};

const renderUserName = async () => {
  let data = await fetch("/api/user").then((res) => res.json());
  const userName = data.data.name;
  document.getElementById(
    "bookingTitle"
  ).textContent = `您好，${userName}，待預訂的行程如下：`;
};

const parseBookingData = (data) => {
  let bookingInfo = data.data;
  let attractionTitle = bookingInfo.attraction.name;
  let attractionAddress = bookingInfo.attraction.address;
  let attractionImg = bookingInfo.attraction.image;
  let bookingDate = bookingInfo.date;
  let bookingTime = bookingInfo.time;
  let bookingPrice = bookingInfo.price;

  return {
    attractionTitle,
    attractionAddress,
    attractionImg,
    bookingDate,
    bookingTime,
    bookingPrice,
  };
};

const renderBookingPage = (bookingInfo) => {
  let {
    attractionTitle,
    attractionAddress,
    attractionImg,
    bookingDate,
    bookingTime,
    bookingPrice,
  } = parseBookingData(bookingInfo);
  document.getElementById("tourTitle").textContent = attractionTitle;
  document.getElementById("locationSpan").textContent = attractionAddress;
  document.getElementById("tourImg").src = attractionImg;
  document.getElementById("dateSpan").textContent = bookingDate;
  if (bookingTime == "afternoon") {
    document.getElementById("timeSpan").textContent = "下午 2 時至晚上 7 時";
  } else {
    document.getElementById("timeSpan").textContent = "上午 8 時至中午 12 時";
  }
  document.getElementById("feeSpan").textContent = `新台幣 ${bookingPrice} 元`;
  document.getElementById(
    "totalPrice"
  ).textContent = `總價：新台幣 ${bookingPrice} 元`;
};

const init = async () => {
  await fetch("/api/booking")
    .then((res) => res.json())
    .then(whichRender);
  renderUserName();
};
init();
