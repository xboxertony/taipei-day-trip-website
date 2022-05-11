let data = {};
const main = document.querySelector("main");
const items = document.querySelector(".items");
const loading = document.querySelector(".loading");
const loadingTxt = document.querySelector(".loadingTxt");

let nextPage;
let keyword;
let isItemLoading = false;
function load(d) {
  isItemLoading = true;
  loading.classList.remove("none");
  let imgLoadCount = 0;
  const item = document.createElement("div");
  item.classList.add("item");
  item.classList.add("none");

  try {
    for (let i = 0; i < d.length; i++) {
      const anchor = document.createElement("a");

      const img = document.createElement("img");
      img.src = `${d[i].image[0]}`;
      img.addEventListener("load", (event) => {
        imgLoadCount = imgLoadCount + 1;

        if (imgLoadCount === d.length) {
          items.appendChild(item);
          item.classList.remove("none");
          loading.classList.add("none");
          loadingTxt.textContent = `0%`;
          isItemLoading = false;

          if (!nextPage) {
            loading.classList.add("none");
          }
        } else {
          loadingTxt.textContent = `${Math.round(
            (imgLoadCount / d.length) * 100
          )}%`;
        }
      });
      anchor.appendChild(img);

      const title = document.createElement("div");
      anchor.appendChild(title);
      title.classList.add("title");
      title.textContent = d[i].name;

      const info = document.createElement("div");
      anchor.appendChild(info);
      info.classList.add("info");

      const mrt = document.createElement("div");
      info.appendChild(mrt);
      mrt.classList.add("mrt");
      mrt.textContent = d[i].mrt;

      const category = document.createElement("div");
      info.appendChild(category);
      category.classList.add("category");
      category.textContent = d[i].category;

      anchor.href = `/attraction/${d[i].id}`;

      item.appendChild(anchor);
    }
  } catch (e) {
    return null;
  }
}

async function initialLoad() {
  const response = await fetch("/api/attractions");
  const parsedData = await response.json();
  nextPage = parsedData.nextPage;
  data = parsedData.data;
  load(data);
}

document.addEventListener("DOMContentLoaded", initialLoad);

//-----------for keyword searching---------------------

const keywordInput = document.querySelector(".inputKeywordBtn");

async function loadKeyword() {
  const response = await fetch(`/api/attractions?page=0&keyword=${keyword}`);
  const parsedData = await response.json();
  nextPage = parsedData.nextPage;
  data = parsedData.data;
  items.textContent = "";
  load(data);
}

keywordInput.addEventListener("click", (e) => {
  let inputKeyword = e.target.previousElementSibling.value;
  keyword = encodeURI(`${inputKeyword}`);
  loadKeyword();
});

//------------for scroll to footer and load more----------------------------
async function loadMore() {
  let url;
  if (!nextPage || isItemLoading) {
    return;
  }

  if (keyword) {
    url = `/api/attractions?page=${nextPage}&keyword=${keyword}`;
  } else {
    url = `/api/attractions?page=${nextPage}`;
  }
  const response = await fetch(url);
  const parsedData = await response.json();
  nextPage = parsedData.nextPage;
  data = parsedData.data;
  load(data);
}
const vh = window.innerHeight;
const options = {
  root: null,
  rootMargin: `-${vh - 64}px 20px 30px 40px`,
  threshold: 0.5,
};

const observer = new IntersectionObserver(loadMore, options);
const target = document.querySelector("footer");
observer.observe(target);
