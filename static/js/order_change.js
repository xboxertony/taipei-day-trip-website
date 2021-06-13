function handle_drag_event(target_item,keyword,source){
    let oldidx = null;
    
    Array.from(target_item).forEach((element) => {
        add_drag(element);
    });
    
    resetid(target_item)
    
    function add_drag(item) {
        item.setAttribute("draggable", true);
        item.addEventListener("dragstart", dragstart);
        item.addEventListener("dragenter", preventDeEnter);
        item.addEventListener("dragover", preventDe);
        item.addEventListener("drop", droped);
        item.addEventListener("drag",drag)
    }
    
    function dragstart(e) {
        if(!e.target.classList.contains(source)){
            return
        }
        let drag_data = JSON.stringify({
            "html":e.target.parentNode.innerHTML,
            "id":e.target.parentNode.dataset.id,
            "price":e.target.parentNode.dataset.price,
            "databaseid":e.target.parentNode.dataset.databaseid,
            "base_order":e.target.parentNode.dataset.base_order
        })
        e.dataTransfer.setData("text/plain",drag_data);
        oldidx = e.target.dataset.order
    }
    
    function droped(e) {
        let tt = JSON.parse(e.dataTransfer.getData("text/plain"));
        let checkout_section = document.getElementsByClassName(keyword)
        Array.from(checkout_section).forEach(item=>{
            item.classList.remove("line")
            item.classList.remove("bottom")
        })
        if(e.target.parentNode.dataset.databaseid===tt.databaseid){
            return
        }
        if(!e.target.parentNode.classList.contains(keyword)){
            return
        }
        e.preventDefault();
        deletesomthing(oldidx);
        let newone = document.createElement("div");
        newone.innerHTML = tt.html;
        // let move_area = document.createElement("div");
        // newone.appendChild(move_area)
        // move_area.classList.add("move_area")
        newone.dataset.id = tt.id
        newone.dataset.price = tt.price
        newone.dataset.databaseid = tt.databaseid
        // newone.dataset.base_order = e.target.parentNode.dataset.base_order
        // e.target.parentNode.dataset.base_order = tt.base_order
        // move_area.setAttribute("draggable", true);
        newone.classList.add("checkout")
        if (oldidx > e.target.dataset.order) {
            e.target.parentNode.parentNode.insertBefore(newone, e.target.parentNode);
        } else {
            e.target.parentNode.parentNode.insertBefore(newone, e.target.parentNode.nextElementSibling);
        }
        add_drag(newone.getElementsByClassName("move_area")[0]);
        let arr = resetid(target_item)
        // delete_order(newone)
        evoke_delete_fcn()
        let need_data = JSON.stringify({
            "data":arr
        })
        update_order(need_data)
    }
    
    function deletesomthing(idx) {
        Array.from(target_item).forEach((item) => {
            if (item.dataset.order === idx) {
                item.parentNode.remove();
                return;
            }
        });
        // let arr = resetid()
        // let need_data = JSON.stringify({
        //     "data":arr
        // })
        // update_order(need_data)

    }
    
    function preventDe(e) {
        e.preventDefault();
    }

    function preventDeEnter(e){
        e.preventDefault()
        if (oldidx > e.target.dataset.order) {
            e.target.parentNode.classList.add("line")
        } else {
            e.target.parentNode.classList.add("bottom")
        }
    }

    function drag(e){

        e.preventDefault()
        e.target.parentNode.classList.remove("line")
        e.target.parentNode.classList.remove("bottom")

    }
    
    
}

function resetid(target_item) {
    let cnt = -1
    let arr = []
    Array.from(target_item).forEach(item => {
        cnt++
        item.dataset.order = cnt
        item.parentNode.dataset.base_order = cnt+1
        let obj = {
            "datasetid":`${item.parentNode.dataset.databaseid}`,
            "orderid":`${cnt+1}`
        }
        arr.push(obj)
    })
    return arr
}

async function update_order(need_data){
    console.log(need_data)
    let res = await fetch("/api/booking",{
        method:"PATCH",
        body:need_data,
        headers:{
            "Content-Type":"application/json"
        }
    })

    if(res.json()["ok"]){
        console.log("ok")
    }
}