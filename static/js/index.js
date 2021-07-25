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

let mrt_color = null

async function get_mrt_color(){
    let get_color = await fetch("/api/mrt_color")
    let data_color_mrt = await get_color.json()
    mrt_color = data_color_mrt
}

let select_category = document.getElementsByClassName("select_category")[0]
let more_detail_search = document.getElementById("more_detail_search")

let select_mrt = document.getElementById("select_mrt")
let select_cat = document.getElementById("select_cat")

let mrt_item = document.getElementsByClassName("mrt_item")[0]
let cat_item = document.getElementsByClassName("cat_item")[0]

let mrt_list = []
let cat_list = []

let more_detail_search_below = document.getElementById("more_detail_search_below")

more_detail_search.addEventListener("click",function(){
    more_detail_search_below.classList.toggle("show")
})

select_mrt.addEventListener("click",function(){
    this.classList.add("click")
    select_cat.classList.remove("click")
    if(mrt_item.classList.contains("hide")){
        mrt_item.classList.remove("hide")
    }
    if(cat_item.classList.contains("show")){
        cat_item.classList.remove("show")
    }
})

select_cat.addEventListener("click",function(){
    this.classList.add("click")
    select_mrt.classList.remove("click")
    if(!mrt_item.classList.contains("hide")){
        mrt_item.classList.add("hide")
    }
    if(!cat_item.classList.contains("show")){
        cat_item.classList.add("show")
    }
})

// select_mrt.addEventListener("click",append_to_below_mrt)
// select_cat.addEventListener("click",append_to_below_cat)

async function append_to_below_mrt(){
    let cat_color = {
        "小南門、新店線":"mrt_green",
        "文山內湖線":"mrt_brown",
        "淡水、信義線":"mrt_red",
        "南港、板橋、土城線":"mrt_blue",
        "中和、蘆洲、新莊線":"mrt_yellow"
    }
    let data_mrt = await fetch("/api/mrt")
    let response = await data_mrt.json()

    response.data.forEach(item=>{
        let option = document.createElement("div")
        option.innerHTML = item
        option.classList.add("click_for_select")
        option.dataset.type = "mrt"
        option.addEventListener("click",add_type_list)
        if(mrt_color[item]){
            let item_id = cat_color[mrt_color[item]["line"]]
            document.getElementById(item_id).appendChild(option)
        }
    })
}

async function append_to_below_cat(){
    let data_cat = await fetch("/api/cat")
    let response = await data_cat.json()

    response.data.forEach(item=>{
        let option = document.createElement("div")
        option.innerHTML = item
        option.classList.add("click_for_select")
        option.dataset.type = "cat"
        cat_item.appendChild(option)
        option.addEventListener("click",add_type_list)
    })
}

append_to_below_cat()


function add_type_list(){
    this.classList.toggle("click")
    if(this.classList.contains("click")){
        if(this.dataset.type==="cat"){
            cat_list.push(this.innerHTML)
        }else{
            mrt_list.push(this.innerHTML)
        }
    }
    if(!this.classList.contains("click")){
        if(this.dataset.type==="cat"){
            const idx_cat = cat_list.indexOf(this.innerHTML)
            if(idx_cat>-1){
                cat_list.splice(idx_cat,1)
            }
        }else{
            const idx_mrt = mrt_list.indexOf(this.innerHTML)
            if(idx_mrt>-1){
                mrt_list.splice(idx_mrt,1)
            }
        }
    }
}

let send_to_select = document.getElementById("send_to_select")

send_to_select.addEventListener("click",function(){
    init()
    mrt_mode = true
    get_data_by_mrt(0,mrt_list,cat_list)
    get_collection()
})

// fetch("/api/mrt").then((res) => {
//     return res.json()
// }).then((data) => {
//     let option = document.createElement("option")
//     option.value = "all"
//     option.innerHTML = "所有"
//     mrt_select.appendChild(option)
//     data.data.forEach((item) => {
//         let option = document.createElement("option")
//         option.value = item
//         option.innerHTML = item
//         mrt_select.appendChild(option)
//     })
// })

// fetch("/api/cat").then((res)=>{
//     return res.json()
// }).then((data)=>{
//     let option = document.createElement("option")
//     option.value = "all"
//     option.innerHTML = "所有"
//     cat_select.appendChild(option)
//     data.data.forEach(item=>{
//         let option = document.createElement("option")
//         option.value = item
//         option.innerHTML = item
//         cat_select.appendChild(option)
//     })
// })

