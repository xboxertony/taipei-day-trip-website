let url = location.href;
let l = url.split("/");
let idx = l[l.length - 1];
let img_block = document.getElementsByClassName("img_test")[0];
let left_btn = document.getElementsByClassName("left")[0];
let right_btn = document.getElementsByClassName("right")[0];
let point_block = document.getElementsByClassName("point")[0];
let id = 0;
let imglist = [];
let error_message_show = document.getElementById("error_message_show");

let attraction_name = document.getElementById("attraction_name"); //景點名稱
let attraction_cat_and_mrt = document.getElementById(
    "attraction_cat_and_mrt"
); //交通方式與捷運
let describe_content = document.getElementsByClassName("describe_content")[0]; //景點描述
let address_place = document.getElementsByClassName("address_place")[0]; //地址
let traffic = document.getElementsByClassName("traffic")[0]; //交通方式

let up_time = document.getElementById("up_time");
let doen_time = document.getElementById("down_time");
let price = document.getElementById("price");

let send_booking_btn = document.getElementById("submit_booking");

let controler = "#control_pic";

let order_price = 2000;
let order_time = "morning";

let page = 0;

let news = document.getElementsByClassName("news")[0]

let score_real = document.getElementById("score_real")

let view_score = {}

// let mymap = L.map("mapid").setView([25.046387, 121.51695], 15);
// L.tileLayer(
//   "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg",
//   {
//     attribution:
//       'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
//     maxZoom: 18,
//   }
// ).addTo(mymap);
// var marker = L.marker([25.046387, 121.51695]).addTo(mymap);
// marker.bindPopup("我是台北一日遊").openPopup();


async function get_score() {
    let get_score_fetch = await fetch("/api/score")
    let get_data = await get_score_fetch.json()

    view_score = { ...get_data }
    let score = view_score[idx + ""] ? parseFloat(view_score[idx + ""]['score']).toFixed(2) : "0"
    let cnt = view_score[idx + ""] ? view_score[idx + ""]['cnt'] : "0"
    attraction_name.innerHTML = attraction_name.innerHTML + `<span class="score_index"><i class="fas fa-star"></i>${score}</span><span class='score_cnt'>一共${cnt}人評分</span>`;
}

function get_yt_video(word) {
    fetch("/api/youtube", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "search_word": word
        })
    }).then((res) => {
        return res.json()
    }).then((data) => {
        let src = "https://www.youtube.com/embed/" + `${data.items[0].id.videoId}`
        document.getElementById("yt_video").setAttribute("src", src)
    })
}

up_time.addEventListener("click", () => {
    price.innerHTML = "導覽費用：新台幣2000元";
    order_time = "morning";
    order_price = 2000;
});

down_time.addEventListener("click", () => {
    price.innerHTML = "導覽費用：新台幣2500元";
    order_time = "afternoon";
    order_price = 2500;
});

fetch("/api/attraction/" + `${idx}`)
    .then((res) => {
        return res.json();
    })
    .then((res) => {
        handle_img(res.data.images2);
        judge_width();
        show_img();
        handle_data(res);
        add_view()
        let res_cat = document.getElementById("res_cat")
        let res_mrt = document.getElementById("res_mrt")

        res_cat.addEventListener("click",get_cat)
        res_mrt.addEventListener("click",get_mrt)
    });

// let calendar = document.getElementById("date")
let error_date = document.getElementById("error_date")

// function set_calendar_today(){
//     let today = new Date()
//     let setday = new Date(today.setDate(today.getDate()+1))
//     let year = setday.getFullYear()
//     let month = setday.getMonth()
//     let date = setday.getDate()
//     let s = `${year}-${month+1<10?"0"+(month+1):month+1}-${date<10?"0"+date:date}`

//     calendar.setAttribute("min",s)
//     calendar.value = s
// }

// set_calendar_today()

// calendar.addEventListener("change", function () {
//     let select_date = this.value.split("-")
//     let select_date_date = new Date(select_date[0], select_date[1] - 1, select_date[2])
//     let da = new Date()
//     let now = new Date(da.getFullYear(), da.getMonth(), da.getDate())
//     if (now >= select_date_date) {
//         error_date.classList.add("open")
//         error_date.innerHTML = "不可選擇過去的日期"
//     } else {
//         error_date.classList.remove("open")
//     }
// })

send_booking_btn.addEventListener("click", (e) => {
    e.preventDefault();
    // if (error_date.classList.contains("open")) {
    //     error_message_show.innerHTML = "請選擇正確的日期"
    //     return
    // }
    if (!select_date) {
        error_message_show.innerHTML = "請選擇日期"
        return
    }
    fetch("/api/user", {
        method: "GET"
    }).then((res) => {
        return res.json()
    }).then((data) => {
        if (data["data"]) {
            post_booking_information()
        } else {
            login_board.classList.add("open");
        }
    })
});


async function post_booking_information() {
    let booking_info = {
        attractionId: parseInt(idx),
        date: select_date,
        time: order_time,
        price: order_price,
    };
    let check_config = {
        method: "POST",
        body: JSON.stringify({
            date: select_date,
            time: order_time
        }),
        headers: {
            "content-type": "application/json"
        }
    }
    let check_schedule = await fetch("/api/check_leader", check_config)
    let check_res = await check_schedule.json()
    if (check_res['error']) {
        error_message_show.innerHTML = check_res["message"]
        return
    }
    await fetch("/api/booking", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(booking_info),
    })
        .then((res) => {
            return res.json();
        })
        .then((result) => {
            if (result["ok"]) {
                window.location.href = "/booking"
            } else {
                error_message_show.innerHTML = result["message"]
            }
        });
}

