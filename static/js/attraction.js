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


function get_yt_video(word){
    fetch("/api/youtube",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            "search_word":word
        })
    }).then((res)=>{
        return res.json()
    }).then((data)=>{
        let src = "https://www.youtube.com/embed/"+`${data.items[0].id.videoId}`
        document.getElementById("yt_video").setAttribute("src",src)
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
        handle_img(res.data.images);
        judge_width();
        show_img();
        handle_data(res);
    });

let calendar = document.getElementById("date")
let error_date = document.getElementById("error_date")

calendar.addEventListener("change",function(){
    let select_date = this.value.split("-")
    let select_date_date = new Date(select_date[0],select_date[1]-1,select_date[2])
    let da = new Date()
    let now = new Date(da.getFullYear(),da.getMonth(),da.getDate())
    if(now>=select_date_date){
        error_date.classList.add("open")
        error_date.innerHTML = "不可選擇過去的日期"
    }else{
        error_date.classList.remove("open")
    }
})

send_booking_btn.addEventListener("click", (e) => {
    e.preventDefault();
    if(error_date.classList.contains("open")){
        error_message_show.innerHTML = "請選擇正確的日期"
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


function post_booking_information() {
    let booking_info = {
        attractionId: parseInt(idx),
        date: document.getElementById("date").value,
        time: order_time,
        price: order_price,
    };
    fetch("/api/booking", {
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

function handle_data(res) {
    attraction_name.innerHTML = res.data.name;
    attraction_cat_and_mrt.innerHTML =
        res.data.category + " at " + res.data.mrt;
    describe_content.innerHTML = res.data.description;
    address_place.innerHTML = res.data.address;
    traffic.innerHTML = res.data.transport;
    get_yt_video(res.data.name)
    get_msg(page)
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
        console.log("load_complete")
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
let btn_more_his = document.getElementById("btn_more_msg")

btn_msg.addEventListener("click",add_msg)

function add_msg(){
    fetch("/api/message",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            "attid":idx,
            "message":textarea_msg.value
        })
    }).then((res)=>{
        return res.json()
    }).then((data)=>{
        if(data["error"]){
            alert("請先登入會員!!")
        }
        else{
            window.location.reload()
        }
    })
}

function get_msg(page){
    fetch(`/api/message?attid=${idx}&page=${page}`).then((res)=>{
        return res.json()
    }).then((data)=>{
        console.log(data)
        Array.from(data.data).forEach((item)=>{
            create_msg(item)
        })
        if(!data["nextpage"]){
            btn_more_his.classList.add("close")
        }
    })
}

btn_more_his.addEventListener("click",function(){
    page++
    get_msg(page)
})


function create_msg(msg){
    let msg_below = document.createElement("div")
    let msg_name = document.createElement("p")
    let msg_time = document.createElement("p")
    let msg_context = document.createElement("p")

    msg_below.classList.add("msg_below")
    msg_name.id = "msg_name"
    msg_time.id = "msg_time"
    msg_context.id = "msg_context"

    msg_name.innerHTML = msg.name
    msg_time.innerHTML = msg.time
    msg_context.innerHTML = msg.message

    msg_below.appendChild(msg_name)
    msg_below.appendChild(msg_time)
    msg_below.appendChild(msg_context)

    msg_history.appendChild(msg_below)
}

fetch("/api/weather").then((res)=>{
    return res.json()
}).then((data)=>{
    weather_forcast = data.records.locations[0].location[0].weatherElement[6].time
    // .locations[0].location[0].weatherElement
    get_weather_data(weather_forcast)
})

let w_region = document.getElementById("weather_forcast_region")
let left_i = document.getElementById("left_icon")
let right_i = document.getElementById("right_icon")

left_i.addEventListener("click",function(){
    w_region.classList.toggle("open")
    toggle_icon()
})

right_i.addEventListener("click",function(){
    w_region.classList.toggle("open")
    toggle_icon()
})

function toggle_icon(){
    left_i.classList.toggle("close")
    right_i.classList.toggle("close")
}

let pre_time = null

function get_weather_data(data){
    data.forEach((item)=>{
        weather_block = document.createElement("div")
        start_time = document.createElement("p")
        // end_time = document.createElement("p")
        des = document.createElement("div")
        line = null;
        if(!pre_time || pre_time===item.startTime.split(" ")[0]){
            line = document.createElement("hr")
        }
        if(item.startTime.split(" ")[1]==="18:00:00"){
            start_time.innerHTML = item.startTime.split(" ")[0]+" 下午"
        }else{
            start_time.innerHTML = item.startTime.split(" ")[0]+" 上午"
        }
        pre_time = item.startTime.split(" ")[0]
        console.log(pre_time)
        if(item.elementValue[0].value.includes("雨")){
            des.innerHTML = '<i class="fas fa-cloud-showers-heavy"></i>'
        }else if(item.elementValue[0].value.includes("雲")){
            des.innerHTML = '<i class="fas fa-cloud"></i>'
        }else{
            des.innerHTML = '<i class="fas fa-sun"></i>'
        }
        weather_block.appendChild(start_time)
        // weather_block.appendChild(end_time)
        weather_block.appendChild(des)

        
        weather_block.classList.add("weather_block")
        w_region.appendChild(weather_block)
        if(line){w_region.appendChild(line)}
    })
}