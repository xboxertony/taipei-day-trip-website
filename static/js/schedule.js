let today = new Date();
let schedule = document.getElementById("schedule");
let select_leader = document.getElementById("select_leader")

let cat = {
    1: "星期一",
    2: "星期二",
    3: "星期三",
    4: "星期四",
    5: "星期五",
    6: "星期六",
    0: "星期日",
};

let memebr = {
    // 0: "A",
    // 1: "B",
    // 2: "C",
    // 3: "D"
}

let schedule_now = {}

let main_user = null

window.onbeforeunload = function(e){
    let event = window.event||e
    event.returnValue = ("確定離開此頁面不繼續編輯嗎?")
}

let sche = []

async function get_Month(check_all,main_user,year, month) {

    let data = await fetch("/api/schedule")
    let res = await data.json()

    let first_day = new Date(year, month - 1, 1).getDate();
    let last_day = new Date(year, month, 0).getDate();

    let time_delta = last_day - first_day + 1;

    let calendar = document.createElement("div");
    calendar.classList.add("calendar");

    let arr = [];

    for (let i = 0; i < time_delta; i++) {
        let select_time = new Date(year, month - 1, i + 1);
        if (select_time <= today) continue;
        let select_year = select_time.getFullYear();
        let select_month = select_time.getMonth();
        let select_day = select_time.getDate();
        let select_week = select_time.getDay();
        let div = document.createElement("div");

        let year_div = document.createElement("div")
        let month_div = document.createElement("div")
        let week_div = document.createElement("div");
        let date_div = document.createElement("div");
        year_div.innerHTML = `${year}`
        month_div.innerHTML = `${month} / ${select_day}`
        if (month === 0) {
            year_div.innerHTML = `${year - 1}`
            month_div.innerHTML = `${12} / ${select_day}`
        }
        week_div.innerHTML = `${cat[select_week]}`;
        year_div.classList.add("week")
        month_div.classList.add("week")
        week_div.classList.add("date")
        div.appendChild(year_div);
        div.appendChild(month_div);
        div.appendChild(date_div);
        div.appendChild(week_div);

        for (let j = 0; j < Object.keys(memebr).length; j++) {
            if(memebr[j+1]!==main_user)continue
            let member_chk = document.createElement("div")
            member_chk.classList.add("member_chk")
            let morning_chk = document.createElement("div")
            let evening_chk = document.createElement("div")
            member_chk.appendChild(morning_chk)
            morning_chk.dataset.date = `${select_year} ${select_month + 1} ${select_day}`
            morning_chk.dataset.id = memebr[j+1]
            morning_chk.dataset.day = "morning"
            morning_chk.addEventListener("click", send_schedule)
            member_chk.appendChild(evening_chk)
            evening_chk.dataset.date = `${select_year} ${select_month + 1} ${select_day}`
            evening_chk.dataset.id = memebr[j+1]
            evening_chk.dataset.day = "afternoon"
            evening_chk.addEventListener("click", send_schedule)
            div.appendChild(member_chk)
            if (!res[memebr[j+1]]) continue
            let read_data = res[memebr[j+1]][`${select_year}-${select_month + 1 < 10 ? '0' + (select_month + 1) : select_month + 1}-${select_day < 10 ? '0' + (select_day) : select_day}`]
            if(!read_data)continue
            for(let k=0;k<read_data.length;k++){
                if (read_data[k] && Object.keys(read_data[k]).includes("morning")) {
                    morning_chk.innerHTML = `O`
                    if(read_data[k]["morning"]){
                        morning_chk.style.color="red"
                        morning_chk.dataset.order_number = read_data[k]["morning"]
                    }
                }
                if (read_data[k] && Object.keys(read_data[k]).includes("afternoon")) {
                    evening_chk.innerHTML = `O`
                    if(read_data[k]["afternoon"]){
                        evening_chk.style.color="red"
                        evening_chk.dataset.order_number = read_data[k]["afternoon"]
                    }
                }
            }
        }


        arr.push(div);
    }

    return arr;
}

let schedual = document.getElementById("schedule");
let member_block = document.getElementById("member_block")

