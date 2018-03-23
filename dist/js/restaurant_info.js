"use strict";window.addEventListener("load",function(){"serviceWorker"in navigator?navigator.serviceWorker.register("/sw.js").then(function(e){console.log("Service worker registration succeeded:",e)}).catch(function(e){console.log("Service worker registration failed:",e)}):console.log("Service workers are not supported.")});var restaurant=void 0,map=void 0;window.initMap=function(){fetchRestaurantFromURL(function(e,t){e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map))})};var fetchRestaurantFromURL=function(n){if(self.restaurant)n(null,self.restaurant);else{var e=getParameterByName("id");if(e)DBHelper.fetchRestaurantById(e,function(e,t){(self.restaurant=t)?(fillRestaurantHTML(),n(null,t)):console.error(e)});else{n("No restaurant id in URL",null)}}},fillRestaurantHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant,t=document.getElementById("restaurant-name");t.innerHTML=e.name,t.setAttribute("tabindex","0"),t.setAttribute("aria-label","restaurant "+e.name),document.getElementById("restaurant-address").innerHTML=e.address;var n=document.getElementById("restaurant-img");n.className="restaurant-img",n.src=DBHelper.imageUrlForRestaurant(e),n.alt="Restaurant "+e.name,n.srcset=DBHelper.imageSrcset(e),n.sizes="(max-width: 640px) 100vw, 50vw",document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()},fillRestaurantHoursHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant.operating_hours,t=document.getElementById("restaurant-hours");for(var n in e){var r=document.createElement("tr"),a=document.createElement("td");a.innerHTML=n,r.appendChild(a);var i=document.createElement("td");i.innerHTML=e[n],r.appendChild(i),t.appendChild(r)}},fillReviewsHTML=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant.reviews,t=document.getElementById("reviews-container"),n=document.createElement("h3");if(n.innerHTML="Reviews",t.appendChild(n),!e){var r=document.createElement("p");return r.innerHTML="No reviews yet!",void t.appendChild(r)}var a=document.getElementById("reviews-list");e.forEach(function(e){a.appendChild(createReviewHTML(e))}),t.appendChild(a)},createReviewHTML=function(e){var t=document.createElement("li"),n=document.createElement("article");n.className="review-wrapper";var r=document.createElement("h4");r.className="review-name",r.innerHTML=e.name,n.appendChild(r);var a=document.createElement("p");a.innerHTML=""+e.rating,a.className="review-rating",n.appendChild(a),t.append(n);var i=document.createElement("p");i.innerHTML=e.date,i.className="review-date",t.appendChild(i);var u=document.createElement("p");return u.innerHTML=e.comments,t.appendChild(u),t},fillBreadcrumb=function(){var e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:self.restaurant,t=document.querySelector("#breadcrumb"),n=document.createElement("li"),r=document.createElement("a");r.href=DBHelper.urlForRestaurant(e),r.innerHTML=e.name,r.setAttribute("aria-current","page"),n.append(r),t.appendChild(n)},getParameterByName=function(e,t){t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");var n=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null},_slicedToArray=function(e,t){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return function(e,t){var n=[],r=!0,a=!1,i=void 0;try{for(var u,l=e[Symbol.iterator]();!(r=(u=l.next()).done)&&(n.push(u.value),!t||n.length!==t);r=!0);}catch(e){a=!0,i=e}finally{try{!r&&l.return&&l.return()}finally{if(a)throw i}}return n}(e,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")},_createClass=function(){function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}}();function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function formatSingleRestaurantData(e){return Object.assign({},e,{photograph:e.photograph?e.photograph+".jpg":e.id+".jpg"})}function formatRestaurantsData(e){return e.map(formatSingleRestaurantData)}var DBHelper=function(){function n(){_classCallCheck(this,n)}return _createClass(n,null,[{key:"fetchRestaurants",value:function(t){fetch(n.DATABASE_URL).then(function(e){return e.json()}).then(formatRestaurantsData).then(function(e){return t(null,e)}).catch(function(e){return t(e,null)})}},{key:"fetchRestaurantById",value:function(e,t){fetch(n.DATABASE_URL+"/"+e).then(function(e){return e.json()}).then(formatSingleRestaurantData).then(function(e){e?t(null,e):t("Restaurant does not exist",null)}).catch(function(e){return t(e,null)})}},{key:"fetchRestaurantByCuisine",value:function(r,a){n.fetchRestaurants(function(e,t){if(e)a(e,null);else{var n=t.filter(function(e){return e.cuisine_type==r});a(null,n)}})}},{key:"fetchRestaurantByNeighborhood",value:function(r,a){n.fetchRestaurants(function(e,t){if(e)a(e,null);else{var n=t.filter(function(e){return e.neighborhood==r});a(null,n)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(r,a,i){n.fetchRestaurants(function(e,t){if(e)i(e,null);else{var n=t;"all"!=r&&(n=n.filter(function(e){return e.cuisine_type==r})),"all"!=a&&(n=n.filter(function(e){return e.neighborhood==a})),i(null,n)}})}},{key:"fetchNeighborhoods",value:function(a){n.fetchRestaurants(function(e,n){if(e)a(e,null);else{var r=n.map(function(e,t){return n[t].neighborhood}),t=r.filter(function(e,t){return r.indexOf(e)==t});a(null,t)}})}},{key:"fetchCuisines",value:function(a){n.fetchRestaurants(function(e,n){if(e)a(e,null);else{var r=n.map(function(e,t){return n[t].cuisine_type}),t=r.filter(function(e,t){return r.indexOf(e)==t});a(null,t)}})}},{key:"urlForRestaurant",value:function(e){return"./restaurant.html?id="+e.id}},{key:"imageUrlForRestaurant",value:function(e){var t=e.photograph.split("."),n=_slicedToArray(t,2);return"/img/"+n[0]+"-320_small."+n[1]}},{key:"imageSrcset",value:function(e){var t=e.photograph.split("."),n=_slicedToArray(t,2),r=n[0],a=n[1];return"/img/"+r+"-320_small."+a+" 400w, /img/"+r+"-640_medium."+a+" 640w, /img/"+r+"-800_large."+a+" 800w "}},{key:"mapMarkerForRestaurant",value:function(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:n.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}},{key:"DATABASE_URL",get:function(){return"http://localhost:1337/restaurants"}}]),n}();
//# sourceMappingURL=restaurant_info.js.map
