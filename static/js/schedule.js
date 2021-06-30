let today = new Date();
let schedule = document.getElementById("schedule");

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

let sche = []

async function get_Month(year, month) {

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
            evening_chk.dataset.day = "evening"
            evening_chk.addEventListener("click", send_schedule)
            div.appendChild(member_chk)
            if (!res[memebr[j+1]]) continue
            let read_data = res[memebr[j+1]][`${select_year}-${select_month + 1 < 10 ? '0' + (select_month + 1) : select_month + 1}-${select_day < 10 ? '0' + (select_day) : select_day}`]
            if (read_data && read_data.includes("morning")) {
                morning_chk.innerHTML = "O"
            }
            if (read_data && read_data.includes("evening")) {
                evening_chk.innerHTML = "O"
            }
        }


        arr.push(div);
    }

    return arr;
}

let schedual = document.getElementById("schedule");

async function append_schedule(cnt) {
    let member_block = document.getElementById("member")
    let data = await fetch("/api/leaders")
    let response = await data.json()
    let leader_cnt = 1
    response["data"].forEach((item)=>{
        memebr[leader_cnt]=item.name
        leader_cnt++
    })
    for (let i = 1; i < Object.keys(memebr).length+1; i++) {
        let sub_member = document.createElement("div")
        sub_member.innerHTML = memebr[i]
        member_block.appendChild(sub_member)
    }
    for (let i = 0; i < cnt; i++) {
        let today_today = new Date();
        let loop_time = new Date(
            today_today.setMonth(today_today.getMonth() + i)
        );
        await get_Month(loop_time.getFullYear(), loop_time.getMonth()).then((res) => {
            res.forEach((item) => {
                schedule.appendChild(item)
            })
        });
    }
}

function send_schedule() {
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

append_schedule(5)

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
    }
}