let mymap = null

let show_data = document.getElementById("show_data")
let show_cat_mrt = document.getElementsByClassName("show_cat_mrt")[0]

// let res_cat = document.getElementById("res_cat")
// let res_mrt = document.getElementById("res_mrt")

// res_cat.addEventListener("click",get_cat)

show_cat_mrt.addEventListener("click",function(e){
    if(!show_data.contains(e.target)){
        show_cat_mrt.classList.remove("show")
    }
})

async function get_cat(e){

    e.preventDefault()

    show_cat_mrt.classList.add("show")
    show_data.innerHTML = ''

    let get_data = await fetch(`/api/attractions?page=0&cat=${this.dataset.name}`)
    let response = await get_data.json()

    append_mrt_cat_data(response)
    
}

async function get_mrt(e){
    e.preventDefault()

    show_cat_mrt.classList.add("show")
    show_data.innerHTML = ''

    let get_data = await fetch(`/api/attractions?page=0&mrt=${this.dataset.name}`)
    let response = await get_data.json()

    append_mrt_cat_data(response)

}

function append_mrt_cat_data(response){
    let title = document.createElement("p")
    title.innerHTML = '以下是部分相關類別的景點：'
    title.classList.add('get_cat_data')
    show_data.appendChild(title)
    
    response.data.forEach(item=>{
        let attr_item = document.createElement("a")
        attr_item.innerHTML = item.name
        attr_item.classList.add("attr_item")
        attr_item.href = `/attraction/${item.id}`
        show_data.appendChild(attr_item)
    })
}


async function handle_data(res) {
    attraction_name.innerHTML = res.data.name;
    get_score()
    attraction_cat_and_mrt.innerHTML =
        `<a id='res_cat' data-name=${res.data.category}>${res.data.category}</a>   at   <a id='res_mrt' data-name=${res.data.mrt}>${res.data.mrt}</a>`;
    describe_content.innerHTML = res.data.description;
    address_place.innerHTML = res.data.address;
    traffic.innerHTML = res.data.transport;
    mymap = L.map("mapid").setView([res.data.latitude, res.data.longitude], 15);
    L.tileLayer(
        "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg",
        {
            attribution:
                'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
            maxZoom: 30,
        }
    ).addTo(mymap);
    var marker = L.marker([res.data.latitude, res.data.longitude]).addTo(mymap);
    marker.bindPopup(res.data.name).openPopup();
    get_yt_video(res.data.name)
    get_msg(page)
    get_news(res.data.name, res.data.mrt, res.data.address.slice(4, 7).trim())
}

function add_point() {
    for (let i = 0; i < imglist.length; i++) {
        let point = document.createElement("img");
        if (i === id) {
            point.src = "../static/circle current_black.png";
        } else {
            point.src = "../static/circle current.png";
        }
        point_block.appendChild(point);
    }
}

function clear_point() {
    point_block.innerHTML = "";
}

let handle_img = (img_list) => {
    img_list.forEach((element) => {
        // let img = document.createElement("img");
        // img.src = element;
        // img.classList.add("pic");
        imglist.push(element);
    });
};

function show_img() {
    clear_point();
    img_block.style.backgroundImage = "url('https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif')";
    img_block.childNodes.forEach((ele) => {
        if (ele.classList && ele.classList.contains("pic")) {
            ele.remove();
        }
    });
    let img = new Image();
    img.classList.add("pic");
    img.useMap = controler;
    img_block.appendChild(img);
    img.onload = (e) => {
        // img.src = imglist[id];
        // console.log("load_complete")
    };
    // img.src = "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif";
    img.src = imglist[id]
    add_point();
}

let left_area = document.getElementsByTagName("area")[0];
let right_area = document.getElementsByTagName("area")[1];
let left_area2 = document.getElementsByTagName("area")[2];
let right_area2 = document.getElementsByTagName("area")[3];

left_area.addEventListener("click", (e) => {
    e.preventDefault();
    left_hand();
});

right_area.addEventListener("click", (e) => {
    e.preventDefault();
    right_hand();
});

left_area2.addEventListener("click", (e) => {
    e.preventDefault();
    left_hand();
});

right_area2.addEventListener("click", (e) => {
    e.preventDefault();
    right_hand();
});

function right_hand() {
    id++;
    if (id > imglist.length - 1) {
        id = 0;
    }
    show_img();
}

function left_hand() {
    id--;
    if (id < 0) {
        id = imglist.length - 1;
    }
    show_img();
}

right_btn.addEventListener("click", () => {
    right_hand();
});

left_btn.addEventListener("click", () => {
    left_hand();
});

function judge_width() {
    if (document.body.offsetWidth < 800) {
        controler = "#control_RWD";
    } else {
        controler = "#control_pic";
    }
}

window.onresize = () => {
    judge_width();
    show_img();
};

let msg_history = document.getElementById("msg_history")
let btn_msg = document.getElementById("btn_msg")
let textarea_msg = document.getElementById("leave_msg_textarea")
let idx_img = -1
// let btn_more_his = document.getElementById("btn_more_msg")

btn_msg.addEventListener("click", add_msg)

