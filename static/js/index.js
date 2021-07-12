let container = document.getElementsByClassName("container")[0];

let search = document.getElementById("search");
let search_input = document.getElementById("search_input");
let search_mode = false;
let copyright = document.getElementsByClassName("copyright")[0];
let mrt_select = document.getElementById("mrt_select")
let cat_select = document.getElementById("cat_select")

let cur_id = 0;
let pre_id = 0;
let next_page = 1;
let key = "";
// let dont_stop = false;
let first_time = false;
let load_complete = false;
let time_machine = null;
let mrt = null;
let cat = null
let mrt_mode = false;

let view_dic = {}
let view_score = {}

let arrow_cnt_one = 0

fetch("/api/mrt").then((res) => {
    return res.json()
}).then((data) => {
    let option = document.createElement("option")
    option.value = "all"
    option.innerHTML = "所有"
    mrt_select.appendChild(option)
    data.data.forEach((item) => {
        let option = document.createElement("option")
        option.value = item
        option.innerHTML = item
        mrt_select.appendChild(option)
    })
})

fetch("/api/cat").then((res)=>{
    return res.json()
}).then((data)=>{
    let option = document.createElement("option")
    option.value = "all"
    option.innerHTML = "所有"
    cat_select.appendChild(option)
    data.data.forEach(item=>{
        let option = document.createElement("option")
        option.value = item
        option.innerHTML = item
        cat_select.appendChild(option)
    })
})

mrt_select.addEventListener("change", function () {
    init()
    mrt_mode = true
    mrt = mrt_select.value
    cat = cat_select.value
    get_data_by_mrt(0,mrt,cat);
    get_collection()
})

cat_select.addEventListener("change",function(){
    init()
    mrt_mode = true
    mrt = mrt_select.value
    cat = cat_select.value
    get_data_by_mrt(0,mrt,cat);
    get_collection()
})

function get_data_by_mrt(page, keyword,category) {
    fetch("/api/attractions?page=" + `${page}` + "&mrt=" + `${keyword}`+`&cat=${category}`)
        .then((res) => {
            return res.json();
        })
        .then((res) => {
            if(page===0&res.data.length===0){
                container.innerHTML = "目前無篩選結果喔"
                return
            }
            // next_page = res.nextPage;
            console.log(page,keyword,category)
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

search_input.addEventListener("keyup",function(e){
    if(e.key==="ArrowDown"||e.key==="ArrowUp")return
    arrow_cnt_one=0
    if(e.target.value&&!(e.key==="Enter")){
        suggest_word(this.value)
    }else{
        suggestion_word.classList.remove("show")
    }
})

document.addEventListener("keyup",enter_search)

function enter_search(e){
    let search_output = document.getElementsByClassName("click_word")

    if((e.key==="ArrowDown"||e.key==="ArrowUp") && suggestion_word.classList.contains("show") && !(suggestion_word.innerHTML==="")){
        for(let i=0;i<search_output.length;i++){
            search_output[i].classList.remove("select")
        }
        if(e.key==="ArrowDown"){
            arrow_cnt_one++
            if(arrow_cnt_one>search_output.length){
                arrow_cnt_one=1
            }
        }else{
            arrow_cnt_one--
            if(arrow_cnt_one<=0){
                arrow_cnt_one=search_output.length
            }
        }
        search_output[arrow_cnt_one-1].classList.add("select")
        search_input.value = search_output[arrow_cnt_one-1].innerHTML
    }

    if(!(e.key==="Enter"))return

    if(!document.getElementsByClassName("block_page")[0].classList.contains("open")){
        search.dispatchEvent(new Event("click"))
        document.dispatchEvent(new Event("click"))
        suggestion_word.innerHTML = ""
    }
}

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
    // suggestion_word.classList.remove("show")
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
    arrow_cnt_one = 0
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
            get_data_by_mrt(next_page, mrt,cat)
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

async function get_score(){
    let get_score_fetch = await fetch("/api/score")
    let get_data = await get_score_fetch.json()

    view_score = {...get_data}
}

get_score()

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
    if(page===0){
        window.scrollTo(0,document.getElementsByClassName("container")[0].getBoundingClientRect().top)
    }
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
    let score = view_score[element.id+""]?view_score[element.id+""]['score']:0
    score = parseFloat(score).toFixed(2)
    p.innerHTML = element.name
    p.classList.add("attr_title")
    attraction.setAttribute("data-content", element.name)

    let transport = document.createElement("a");
    transport.classList.add("transport");
    transport.innerHTML = element.mrt;

    let cate = document.createElement("a");
    cate.classList.add("cat");
    cate.innerHTML = element.category;

    description.appendChild(p);
    description.appendChild(transport);
    description.appendChild(cate);

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
    view_cnt.innerHTML = view_cnt.innerHTML +`<span class="score_index"><i class="fas fa-star"></i>${score}</span>`
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

//最近瀏覽的景點

// let recent_record = document.getElementById("recent_record")

// async function get_recent_record(){
//     if(window.location.pathname!=="/")return
//     let get_record = await fetch("/api/get_recent_record")
//     let response = await get_record.json()

//     recent_record.innerHTML = ""

//     if(!response["error"]){
//         for(const [key,val] of Object.entries(response)){
//             let link_to_attr = document.createElement("a")
//             recent_record.appendChild(link_to_attr)
//             link_to_attr.innerHTML = val
//             link_to_attr.href = `/attraction/${key}`
//         }
//         return
//     }

//     let link_to_attr = document.createElement("a")
//     recent_record.appendChild(link_to_attr)
//     link_to_attr.innerHTML = "目前無瀏覽紀錄"


// }

// get_recent_record()