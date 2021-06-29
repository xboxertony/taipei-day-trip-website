let member_center_block = document.getElementById("member_center_block")
let user_information = {}
let member_name = document.getElementById("member_name")
let member_email = document.getElementById("member_email")
let member_info = document.getElementsByClassName("member_info")[0]
let message_info = document.getElementsByClassName("message_info")[0]
let collection_info = document.getElementsByClassName("collection_info")[0]
let order_info = document.getElementsByClassName("order_info")[0]

let month_list = {
    "Jan": 1,
    "Feb": 2,
    "Mar": 3,
    "Apr": 4,
    "May": 5,
    "Jun": 6,
    "Jul": 7,
    "Aug": 8,
    "Sep": 9,
    "Oct": 10,
    "Nov": 11,
    "Dec": 12
}

async function check_login_user() {
    if (!window.location.href.includes("member_center")) return
    let res = await fetch("/api/user")
    let data = await res.json()
    if (data["data"]) {
        user_information = { ...data["data"] }
        appned_center()
    } else {
        member_info.classList.remove("open")
        alert("你尚未登入會員")
        // member_center_block.innerHTML = "你尚未登入會員，請先登入會員"
        // member_center_block.classList.add("text_center")
    }
}

check_login_user()

async function appned_center() {
    member_info.classList.add("open")
    message_info.classList.add("open")
    collection_info.classList.add("open")
    order_info.classList.add("open")
    write_member_info()
    write_message_info()
    write_collection_info()
    write_order_info()
}

function write_member_info() {
    member_name.innerHTML = user_information["name"]
    member_email.innerHTML = user_information["email"]
}

async function write_message_info() {
    let res = await fetch("/api/message_individual")
    let data = await res.json()
    if (data["data"]) {
        let record_data = data["data"]
        record_data.forEach(element => {
            let record = document.createElement("p")
            let date = new Date(element['time'])
            date = new Date(date.setTime(date.getTime()))
            record.innerHTML = `你曾於 ${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}  ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()} 在<a href='/attraction/${element["attrid"]}'>${element['attname']}</a>留言`
            message_info.appendChild(record)
        });
    } else {
        message_info.innerHTML = "你目前沒有留言紀錄"
    }
}

async function write_collection_info(){
    let res = await fetch("api/collect_user")
    let data = await res.json()

    if(data["data"]){
        let att_collect = data["data"]
        att_collect.forEach((item)=>{
            let attname = document.createElement("p")
            attname.innerHTML = `<a href='/attraction/${item["attid"]}'>${item['attname']}</a>`
            collection_info.appendChild(attname)

        })
    }
}

async function write_order_info(){
    let res = await fetch("/api/orders")
    let order_data = await res.json()

    let data = order_data['data']

    for(const [key,val] of Object.entries(data)){
        let order_history_div = document.createElement("div")
        let title = document.createElement("p")
        title.innerHTML = key
        title.addEventListener("click",toggle_contain)
        title.classList.add("object_key")
        
        order_history_div.appendChild(title)
        order_history_div.classList.add("order_history")
        
        let div = document.createElement("div")
        order_history_div.appendChild(div)
        div.classList.add("order_contain")
        div.classList.add("hide")

        val['arr'].forEach((item)=>{
            let div2 = document.createElement("div")
            order_history_div.appendChild(div2)
            div2.classList.add("single_attr")

            let attname = document.createElement("p")
            attname.innerHTML = `景點名稱：${item['attname']}`
            div2.appendChild(attname)

            let date = document.createElement("p")
            date.innerHTML = `遊覽日期：${item['date']}`
            div2.appendChild(date)

            let price = document.createElement("p")
            price.innerHTML = `價錢：${item['price']}`
            div2.appendChild(price)

            let time = document.createElement("p")
            time.innerHTML = `時間：${item['time']}`
            div2.appendChild(time)

            div.appendChild(div2)
        })

        order_history_div.appendChild(div)

        let Chervon = document.createElement("div")
        Chervon.classList.add("chevron")
        Chervon.classList.add("right")
        Chervon.innerHTML = "<i class='fas fa-chevron-right'></i>"
        order_history_div.appendChild(Chervon)

        let Chervon2 = document.createElement("div")
        Chervon2.classList.add("chevron")
        Chervon2.classList.add("down")
        Chervon2.classList.add("hide")
        Chervon2.innerHTML = "<i class='fas fa-chevron-down'></i>"
        order_history_div.appendChild(Chervon2)

        order_info.appendChild(order_history_div)

        Chervon.addEventListener("click",toggle_contain)
        Chervon2.addEventListener("click",toggle_contain)

    }

}



function toggle_contain(){
    let chev = this.parentNode.getElementsByClassName("chevron")
    Array.from(chev).forEach((item)=>{
        item.classList.toggle("hide")
    })
    this.parentNode.getElementsByClassName("order_contain")[0].classList.toggle("hide")
}