// mrt_select.addEventListener("change", function () {
//     init()
//     mrt_mode = true
//     mrt = mrt_select.value
//     cat = cat_select.value
//     get_data_by_mrt(0,mrt,cat);
//     get_collection()
// })

// cat_select.addEventListener("change",function(){
//     init()
//     mrt_mode = true
//     mrt = mrt_select.value
//     cat = cat_select.value
//     get_data_by_mrt(0,mrt,cat);
//     get_collection()
// })

async function get_data_by_mrt(page,mrt_list,cat_list) {
    let config = {
        method:"POST",
        body:JSON.stringify({
            "page":page,
            "mrt":mrt_list,
            "cat":cat_list
        }),
        headers:{
            "Content-Type":"application/json"
        }
    }
    let send_select = await fetch("/api/attractions/select",config)
    let response = await send_select.json()

    if(page===0&response.data.length===0){
        container.innerHTML = "目前無篩選結果喔"
        return
    }
    render_data(response);
    next_page = response.nextPage
    // fetch("/api/attractions?page=" + `${page}` + "&mrt=" + `${keyword}`+`&cat=${category}`)
    //     .then((res) => {
    //         return res.json();
    //     })
    //     .then((res) => {
    //         if(page===0&res.data.length===0){
    //             container.innerHTML = "目前無篩選結果喔"
    //             return
    //         }
    //         // next_page = res.nextPage;
    //         console.log(page,keyword,category)
    //         render_data(res);
    //         next_page = res.nextPage
    //     });
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

let loading = document.getElementsByClassName("loading")[0]

function do_this() {
    if (load_complete && next_page) {
        load_complete = false
        if(loading.classList.contains("hide")){
            loading.classList.remove("hide")
        }
        if (!search_mode && !mrt_mode) {
            get_data_by_page(next_page)
            return
        }
        if (mrt_mode) {
            get_data_by_mrt(next_page,mrt_list,cat_list)
            return
        }
        get_data_by_keyword(next_page, key)
    }
    if(!next_page){
        loading.classList.add("hide")
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
    if(page===0){
        console.log(1111)
        await get_mrt_color()
        await append_to_below_mrt()
    }
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

let right_arrow = document.getElementsByClassName("right_arrow")[0]
let left_arrow = document.getElementsByClassName("left_arrow")[0]
let parentNode = document.getElementsByClassName("top_attr_item")[0]

async function appened_data_to_top_5(){
    await get_mrt_color()
    let view_dic_fetch = await fetch("/api/all_view")
    let res = await view_dic_fetch.json()
    view_dic = res
    let append_top = await fetch("/api/search")
    let response = await append_top.json()

    if(response.data.length===0){
        top_attr_item.innerHTML = "目前尚無景點觀看量"
        return
    }

    
    response.data.forEach((item)=>{
        top_attr_item.appendChild(create_attraction(item))
    })
    if(parentNode.scrollWidth>parentNode.clientWidth){
        right_arrow.classList.add("show")
        console.log(1)
    }
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
    img.src = element.images2[0];

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

    let transport = document.createElement("div");
    transport.classList.add("transport");
    let mrt_img = document.createElement("img")
    mrt_img.src = "/static/metro-removebg-preview.png"
    mrt_img.classList.add("mrt_img")
    let t_content = document.createElement("a")
    t_content.innerHTML = element.mrt;
    transport.appendChild(mrt_img)
    transport.appendChild(t_content)
    try{
        transport.style.backgroundColor = mrt_color[element.mrt].color
    }catch{

    }

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

// let right_arrow = document.getElementsByClassName("right_arrow")[0]
// let left_arrow = document.getElementsByClassName("left_arrow")[0]
// let parentNode = document.getElementsByClassName("top_attr_item")[0]

function right_end(){
    if(right_arrow.classList.contains("show")){
        right_arrow.classList.remove("show")
    }
    if(!left_arrow.classList.contains("show")){
        left_arrow.classList.add("show")
    }
}

function left_end(){
    if(!right_arrow.classList.contains("show")){
        right_arrow.classList.add("show")
    }
    if(left_arrow.classList.contains("show")){
        left_arrow.classList.remove("show")
    }
}

right_arrow.addEventListener("click",function(){
    // right_end()
    parentNode.scrollTo(parentNode.scrollWidth,0)
})

left_arrow.addEventListener("click",function(){
    // left_end()
    parentNode.scrollTo(0,0)
})

parentNode.addEventListener("scroll",function(e){
    if (e.target.scrollLeft + e.target.offsetWidth+5 >= e.target.scrollWidth){
        right_end()
    }
    if(e.target.scrollLeft<5){
        left_end()
    }
})