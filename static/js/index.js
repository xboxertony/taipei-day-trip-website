let container = document.getElementsByClassName("container")[0];

let search = document.getElementById("search");
let search_input = document.getElementById("search_input");
let search_mode = false;
let copyright = document.getElementsByClassName("copyright")[0];
let mrt_select = document.getElementById("mrt_select")

let cur_id = 0;
let pre_id = 0;
let next_page = 1;
let key = "";
// let dont_stop = false;
let first_time = false;
let load_complete = false;
let time_machine = null;
let mrt = null;
let mrt_mode = false;

let view_dic = {}

fetch("/api/mrt").then((res) => {
    return res.json()
}).then((data) => {
    data.data.forEach((item) => {
        let option = document.createElement("option")
        option.value = item
        option.innerHTML = item
        mrt_select.appendChild(option)
    })
})

mrt_select.addEventListener("change", function () {
    init()
    mrt_mode = true
    mrt = mrt_select.value
    get_data_by_mrt(0, mrt);
    get_collection()
})

function get_data_by_mrt(page, keyword) {
    fetch("/api/attractions?page=" + `${page}` + "&mrt=" + `${keyword}`)
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            // next_page = res.nextPage;
            render_data(res);
            next_page = res.nextPage
        });
}

search.addEventListener("click", () => {
    init()
    key = search_input.value;
    search_mode = true;
    get_data_by_keyword(cur_id, key);
    check_full_name(key)
});

async function check_full_name(name){
    let full_name = await fetch(`/api/full_name/${name}`)
    let response = await full_name.json()

    if(response['ok']){
        let accu_cnt = await fetch(`/api/accu_cnt/${name}`)
        let res = await accu_cnt.json()
    }
}

let suggestion_word = document.getElementById("suggestion_word")

search_input.addEventListener("keyup",function(){
    if(this.value){

        suggest_word(this.value)
    }else{
        suggestion_word.classList.remove("show")
    }
})

async function suggest_word(key_word){

    let suggest_fetch = await fetch(`/api/suggestion?word=${key_word}`)
    let data = await suggest_fetch.json()

    if(!suggestion_word.classList.contains("show")){
        suggestion_word.classList.add("show")
    }
    
    suggestion_word.innerHTML = ""


    data.forEach((item)=>{
        let output = document.createElement("div")
        output.innerHTML = item
        output.classList.add("click_word")
        output.addEventListener("click",update_word)
        suggestion_word.appendChild(output)
    })

}

function update_word(){
    search_input.value = this.innerHTML
    if(!suggestion_word.classList.contains("show"))return
    suggestion_word.classList.remove("show")
}


function init() {
    container.innerHTML = "";
    cur_id = 0;
    pre_id = 0;
    dont_stop = false;
    first_time = false;
    load_complete = false;
    time_machine = null;
    mrt_mode = false
    search_mode = false
}

window.addEventListener("scroll", () => {
    // e.log(document.consolbody.scrollTop,document.body.offsetHeight,document.documentElement.scrollHeight)
    if (
        document.body.scrollTop + document.body.offsetHeight + 150 >=
        document.documentElement.scrollHeight
    ) {
        do_this()
        // clearTimeout(time_machine);
        // time_machine = setTimeout(() => {
        //     do_this()
        // }, 500)
    }
});

function do_this() {

    if (load_complete && next_page) {
        load_complete = false
        if (!search_mode && !mrt_mode) {
            get_data_by_page(next_page)
            return
        }
        if (mrt_mode) {
            get_data_by_mrt(next_page, mrt)
            return
        }
        get_data_by_keyword(next_page, key)
    }
    // if (next_page !== null) {
    //     cur_id++;
    // }
    // if (!search_mode && cur_id !== pre_id) {
    //     load_complete = false;
    //     await get_data_by_page(cur_id);
    //     pre_id = cur_id;
    // }
    // if (search_mode && cur_id !== pre_id) {
    //     load_complete = false;
    //     await get_data_by_keyword(cur_id, key);
    //     pre_id = cur_id;
    // }
}

get_data_by_page(cur_id);

async function get_data_by_page(page) {
    let view_dic_fetch = await fetch("/api/all_view")
    let response = await view_dic_fetch.json()
    view_dic = response
    await fetch("/api/attractions?page=" + `${page}`)
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            // next_page = res.nextPage;
            render_data(res);
            next_page = res.nextPage
        });
}

async function get_data_by_keyword(page, keyword) {
    let view_dic_fetch = await fetch("/api/all_view")
    let response = await view_dic_fetch.json()
    view_dic = response
    await fetch("/api/attractions?page=" + `${page}` + "&keyword=" + `${keyword}`)
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            // if (res.data.length === 0 && dont_stop === false) {
            //     container.innerHTML = "查無結果";
            //     return;
            // }
            if (res.data.length === 0) {
                container.innerHTML = "查無結果";
                return;
            }
            // next_page = res.nextPage;
            render_data(res);
            next_page = res.nextPage
            // dont_stop = true;
        });
    window.scrollTo(0,document.body.scrollHeight)
}

let top_attr_item = document.getElementsByClassName("top_attr_item")[0]
let right_page = document.getElementById("right_page")

