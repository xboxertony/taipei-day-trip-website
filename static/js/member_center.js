let member_center_block = document.getElementById("member_center_block")
let user_information = {}
let member_name = document.getElementById("member_name")
let member_email = document.getElementById("member_email")
let member_info = document.getElementsByClassName("member_info")[0]
let message_info = document.getElementsByClassName("message_info")[0]
let collection_info = document.getElementsByClassName("collection_info")[0]

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
    write_member_info()
    write_message_info()
    write_collection_info()
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
        console.log(att_collect)
        att_collect.forEach((item)=>{
            let attname = document.createElement("p")
            attname.innerHTML = `<a href='/attraction/${item["attid"]}'>${item['attname']}</a>`
            console.log(collection_info)
            collection_info.appendChild(attname)

        })
    }
}