let msg_photo_upload = document.getElementById("msg_photo_upload")
let photo_message = document.getElementById("photo_message")
let msg_img_arr = []

function fcn_delete_image() {
    msg_img_arr = msg_img_arr.filter((item) => parseInt(item.idx) !== parseInt(this.parentNode.dataset.idx))
    this.parentNode.remove()
}

msg_photo_upload.addEventListener("change", append_img)


function append_img() {

    let item = msg_photo_upload.files[0];
    const reader = new FileReader()

    reader.addEventListener("load", function () {
        let img_container = document.createElement("div")
        let photo_show = document.createElement("img")
        img_container.dataset.idx = idx_img + 1
        photo_show.src = reader.result
        img_container.appendChild(photo_show)
        let delete_img = document.createElement("div")
        delete_img.innerHTML = "<i class='fas fa-times-circle'></i>"
        delete_img.classList.add("delete_img")
        delete_img.addEventListener("click", fcn_delete_image)
        img_container.appendChild(delete_img)
        photo_message.appendChild(img_container)
        msg_img_arr.push({ "files": item, "idx": idx_img + 1 })
        idx_img++
    })

    if (item) {
        reader.readAsDataURL(item)
    }
}

function add_msg() {
    let upload_img = new FormData()
    msg_img_arr.forEach(item => {
        upload_img.append("files", item.files)
    })
    upload_img.append("context", JSON.stringify({
        "attid": idx,
        "message": textarea_msg.innerHTML,
        "score": parseInt(score_real.innerHTML)
    }))
    fetch("/api/message", {
        method: "POST",
        // headers: {
        //     "Content-Type": "application/json"
        body: upload_img
        // },
    }).then((res) => {
        return res.json()
    }).then((data) => {
        if (data["error"]) {
            alert("請先登入會員!!")
        }
        else {
            window.location.reload()
        }
    })
}

document.addEventListener("paste", function (e) {
    if (e.clipboardData.items[0].type !== "text/plain") {
        let reader = new FileReader();
        reader.onload = function (e) {
            let div = document.createElement("div");
            let img = new Image();
            let p = document.createElement("p");
            let br = document.createElement("br");

            let delete_btn = document.createElement("div");
            delete_btn.classList.add("delete_btn");
            delete_btn.innerHTML = "X";
            delete_btn.addEventListener("click", delete_parent);

            img.src = e.target.result;
            div.appendChild(img);
            div.appendChild(delete_btn);
            div.contentEditable = false
            div.classList.add("img_blk");
            // textarea_msg.appendChild(div);
            const Rect = window.getSelection().getRangeAt(0)
            // node = Rect.createContextualFragment(div)
            Rect.insertNode(div)
            window.getSelection().empty()
            p.appendChild(br);
            textarea_msg.appendChild(p);
        };
        reader.readAsDataURL(e.clipboardData.items[0].getAsFile());
    }
});

function delete_parent() {
    this.parentNode.remove();
}

// function get_msg(page) {
//     fetch(`/api/message?attid=${idx}&page=${page}`).then((res) => {
//         return res.json()
//     }).then((data) => {
//         // console.log(data)
//         if(page===0)msg_history.innerHTML=""
//         Array.from(data.data).forEach((item) => {
//             create_msg(item)
//         })
//         if (!data["nextpage"]) {
//             btn_more_his.classList.add("close")
//         }
//     })
// }

btn_more_his.addEventListener("click", function () {
    page++
    get_msg(page)
})

function delete_img_in_msg() {
    this.parentNode.remove()
}


function create_msg(msg) {
    let msg_below = document.createElement("div")
    let msg_name = document.createElement("p")
    let msg_time = document.createElement("p")
    let msg_context = document.createElement("div")
    let delete_msg = document.createElement("div")

    msg_below.classList.add("msg_below")
    msg_name.classList.add("msg_name")
    msg_time.classList.add("msg_time")
    msg_context.classList.add("msg_context")

    msg_name.innerHTML = msg.name
    msg_time.innerHTML = msg.time
    if (msg.cnt > 0) {
        msg_time.innerHTML = msg_time.innerHTML + " (已編輯) "
    }
    msg_context.innerHTML = msg.message
    delete_msg.innerHTML = '<i class="fas fa-trash-alt"></i>'
    delete_msg.classList.add("btn_delete_msg")

    let score = document.createElement("span")
    score.classList.add("score_in_msg")
    let star_html = "<span class='score_title'>景點評價：</span>"
    for (let i = 0; i < msg.score; i++) {
        star_html = star_html + "<i class='fas fa-star'></i>"
    }
    score.innerHTML = star_html

    msg_below.appendChild(msg_name)
    msg_below.appendChild(score)
    msg_below.appendChild(msg_time)
    msg_below.appendChild(msg_context)

    if (msg.img) {
        let img_contain_msg = document.createElement("div")
        img_contain_msg.classList.add("img_contain_msg")
        msg.img.split(";").forEach(item => {
            let img_div = document.createElement("div")
            let img_msg = document.createElement("img")
            let img_delete = document.createElement("div")
            img_div.classList.add("img_div")
            img_delete.innerHTML = "<i class='fas fa-times-circle'></i>"
            img_delete.classList.add("img_delete")
            img_msg.src = item
            img_div.appendChild(img_msg)
            img_div.appendChild(img_delete)
            img_contain_msg.appendChild(img_div)
            img_delete.addEventListener("click", delete_img_in_msg)
        })
        msg_below.appendChild(img_contain_msg)
    }

    if (msg["delete"]) {
        delete_msg.addEventListener("click", delete_msg_fcn)
        msg_below.appendChild(delete_msg)
        edit_button = document.createElement("div")
        edit_button.innerHTML = "<i class='fas fa-edit'></i>"
        edit_button.classList.add("btn_edit_msg")
        edit_button.addEventListener("click", edit_msg_fcn)
        msg_below.appendChild(edit_button)
    }
    msg_below.dataset.msgid = msg.id

    msg_history.appendChild(msg_below)
}