// right_page.addEventListener("click",right_page_act)
// let px = 0

// function right_page_act(){

//     let son = top_attr_item.getElementsByClassName("for_move")
//     px = px-50
//     Array.from(son).forEach((item)=>{
//         item.style.transform = `translateX(${px}px)`
//     })
// }

async function appened_data_to_top_5(){
    let view_dic_fetch = await fetch("/api/all_view")
    let res = await view_dic_fetch.json()
    view_dic = res
    let append_top = await fetch("/api/search")
    let response = await append_top.json()

    response.data.forEach((item)=>{
        top_attr_item.appendChild(create_attraction(item))
    })
    get_collection()
}

// async function update_view(){
//     let view_dic_fetch = await fetch("/api/all_view")
//     let response = await view_dic_fetch.json()
//     view_dic = response

//     // if(Object.keys(response).includes(item.dataset.attrid)){
//     //     item.innerHTML = `${response[item.dataset.attrid]}`
//     // }else{
//     //     item.innerHTML = "0"
//     // }
// }

appened_data_to_top_5()

function render_data(res) {
    let cnt = 0;
    res.data.forEach((element) => {
        container.appendChild(create_attraction(element));
        cnt++
        if (cnt === res.data.length) {
            load_complete = true
        }
    });
    get_collection()
}



function create_attraction(element){

    let attraction = document.createElement("div");
    attraction.classList.add("attraction");

    attraction.style.backgroundImage = "url('https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif')";

    let img = new Image();
    // img.onload = function () {
    //     cnt++;
    //     if (cnt === res.data.length && load_complete === false) {
    //         load_complete = true;
    //     }
    // };
    img.src = element.images[0];

    let link = document.createElement("a");
    link.href = `/attraction/${element.id}`;
    link.classList.add("for_move")

    link.appendChild(attraction);
    attraction.appendChild(img);


    let description = document.createElement("div");
    description.classList.add("description");

    let p = document.createElement("p");
    p.innerHTML = element.name;
    p.classList.add("attr_title")
    attraction.setAttribute("data-content", element.name)

    let transport = document.createElement("a");
    transport.classList.add("transport");
    transport.innerHTML = element.mrt;

    let cat = document.createElement("a");
    cat.classList.add("cat");
    cat.innerHTML = element.category;

    description.appendChild(p);
    description.appendChild(transport);
    description.appendChild(cat);

    let favorite = new Image()
    favorite.src = "/static/favourite.png"
    favorite.classList.add("icon_collect")
    favorite.classList.add("icon_fav")
    favorite.classList.add("close")
    favorite.dataset.attrid = element.id
    favorite.addEventListener("click", cancel_attr)
    let close = new Image()
    close.src = "/static/close.png"
    close.classList.add("icon_collect")
    close.classList.add("icon_close")
    close.dataset.attrid = element.id
    close.addEventListener("click", collect_attr)

    attraction.appendChild(favorite)
    attraction.appendChild(close)

    attraction.appendChild(description);

    let view_cnt = document.createElement("div")
    view_cnt.innerHTML = `<i class="far fa-eye"></i> <span class='view_cnt'>${view_dic[element.id]?view_dic[element.id]:0}<span>`
    view_cnt.classList.add("view_cnt_div")
    attraction.appendChild(view_cnt)

    return link

}

// 收藏景點


async function collect_attr(e) {
    e.preventDefault();
    let res = await fetch("/api/user")
    let member = await res.json()
    if (!member["data"]) {
        alert("請先登入會員，才可使用收藏功能")
        return
    }
    let config = {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            "id": e.target.dataset.attrid
        })
    }
    let post_collect = await fetch("/api/collect_user", config)
    let result = await post_collect.json()
    let collect_icon = document.getElementsByClassName("icon_fav")
    let close_icon = document.getElementsByClassName("icon_close")
    Array.from(collect_icon).forEach((item) => {
        if (item.dataset.attrid === e.target.dataset.attrid) {
            item.classList.remove("close")
        }
    })
    Array.from(close_icon).forEach((item) => {
        if (item.dataset.attrid === e.target.dataset.attrid) {
            item.classList.add("close")
        }
    })
}

async function cancel_attr(e) {
    e.preventDefault();
    let res = await fetch("/api/user")
    let member = await res.json()
    if (!member["data"]) {
        alert("請先登入會員，才可取消收藏")
        return
    }
    let config = {
        headers: {
            "Content-Type": "application/json"
        },
        method: "DELETE",
        body: JSON.stringify({
            "id": e.target.dataset.attrid
        })
    }
    let post_collect = await fetch("/api/collect_user", config)
    let result = await post_collect.json()
    let collect_icon = document.getElementsByClassName("icon_fav")
    let close_icon = document.getElementsByClassName("icon_close")
    Array.from(collect_icon).forEach((item) => {
        if (item.dataset.attrid === e.target.dataset.attrid) {
            item.classList.add("close")
        }
    })
    Array.from(close_icon).forEach((item) => {
        if (item.dataset.attrid === e.target.dataset.attrid) {
            item.classList.remove("close")
        }
    })
}