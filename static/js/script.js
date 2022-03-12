let url = "http://127.0.0.1:3000/api/attractions";

const searchKeyword = () => {
  let keywordValue = document.getElementById("keywordInput").value;
  let url = `http://127.0.0.1:3000/api/attractions?keyword=${keywordValue}`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      attractionsInfo = data.data;
      nextPage = data.nextPage;
    })
    .then(() => {
      addCards(true);
    })
    .then(getNextPage)
    .catch(console.log);
};

lastSendRequestTimeInMs = 0;
resendIntervalInMs = 1500;
const canSendRequst = () => {
  return Date.now() > lastSendRequestTimeInMs + resendIntervalInMs;
};

const getNextPage = () => {
  const footer = document.querySelector("footer");
  const options = {
    threshold: [0.2, 0.4, 0.6, 0.8, 1],
  };
  const loadMoreAttractions = () => {
    if (nextPage != null) {
      let url = `http://127.0.0.1:3000/api/attractions?page=${nextPage}`;
      let keywordValue = document.getElementById("keywordInput").value;
      if (keywordValue) {
        url = `http://127.0.0.1:3000/api/attractions?page=${nextPage}&keyword=${keywordValue}`;
      }

      if (canSendRequst()) {
        lastSendRequestTimeInMs = Date.now();
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            attractionsInfo = data.data;
            nextPage = data.nextPage;
          })
          .then(() => {
            addCards(false);
          });
      }
    }
  };
  const callback = ([entry]) => {
    if (entry || entry.isIntersecting) {
      loadMoreAttractions();
    }
  };
  let observer = new IntersectionObserver(callback, options);

  observer.observe(footer);
};
const removeCards = () => {
  let el = document.getElementById("photoBox");
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
};
const addCards = (isReplace) => {
  if (isReplace) {
    removeCards();
  }
  if (attractionsInfo.length == 0 || attractionsInfo == "") {
    let noDataPara = document
      .getElementById("photoBox")
      .appendChild(document.createElement("p"));
    noDataPara.textContent = "沒有資料唷";
  }
  if (Array.isArray(attractionsInfo)) {
    attractionsInfo.forEach(addCard);
  } else {
    addCard(attractionsInfo);
  }
};

const addCard = (attraction) => {
  let { imgUrl, caption, mrt, category } = parseAttractionsInfo(attraction);
  let newDiv = document
    .getElementById("photoBox")
    .appendChild(document.createElement("div"));
  let newImgSec = newDiv.appendChild(document.createElement("img"));
  let titlePara = newDiv.appendChild(document.createElement("p"));
  let mrtPara = newDiv.appendChild(document.createElement("p"));
  let categoryPara = newDiv.appendChild(document.createElement("p"));
  newImgSec.src = imgUrl;
  titlePara.textContent = caption;
  mrtPara.textContent = mrt;
  categoryPara.textContent = category;
  newDiv.setAttribute("class", "photoCard");
  titlePara.setAttribute("class", "titleName");
  mrtPara.setAttribute("class", "mrt");
  categoryPara.setAttribute("class", "category");
};

const parseAttractionsInfo = (attraction) => {
  let imgUrl = attraction.images[0];
  let caption = attraction.name;
  let mrt = attraction.mrt;
  let category = attraction.category;

  return { imgUrl, caption, mrt, category };
};

fetch(url)
  .then((res) => res.json())
  .then((datas) => datas)
  .then((datas) => {
    attractionsInfo = datas.data;
    nextPage = datas.nextPage;
  })
  .then(() => {
    addCards(false);
  })
  .then(getNextPage);