function edit_msg_fcn(e) {
    // let edit = await fetch(`/api/message/${idx}`,{
    //     method:"PATCH"
    // })
    // let = res = await edit.json()
    let edit_area = e.target.parentNode.parentNode.getElementsByClassName("msg_context")[0]
    edit_area.setAttribute("contenteditable", true)
    edit_area.classList.add("edit")
    edit_area.focus()
    let btn_send_edit_msg = document.createElement("div")
    btn_send_edit_msg.innerHTML = "<i class='fas fa-reply'></i>"
    btn_send_edit_msg.classList.add("edit_btn_msg")
    e.target.parentNode.parentNode.appendChild(btn_send_edit_msg)
    btn_send_edit_msg.addEventListener("click", send_edit_msg)
    let img_delete_class = e.target.parentNode.parentNode.getElementsByClassName("img_delete")
    Array.from(img_delete_class).forEach(item => {
        item.classList.add("open")
    })
}

async function send_edit_msg(e) {

    let content = e.target.parentNode.parentNode.getElementsByClassName("msg_context")[0].innerHTML
    let idx = e.target.parentNode.parentNode.dataset.msgid
    let img_src_str = ""
    let img_list_for_edit = e.target.parentNode.parentNode.getElementsByTagName("img")
    Array.from(img_list_for_edit).forEach(item => {
        img_src_str += item.src + ";"
    })
    let config = {
        method: "PATCH",
        body: JSON.stringify({
            "content": content,
            "msg_id": idx,
            "img": img_src_str
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }
    let send_fetch = await fetch(`/api/message/${idx}`, config)
    let data = await send_fetch.json()
    if (data["ok"]) {
        window.location.reload()
    }
}

async function delete_msg_fcn(e) {
    let idx = e.target.parentNode.parentNode.dataset.msgid
    let de = await fetch(`/api/message/${idx}`, {
        method: "DELETE"
    })
    let res = await de.json()
    window.location.reload()
}

//評價星星的程式碼
let empty_star = document.getElementsByClassName("empty_star")
let full_star = document.getElementsByClassName("full_star")

function hover_star() {
    for (let i = 0; i < 5; i++) {
        if (i <= this.dataset.id) {
            empty_star[i].classList.add("close")
            full_star[i].classList.add("open")
        } else {
            empty_star[i].classList.remove("close")
            full_star[i].classList.remove("open")
        }
    }

    score_real.innerHTML = `${parseInt(this.dataset.id) + 1}`

}

Array.from(empty_star).forEach((item) => {
    item.addEventListener("mouseover", hover_star)
})

fetch("/api/weather").then((res) => {
    return res.json()
}).then((data) => {
    weather_forcast = data.records.locations[0].location[0].weatherElement
    // .locations[0].location[0].weatherElement
    get_weather_data(weather_forcast)
    // console.log(weather_forcast)
})

let w_region = document.getElementById("weather_forcast_region")
// let left_i = document.getElementById("left_icon")
// let right_i = document.getElementById("right_icon")
let weather_tool = document.getElementById("weather_tool")

// left_i.addEventListener("click", function () {
//     w_region.classList.toggle("open")
//     toggle_icon()
// })

// right_i.addEventListener("click", function () {
//     w_region.classList.toggle("open")
//     toggle_icon()
// })

function toggle_icon() {
    left_i.classList.toggle("close")
    right_i.classList.toggle("close")
}

// let pre_time = null

function get_weather_data(data) {
    weather_tool.innerHTML = ""
    let weather_des = data[6].time
    let raining_percent = data[0].time
    let themometer_high = data[12].time
    let themometer_low = data[8].time
    weather_des.forEach((item) => {
        weather_block = document.createElement("div")
        start_time = document.createElement("p")
        // end_time = document.createElement("p")
        des = document.createElement("div")
        line = null;
        let regex = /\D*陰+\D*雲+/g
        let regex2 = /\D*晴+\D*雲+/g
        let regex3 = /\D*雲+/g
        let regex4 = /\D*陰+\D*/g
        // if (item.startTime.split(" ")[1] === "18:00:00") {
        //     line = document.createElement("hr")
        // }
        if (item.startTime.split(" ")[1] === "18:00:00") {
            start_time.innerHTML = item.startTime.split(" ")[0] + " 下午"
        } else if ((item.startTime.split(" ")[1] === "06:00:00")) {
            start_time.innerHTML = item.startTime.split(" ")[0] + " 上午"
        } else {
            start_time.innerHTML = item.startTime.split(" ")[0] + " 上午"
        }
        // pre_time = item.startTime.split(" ")[0]
        if (item.elementValue[0].value.includes("雨")) {
            des.innerHTML = '<svg height="76.93" viewBox="0 0 91.43 76.93" width="91.43" xmlns="http://www.w3.org/2000/svg"><path d="m72.38 18.5c-.57 0-1.13 0-1.69.06a19 19 0 0 0 -18-13 29.82 29.82 0 0 0 -3.29.2 23.63 23.63 0 0 0 -15.58-5.76c-12.52 0-22.71 8.93-24.89 21.49-5.41 3.45-8.93 9.2-8.93 14.81a18 18 0 0 0 18.17 17.81h54.21c10.32 0 19.05-8.11 19.05-17.81s-8.73-17.8-19.05-17.8z" fill="#ddd"/><path d="m85.34 44.77a23.2 23.2 0 0 1 -4 5.84 16.62 16.62 0 0 0 7.66-7.61c3.7-7.77.09-16.74-8-20.66 6.4 4.47 8.44 13.8 4.34 22.43z" fill="#ccc" fill-rule="evenodd"/><g fill="#00bcd4"><path d="m27.17 46.45c-.06 0-5.66 5.14-6.26 7.32a4.09 4.09 0 1 0 7.89 2.23c.6-2.23-1.56-9.53-1.63-9.55z"/><path d="m42 64.42c-.06 0-5.67 5.14-6.27 7.32a4.1 4.1 0 1 0 7.9 2.18c.55-2.18-1.63-9.48-1.63-9.5z"/><path d="m60.46 52.71c-.06 0-5.66 5.14-6.26 7.32a4.09 4.09 0 1 0 7.89 2.17c.61-2.2-1.56-9.48-1.63-9.49z"/></g></svg>'
        } else if (item.elementValue[0].value.match(regex)) {
            des.innerHTML = '<svg height="61.12" viewBox="0 0 94.24 61.12" width="94.24" xmlns="http://www.w3.org/2000/svg"><path d="m81.86 13.49c-.36 0-.73 0-1.09 0-1.65-5.49-6.32-9.42-11.71-9.42a19.58 19.58 0 0 0 -2.14.15 14.37 14.37 0 0 0 -10.1-4.22c-8.14 0-14.76 6.51-16.17 15.67a13.78 13.78 0 0 0 -5.8 10.8c0 7.16 5.29 13 11.8 13h35.21c6.71 0 12.38-5.94 12.38-13s-5.67-12.98-12.38-12.98z" fill="#ddd"/><path d="m67.42 27.94c-.53 0-1 0-1.57.07a17.72 17.72 0 0 0 -16.79-12.09 28 28 0 0 0 -3.07.19 21.94 21.94 0 0 0 -14.49-5.39c-11.66 0-21.15 8.31-23.18 20-5.04 3.28-8.32 8.58-8.32 13.81a16.78 16.78 0 0 0 16.93 16.59h50.49c9.62 0 17.74-7.6 17.74-16.59s-8.16-16.59-17.74-16.59z" fill="#999"/><path d="m77.78 52.54a22.92 22.92 0 0 1 -3.91 5.74 16.35 16.35 0 0 0 7.48-7.51c3.63-7.65.09-16.47-7.92-20.32 6.37 4.42 8.38 13.6 4.35 22.09z" fill="#777" fill-rule="evenodd"/></svg>'
        } else if (item.elementValue[0].value.match(regex2)) {
            des.innerHTML = '<svg height="81.35" viewBox="0 0 108.87 81.35" width="108.87" xmlns="http://www.w3.org/2000/svg"><path d="m98.57 42.4a25.91 25.91 0 0 0 1-6.49l4.55-2.32 4.77-2.44-5.2-1.24-5-1.18a25.54 25.54 0 0 0 -2.45-6.09l2.76-4.22 2.94-4.42-5.16 1.47-4.92 1.41a26.75 26.75 0 0 0 -5.23-4l.25-5 .27-5.24-3.73 3.74-3.56 3.62a27.47 27.47 0 0 0 -6.63-.92l-2.33-4.43-2.45-4.65-1.3 5.1-1.25 4.9a27.56 27.56 0 0 0 -6.24 2.45l-4.29-2.72-4.5-2.81 1.46 5 1.4 4.8a26.74 26.74 0 0 0 -4.16 5.16l-5.11-.2-5.35-.23 3.89 3.67 3.67 3.45a25.62 25.62 0 0 0 -1 6.5l-4.55 2.32-4.76 2.43 5.19 1.24 5 1.19a25.47 25.47 0 0 0 2.45 6.08l-2.77 4.22-2.99 4.45 5.16-1.48 4.92-1.41a26.35 26.35 0 0 0 5.24 4l-.26 5-.3 5.28 3.73-3.79 3.6-3.6a27.32 27.32 0 0 0 6.62.91l2.33 4.44 2.45 4.65 1.27-5.12 1.29-4.88a27.48 27.48 0 0 0 6.23-2.45l4.29 2.68 4.5 2.81-1.46-5-1.4-4.81a26.87 26.87 0 0 0 4.17-5.16l5.1.21 5.36.22-3.85-3.62z" fill="#f3712d"/><path d="m95.69 35.49a23.1 23.1 0 1 1 -23.1-23.38 23.23 23.23 0 0 1 23.1 23.38z" fill="#ffc82c"/><path d="m69.59 17.77a26.3 26.3 0 0 0 -18.59 16.36 22.83 22.83 0 0 1 17-19.92 22.3 22.3 0 0 1 21.28 6.11 26.51 26.51 0 0 0 -19.69-2.55z" fill="#ffd74b" fill-rule="evenodd"/><path d="m71.47 46.19c-.56 0-1.11 0-1.66.06a18.79 18.79 0 0 0 -17.81-12.81 31.66 31.66 0 0 0 -3.24.2 23.34 23.34 0 0 0 -15.36-5.72c-12.4 0-22.4 8.82-24.58 21.22-5.34 3.41-8.82 9.09-8.82 14.63a17.78 17.78 0 0 0 17.94 17.58h53.53c10.2 0 18.81-8 18.81-17.58s-8.61-17.58-18.81-17.58z" fill="#ddd"/><path d="m84.27 72.13a22.91 22.91 0 0 1 -3.91 5.77 16.43 16.43 0 0 0 7.5-7.55c3.64-7.67.09-16.53-8-20.39 6.44 4.43 8.46 13.65 4.41 22.17z" fill="#ccc" fill-rule="evenodd"/></svg>'
        } else if (item.elementValue[0].value.match(regex3)) {
            des.innerHTML = '<svg height="61.12" viewBox="0 0 94.24 61.12" width="94.24" xmlns="http://www.w3.org/2000/svg"><path d="m81.86 13.49c-.36 0-.73 0-1.09 0-1.65-5.49-6.32-9.42-11.71-9.42a19.58 19.58 0 0 0 -2.14.15 14.37 14.37 0 0 0 -10.1-4.22c-8.14 0-14.76 6.51-16.17 15.67a13.78 13.78 0 0 0 -5.8 10.8c0 7.16 5.29 13 11.8 13h35.21c6.71 0 12.38-5.94 12.38-13s-5.67-12.98-12.38-12.98z" fill="#ddd"/><path d="m67.42 27.94c-.53 0-1 0-1.57.07a17.72 17.72 0 0 0 -16.79-12.09 28 28 0 0 0 -3.07.19 21.94 21.94 0 0 0 -14.49-5.39c-11.66 0-21.15 8.31-23.18 20-5.04 3.28-8.32 8.58-8.32 13.81a16.78 16.78 0 0 0 16.93 16.59h50.49c9.62 0 17.74-7.6 17.74-16.59s-8.16-16.59-17.74-16.59z" fill="#999"/><path d="m77.78 52.54a22.92 22.92 0 0 1 -3.91 5.74 16.35 16.35 0 0 0 7.48-7.51c3.63-7.65.09-16.47-7.92-20.32 6.37 4.42 8.38 13.6 4.35 22.09z" fill="#777" fill-rule="evenodd"/></svg>'
        } else if (item.elementValue[0].value.match(regex4)){
            des.innerHTML = '<svg height="56.26" viewBox="0 0 95.07 56.26" width="95.07" xmlns="http://www.w3.org/2000/svg"><path d="m75.26 19.23c-.58 0-1.17 0-1.75.07a19.78 19.78 0 0 0 -18.75-13.49 32.79 32.79 0 0 0 -3.42.19 24.52 24.52 0 0 0 -16.17-6c-13 0-23.62 9.28-25.88 22.35-5.63 3.59-9.29 9.56-9.29 15.4a18.73 18.73 0 0 0 18.9 18.51h56.36c10.74 0 19.81-8.47 19.81-18.51s-9.07-18.52-19.81-18.52z" fill="#999"/><path d="m87.5 46.13a24.27 24.27 0 0 1 -4.13 6.07 17.27 17.27 0 0 0 7.9-7.94c3.84-8.08.09-17.41-8.36-21.48 6.72 4.67 8.85 14.38 4.59 23.35z" fill="#777" fill-rule="evenodd"/></svg>'
        }
        else if (item.startTime.split(" ")[1] !== "18:00:00") {
            des.innerHTML = '<svg height="92.86" viewBox="0 0 94.92 92.86" width="94.92" xmlns="http://www.w3.org/2000/svg"><path d="m43.54 23.25a34.38 34.38 0 0 0 -24.29 21.4c1.34-12.32 9.86-23 22.15-26.06a29.15 29.15 0 0 1 27.84 8 34.63 34.63 0 0 0 -25.7-3.34z" fill="#ffd74b" fill-rule="evenodd"/><path d="m81.44 55.48a33.86 33.86 0 0 0 1.29-8.48l6-3 6.24-3.18-6.8-1.62-6.49-1.55a33.41 33.41 0 0 0 -3.2-8l3.62-5.53 3.81-5.8-6.75 1.93-6.44 1.84a34.85 34.85 0 0 0 -6.85-5.28l.33-6.55.35-6.85-4.88 5-4.67 4.67a36.05 36.05 0 0 0 -8.67-1.2l-3-5.8-3.28-6.08-1.71 6.67-1.64 6.33a35.55 35.55 0 0 0 -8.16 3.21l-5.61-3.51-5.93-3.65 2 6.59 1.83 6.29a34.61 34.61 0 0 0 -5.45 6.75l-6.69-.27-7-.29 5 4.74 4.8 4.52a33.86 33.86 0 0 0 -1.29 8.5l-5.95 3-6.25 3.22 6.8 1.62 6.48 1.55a33.85 33.85 0 0 0 3.21 8l-3.62 5.53-3.8 5.8 6.74-1.94 6.44-1.84a34.9 34.9 0 0 0 6.85 5.29l-.33 6.55-.35 6.85 4.88-5 4.7-4.73a35.55 35.55 0 0 0 8.62 1.22l3.05 5.81 3.2 6.08 1.72-6.67 1.63-6.36a35.75 35.75 0 0 0 8.15-3.21l5.63 3.48 5.89 3.68-1.89-6.59-1.83-6.29a34.91 34.91 0 0 0 5.45-6.75l6.69.27 7 .29-5-4.74zm-33.98 21.52a30.58 30.58 0 1 1 30.22-30.57 30.39 30.39 0 0 1 -30.22 30.57z" fill="#f3712d"/><path d="m47.46 15.85a30.58 30.58 0 1 0 30.22 30.58 30.39 30.39 0 0 0 -30.22-30.58zm-3.92 7.4a34.38 34.38 0 0 0 -24.29 21.4c1.34-12.32 9.86-23 22.15-26.06a29.15 29.15 0 0 1 27.84 8 34.63 34.63 0 0 0 -25.7-3.34z" fill="#ffc82c"/></svg>'
        } else {
            des.innerHTML = '<svg height="92.86" viewBox="0 0 94.92 92.86" width="94.92" xmlns="http://www.w3.org/2000/svg"><path d="m43.54 23.25a34.38 34.38 0 0 0 -24.29 21.4c1.34-12.32 9.86-23 22.15-26.06a29.15 29.15 0 0 1 27.84 8 34.63 34.63 0 0 0 -25.7-3.34z" fill="#ffd74b" fill-rule="evenodd"/><path d="m81.44 55.48a33.86 33.86 0 0 0 1.29-8.48l6-3 6.24-3.18-6.8-1.62-6.49-1.55a33.41 33.41 0 0 0 -3.2-8l3.62-5.53 3.81-5.8-6.75 1.93-6.44 1.84a34.85 34.85 0 0 0 -6.85-5.28l.33-6.55.35-6.85-4.88 5-4.67 4.67a36.05 36.05 0 0 0 -8.67-1.2l-3-5.8-3.28-6.08-1.71 6.67-1.64 6.33a35.55 35.55 0 0 0 -8.16 3.21l-5.61-3.51-5.93-3.65 2 6.59 1.83 6.29a34.61 34.61 0 0 0 -5.45 6.75l-6.69-.27-7-.29 5 4.74 4.8 4.52a33.86 33.86 0 0 0 -1.29 8.5l-5.95 3-6.25 3.22 6.8 1.62 6.48 1.55a33.85 33.85 0 0 0 3.21 8l-3.62 5.53-3.8 5.8 6.74-1.94 6.44-1.84a34.9 34.9 0 0 0 6.85 5.29l-.33 6.55-.35 6.85 4.88-5 4.7-4.73a35.55 35.55 0 0 0 8.62 1.22l3.05 5.81 3.2 6.08 1.72-6.67 1.63-6.36a35.75 35.75 0 0 0 8.15-3.21l5.63 3.48 5.89 3.68-1.89-6.59-1.83-6.29a34.91 34.91 0 0 0 5.45-6.75l6.69.27 7 .29-5-4.74zm-33.98 21.52a30.58 30.58 0 1 1 30.22-30.57 30.39 30.39 0 0 1 -30.22 30.57z" fill="#f3712d"/><path d="m47.46 15.85a30.58 30.58 0 1 0 30.22 30.58 30.39 30.39 0 0 0 -30.22-30.58zm-3.92 7.4a34.38 34.38 0 0 0 -24.29 21.4c1.34-12.32 9.86-23 22.15-26.06a29.15 29.15 0 0 1 27.84 8 34.63 34.63 0 0 0 -25.7-3.34z" fill="#ffc82c"/></svg>'
        }
        des.classList.add("weather_icon")
        weather_block.appendChild(start_time)
        // weather_block.appendChild(end_time)
        let des_word = document.createElement("div")
        des_word.innerHTML = item.elementValue[0].value
        des_word.classList.add("des_word")
        weather_block.appendChild(des)
        weather_block.appendChild(des_word)


        weather_block.classList.add("weather_block")
        weather_tool.appendChild(weather_block)
        if (line) { weather_tool.appendChild(line) }
    })

    let weather_block_div = document.getElementsByClassName("weather_block")
    for (let i = 0; i < weather_block_div.length; i++) {

        let val = raining_percent[i].elementValue[0].value
        let block = document.createElement("div")
        block.classList.add("raning_block")
        block.classList.add("rainng_move")
        block.innerHTML = `<div class='raining'><i class="fas fa-umbrella"></i></div> <div class="weather_word">${val !== " " ? val + "%" : "尚無資料"}</div>`
        weather_block_div[i].appendChild(block)
        let high_temp = themometer_high[i].elementValue[0].value
        let low_temp = themometer_low[i].elementValue[0].value
        let block2 = document.createElement("div")
        block2.classList.add("raning_block")
        block2.innerHTML = `<div class='raining'><i class="fas fa-thermometer-half"></i></div> <div class="weather_word">${low_temp + "°" + " ~ " + high_temp + "°C"}</div>`
        weather_block_div[i].appendChild(block2)
    }
}

// let news = document.getElementsByClassName("news")[0]

async function get_news(...word) {
    let ss = "/api/news?"
    for (let i = 0; i < arguments.length; i++) {
        ss += `word${i + 1}=${arguments[i]}&`
    }
    let news_props = await fetch(ss)
    let data = await news_props.json()

    if (Object.keys(data).length === 0) {
        news.innerHTML = "目前一周內無相關新聞"
        return
    }

    for (const [key, val] of Object.entries(data)) {
        let a = document.createElement("a")
        a.href = val
        a.setAttribute("target", "_blank")
        a.innerHTML = key
        news.appendChild(a)
    }
}


// collect 收藏

let collect_btn = document.getElementById("collect_btn")

collect_btn.addEventListener("click", collec_action)

async function collec_action(e) {
    e.preventDefault()
    let config = {
        method: "POST",
        body: JSON.stringify({
            id: idx
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }
    let send_collect = await fetch("/api/collect_user", config)
    let response = await send_collect.json()
    if (response["ok"]) {
        alert("該景點已加入收藏")
        check_collect()
        return
    }
    if (response["error"]) {
        alert(response["error"])
        return
    }
}

async function check_collect(){
    let get_collect = await fetch("/api/collect_user")
    let data = await get_collect.json()

    data.data.forEach((item)=>{
        if(item.attid===parseInt(idx)){
            collect_btn.removeEventListener("click",collec_action)
            collect_btn.innerHTML = "已加入收藏"
            collect_btn.disabled = true
            collect_btn.classList.add("red_btn")
        }
    })
}

check_collect()

//新增瀏覽次數
async function add_view() {

    let time = new Date()

    const config = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "time": `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`,
            "attrid": idx
        })
    }
    let view_api = await fetch("/api/search", config)
    let response = await view_api.json()

    if (response["ok"]) {
    }
    if (response["error"]) {
    }
}

//紀錄瀏覽紀錄

async function record() {
    let data = await fetch(`/api/recent_view/${idx}`)
    let res = await data.json()
}

record()

//得到附近景點

let near_by_attr = document.getElementById("near_by_attr")
let km = 2
let time_action = null

let marker_arr = []

async function get_near_by() {
    let data = await fetch(`/api/nearby?attrid=${idx}&km=${km}`)
    let response = await data.json()

    if(marker_arr){
        marker_arr.forEach(item=>{
            mymap.removeLayer(item.marker)
        })
    }

    near_by_attr.innerHTML = ""
    marker_arr = []

    let cnt = 5
    for (let i = 0; i < response.length; i++) {
        if (i >= cnt) break
        for (const [key, val] of Object.entries(response[i])) {
            let find_out_attr = document.createElement("a")
            find_out_attr.innerHTML = val.name
            find_out_attr.href = `/attraction/${key}`
            find_out_attr.setAttribute("target", "_blank")
            near_by_attr.appendChild(find_out_attr)
            find_out_attr.classList.add("find_out_attr")
            let marker_self = L.AwesomeMarkers.icon({
                icon:'star',
                markerColor: 'green'
              });
            marker_arr.push({"marker":L.marker([val.lat,val.long],{icon:marker_self}),"name":val.name})
        }
    }

    marker_arr.forEach(item=>{
        item.marker.addTo(mymap)
        item.marker.bindPopup(item.name).openPopup()
    })

// var marker = L.marker([25.046387, 121.51695]).addTo(mymap);
// marker.bindPopup("我是台北一日遊").openPopup();

}

get_near_by()

let circle = document.getElementById("circle")
let scroll_bar = document.getElementById("scroll_bar")
let isdrawing = false

scroll_bar.addEventListener("click", function (e) {
    move_circle(e)
    // console.log(Math.round(parseInt(e.clientX-30)*10/scroll_bar.offsetWidth))
})
circle.addEventListener("mousedown", function (e) {
    move_circle(e)
    isdrawing = true
})
circle.addEventListener("mousemove", function (e) {
    if (!isdrawing) return
    move_circle(e)
})
circle.addEventListener("mouseup", function (e) {
    isdrawing = false
})

function get_left(left) {
    circle.dataset.left = Math.round(parseInt(left - 50) * 10 / scroll_bar.offsetWidth + 1)
    clearTimeout(time_action)
    time_action = setTimeout(function () {
        km = circle.dataset.left
        get_near_by()
    }, 500)
}

function move_circle(e) {
    let window_size = document.body.offsetWidth
    let delta = null
    if (window_size > 800) {
        delta = (window_size - document.getElementsByClassName("place_view")[0].offsetWidth) / 2
    } else {
        delta = (window_size - scroll_bar.offsetWidth) / 2
    }
    if (e.clientX - delta - 20 < 0 || e.clientX - delta > scroll_bar.offsetWidth - 20) return
    circle.style.left = (e.clientX - delta - 20) + "px"
    get_left(e.clientX - delta + 30)
}

//更新照片牆

let the_wall_inside = document.getElementsByClassName("the_wall_inside")[0]
let the_wall = document.getElementsByClassName("the_wall")[0]

async function add_photo_to_wall() {
    let fetch_get_photo = await fetch(`/api/photo_wall/${idx}`)
    let data_get = await fetch_get_photo.json()

    data_get.forEach((item) => {
        let img_to_wall = document.createElement("img")
        img_to_wall.src = item
        img_to_wall.addEventListener("click", function () {
            the_wall.classList.toggle("show")
            document.getElementById("the_wall_photo").src = this.src
        })
        the_wall_inside.appendChild(img_to_wall)
    })
}

add_photo_to_wall()

the_wall.addEventListener("click", function () {
    the_wall.classList.remove("show")
})

let message_count = document.getElementById("message_count")
async function get_message_count(){
    let get_count = await fetch(`/api/message_count/${idx}`)
    let result = await get_count.json()

    message_count.innerHTML = `(${result.count})`
}

get_message_count()