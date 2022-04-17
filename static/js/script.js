import { loading, removeLoading } from "./loadingScript.js";

let attractionsInfo;
let nextPage;

const searchKeywordPressEnter = (e) => {
  if (e.keyCode === 13) {
    searchKeyword();
  }
};
document
  .getElementById("keywordInput")
  .addEventListener("keydown", searchKeywordPressEnter);

const searchKeyword = () => {
  let keywordValue = document.getElementById("keywordInput").value;
  fetch(`/api/attractions?keyword=${keywordValue}`)
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

let fetchFlag = true;
const toggleFetchSwitch = () => {
  if (fetchFlag) {
    fetchFlag = false;
  } else {
    fetchFlag = true;
  }
};

const getNextPage = () => {
  const footer = document.querySelector("footer");
  const options = {
    threshold: [0.2, 0.4, 0.6, 0.8, 1],
  };
  const loadMoreAttractions = async () => {
    if (nextPage != null) {
      let url = `http://${window.location.host}/api/attractions?page=${nextPage}`;
      let keywordValue = document.getElementById("keywordInput").value;
      if (keywordValue) {
        url = `http://${window.location.host}/api/attractions?page=${nextPage}&keyword=${keywordValue}`;
      }

      if (fetchFlag) {
        toggleFetchSwitch();
        await fetch(url)
          .then((res) => res.json())
          .then((data) => {
            attractionsInfo = data.data;
            nextPage = data.nextPage;
          })
          .then(() => {
            addCards(false);
          });
        toggleFetchSwitch();
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
  let { imgUrl, caption, mrt, category, id } = parseAttractionsInfo(attraction);
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
  newDiv.addEventListener("click", (e) => linkAttractionId(e, id));
};

const linkAttractionId = (e, id) => {
  location.href = `/attraction/${id}`;
};

const parseAttractionsInfo = (attraction) => {
  let imgUrl = attraction.images[0];
  let caption = attraction.name;
  let mrt = attraction.mrt;
  let category = attraction.category;
  let id = attraction.id;

  return { imgUrl, caption, mrt, category, id };
};

const initIndex = async () => {
  let spotsSection = document.getElementById("spotsSection");
  let photoBox = document.getElementById("photoBox");
  photoBox.style.visibility = "hidden";
  loading(spotsSection);
  let data = await fetch("/api/attractions").then((res) => res.json());

  attractionsInfo = data.data;
  nextPage = data.nextPage;
  addCards(false);
  removeLoading();
  document.getElementById("photoBox").style.visibility = "visible";
  getNextPage();
};
initIndex();
