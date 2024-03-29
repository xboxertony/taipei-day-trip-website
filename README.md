<h1 align='center'>台北一日遊</h1>

<hr>

本專案依據台北市政府提供的資訊做為資料來源，所架設的一日遊電商旅遊網站

### 主網站連結：https://www.taipei-attraction.com/

##### 測試帳號：tony@tony
##### 測試密碼：tony

![image alt](http://d3nczlg85bnjib.cloudfront.net/購物車.png)

### AWS架構圖

<hr>

![image alt](http://d3nczlg85bnjib.cloudfront.net/AWS架構圖之三.png)

<hr>

### SQL架構圖

<hr>

![image alt](http://d3nczlg85bnjib.cloudfront.net/SQL架構圖.png)

<hr>

### 歡迎大家光臨台北一日遊，這裡主要提供旅遊訂購服務。網站承列各項台北熱門景點，提供收藏、評分、留言、查詢、篩選、天氣預報、行前通知等功能，旅遊時間選擇會依據導遊目前的實際排班狀況而有所不同。本網站具備以下功能：

<hr>

### 1. 319項景點詳細介紹
    - 詳細的景點描述、分類及交通方式
    - 提供附近景點，並以地圖呈現
    - 串接氣象局API，提供天氣預報
    - 抓取七天內該區附近或該景點新聞
    - 並附有相關youtube影片介紹

![image alt](http://d3nczlg85bnjib.cloudfront.net/所有景點.png)



---


![image alt](http://d3nczlg85bnjib.cloudfront.net/詳細介紹.png)
![img](http://d3nczlg85bnjib.cloudfront.net/士林官邸.png)

### 2. 網友評分

    - 使用者可在每一個景點留言並貼上自己的景點圖片，並為景點評分，留言區圖片皆會在照片牆上呈列
    
![img](http://d3nczlg85bnjib.cloudfront.net/留言區留言.png)
### 3. 熱門觀看景點
    - 統計點擊次數，每天呈列前五名熱門點擊於首頁
![img](http://d3nczlg85bnjib.cloudfront.net/熱門瀏覽.png)
### 4. 一日遊訂購服務
    - 一日遊服務皆由專業導遊帶領，距離實際出發時間三天以上的訂單皆可全額退費
![image](http://d3nczlg85bnjib.cloudfront.net/訂購資訊.png)

### 5. 專業回答的客服機器人
    - 客服機器人24小時全天候服務
![image](http://d3nczlg85bnjib.cloudfront.net/客服機器人.png)
### 6. 訂單前三天行程email通知
    - 距離出發時間三天內的訂單會做email行前通知，貼心提醒不忘記



### Techonologies
<hr/>
<ul>
    <li>Flask</li>
</ul>
<ul>
    <li>AWS
        <ul>
            <li>EC2</li>
            <li>S3</li>
            <li>Elasticache</li>
            <li>RDS</li>
            <li>Cloudfront</li>
        </ul>
    </li>
</ul>
<ul>
    <li>Tappay金流</li>
    <li>Web Crawer by multi-thread</li>
    <li>Websocket</li>
    <li>Youtube API</li>
    <li>Google login API</li>
    <li>Facbook Login API</li>
    <li>linux Crontab</li>
    <li>Responsive Web Design</li>
    <li>leaflet</li>
    <li>jieba</li>
    <li>bcrypt</li>
</ul>
