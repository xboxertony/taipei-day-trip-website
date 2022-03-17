function makeDiv(name, cate, descp, address, transport, mrt){
    document.getElementsByClassName('title')[0].appendChild(document.createTextNode(name))
    document.getElementsByClassName('mrt_cat')[0].appendChild(document.createTextNode(`${cate} at ${mrt}`))
    document.getElementsByClassName('des')[0].appendChild(document.createTextNode(descp))
    document.getElementsByClassName('addr_des')[0].appendChild(document.createTextNode(address))
    document.getElementsByClassName('traf_des')[0].appendChild(document.createTextNode(transport))
};
async function getValue(url){
    try{
        let res =  await fetch(url) // fetch(url) is a promise, so we should wait until fullfilled. res is a response object.
        if (res.status === 200){
            let data = await res.json() // res.json() is a promise so we should wait until fullfilled. data is the value we want.
            return data          
        }        
    }catch(e){console.log('產生錯誤',e)}
} 
async function loadItem(url){
    console.log('fetch',url)
    let ajaxBack = await getValue(url)
    let data = ajaxBack['data']
    let name = data['name'], cate = data['category'], descp = data['description'], address = data['address'], transport = data['transport'], mrt = data['mrt']
    document.title = name
    console.log(`${name}, ${cate}, ${mrt}`)
    makeDiv(name, cate, descp, address, transport, mrt)
};
function first (){
    if (!document.getElementById('A')&& !document.getElementById('B')){
        let _1span = document.createElement('span')
        _1span.className = 'choose'
        _1span.setAttribute('id','A');
        document.getElementById('_1pick').appendChild(_1span)
        document.getElementById('dollar').innerHTML  = '2,000'
    }

    else if (!document.getElementById('A')&& document.getElementById('B')){
        document.getElementById('B').remove()
        let _1span = document.createElement('span')
        _1span.className = 'choose'
        _1span.setAttribute('id','A');
        document.getElementById('_1pick').appendChild(_1span)
        document.getElementById('dollar').innerHTML  = '2,000'
    }
    else{

    }
}
function second(){
    if (document.getElementById('A')){
        document.getElementById('A').remove()
        let _2span = document.createElement('span')
        _2span.className = 'choose'
        _2span.setAttribute('id','B')
        document.getElementById('_2pick').appendChild(_2span)
        document.getElementById('dollar').innerHTML  = '2,500'
    }
    else{

    }
};
document.getElementById('_1pick').addEventListener('click',first)
document.getElementById('_2pick').addEventListener('click',second)

const id = window.location.href.substring(33)
loadItem(`/api/attraction/${id}`)
window.onload = first