let confirm_btn = document.getElementById("confirm_order_btn");
let attraction_order = {};
let total_sum_of_attr = 0;
let trip_list = []
let checkout = null;

// function NextMove(obj, Nextone) {
//   let Next = document.getElementById(Nextone);
//   if (obj.value.length === parseInt(obj.getAttribute("maxlength"))) {
//     Next.focus();
//   }
//   return;
// }

function evoke_delete_fcn() {
    let delete_fuc = document.getElementsByClassName("delete");

    Array.from(delete_fuc).forEach((element) => {
        delete_order(element)
    });
}

function delete_order(item){
    item.addEventListener("click", (e) => {
        let idx = e.target.parentNode.dataset.id
        total_sum_of_attr = total_sum_of_attr-parseInt(e.target.parentNode.dataset.price)
        e.target.parentNode.remove();
        fetch(`/api/booking/${idx}`, {
            method: "DELETE",
        })
            .then((res) => {
                return res.json();
            })
            .then((d) => {
                delete_below();
            });
    });
}

let schedule = document.getElementsByClassName("schedule")[0];

fetch("/api/booking", {
    method: "GET",
})
    .then((res) => {
        return res.json();
    })
    .then((d) => {
        handle_attraction_list(d)
        evoke_delete_fcn();
        let checkout = document.getElementsByClassName("checkout");
        handle_drag_event(checkout,"schedule")
    });

// if (localStorage.getItem("booking") === "ok") {
// } else {
//     delete_below();
//     // document.getElementById(
//     //     "howareyou"
//     // ).innerHTML = `您好，{}，您待預定的行程如下`;
// }

// fetch("/api/user", {
//     method: "GET",
// })
//     .then((res) => {
//         return res.json();
//     })
//     .then((data) => {
//     });

function delete_below() {
    // schedule.classList.remove("close");
    let check_cnt = document.getElementsByClassName("checkout").length
    if(check_cnt===0){
        document.getElementById("messgae_for_null").classList.add("open");
        Array.from(dommi).forEach(item=>{
            item.classList.remove("open")
        })
    }

    document.getElementById(
        "total_sum"
    ).innerHTML = `確認總價：新台幣${total_sum_of_attr}元`;

    // let text = document.createElement("p");
    // text.innerHTML = "目前沒有任何待預定的行程";
    // schedule.appendChild(text);
}

let dommi = document.getElementsByClassName("form_div")

function handle_attraction_list(d){
    if(d.data.length===0){
        delete_below()
        return
    }
    d.data.forEach((item)=>{
        append_attraction(item)
    })

}

function append_attraction(d) {
    document.getElementById("messgae_for_null").classList.remove("open");
    Array.from(dommi).forEach(item=>{
        item.classList.add("open")
    })
    let order_image = document.createElement("div");
    order_image.classList.add("photo");
    let image_inside = new Image();
    // image_inside.src = d.data.attraction.image;
    image_inside.src = d.attraction.image;
    order_image.appendChild(image_inside);

    // console.log(`"url('${d.data.attraction.image}')"`);

    let word_to_paid = document.createElement("div");
    word_to_paid.classList.add("word_to_paid");

    let title_word_to_paid = document.createElement("p");
    // title_word_to_paid.innerHTML = `台北一日遊：${d.data.attraction.name}`;
    title_word_to_paid.innerHTML = `台北一日遊：${d.attraction.name}`;
    title_word_to_paid.classList.add("title_word_to_paid");

    let order_date = document.createElement("p");
    // order_date.innerHTML = `日期：${d.data.date}`;
    order_date.innerHTML = `日期：${d.date}`;
    order_date.classList.add("information");

    let order_time = document.createElement("p");
    // if (d.data.time === "morning") {
    //     order_time.innerHTML = `時間：早上9點到下午4點`;
    // } else {
    //     order_time.innerHTML = `時間：下午4點到早上9點`;
    // }
    if (d.time === "morning") {
        order_time.innerHTML = `時間：早上9點到下午4點`;
    } else {
        order_time.innerHTML = `時間：下午4點到早上9點`;
    }
    order_time.classList.add("information");

    let order_price = document.createElement("p");
    // order_price.innerHTML = `費用：新台幣${d.data.price}元`;
    order_price.innerHTML = `費用：新台幣${d.price}元`;
    order_price.classList.add("information");

    let order_name_attraction = document.createElement("p");
    // order_name_attraction.innerHTML = `地點：${d.data.attraction.address}`;
    order_name_attraction.innerHTML = `地點：${d.attraction.address}`;
    order_name_attraction.classList.add("information");

    word_to_paid.appendChild(title_word_to_paid);
    word_to_paid.appendChild(order_date);
    word_to_paid.appendChild(order_time);
    word_to_paid.appendChild(order_price);
    word_to_paid.appendChild(order_name_attraction);

    let checkout = document.createElement("div");
    checkout.classList.add("checkout");
    checkout.appendChild(order_image);
    // console.log(order_image);
    checkout.appendChild(word_to_paid);

    let delete_action_btn = document.createElement("img");
    delete_action_btn.src = "../static/icon_delete.png";
    delete_action_btn.classList.add("delete");

    checkout.appendChild(delete_action_btn);

    checkout.dataset.id = d.attraction.id
    checkout.dataset.price = d.price

    schedule.appendChild(checkout);

    total_sum_of_attr = total_sum_of_attr+d.price

    document.getElementById(
        "total_sum"
    ).innerHTML = `確認總價：新台幣${total_sum_of_attr}元`;

    // attraction_order = {
    //     price: d.data.price,
    //     trip: {
    //         attraction: d.data.attraction,
    //         date: d.data.date,
    //         time: d.data.time,
    //     },
    // };

    trip_list.push({
        attraction: d.attraction.id,
        date: d.date,
        time: d.time,
        price:d.price
    })

    attraction_order = {
        price: total_sum_of_attr,
        trip: trip_list,
    };

}

