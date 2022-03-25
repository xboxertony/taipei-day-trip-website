let data = {};
const main = document.querySelector("main");
const items = document.querySelector(".items");

let nextPage;
let keyword;
function load(d) {
  try {
    for (let i = 0; i < d.length; i++) {
      const anchor = document.createElement("a");
      // const item = document.createElement("div");
      anchor.classList.add("item");

      const img = document.createElement("img");
      anchor.appendChild(img);
      img.src = `${d[i].image[0]}`;

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

      items.appendChild(anchor);
    }
  } catch (e) {
    return null;
  }
}

async function initialLoad() {
  console.log("ini-loading");

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
  load();
}

keywordInput.addEventListener("click", (e) => {
  let inputKeyword = e.target.previousElementSibling.value;
  keyword = encodeURI(`${inputKeyword}`);
  loadKeyword();
});

//------------for scroll to footer and load more----------------------------
async function loadMore() {
  let url;
  if (!nextPage) {
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

const options = {
  root: null,
  rootMargin: "0px",
  threshold: 0.5,
};

const observer = new IntersectionObserver(loadMore, options);
const target = document.querySelector("footer");
observer.observe(target);
