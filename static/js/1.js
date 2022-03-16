async function getValue(url){
    let res =  await fetch(url) // fetch(url) is a promise, so we should wait until fullfilled. res is a response object.
    if (res.status === 200){
        let data = await res.json() // res.json() is a promise so we should wait until fullfilled. data is the value we want.
        return data          
    }
} 

async function ajax(url){
    console.log('before')
    let ajaxBack = await getValue(url)
    console.log(ajaxBack,'ajaxBack')
    console.log('after')
}

console.log(123)
ajax('/api/attractions/')
console.log(456)





// console.log('before')
// ajax('/api/attractions/').then(result => {
//         console.log(result,'outside result'); 
//     });
// console.log('after')



// ajax('/api/attractions/').then(result => {
//     console.log(result); // => 'Page not found'
//   });

// console.log('after')

/* 正常情況res.status為200。雖然res是response 物件, 但res.json()是promise物件，
所以也要針對res.json()做await，之後用.then()去取值
*/


// function UserException(message) {
//     this.message = message;
//     this.name = 'UserException';
//  }
//  function getMonthName(mo) {
//     mo = mo - 1; // Adjust month number for array index (1 = Jan, 12 = Dec)
//     var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
//        'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     if (months[mo] !== undefined) {
//        return months[mo];
//     } else {
//        throw new UserException('InvalidMonthNo');
//     }
//  }
 
//  try {
//     // statements to try
//     var myMonth = 15; // 15 is out of bound to raise the exception
//     var monthName = getMonthName(myMonth);
//  } catch (e) {
//     monthName = 'unknown';
//     console.log(e.message, e.name); // pass exception object to err handler
//  }
 