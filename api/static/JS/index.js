// pord:http://13.208.55.153:3000
// dev:http://13.208.55.153:3000
// treeful:http://192.168.50.154:3000/

let data = {};
const main = document.querySelector("main");
const items = document.querySelector(".items");

let nextPage;
let keyword;
function load() {
  try {
    for (let i = 0; i < data.length; i++) {
      const anchor = document.createElement("a");
      // const item = document.createElement("div");
      anchor.classList.add("item");

      const img = document.createElement("img");
      anchor.appendChild(img);
      img.src = `${data[i].image[0]}`;

      const title = document.createElement("div");
      anchor.appendChild(title);
      title.classList.add("title");
      title.textContent = data[i].name;

      const info = document.createElement("div");
      anchor.appendChild(info);
      info.classList.add("info");

      const mrt = document.createElement("div");
      info.appendChild(mrt);
      mrt.classList.add("mrt");
      mrt.textContent = data[i].mrt;

      const category = document.createElement("div");
      info.appendChild(category);
      category.classList.add("category");
      category.textContent = data[i].category;

      anchor.href = `http://13.208.55.153:3000/attraction/${data[i].id}`;

      items.appendChild(anchor);
    }
  } catch (e) {
    return null;
  }
}

async function initialLoad() {
  console.log("ini-loading");

  const response = await fetch("http://13.208.55.153:3000/api/attractions");
  const parsedData = await response.json();
  nextPage = parsedData.nextPage;
  data = parsedData.data;
  load();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialLoad());
} else {
  initialLoad();
}

//-----------for keyword searching---------------------

const keywordInput = document.querySelector(".inputKeywordBtn");

async function loadKeyword() {
  const response = await fetch(
    `http://13.208.55.153:3000/api/attractions?page=0&keyword=${keyword}`
  );
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

  if (keyword) {
    url = `http://13.208.55.153:3000/api/attractions?page=${nextPage}&keyword=${keyword}`;
  } else {
    url = `http://13.208.55.153:3000/api/attractions?page=${nextPage}`;
  }
  const response = await fetch(url);
  const parsedData = await response.json();
  nextPage = parsedData.nextPage;
  data = parsedData.data;
  load();
}

const options = {
  root: null,
  rootMargin: "0px",
  threshold: 0.5,
};

const observer = new IntersectionObserver(loadMore, options);
const target = document.querySelector("footer");
observer.observe(target);