document.getElementById("order_name").value = booking_name
document.getElementById("order_email").value = booking_email
// <!-- <div class="checkout">
//     <div class="photo"></div>
//     <div class="word_to_paid">
//       <p class="title_word_to_paid">台北一日遊1</p>
//       <p class="information">日期：</p>
//       <p class="information">時間：</p>
//       <p class="information">費用：</p>
//       <p class="information">地點：</p>
//     </div>
//     <img src="../static/icon_delete.png" alt="" class="delete">
//   </div> -->

order_email = document.getElementById("order_email")
order_phone = document.getElementById("order_phone")

error_order_email = document.getElementById("error_order_email")
error_order_phone = document.getElementById("error_order_phone")

add_event(order_email,"blur",check_order_email)
add_event(order_phone,"blur",check_order_phone)

function check_order_phone(){
    let reg = /09\d{8}/g
    let phone = order_phone.value
    if(!(phone.match(reg) && phone.match(reg)[0]===phone)){
        error_order_phone.classList.add("open")
        error_order_phone.innerHTML = "手機號碼格式錯誤，ex:09xxxxxxxxx"
    }else{
        error_order_phone.classList.remove("open")
    }
}

function check_order_email(){
    let em = this.value
    let ma = em.match(regex)
    if(!(ma && em===ma[0])){
        error_order_email.classList.add("open")
        error_order_email.innerHTML = "請輸入正確的email格式，例：xxx@xxx.com"
    }else{
        error_order_email.classList.remove("open")
    }
}

TPDirect.setupSDK(
    20216,
    "app_9TqLsD0qcuIVWst39YRyC9Aud7VxBnGfeYQL0NZ8JMJuYs7CJwWxEbwmITCL",
    "sandbox"
);
// 以下提供必填 CCV 以及選填 CCV 的 Example
// 必填 CCV Example
var fields = {
    number: {
        // css selector
        element: "#card-number",
        placeholder: "**** **** **** ****",
    },
    expirationDate: {
        // DOM object
        element: document.getElementById("card-expiration-date"),
        placeholder: "MM / YY",
    },
    ccv: {
        element: "#card-ccv",
        placeholder: "後三碼",
    },
};
// 選填 CCV Example
// var fields = {
//   number: {
//     // css selector
//     element: "#card-number",
//     placeholder: "**** **** **** ****",
//   },
//   expirationDate: {
//     // DOM object
//     element: document.getElementById("card-expiration-date"),
//     placeholder: "MM / YY",
//   },
// };
TPDirect.card.setup({
    fields: fields,
    styles: {
        // Style all elements
        input: {
            color: "gray",
        },
        // Styling ccv field
        "input.cvc": {
            // 'font-size': '16px'
        },
        // Styling expiration-date field
        "input.expiration-date": {
            // 'font-size': '16px'
        },
        // Styling card-number field
        "input.card-number": {
            // 'font-size': '16px'
        },
        // style focus state
        ":focus": {
            // 'color': 'black'
        },
        // style valid state
        ".valid": {
            color: "green",
        },
        // style invalid state
        ".invalid": {
            color: "red",
        },
        // Media queries
        // Note that these apply to the iframe, not the root window.
        "@media screen and (max-width: 400px)": {
            input: {
                color: "orange",
            },
        },
    },
});

function onClick() {
    TPDirect.card.getPrime(function (result) {
        if (result.status !== 0) {
            // console.error("getPrime error");
            document.getElementById("status_code").innerHTML = "請輸入正確信用卡號碼"
            return
        }
        let prime = result.card.prime;
        let data = {
            prime: prime,
            order: {
                price: attraction_order.price,
                trip: attraction_order.trip,
                contact: {
                    name: document.getElementById("order_name").value,
                    email: document.getElementById("order_email").value,
                    phone: document.getElementById("order_phone").value,
                },
            },
        };
        document.getElementById("status_code").innerHTML = "執行中..."
        fetch("/api/orders", {
            body: JSON.stringify(data),
            headers: {
                "content-type": "application/json",
            },
            method: "POST",
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log(data)
                if (data["error"]) {
                    document.getElementById("status_code").innerHTML = data["message"]
                    return
                }
                window.location.href = `/thankyou?number=${data.data.number}`
            });
    });
}