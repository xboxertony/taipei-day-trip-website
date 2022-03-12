function siteDiv(picture,spot,station,catagory){
    var ba3_id = document.getElementById('ba3_id')

    var site =document.createElement('div')
    site.className='site'

    var img_embed = document.createElement('div')
    img_embed.className = "img_embed"

    var photo = document.createElement('img')
    photo.src = picture
    img_embed.appendChild(photo)

    var stname = document.createElement('div')
    stname.className='stname'
    var st_span = document.createElement('span')
    var st_Text = document.createTextNode(spot)
    st_span.appendChild(st_Text)
    stname.appendChild(st_span)

    var word = document.createElement('div')
    word.className='word'

    var mrt =document.createElement('span')
    mrt.className='mrt'
    var m_text = document.createTextNode(station)
    mrt.appendChild(m_text)
    word.appendChild(mrt)

    var cate =document.createElement('span')
    cate.className='cate'
    var c_text = document.createTextNode(catagory)
    cate.appendChild(c_text)
    word.appendChild(cate)
    
    site.appendChild(img_embed)
    site.appendChild(stname)
    site.appendChild(word)
    ba3_id.appendChild(site)
};


function ajax(){
    fetch('/api/attractions/').then(function(response) {return response.json()}).then(function(attra_dic){
        let d_list = attra_dic['data'];

        // for (let row of d_list ){
        //     let spoturl = row['images'][0], spotname = row['name'], spotmrt = row['mrt'], spotcate = row['category'];
        //     siteDiv(spoturl, spotname, spotmrt, spotcate)
        // }

        
        
    });
    
    




}

console.log('123456')