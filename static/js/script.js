const showMenu = () => {
  let menuUl = document.getElementById("navbar");
  menuUl.classList.toggle("ulMenu");
};

let url = "http://127.0.0.1:3000/api/attractions";

const addCards = () => {
  attractionsInfo.forEach(addCard);
};

trafficLight = true;
const toggleTrafficLight = () => {
  trafficLight = !trafficLight;
  console.log(`current is traffic light ${trafficLight ? "green" : "red"}`);
};

const getNextPage = () => {
  const attractionsSection = document.querySelector(".spots");
  const footer = document.querySelector("footer");
  const options = {
    threshold: 0.1,
  };

  const loadMoreAttractions = () => {
    if (nextPage != null) {
      let url = `http://127.0.0.1:3000/api/attractions?page=${nextPage}`;
      if (trafficLight) {
        toggleTrafficLight();
        fetch(url)
          .then((res) => res.json())
          .then((datas) => datas)
          .then((datas) => {
            attractionsInfo = datas.data;
            nextPage = datas.nextPage;
          })
          .then(addCards)
          .then(toggleTrafficLight)
          .catch(console.log);
      }
    }
  };
  const callback = ([entry]) => {
    if (entry && entry.isIntersecting) {
      loadMoreAttractions();
    }
  };
  let observer = new IntersectionObserver(callback, options);

  observer.observe(footer);
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
    totalCounts = datas.data.length;
  })
  .then(addCards)
  .then(getNextPage)
  .catch(console.log);
