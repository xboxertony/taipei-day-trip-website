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

send_booking_btn.addEventListener("click", (e) => {
    e.preventDefault();
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
                localStorage.setItem("booking","ok")
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
    // img_block.style.backgroundImage = "url(" + `${imglist[id]}` + ")";
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
        img.src = imglist[id];
    };
    img.src = "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif";
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