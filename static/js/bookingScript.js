let bookingUrl = `http://${window.location.host}/api/booking`;

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
  await fetch(bookingUrl)
    .then((res) => res.json())
    .then(renderBookingPage);
  renderUserName();
};
init();
