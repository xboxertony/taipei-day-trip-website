let member_center_block = document.getElementById("member_center_block")
let user_information = {}
let member_name = document.getElementById("member_name")
let member_email = document.getElementById("member_email")
let member_info = document.getElementsByClassName("member_info")[0]
let message_info = document.getElementsByClassName("message_info")[0]
let collection_info = document.getElementsByClassName("collection_info")[0]
let order_info = document.getElementsByClassName("order_info")[0]
let order_info_contain = document.getElementsByClassName("order_info_contain")[0]

let select_region = document.getElementById("select_region")

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

let photo_show = document.getElementById("photo_show")

async function check_login_user() {
    if (!window.location.href.includes("member_center")) return
    let res = await fetch("/api/user")
    let data = await res.json()
    if (data["data"]) {
        user_information = { ...data["data"] }
        appned_center()
    } else {
        // window.location.href = "/"
        // member_info.classList.remove("open")
        // alert("你尚未登入會員")
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
    write_order_info(100)
}

function write_member_info() {
    member_name.innerHTML = user_information["name"]
    member_email.innerHTML = user_information["email"]
    if(user_information['img_src']){
        photo_show.src = user_information['img_src']
    }
}

async function write_message_info() {
    let res = await fetch("/api/message_individual")
    let data = await res.json()
    if (data["data"].length>0) {
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

    if(data["data"].length>0){
        let att_collect = data["data"]
        att_collect.forEach((item)=>{
            let attname = document.createElement("p")
            attname.innerHTML = `<a href='/attraction/${item["attid"]}'>${item['attname']}</a>`
            let btn = document.createElement("button")
            btn.innerHTML = "取消收藏"
            attname.appendChild(btn)
            btn.dataset.idx = item["attid"]
            btn.classList.add("cancel_collection")
            btn.addEventListener("click",cancel_collection_fcn)
            collection_info.appendChild(attname)

        })
    }else{
        collection_info.innerHTML = "你目前沒有收藏"
    }
}

async function cancel_collection_fcn(){
    let config = {
        method:"DELETE",
        body:JSON.stringify({
            id:this.dataset.idx
        }),
        headers:{
            "Content-Type":"application/json"
        }
    }
    let send_delete = await fetch("/api/collect_user",config)
    let response = await send_delete.json()
    if(response["ok"]){
        window.location.reload()
    }
}

async function refund_action(){
    let yes = confirm("請問確定要退款嗎?")
    if(yes){
        let refund_fetch = await fetch(`/api/refund/${this.dataset.number}`)
        let result = await refund_fetch.json()
        if(result["ok"]){
            alert("退款成功!!!!")
            window.location.reload()
        }
        if(result["error"]){
            alert(result["msg"])
        }
    }
}

async function write_order_info(select_time){
    order_info_contain.innerHTML = "載入中...."
    let res = await fetch("/api/orders")
    let order_data = await res.json()
    order_info_contain.innerHTML = ""

    let data = order_data['data']
    let now = new Date()
    let select_now = new Date(now.setDate(now.getDate()-select_time))

    let arr = []

    for(const [key,val] of Object.entries(data)){
        let obj = {}
        obj[key]=val
        arr.push(obj)
    }

    console.log(arr)

    arr = arr.sort(function(a,b){
        let key1 = Object.keys(a)[0]
        let key2 = Object.keys(b)[0]
        if(new Date(a[key1].time)<new Date(b[key2].time)){
            return 1
        }else{
            return -1
        }
    })

    if(arr.length===0){
        order_info_contain.innerHTML = "目前並無訂單"
        return
    }

    for(let i=0;i<arr.length;i++){
        let key = Object.keys(arr[i])[0]
        let val = arr[i][key]

        let order_history_div = document.createElement("div")
        let title = document.createElement("p")
        title.innerHTML = key
        title.addEventListener("click",toggle_contain)
        title.classList.add("object_key")
        let contact_name = document.createElement("p")

        let refund_button = document.createElement("button")

        if(!val.refund_time){
            refund_button.innerHTML = "退款"
            refund_button.classList.add("refund_button")
            refund_button.addEventListener("click",refund_action)
            refund_button.dataset.number = key
        }else{
            refund_button.innerHTML = "已退款"
            refund_button.classList.add("refund_button")
            refund_button.classList.add("fix")
        }
    
        let time_des = document.createElement("p")
        let year = val['time'].split(" ")[3]
        let month = val['time'].split(" ")[2]
        let date = val['time'].split(" ")[1]
        let hr = val['time'].split(" ")[4]
        if(new Date(val["time"]) <= select_now)continue
        time_des.classList.add("time_des")
        time_des.addEventListener("click",toggle_contain)
        time_des.innerHTML = `${year}/${month_list[month]}/${date} ${hr}`
        
        order_history_div.appendChild(title)
        if(val.contact_name){
            contact_name.innerHTML = `聯絡人姓名：${val.contact_name}`
            order_history_div.appendChild(contact_name)
            contact_name.classList.add("contact_name")
            contact_name.addEventListener("click",toggle_contain)
        }
        order_history_div.appendChild(time_des)
        order_history_div.appendChild(refund_button)
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
    
        order_info_contain.appendChild(order_history_div)
    
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

select_region.addEventListener("change",fcn_select_region)


function fcn_select_region(){
    let v = select_region.value
    write_order_info(parseInt(v))
}

let open_update_password_blk = document.getElementById("open_update_password_blk")
let blk_update_password = document.getElementsByClassName("blk_update_password")[0]
let btn_update_password = document.getElementById("btn_update_password")

open_update_password_blk.addEventListener("click",open_div)
btn_update_password.addEventListener("click",update_password)

function open_div(){
    blk_update_password.classList.toggle("open")
}

async function update_password(){
    let msg_for_update = document.getElementById("msg_for_update")
    let config = {
        method:"POST",
        body:JSON.stringify({
            old_password:document.getElementById("old_password").value,
            new_password:document.getElementById("new_password").value,
            again_password:document.getElementById("new_password_again").value
        }),
        headers:{
            "Content-Type":"application/json"
        }
    }
    let res = await fetch("/api/user/password",config)
    let result = await res.json()
    if(result['ok']){
        msg_for_update.innerHTML = "修改密碼成功!!"
    }else{
        msg_for_update.innerHTML = `${result['error']}`
    }
}

// ##上傳圖片##

let btn_upload_photo = document.getElementById("photo_upload")
let upload_check = document.getElementById("upload_check")
// let photo_show = document.getElementById("photo_show")
let error_upload = document.getElementById("error_upload")

upload_check.addEventListener("click",upload_photo_fcn)
btn_upload_photo.addEventListener("change",upload_photo)

function upload_photo(){

    let item = btn_upload_photo.files[0];
    const reader = new FileReader()

    reader.addEventListener("load",function(){
        photo_show.src = reader.result
    })

    if(item){
        reader.readAsDataURL(item)
    }

}

async function upload_photo_fcn(){
    let item = btn_upload_photo.files[0];

    let data = new FormData()
    data.append("files",item)

    error_upload.innerHTML="上傳中"
    error_upload.style.display = "block"

    let send_photo = await fetch("/api/user_photo",{
        method:"POST",
        body:data
    })
    let response = await send_photo.json()
    if(response["ok"]){
        alert("上傳成功")
    }
    if(response["error"]){
        alert("上傳失敗，"+response["message"])
    }
    error_upload.innerHTML = ""
    window.location.reload()
}