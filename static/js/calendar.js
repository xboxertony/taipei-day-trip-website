let schedule = document.getElementById("schedule_table")

let connect_day = {
    "0":"日",
    "1":"一",
    "2":"二",
    "3":"三",
    "4":"四",
    "5":"五",
    "6":"六",
}

let select_date = null
let select_date_arr = []
let check_date_time = {}
let up_time_btn = document.getElementById("up_time")
let down_time_btn = document.getElementById("down_time")
up_time_btn.disabled = true
down_time_btn.disabled = true

function get_calendar(year,month) {
    let arr = []
    let select_day = new Date(year,month-1,1)
    let first_Day = new Date(select_day.setMonth(select_day.getMonth(),1))
    let select_day_2 = new Date(year,month-1,1)
    let last_Day = new Date(select_day_2.setMonth(select_day_2.getMonth()+1,0))
    let time_delta = (last_Day-first_Day)/(1000*3600*24)+1
    for(let i=0;i<time_delta;i++){
        let first_Day = new Date(select_day.setMonth(select_day.getMonth(),1))
        let append_day = new Date(first_Day.setMonth(first_Day.getMonth(),i+1))
        if(append_day<new Date())continue
        arr.push(append_day)
    }
    return arr
}

async function append_calendar(cnt) {
    let arr = []
    let ans = []
    let check = []
    let all_date = await fetch("/api/all_date")
    let response = await all_date.json()

    response.forEach((item)=>{
        let a = new Date(item.date)
        let a_date = `${a.getFullYear()}-${a.getMonth()+1<10?"0"+(a.getMonth()+1):a.getMonth()+1}-${a.getDate()<10?"0"+a.getDate():a.getDate()}`
        check.push(a_date)
        if(!Object.keys(check_date_time).includes(a_date)){
            check_date_time[a_date] = [item.half]
        }else{
            check_date_time[a_date].push(item.half)
        }
    })
    
    console.log(check)

    for(let i=0;i<cnt;i++){
        let dd = new Date(new Date().setMonth(new Date().getMonth()+i))
        arr.push({"year":dd.getFullYear(),"month":dd.getMonth()+1})
    }
    arr.forEach((item)=>{
        ans.push(get_calendar(item.year,item.month))
    })
    ans.forEach((item)=>{
        let big_calnedar = document.createElement("div")
        let div_year = document.createElement("div")
        div_year.innerHTML = `${item[0].getFullYear()}-${item[0].getMonth()+1<10?"0"+(item[0].getMonth()+1):item[0].getMonth()+1}`
        div_year.classList.add("div_year")
        big_calnedar.appendChild(div_year)

        let big_date = document.createElement("div")
        big_date.classList.add("big_date")

        let big_day = document.createElement("div")
        for(let i=0;i<7;i++){
            let day = document.createElement("div")
            day.innerHTML = `${connect_day[i]}`
            big_day.appendChild(day)
        }
        big_calnedar.appendChild(big_day)
        big_day.classList.add("big_day")
        for(let i=0;i<item.length;i++){
            let date = document.createElement("div")
            date.innerHTML = `${item[i].getDate()<10?"0"+item[i].getDate():item[i].getDate()}`
            // let day = document.createElement("div")
            // day.innerHTML = `${item[i].getDay()!==0?item[i].getDay():7}`
            let select_date = document.createElement("div")
            if(i==0){
                for(let j=0;j<item[i].getDay();j++){
                    let empty_date = document.createElement("div")
                    empty_date.classList.add("select_date")
                    empty_date.classList.add("empty_date")
                    big_date.appendChild(empty_date)
                }
            }
            select_date.dataset.act_date = `${item[i].getFullYear()}-${item[i].getMonth()+1<10?"0"+(item[i].getMonth()+1):item[i].getMonth()+1}-${item[i].getDate()<10?"0"+item[i].getDate():item[i].getDate()}`
            if(check.includes(select_date.dataset.act_date)){
                select_date.classList.add("hide")
                select_date.addEventListener("click",fcn_select_fcn)
            }
            select_date.appendChild(date)
            // select_date.appendChild(day)
            select_date.classList.add("select_date")
            select_date.classList.add("select_date_for_light")
            big_date.appendChild(select_date)
            big_calnedar.appendChild(big_date)
        }
        schedule.appendChild(big_calnedar)
        big_calnedar.classList.add("big_calnedar")
    })

    let first_one = document.getElementsByClassName("select_date_for_light")[0]
    
    // console.log(first_one)
    // console.log(check_date_time)
    
    first_one.dispatchEvent(new Event("click"))
}

function fcn_select_fcn(){
    select_date = this.dataset.act_date
    select_date_arr.forEach(element => {
        element.classList.remove("light")
    });
    this.classList.add("light")
    select_date_arr.push(this)
    up_time_btn.disabled = true
    down_time_btn.disabled = true

    for(const [key,value] of Object.entries(check_date_time)){
        if(key!==this.dataset.act_date)continue
        if(value.includes("morning")){
            up_time_btn.disabled = false
            up_time_btn.dispatchEvent(new Event("click"))
            up_time_btn.checked = true
        }
        if(value.includes("afternoon")){
            down_time_btn.disabled = false
            down_time_btn.dispatchEvent(new Event("click"))
            down_time_btn.checked = true
        }
    }

    let select_certain_date = document.getElementById("select_certain_date")

    select_certain_date.innerHTML = "已選擇 "+this.dataset.act_date
}

append_calendar(9)

let calendar_toggle = document.getElementById("calendar_toggle")
calendar_toggle.addEventListener("click",fcn_toggle_calendar)

function fcn_toggle_calendar(){
    schedule.classList.toggle("show")
}