async function append_schedule(check_all,cnt) {
    schedual.innerHTML = ""
    let check_user = await fetch("/api/user")
    let check_user_result = await check_user.json()
    main_user = check_user_result["data"].name
    let data = await fetch("/api/leaders")
    let response = await data.json()
    let leader_cnt = 1
    response["data"].forEach((item)=>{
        memebr[leader_cnt]=item.name
        // if(memebr[leader_cnt]===main_user){
        //     let option = document.createElement("option")
        //     select_leader.appendChild(option)
        //     option.value = leader_cnt
        //     option.innerHTML = item.name
        // }
        leader_cnt++
    })
    for (let i = 1; i < Object.keys(memebr).length+1; i++) {
        if(memebr[i]===main_user){
            let sub_member = document.createElement("div")
            sub_member.innerHTML = memebr[i]
            member_block.appendChild(sub_member)
        }
    }
    for (let i = 0; i < cnt; i++) {
        let today_today = new Date();
        let loop_time = new Date(
            today_today.setMonth(today_today.getMonth() + i)
        );
        await get_Month(check_all,main_user,loop_time.getFullYear(), loop_time.getMonth()).then((res) => {
            res.forEach((item) => {
                schedule.appendChild(item)
            })
        });
    }
}

let blk_schedule_select = document.getElementsByClassName("blk_schedule_select")[0]
let trip_detail = document.getElementsByClassName("trip_detail")[0]

function append_order_detail(detail){
    detail["data"]["trip"].forEach((item)=>{
        let attraction_detail = document.createElement("div")
        let attraction_name = document.createElement("div")
        let attraction_date = document.createElement("div")
        let attraction_time = document.createElement("div")

        attraction_name.innerHTML = `景點名稱：${item.attraction.name}`
        attraction_date.innerHTML = `出發日期：${item.date}`
        attraction_time.innerHTML = `出發時間：${item.time}`

        attraction_detail.appendChild(attraction_name)
        attraction_detail.appendChild(attraction_date)
        attraction_detail.appendChild(attraction_time)

        trip_detail.appendChild(attraction_detail)
    })
}

let contact_name = document.getElementById("contact_name")
let contact_email = document.getElementById("contact_email")
let contact_phone = document.getElementById("contact_phone")
let order_number = document.getElementsByClassName("order_number")[0]

function clear_div(){
    contact_name.innerHTML = ""
    contact_email.innerHTML = ""
    contact_phone.innerHTML = ""
    trip_detail.innerHTML = ""
}

async function send_schedule() {
    if(this.dataset.id!==main_user)return

    if(this.style.color==="red"){
        clear_div()
        blk_schedule_select.classList.add("open")
        order_number.innerHTML = `訂單編號：${this.dataset.order_number}`
        if(this.dataset.order_number){
            let data = await fetch(`/api/order/${this.dataset.order_number}`)
            let response = await data.json()
            contact_name.innerHTML = response["data"]["contact"]["name"]
            contact_email.innerHTML = response["data"]["contact"]["email"]
            contact_phone.innerHTML = response["data"]["contact"]["phone"]
            append_order_detail(response)
        }
    }

    if(this.style.color==="red")return
    let config = {
        "name": this.dataset.id,
        "Time": this.dataset.date,
        "half": this.dataset.day,
        "update": true
    }
    if (this.innerHTML === "O") {
        this.innerHTML = ""
        config["update"] = false
        sche.push(config)
        return
    }
    this.innerHTML = "O"
    sche.push(config)
    // let send = await fetch("/api/schedule",{
    //     method:"POST",
    //     body:JSON.stringify(config),
    //     headers:{
    //         "Content-Type":"application/json"
    //     }
    // })
    // let data = await send.json()
    // console.log(data)
}

append_schedule(false,5)

let btn_send_sche = document.getElementById("send_schedule")
btn_send_sche.addEventListener("click", fcn_send_sche)


async function fcn_send_sche() {
    let send = await fetch("/api/schedule", {
        method: "POST",
        body: JSON.stringify({ data: sche }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    let data = await send.json()
    if (data["ok"]) {
        alert("班表寄送成功")
        sche=[]
    }
    if(data["error"]){
        alert(data["message"])
    }
}

function appned_all(){
    let option = document.createElement("option")
    option.innerHTML = "All"
    select_leader.appendChild(option)
}

appned_all()


select_leader.addEventListener("change",function(){
    if(select_leader.value==="All"){
        select_leader.innerHTML=""
        member_block.innerHTML = ""
        appned_all()
        append_schedule(false,5)
        return
    }
    append_schedule_individual(this.value,5)
})


async function append_schedule_individual(idx,cnt) {
    console.log(idx)
    schedual.innerHTML = ""
    member_block.innerHTML = ""
    let child = document.createElement("div")
    child.innerHTML = memebr[parseInt(idx)]
    member_block.appendChild(child)
    for (let i = 0; i < cnt; i++) {
        let today_today = new Date();
        let loop_time = new Date(
            today_today.setMonth(today_today.getMonth() + i)
        );
        await get_Month(true,memebr[parseInt(idx)],loop_time.getFullYear(), loop_time.getMonth()).then((res) => {
            res.forEach((item) => {
                schedule.appendChild(item)
            })
        });
    }
}


// async function update_schedule(){
//     let data = await fetch("/api/schedule")
//     let 
// }