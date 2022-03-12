function siteDiv(picture,spot,station,catagory){
    let site =document.createElement('div')
    site.className='site'

    let img_embed = document.createElement('div')
    img_embed.className = "img_embed"

    let photo = document.createElement('img')
    photo.src = picture
    img_embed.appendChild(photo)

    let stname = document.createElement('div')
    stname.className='stname'
    let st_span = document.createElement('span')
    let st_Text = document.createTextNode(spot)
    st_span.appendChild(st_Text)
    stname.appendChild(st_span)

    let word = document.createElement('div')
    word.className='word'

    let mrt =document.createElement('span')
    mrt.className='mrt'
    let m_text = document.createTextNode(station)
    mrt.appendChild(m_text)
    word.appendChild(mrt)

    let cate =document.createElement('span')
    cate.className='cate'
    let c_text = document.createTextNode(catagory)
    cate.appendChild(c_text)
    word.appendChild(cate)
    
    site.appendChild(img_embed)
    site.appendChild(stname)
    site.appendChild(word)
    ba3_id.appendChild(site)
};

function emptyReply(){
    let empty =document.createElement('div')
    empty.className='stname'
    let no_str = document.createTextNode('無資料顯示')
    ba3_id.appendChild(no_str)

}

function ajax(url){

    fetch(url).then(function(response) {return response.json()}).then(function(attra_dic){
        let d_list = attra_dic['data']
        nextPage = attra_dic['nextPage']

        if (Object.keys(d_list).length > 0) {
            for (let row of d_list ){
                let spoturl = row['images'][0], spotname = row['name'], spotmrt = row['mrt'], spotcate = row['category'];
                siteDiv(spoturl, spotname, spotmrt, spotcate)
            }
        }
        else{
            console.log('空值')
            emptyReply()
        };
        console.log('AJAX DONE, nextPage:',nextPage)
    })};


console.log('start loading')

window.addEventListener('scroll',()=>{
    let ajaxHeight = document.documentElement.scrollHeight;
    let deviseHeight= window.innerHeight
    let scrollable = ajaxHeight- deviseHeight
    let scrolled =document.documentElement.scrollTop

    console.log('捲動',ajaxHeight,deviseHeight,scrollable,',',scrolled )
    if (scrolled + 10 >= scrollable){
        if (nextPage){
            
            if (document.getElementById("search").value == '') {nexturl = `/api/attractions/?page=${nextPage}`;}
            else{
                nexturl = `/api/attractions/?keyword=${document.getElementById("search").value}&page=${nextPage}`
            }
            console.log('go to',nexturl)
            if (record.includes(nextPage)){
                console.log('已送出連線不再重覆發送',nextPage)
            }
            else{
                ajax(nexturl)
                record.push(nextPage)
                console.log('fetch',nexturl)
            }
        
        }
        else{console.log('end')}
    }
})


document.getElementById("magnify").addEventListener("click", function(){
    console.log('輸入景點名稱',document.getElementById("search").value)
    nexturl = `/api/attractions/?keyword=${document.getElementById("search").value}`
    record = []; /*清空之前搜尋紀錄*/
    ba3_id.innerHTML = '' /*清空之前載入景點*/
    ajax(nexturl) 
    console.log('fetch',nexturl)
});


var nextPage, nexturl
var record = [];

var ba3_id = document.getElementById('ba3_id');

document.getElementById("search").value = ''