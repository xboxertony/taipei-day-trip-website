function handle_drag_event(target_item,keyword,source){
    let oldidx = null;
    
    Array.from(target_item).forEach((element) => {
        add_drag(element);
    });
    
    resetid()
    
    function add_drag(item) {
        item.setAttribute("draggable", true);
        item.addEventListener("dragstart", dragstart);
        item.addEventListener("dragenter", preventDe);
        item.addEventListener("dragover", preventDe);
        item.addEventListener("drop", droped);
    }
    
    function dragstart(e) {
        if(!e.target.classList.contains(source)){
            return
        }
        let drag_data = JSON.stringify({
            "html":e.target.parentNode.innerHTML,
            "id":e.target.parentNode.dataset.id,
            "price":e.target.parentNode.dataset.price
        })
        e.dataTransfer.setData("text/plain",drag_data);
        oldidx = e.target.dataset.order
    }
    
    function droped(e) {
        console.log(e.target.parentNode.parentNode)
        if(!e.target.parentNode.classList.contains(keyword)){
            return
        }
        e.preventDefault();
        let tt = JSON.parse(e.dataTransfer.getData("text/plain"));
        deletesomthing(oldidx);
        let newone = document.createElement("div");
        newone.innerHTML = tt.html;
        // let move_area = document.createElement("div");
        // newone.appendChild(move_area)
        // move_area.classList.add("move_area")
        newone.dataset.id = tt.id
        newone.dataset.price = tt.price
        // move_area.setAttribute("draggable", true);
        newone.classList.add("checkout")
        if (oldidx > e.target.dataset.order) {
            e.target.parentNode.parentNode.insertBefore(newone, e.target.parentNode);
        } else {
            e.target.parentNode.parentNode.insertBefore(newone, e.target.parentNode.nextElementSibling);
        }
        add_drag(newone);
        resetid()
        delete_order(newone)
    }
    
    function deletesomthing(idx) {
        Array.from(target_item).forEach((item) => {
            if (item.dataset.order === idx) {
                item.parentNode.remove();
                return;
            }
        });
    }
    
    function preventDe(e) {
        e.preventDefault();
    }
    
    function resetid() {
        let cnt = -1
        Array.from(target_item).forEach(item => {
            cnt++
            item.dataset.order = cnt
        })
    }
}