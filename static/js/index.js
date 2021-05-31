let container = document.getElementsByClassName("container")[0];

let search = document.getElementById("search");
let search_input = document.getElementById("search_input");
let search_mode = false;
let copyright = document.getElementsByClassName("copyright")[0];

let cur_id = 0;
let pre_id = 0;
let next_page = 1;
let key = "";
let dont_stop = false;
let first_time = false;
let load_complete = false;
let time_machine = null;

search.addEventListener("click", () => {
    container.innerHTML = "";
    cur_id = 0;
    pre_id = 0;
    key = search_input.value;
    search_mode = true;
    get_data_by_keyword(cur_id, key);
    dont_stop = false;
    first_time = false;
    load_complete = false;
    time_machine = null;
});

window.addEventListener("scroll", () => {
    if (
        document.body.scrollTop + window.outerHeight >
        document.body.offsetHeight
    ) {
        clearTimeout(time_machine);
        time_machine = setTimeout(() => {
            do_this()
        }, 500)
    }
});

async function do_this() {
    if (next_page !== null) {
        cur_id++;
    }
    if (!search_mode && cur_id !== pre_id) {
        load_complete = false;
        await get_data_by_page(cur_id);
        pre_id = cur_id;
    }
    if (search_mode && cur_id !== pre_id) {
        load_complete = false;
        await get_data_by_keyword(cur_id, key);
        pre_id = cur_id;
    }
}

get_data_by_page(cur_id);

function get_data_by_page(page) {
    fetch("/api/attractions?page=" + `${page}`)
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            next_page = res.nextPage;
            render_data(res);
        });
}

function get_data_by_keyword(page, keyword) {
    fetch("/api/attractions?page=" + `${page}` + "&keyword=" + `${keyword}`)
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            if (res.data.length === 0 && dont_stop === false) {
                container.innerHTML = "查無結果";
                return;
            }
            next_page = res.nextPage;
            render_data(res);
            dont_stop = true;
        });
}

function render_data(res) {
    let cnt = 0;
    res.data.forEach((element) => {
        let attraction = document.createElement("div");
        attraction.classList.add("attraction");

        attraction.style.backgroundImage = "url('https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif')";

        let img = new Image();
        img.onload = function () {
            cnt++;
            if (cnt === res.data.length && load_complete === false) {
                load_complete = true;
            }
        };
        img.src = element.images[0];

        let link = document.createElement("a");
        link.href = `/attraction/${element.id}`;
        
        link.appendChild(attraction);
        attraction.appendChild(img);


        let description = document.createElement("div");
        description.classList.add("description");

        let p = document.createElement("p");
        p.innerHTML = element.name;
        attraction.setAttribute("data-content",element.name)

        let transport = document.createElement("a");
        transport.classList.add("transport");
        transport.innerHTML = element.mrt;

        let cat = document.createElement("a");
        cat.classList.add("cat");
        cat.innerHTML = element.category;

        description.appendChild(p);
        description.appendChild(transport);
        description.appendChild(cat);

        attraction.appendChild(description);

        container.appendChild(link);
    });
}