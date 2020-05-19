
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.json());

const toJson = require('unsplash-js').toJson;
const fetch = require('node-fetch');
global.fetch = fetch;

const Unsplash = require('unsplash-js').default;

const unsplash = new Unsplash({
  accessKey: "f0MWFCRcUJJfLFZqK0UY4zjwElC4DLlG6G0lsNclooI",
  headers: {
    "X-Custom-Header": "foo"
  },
  timeout: 500
});
const axios = require('axios');
CircularJSON = require('circular-json')


app.get('/search/:term', function (req, res) { 
  
    console.log(req.body.search)
    unsplash.search.photos(req.params.term, 1, 1, { orientation: "portrait" })
    .then(toJson) 
    .then(json => {
        image_url = json.results[0].urls.raw
        console.log(image_url)
        axios.post('https://api.nal.usda.gov/fdc/v1/foods/search?api_key=U7LnkKAa6qPCPRxI47P1lPA0tI7tBUEEiFH1Hc5q',
    {
      "query": req.params.term,
      "dataType": [
        "Foundation",
        "SR Legacy"
      ],
      "pageSize": 5,
      "pageNumber": 1,
      "sortBy": "dataType.keyword",
      "sortOrder": "desc"
    })
  .then(response => {
    foodArray = []
    response.data.foods.forEach(foodItem => {
    tempObj = {}
    tempObj["name"] = foodItem.description
    tempObj["image"] = json.results[0].urls.raw

    foodItem.foodNutrients.forEach((nutrient) => {
      if(nutrient.nutrientName === 'Protein' && nutrient.unitName === 'G') {
        tempObj['proteins'] = {
          "value" : nutrient.value,
          "unit" : nutrient.unitName
        }
      }
      if(nutrient.nutrientName === 'Energy' && nutrient.unitName === 'KCAL') {
        tempObj['calories'] = {
          "value" : nutrient.value,
          "unit" : nutrient.unitName
        }
      }
      if(nutrient.nutrientName === 'Carbohydrate, by difference' && nutrient.unitName === 'G') {
        tempObj['carbohydrates'] = {
          "value" : nutrient.value,
          "unit" : nutrient.unitName
        }
      }
    })
    foodArray.push(tempObj)
    })
    
    res.end(JSON.stringify(foodArray))
    // console.log(response.data.explanation);
  })
  .catch(error => {
    console.log(error);
  });
    });
    
  // res.end(JSON.stringify(req.body.search))
    
 })

 function fetchImageViaUnsplash(meal) {
  return new Promise(resolve => {
    unsplash.search.photos(meal, 1, 1, { orientation: "portrait" })
    .then(toJson) 
    .then(json => {
        console.log(JSON.stringify(json))
        image_url = json.results[0].urls.raw
        resolve(image_url)
    })
    .catch();
  });
}

function fetchImageViaScraper(meal) {
  return new Promise(resolve => {
    axios.get('http://127.0.0.1:80/searchImages?query='+meal)
    .then(response => {
    console.log('fetching image : ' + 'http://127.0.0.1:80/searchImages?query='+meal)
      resolve(response.data)
        })
        .catch(error => {
          console.log(error);
        })
  });
}

 app.get('/read-meals/:pageSize/:pageNumber',async function (req, res) { 
  fetched_images = []
  resultArray = []
  axios.post('https://api.nal.usda.gov/fdc/v1/foods/list?api_key=U7LnkKAa6qPCPRxI47P1lPA0tI7tBUEEiFH1Hc5q',
  {
    "dataType": [
      "Foundation",
      "SR Legacy"
    ],
    "pageSize": req.params.pageSize,
    "pageNumber": req.params.pageNumber,
    "sortBy": "dataType.keyword",
    "sortOrder": "desc"
  })
.then( async response => {
  
  const str = CircularJSON.stringify(response);
  // console.log(JSON.parse(str))
  data = JSON.parse(str)
  data = data.data
//   data.forEach(meal => {
//     url = 'http://127.0.0.1:80/searchImages?query='+meal.description
//     axios.get(url)
// .then(response => {
//   console.log(response.data)
// })
// .catch(error => {
//   console.log(error);
// });

// "proteins": (meal) => { meal.foodNutrients.forEach((nutrient) => {
//   if(nutrient.name === 'Protein' && ( nutrient.unitName === 'G' || nutrient.unitName === 'g' )) {
//     return nutrient.amount
//   }
//   return -1
// }


 data.forEach( async (meal) => {
  tempObj = {}
  // tempObj["image"] = await fetchImageViaUnsplash(meal.description.split(",")[0]);
  tempObj["image"] = "https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/Pok%C3%A9mon_Pikachu_art.png/220px-Pok%C3%A9mon_Pikachu_art.png"
  tempObj["name"] = meal.description
  tempObj["fdcId"] = meal.fdcId
  tempObj["quantity"] = 0
  meal.foodNutrients.forEach( async (nutrient) => {
 
    if(nutrient.name === 'Protein' && ( nutrient.unitName === 'G' || nutrient.unitName === 'g' )) {
      temp = {
        "value" : nutrient.amount,
        "unit" : nutrient.unitName
      }
      tempObj["proteins"] = temp
    }
    if(nutrient.name === 'Energy'  && nutrient.unitName === 'KCAL') {
      temp = {
        "value" : nutrient.amount,
        "unit" : nutrient.unitName
      }
      tempObj["calories"] = temp
    }
    if((nutrient.name === 'Carbohydrate, by difference' || nutrient.name === 'Carbohydrates') && (nutrient.unitName === 'G' || nutrient.unitName === 'g')) {
      temp = {
        "value" : nutrient.amount,
        "unit" : nutrient.unitName
      }
      tempObj["carbohydrates"] = temp
    }
  }
)     
                        
  
resultArray.push(tempObj)   

})

  


})
.catch(error => {
  console.log(error);
  })
  console.log(fetched_images)
// 
setTimeout(() => {
  res.end(JSON.stringify(resultArray))
},2000)

  
})
var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
 })