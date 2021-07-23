let today = new Date();
let schedule = document.getElementById("schedule");
let select_leader = document.getElementById("select_leader")
let select_month = document.getElementById("select_month")

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

let another_action = false

window.onbeforeunload = function(e){
    if(another_action)return
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
    let cntttt = 0
    let last_week = null

    for (let i = 0; i < time_delta; i++) {
        let select_time = new Date(year, month - 1, i + 1);
        if (select_time <= today) continue;
        cntttt+=1
        let select_year = select_time.getFullYear();
        let select_month = select_time.getMonth();
        let select_day = select_time.getDate();
        let select_week = select_time.getDay();
        last_week = select_week
        let div = document.createElement("div");

        if(cntttt===1){
            let bb = select_week
            // if(select_week===6){
            //     bb = 0
            // }else{
            //     bb = select_week
            // }
            for(let blank_day=0;blank_day<bb;blank_day++){
                let create_blank_day = document.createElement("div")
                create_blank_day.classList.add("blank_div")
                arr.push(create_blank_day)
            }
        }

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
        month_div.classList.add("month_check")
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

    let bbb = 6 - last_week
    
    if(cntttt!==0){
        for(let blank_day=0;blank_day<bbb;blank_day++){
            let create_blank_day = document.createElement("div")
            create_blank_day.classList.add("blank_div")
            arr.push(create_blank_day)
        }
    }
    // console.log(arr)
    return arr;
}

let schedual = document.getElementById("schedule");
let member_block = document.getElementById("member_block")
let order_today = document.getElementById("order_today")
let already_timeline = document.getElementsByClassName("already_timeline")[0]

function append_schedule_already_month(res){
    // let already_timeline = document.createElement("table")
    // already_timeline.classList.add("already_timeline")

    //新增欄位
    let column_for_timeline = document.createElement("tr")
    let timeline_title = document.createElement("td")
    timeline_title.classList.add("table_title")
    timeline_title.innerHTML = '月份'
    column_for_timeline.appendChild(timeline_title)
    let month = today.getMonth()+1
    for(let i=0;i<5;i++){
        let column_month = document.createElement("td")
        column_month.innerHTML = `${month+i}`
        column_for_timeline.appendChild(column_month)
    }

    already_timeline.appendChild(column_for_timeline)
    // order_today.appendChild(already_timeline)

    let total_cnt = document.createElement("tr")
    let total_cnt_title = document.createElement("td")
    total_cnt_title.innerHTML = '總排班數'
    total_cnt_title.classList.add("table_title")
    total_cnt.appendChild(total_cnt_title)
    for(let i=0;i<5;i++){
        let month_block = document.createElement("td")
        if(res[month+i]){
            month_block.innerHTML = `${res[month+i].total_cnt}`
            total_cnt.appendChild(month_block)
        }else{
            month_block.innerHTML = "0"
            total_cnt.appendChild(month_block)
        }
    }
    already_timeline.appendChild(total_cnt)

    let already_cnt = document.createElement("tr")
    let already_cnt_title = document.createElement("td")
    already_cnt_title.innerHTML = '已排班數'
    already_cnt_title.classList.add("table_title")
    already_cnt.appendChild(already_cnt_title)
    for(let i=0;i<5;i++){
        let month_block = document.createElement("td")
        if(res[month+i]){
            month_block.innerHTML = `${res[month+i].arrange_cnt}`
            already_cnt.appendChild(month_block)
            month_block.dataset.month = month+i
            if(res[month+i].arrange_cnt===0)continue
            month_block.addEventListener("click",get_schedule_for_month)
            month_block.classList.add("month_block")
        }else{
            month_block.innerHTML = "0"
            already_cnt.appendChild(month_block)
        }
    }
    already_timeline.appendChild(already_cnt)
}

let already_timeline_for_month = document.getElementsByClassName("already_timeline_for_month")[0]


async function get_schedule_for_month(){
    already_timeline_for_month.innerHTML = ""
    let title_for_month = document.createElement("tr")
    let obj = ['日期','時間','景點名稱','聯絡人','聯絡信箱']
    obj.forEach(item=>{
        let title_td = document.createElement("td")
        title_td.innerHTML = item
        title_for_month.appendChild(title_td)
    })
    already_timeline_for_month.appendChild(title_for_month)

    //新增景點列表
    let get_data_for_month = await fetch(`/api/schedule_month/${this.dataset.month}`)
    let data_get_month = await get_data_for_month.json()

    for(const [key,val] of Object.entries(data_get_month)){
        for(let i=0;i<val.length;i++){
            let key_for_month = document.createElement("tr")
            if(i==0){
                append_month_to_month(key_for_month,key)
            }else{
                append_month_to_month(key_for_month,"")
            }
            append_month_to_month(key_for_month,val[i]['half'])
            append_month_to_month(key_for_month,val[i]['att_name'])
            append_month_to_month(key_for_month,val[i]['contact_name'])
            append_month_to_month(key_for_month,val[i]['contact_email'])
            already_timeline_for_month.appendChild(key_for_month)
        }
    }
}

function append_month_to_month(mother,val){
    let date_ff = document.createElement("td")
    date_ff.innerHTML = val
    mother.appendChild(date_ff)
}

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
    let get_schedule_month = await fetch(`/api/schedule_sum/${main_user}`)
    let get_data = await get_schedule_month.json()
    append_schedule_already_month(get_data)
    for (let i = 1; i < cnt+1; i++) {
        let today_today = new Date();
        let loop_time = new Date(
            today_today.setMonth(today_today.getMonth() + i)
        );
        append_month_to_selectbar(loop_time.getMonth())
        await get_Month(check_all,main_user,loop_time.getFullYear(), loop_time.getMonth()).then((res) => {
            let month_title = document.createElement("div")
            month_title.classList.add("month_title")
            month_title.innerHTML = `${loop_time.getMonth()}月`
            let month_only = document.createElement("div")
            month_only.appendChild(month_title)
            month_only.classList.add("month_only")
            let month_content = document.createElement("div")
            month_content.classList.add("month_content")
            res.forEach((item) => {
                month_content.appendChild(item)
            })
            month_only.appendChild(month_content)
            schedual.appendChild(month_only)
        });
    }
    add_func_to_month_block()
    show_order_in_screen()
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
let schedule_now_select = document.getElementById("schedule_now_select")

function clear_div(){
    contact_name.innerHTML = ""
    contact_email.innerHTML = ""
    contact_phone.innerHTML = ""
    trip_detail.innerHTML = ""
}

function update_sche(){
    schedule_now_select.innerHTML = ""
    sche.forEach(item=>{
        let p = document.createElement("p")
        p.classList.add("schedule_change_word")
        p.innerHTML = `
            <span class=${item.update?'red':'blue'}>${item.update?'新增':'取消'}</span> ${item.Time} ${item.half} 班別
        `
        schedule_now_select.appendChild(p)
    })
}

let shrink_window = document.getElementById("shrink_window")
shrink_window.addEventListener("click",shrink_window_fcn)

function shrink_window_fcn(){
    schedule_now_select.classList.toggle("hide")
}

async function send_schedule() {
    if(this.dataset.id!==main_user)return

    if(this.style.color==="red"){
        clear_div()
        blk_schedule_select.classList.add("open")
        order_number.innerHTML = `${this.dataset.order_number}`
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
        update_sche()
        return
    }
    this.innerHTML = "O"
    sche.push(config)
    update_sche()
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
    let cover_page = document.getElementById("cover_page")
    cover_page.classList.add("show")
    let send = await fetch("/api/schedule", {
        method: "POST",
        body: JSON.stringify({ data: sche }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    another_action = true
    let data = await send.json()
    cover_page.classList.remove("show")
    if (data["ok"]) {
        setTimeout(()=>{
            alert("班表寄送成功")
        },0)
        sche=[]
    }
    if(data["error"]){
        setTimeout(()=>{
            alert(data["message"])
        },0)
    }
    window.location.reload()
}

function appned_all(){
    // let option = document.createElement("option")
    // option.innerHTML = "All"
    // select_leader.appendChild(option)
}

appned_all()


// select_leader.addEventListener("change",function(){
//     if(select_leader.value==="All"){
//         select_leader.innerHTML=""
//         member_block.innerHTML = ""
//         appned_all()
//         append_schedule(false,5)
//         return
//     }
//     append_schedule_individual(this.value,5)
// })


async function append_schedule_individual(idx,cnt) {
    // console.log(idx)
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

select_month.addEventListener("change",change_month)

function append_month_to_selectbar(month){

    let opt = document.createElement("option")
    select_month.appendChild(opt)
    opt.value = `${month}`
    opt.innerHTML= `${month}月`

}

function change_month(){

    let val = this.value
    let schedule_pos = document.getElementsByClassName("month_check")
    for(let i=0;i<schedule_pos.length;i++){
        let content = schedule_pos[i].innerHTML
        if(parseInt(content.split("/")[0])===parseInt(val)){
            let x = schedule_pos[i].offsetLeft
            let xx = schedule.offsetLeft
            schedule.scrollTo(x-xx,0)
            break
        }
    }
}

function add_func_to_month_block(){
    let month_title = document.getElementsByClassName("month_title")
    
    Array.from(month_title).forEach(item=>{
        item.addEventListener("click",show_content)
    })
    
    function show_content(){
        let parent = this.parentNode
        let content = parent.getElementsByClassName("month_content")[0]
        content.classList.toggle("show")
    }
}

// async function update_schedule(){
//     let data = await fetch("/api/schedule")
//     let 
// }


function show_order_in_screen(){
    let blk_schedule_select = document.getElementsByClassName("blk_schedule_select")[0]
    blk_schedule_select.addEventListener("click",toggle_order_content)
    function toggle_order_content(e){
        let order_number_big = document.getElementById("order_number_big")
        let more_detail = document.getElementsByClassName("more_detail")[0]
        if(order_number_big.contains(e.target) || more_detail.contains(e.target))return
        this.classList.remove("open")
    }
}


// 複製單號
let copy_icon = document.getElementById("copy_icon")
copy_icon.addEventListener("click",copy_order_num)
function copy_order_num(){
    let order_number = document.getElementsByClassName("order_number")[0]
    let range = document.createRange()
    range.selectNode(order_number)
    let sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
    try{
        if (document.execCommand("Copy", "false", null)) {
            alert("複製成功");
        } else {
            alert("複製失敗");
        }
    } catch{
        alert("複製錯誤")
    }
}