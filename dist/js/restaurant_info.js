"use strict";var _slicedToArray=function(e,t){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return function(e,t){var n=[],r=!0,a=!1,o=void 0;try{for(var i,u=e[Symbol.iterator]();!(r=(i=u.next()).done)&&(n.push(i.value),!t||n.length!==t);r=!0);}catch(e){a=!0,o=e}finally{try{!r&&u.return&&u.return()}finally{if(a)throw o}}return n}(e,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")},_createClass=function(){function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}}();function _defineProperty(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var DBPromise=void 0;function formatSingleRestaurantData(e){return Object.assign({},e,{photograph:e.photograph?e.photograph+".jpg":e.id+".jpg"})}function formatRestaurantsData(e){return e.map(formatSingleRestaurantData)}!function(){var e=idb.open("restuarant_app_db",4,function(e){switch(e.oldVersion){case 0:e.createObjectStore("keyval").put("value is value","key");case 1:e.createObjectStore("people",{keyPath:"name"});case 2:e.transaction.objectStore("people").createIndex("animal","favoriteAnimal");case 3:e.transaction.objectStore("people").createIndex("age","age")}});e.then(function(e){var t=e.transaction("people","readwrite"),n=t.objectStore("people");return n.put({name:"Sam Munoz",age:25,favoriteAnimal:"dog"}),n.put({name:"Wam ok",age:34,favoriteAnimal:"cat"}),n.put({name:"Kim Bad",age:35,favoriteAnimal:"dog"}),n.put({name:"Jam Good",age:21,favoriteAnimal:"dog"}),t.complete}),e.then(function(e){return e.transaction("people").objectStore("people").index("animal").getAll("dog")}),e.then(function(e){return e.transaction("people").objectStore("people").index("age").openCursor()}).then(function(e){if(e)return e.advance(2)}).then(function e(t){if(t)return t.continue().then(e)}),e.then(function(e){return e.transaction("keyval").objectStore("keyval").get("key")}),e.then(function(e){var t=e.transaction("keyval","readwrite");return t.objectStore("keyval").put("barValue","fooKey"),t.complete}),DBPromise=idb.open("restaurant-app",3,function(e){switch(e.oldVersion){case 0:var t=e.createObjectStore("restaurants",{keyPath:"id"});t.createIndex("by-name","name");case 1:e.createObjectStore("cuisines"),e.createObjectStore("neighborhoods");case 2:e.createObjectStore("detail",{keyPath:"id"})}})}();var DBHelper=function(){function n(){_classCallCheck(this,n),this.restaurants=[],this.neighborhoods=[],this.cuisines=[],this.details={}}return _createClass(n,null,[{key:"setLocalData",value:function(e){this.restaurants=e}},{key:"fetchRestaurantsFromCache",value:function(t){var n=this;return DBPromise.then(function(e){if(!(!e||n.restaurants&&n.restaurants.length))return e.transaction("restaurants").objectStore("restaurants").index("by-name").getAll().then(function(e){return t(null,e)}).catch(function(e){return t(e,null)})})}},{key:"fetchNeighborhoodsFromCache",value:function(t){var n=this;return DBPromise.then(function(e){if(!(!e||n.resneighborhoodstaurants&&n.neighborhoods.length))return e.transaction("neighborhoods").objectStore("neighborhoods").getAll().then(function(e){return t(null,e)}).catch(function(e){return t(e,null)})})}},{key:"fetchCuisinesFromCache",value:function(t){var n=this;return DBPromise.then(function(e){if(!(!e||n.cuisines&&n.cuisines.length))return e.transaction("cuisines").objectStore("cuisines").getAll().then(function(e){return t(null,e)}).catch(function(e){return t(e,null)})})}},{key:"fetchRestaurants",value:function(t){if(this.restaurants&&this.restaurants.length)return this.restaurants;fetch(n.DATABASE_URL).then(function(e){return e.json()}).then(formatRestaurantsData).then(function(r){return DBPromise.then(function(e){var t=e.transaction("restaurants","readwrite"),n=t.objectStore("restaurants");return r&&r.forEach(function(e){return n.put(e)}),t.complete}),r}).then(function(e){return t(null,e)}).then(function(e){return n.setLocalData(e)}).catch(function(e){return t(e,null)})}},{key:"fetchRestaurantByIdFromCache",value:function(t,n){var r=this;return DBPromise.then(function(e){if(!(!e||r.details&&r.details[t]))return e.transaction("detail").objectStore("detail").get(Number(t)).then(function(e){console.log("data",e),n(null,e)}).catch(function(e){return n(e,null)})})}},{key:"fetchRestaurantById",value:function(e,t){var r=this;fetch(n.DATABASE_URL+"/"+e).then(function(e){return e.json()}).then(formatSingleRestaurantData).then(function(n){return DBPromise.then(function(e){var t=e.transaction("detail","readwrite");return t.objectStore("detail").put(n),t.complete}),r.details=Object.assign({},r.details,_defineProperty({},e,n)),n}).then(function(e){e?t(null,e):t("Restaurant does not exist",null)}).catch(function(e){return t(e,null)})}},{key:"fetchRestaurantByCuisine",value:function(r,a){n.fetchRestaurants(function(e,t){if(e)a(e,null);else{var n=t.filter(function(e){return e.cuisine_type==r});a(null,n)}})}},{key:"fetchRestaurantByNeighborhood",value:function(r,a){n.fetchRestaurants(function(e,t){if(e)a(e,null);else{var n=t.filter(function(e){return e.neighborhood==r});a(null,n)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(r,a,o){n.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t;"all"!=r&&(n=n.filter(function(e){return e.cuisine_type==r})),"all"!=a&&(n=n.filter(function(e){return e.neighborhood==a})),o(null,n)}})}},{key:"fetchNeighborhoods",value:function(a){n.fetchRestaurants(function(e,n){if(e)a(e,null);else{var r=n.map(function(e,t){return n[t].neighborhood}),t=r.filter(function(e,t){return r.indexOf(e)==t});DBPromise.then(function(e){var n=e.transaction("neighborhoods","readwrite").objectStore("neighborhoods");t&&t.forEach(function(e,t){return n.put(e,t)})}),a(null,t)}})}},{key:"fetchCuisines",value:function(a){n.fetchRestaurants(function(e,n){if(e)a(e,null);else{var r=n.map(function(e,t){return n[t].cuisine_type}),t=r.filter(function(e,t){return r.indexOf(e)==t});DBPromise.then(function(e){var n=e.transaction("cuisines","readwrite").objectStore("cuisines");t&&t.forEach(function(e,t){return n.put(e,t)})}),a(null,t)}})}},{key:"urlForRestaurant",value:function(e){return"./restaurant.html?id="+e.id}},{key:"imageUrlForRestaurant",value:function(e){var t=e.photograph.split("."),n=_slicedToArray(t,2);return"/img/"+n[0]+"-320_small."+n[1]}},{key:"imageSrcset",value:function(e){var t=e.photograph.split("."),n=_slicedToArray(t,2),r=n[0],a=n[1];return"/img/"+r+"-320_small."+a+" 400w, /img/"+r+"-640_medium."+a+" 640w, /img/"+r+"-800_large."+a+" 800w "}},{key:"mapMarkerForRestaurant",value:function(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:n.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}},{key:"DATABASE_URL",get:function(){return"http://localhost:1337/restaurants"}}]),n}();window.addEventListener("load",function(){"serviceWorker"in navigator?navigator.serviceWorker.register("/sw.js").then(function(e){console.log("Service worker registration succeeded:",e)}).catch(function(e){console.log("Service worker registration failed:",e)}):console.log("Service workers are not supported.")});var restaurant=void 0,map=void 0;window.initMap=function(){fetchRestaurantFromURL(handleFetchRestaurantFromURL)};var handleFecthRestaurant=function(n){return function(e,t){console.log("handleFecthRestaurant",t),(self.restaurant=t)?(fillRestaurantHTML(),n(null,t)):console.error(e)}};function handleFetchRestaurantFromURL(e,t){e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),fillBreadcrumb(t),DBHelper.mapMarkerForRestaurant(t,self.map))}var fetchRestaurantFromURL=function(e){if(self.restaurant)e(null,self.restaurant);else{var t=getParameterByName("id");if(t)DBHelper.fetchRestaurantById(t,handleFecthRestaurant(e));else{e("No restaurant id in URL",null)}}},fillRestaurantHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant,t=document.getElementById("restaurant-name");t.innerHTML=e.name,t.setAttribute("tabindex","0"),t.setAttribute("aria-label","restaurant "+e.name),document.getElementById("restaurant-address").innerHTML=e.address;var n=document.getElementById("restaurant-img");n.className="restaurant-img",n.src=DBHelper.imageUrlForRestaurant(e),n.alt="Restaurant "+e.name,n.srcset=DBHelper.imageSrcset(e),n.sizes="(max-width: 640px) 100vw, 50vw",document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()},fillRestaurantHoursHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant.operating_hours,t=document.getElementById("restaurant-hours");for(var n in e){var r=document.createElement("tr"),a=document.createElement("td");a.innerHTML=n,r.appendChild(a);var o=document.createElement("td");o.innerHTML=e[n],r.appendChild(o),t.appendChild(r)}},fillReviewsHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant.reviews,t=document.getElementById("reviews-container"),n=document.createElement("h3");if(n.innerHTML="Reviews",t.appendChild(n),!e){var r=document.createElement("p");return r.innerHTML="No reviews yet!",void t.appendChild(r)}var a=document.getElementById("reviews-list");e.forEach(function(e){a.appendChild(createReviewHTML(e))}),t.appendChild(a)},createReviewHTML=function(e){var t=document.createElement("li"),n=document.createElement("article");n.className="review-wrapper";var r=document.createElement("h4");r.className="review-name",r.innerHTML=e.name,n.appendChild(r);var a=document.createElement("p");a.innerHTML=""+e.rating,a.className="review-rating",n.appendChild(a),t.append(n);var o=document.createElement("p");o.innerHTML=e.date,o.className="review-date",t.appendChild(o);var i=document.createElement("p");return i.innerHTML=e.comments,t.appendChild(i),t},fillBreadcrumb=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant,t=document.querySelector("#breadcrumb"),n=document.createElement("li"),r=document.createElement("a");r.href=DBHelper.urlForRestaurant(e),r.innerHTML=e.name,r.setAttribute("aria-current","page"),n.append(r),t.appendChild(n)},getParameterByName=function(e,t){t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");var n=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null};
//# sourceMappingURL=restaurant_info.js.map
