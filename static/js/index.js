function siteDiv(id, picture, spot, station, catagory) {
  let a_tag = document.createElement('a')
  //
  a_tag.setAttribute('href', `/attraction/${id}`)
  //
  let site = document.createElement('div')
  site.className = 'site'

  let img_embed = document.createElement('div')
  img_embed.className = 'img_embed'

  let photo = document.createElement('img')
  photo.src = picture
  img_embed.appendChild(photo)

  let stname = document.createElement('div')
  stname.className = 'stname'
  let st_span = document.createElement('span')
  let st_Text = document.createTextNode(spot)
  st_span.appendChild(st_Text)
  stname.appendChild(st_span)

  let word = document.createElement('div')
  word.className = 'word'

  let mrt = document.createElement('span')
  mrt.className = 'mrt'
  let m_text = document.createTextNode(station)
  mrt.appendChild(m_text)
  word.appendChild(mrt)

  let cate = document.createElement('span')
  cate.className = 'cate'
  let c_text = document.createTextNode(catagory)
  cate.appendChild(c_text)
  word.appendChild(cate)

  site.appendChild(img_embed)
  site.appendChild(stname)
  site.appendChild(word)
  a_tag.appendChild(site)
  ba3_id.appendChild(a_tag)
}

function emptyReply() {
  let empty = document.createElement('div')
  empty.className = 'stname'
  let no_str = document.createTextNode('無資料顯示')
  ba3_id.appendChild(no_str)
}

async function getValue(url) {
  try {
    let res = await fetch(url)
    if (res.status === 200) {
      let data = await res.json()
      return data
    }
  } catch (e) {
    console.log('error occur', e)
  }
}

async function ajax(url) {
  while (true) {
    let ajaxBack = await getValue(url)
    let d_list = ajaxBack['data']
    nextPage = ajaxBack['nextPage']
    document.querySelector('.frontPage').style.display = 'none'

    if (Object.keys(d_list).length > 0) {
      for (let row of d_list) {
        let spotID = row['id'],
          spoturl = row['images'][0],
          spotname = row['name'],
          spotmrt = row['mrt'],
          spotcate = row['category']
        siteDiv(spotID, spoturl, spotname, spotmrt, spotcate) // 製作各地旅遊景點方塊

        let now_a_len = document.querySelectorAll('#ba3_id a').length
        // document
        //   .querySelectorAll('#ba3_id a')
        //   [now_a_len - 1].addEventListener('click', () => {
        //     document.getElementById('search').value = ''
        //   })
      }

      if (document.querySelector('.secondPage')) {
        document.querySelector('.secondPage').remove()
      }
      break
    } else if (
      Object.keys(d_list).length === 0 &&
      nextPage === null &&
      document.querySelector('#ba3_id a') === null
    ) {
      emptyReply()
      break
    } else {
    }
  }
}

window.addEventListener('scroll', () => {
  let ajaxHeight = document.documentElement.scrollHeight
  let deviseHeight = window.innerHeight
  let scrollable = ajaxHeight - deviseHeight
  let scrolled = document.documentElement.scrollTop
  if (scrolled + 100 >= scrollable) {
    if (nextPage) {
      if (document.getElementById('search').value == '') {
        nexturl = `/api/attractions/?page=${nextPage}`
      } else {
        nexturl = `/api/attractions/?keyword=${
          document.getElementById('search').value
        }&page=${nextPage}`
      }
      if (record.includes(nextPage)) {
      } else {
        if (nexturl.includes('page=')) {
          // 代表它非首頁ajax
          let g_box = document.createElement('div')
          g_box.className = 'secondPage'

          let g_img = document.createElement('img')
          g_img.src = '/static/img/load.gif'
          g_img.className = 'gif'
          g_box.appendChild(g_img)
          g_box.id = 'load'
          box3.appendChild(g_box)
        }

        setTimeout('ajax(`${nexturl}`)', 700)

        record.push(nextPage)
      }
    } else {
    }
  }
})

function search_func() {
  if (document.querySelector('.frontPage').style.display === 'none' && document.querySelector('.secondPage') === null){ //畫面沒有在loading時才能點擊成功
    nexturl = `/api/attractions/?keyword=${
      document.getElementById('search').value
    }`
    record = [] /*清空之前搜尋紀錄*/
    ba3_id.innerHTML = '' /*清空之前載入景點*/
    //跑出loading gif
    document.querySelector('.frontPage').style.display = 'flex'
    //載入頁面
    setTimeout('ajax(`${nexturl}`)', 700)
  }
}


var ba3_id = document.getElementById('ba3_id'),
  box3 = document.querySelector('.box3')

document.getElementById('search').value = ''
document.getElementById('magnify').addEventListener('click', search_func)

//載入頁面
setTimeout("ajax('/api/attractions')", 700)
