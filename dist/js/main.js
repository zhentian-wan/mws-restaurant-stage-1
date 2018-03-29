'use strict';

(function () {
    window.addEventListener('load', function () {
        if ('serviceWorker' in navigator) {
            // Register a service worker hosted at the root of the
            // site using the default scope.
            navigator.serviceWorker.register('/sw.js').then(function (registration) {
                console.log('Service worker registration succeeded', registration);
            }).catch(function (error) {
                console.log('Service worker registration failed:', error);
            });
        } else {
            console.log('Service workers are not supported.');
        }
    });
})();

var restaurants = void 0,
    // eslint-disable-line no-unused-vars
neighborhoods = void 0,
    // eslint-disable-line no-unused-vars
cuisines = void 0; // eslint-disable-line no-unused-vars
var map = void 0; // eslint-disable-line no-unused-vars
var markers = []; // eslint-disable-line no-unused-vars
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', function () {

    DBHelper.fetchRestaurantsFromCache(handleNeighborhoods).then(function () {
        fetchNeighborhoods();
    });
    DBHelper.fetchRestaurantsFromCache(handleCuisines).then(function () {
        fetchCuisines();
    });
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
var fetchNeighborhoods = function fetchNeighborhoods() {
    DBHelper.fetchNeighborhoods(handleNeighborhoods);
};

var handleNeighborhoods = function handleNeighborhoods(error, neighborhoods) {
    if (error) {
        // Got an error
        console.error(error);
    } else {
        self.neighborhoods = neighborhoods;
        fillNeighborhoodsHTML();
    }
};

/**
 * Set neighborhoods HTML.
 */
var fillNeighborhoodsHTML = function fillNeighborhoodsHTML() {
    var neighborhoods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.neighborhoods;

    var select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(function (neighborhood) {
        var option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        option.name = neighborhood;
        select.append(option);
    });
};

/**
 * Fetch all cuisines and set their HTML.
 */
var fetchCuisines = function fetchCuisines() {
    DBHelper.fetchCuisines(handleCuisines);
};

var handleCuisines = function handleCuisines(error, cuisines) {
    if (error) {
        // Got an error!
        console.error(error);
    } else {
        self.cuisines = cuisines;
        fillCuisinesHTML();
    }
};

/**
 * Set cuisines HTML.
 */
var fillCuisinesHTML = function fillCuisinesHTML() {
    var cuisines = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.cuisines;

    var select = document.getElementById('cuisines-select');

    cuisines.forEach(function (cuisine) {
        var option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = function () {
    var loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        scrollwheel: false,
        keyboardShortcuts: false
    });

    DBHelper.fetchRestaurantsFromCache(handlerCuisineAndNeighborhod).then(function () {
        updateRestaurants();
    });
};

var handlerCuisineAndNeighborhod = function handlerCuisineAndNeighborhod(error, restaurants) {
    if (error) {
        // Got an error!
        console.error(error);
    } else {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
    }
};

/**
 * Update page and map for current restaurants.
 */
var updateRestaurants = function updateRestaurants() {
    var cSelect = document.getElementById('cuisines-select');
    var nSelect = document.getElementById('neighborhoods-select');

    var cIndex = cSelect.selectedIndex;
    var nIndex = nSelect.selectedIndex;

    var cuisine = cSelect[cIndex].value;
    var neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, handlerCuisineAndNeighborhod);
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
var resetRestaurants = function resetRestaurants(restaurants) {
    // Remove all restaurants
    self.restaurants = [];
    var ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';
    // Remove all map markers
    self.markers.forEach(function (m) {
        return m.setMap(null);
    });
    self.markers = [];
    self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
var fillRestaurantsHTML = function fillRestaurantsHTML() {
    var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

    var ul = document.getElementById('restaurants-list');
    restaurants.forEach(function (restaurant) {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
var createRestaurantHTML = function createRestaurantHTML(restaurant) {
    var li = document.createElement('li');

    var image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.alt = 'Restaurant ' + restaurant.name;
    li.append(image);

    var info = document.createElement('div');
    info.className = 'restaurant-info';

    var name = document.createElement('h3');
    name.innerHTML = restaurant.name;
    name.id = 'restaurant-item-' + restaurant.id;
    info.append(name);

    var neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    info.append(neighborhood);

    var address = document.createElement('p');
    address.innerHTML = restaurant.address;
    info.append(address);

    var more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    more.setAttribute('aria-labelledby', 'restaurant-detail-' + restaurant.id);
    info.append(more);

    var detail = document.createElement('span');
    detail.hidden = true;
    detail.id = 'restaurant-detail-' + restaurant.id;
    detail.innerHTML = 'Restaurant name: ' + restaurant.name + ', address:' + restaurant.address + ', click the link to view detail';

    li.appendChild(detail);
    li.append(info);

    return li;
};

/**
 * Add markers for current restaurants to the map.
 */
var addMarkersToMap = function addMarkersToMap() {
    var restaurants = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurants;

    restaurants.forEach(function (restaurant) {
        // Add marker to the map
        var marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, 'click', function () {
            window.location.href = marker.url;
        });
        self.markers.push(marker);
    });
};
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DBPromise = void 0;

(function () {
  var dbPromise = idb.open("restuarant_app_db", 4, function (db) {
    switch (db.oldVersion) {
      case 0:
        {
          var keyvalStore = db.createObjectStore("keyval");
          keyvalStore.put("value is value", "key");
        }

      // name is the primary key
      case 1:
        {
          // eslint-disable-line
          db.createObjectStore("people", { keyPath: "name" });
        }

      // create index 'favoriteAnimal'
      case 2:
        {
          // eslint-disable-line
          var peopleStore = db.transaction.objectStore("people");
          peopleStore.createIndex("animal", "favoriteAnimal"); // named index as 'animal'
        }

      case 3:
        {
          // eslint-disable-line
          var _peopleStore = db.transaction.objectStore("people");
          _peopleStore.createIndex("age", "age");
        }
    }
  });

  dbPromise.then(function (db) {
    var tx = db.transaction("people", "readwrite");
    var peopleStore = tx.objectStore("people");
    peopleStore.put({
      name: "Sam Munoz",
      age: 25,
      favoriteAnimal: "dog"
    });

    peopleStore.put({
      name: "Wam ok",
      age: 34,
      favoriteAnimal: "cat"
    });

    peopleStore.put({
      name: "Kim Bad",
      age: 35,
      favoriteAnimal: "dog"
    });

    peopleStore.put({
      name: "Jam Good",
      age: 21,
      favoriteAnimal: "dog"
    });

    return tx.complete;
  });

  dbPromise.then(function (db) {
    var tx = db.transaction("people");
    var peopleStore = tx.objectStore("people");
    var animalIndex = peopleStore.index("animal");

    return animalIndex.getAll("dog");
    // return animalIndex.getAll();
    // return peopleStore.getAll();
  });

  dbPromise.then(function (db) {
    var tx = db.transaction("people");
    var peopleStore = tx.objectStore("people");
    var ageIndex = peopleStore.index("age");

    return ageIndex.openCursor();
  }).then(function (cursor) {
    if (!cursor) return;
    // Skip first two
    return cursor.advance(2);
  }).then(function logPerson(cursor) {
    if (!cursor) return;
    // loop each one get value out ot it
    // console.log("Cursor at: ", cursor.value.name);
    // continue looping
    return cursor.continue().then(logPerson);
  });

  dbPromise.then(function (db) {
    var tx = db.transaction("keyval");
    var keyvalStore = tx.objectStore("keyval");
    return keyvalStore.get("key");
  });

  dbPromise.then(function (db) {
    var tx = db.transaction("keyval", "readwrite");
    var keyvalStore = tx.objectStore("keyval");
    keyvalStore.put("barValue", "fooKey");
    return tx.complete;
  });

  DBPromise = openIDB();

  function openIDB() {
    return idb.open("restaurant-app", 3, function (db) {
      switch (db.oldVersion) {
        case 0:
          {
            // Create table 'restaurants', primary key is id
            var store = db.createObjectStore("restaurants", {
              keyPath: "id"
            });
            // if index is needed, put down below
            store.createIndex("by-name", "name");
          }

        case 1:
          {
            // eslint-disable-line
            db.createObjectStore("cuisines");
            db.createObjectStore("neighborhoods");
          }

        case 2:
          {
            // eslint-disable-line
            db.createObjectStore("detail", { keyPath: "id" });
          }
      }
    });
  }
})();

/**
 * photograph no longer return 1.jpg
 in api returns 1, so format data here
 also the last one doesn't have, using id to replace
 * @param r
 * @returns {{} & any & {photograph: string}}
 */
function formatSingleRestaurantData(r) {
  return Object.assign({}, r, {
    photograph: r.photograph ? r.photograph + ".jpg" : r.id + ".jpg"
  });
}

/**
 * Format restaurants array data
 * @param restaurants
 */
function formatRestaurantsData(restaurants) {
  return restaurants.map(formatSingleRestaurantData);
}

/**
 * Common database helper functions.
 */

var DBHelper = function () {
  // eslint-disable-line no-unused-vars

  function DBHelper() {
    _classCallCheck(this, DBHelper);

    this.restaurants = [];
    this.details = {};
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */


  _createClass(DBHelper, null, [{
    key: "setLocalData",
    value: function setLocalData(restaurants) {
      this.restaurants = restaurants;
    }
  }, {
    key: "fetchRestaurantsFromCache",
    value: function fetchRestaurantsFromCache(callback) {
      var _this = this;

      return DBPromise.then(function (db) {
        // only fetch from db once
        if (!db || _this.restaurants && _this.restaurants.length) {
          return;
        }

        var tx = db.transaction("restaurants");
        var store = tx.objectStore("restaurants").index("by-name");
        return store.getAll().then(function (data) {
          return callback(null, data);
        }).catch(function (err) {
          return callback(err, null);
        });
      });
    }

    /**
     * Fetch all restaurants.
     */

  }, {
    key: "fetchRestaurants",
    value: function fetchRestaurants(callback) {
      if (this.restaurants && this.restaurants.length) {
        return this.restaurants;
      }

      fetch(DBHelper.DATABASE_URL).then(function (res) {
        return res.json();
      }).then(formatRestaurantsData).then(function (data) {
        DBPromise.then(function (db) {
          var tx = db.transaction("restaurants", "readwrite");
          var store = tx.objectStore("restaurants");
          data && data.forEach(function (d) {
            return store.put(d);
          });
          return tx.complete;
        });
        return data;
      }).then(function (restaurants) {
        return callback(null, restaurants);
      }).then(function (restaurants) {
        return DBHelper.setLocalData(restaurants);
      }).catch(function (error) {
        return callback(error, null);
      });
    }
  }, {
    key: "fetchRestaurantByIdFromCache",
    value: function fetchRestaurantByIdFromCache(id, callback) {
      var _this2 = this;

      return DBPromise.then(function (db) {
        // only fetch from db once
        if (!db || _this2.details && _this2.details[id]) {
          return;
        }

        var tx = db.transaction("detail");
        var store = tx.objectStore("detail");
        return store.get(Number(id)).then(function (data) {
          console.log("data", data);
          callback(null, data);
        }).catch(function (err) {
          return callback(err, null);
        });
      });
    }

    /**
     * Fetch a restaurant by its ID.
     */

  }, {
    key: "fetchRestaurantById",
    value: function fetchRestaurantById(id, callback) {
      var _this3 = this;

      fetch(DBHelper.DATABASE_URL + "/" + id).then(function (res) {
        return res.json();
      }).then(formatSingleRestaurantData).then(function (restaurant) {
        DBPromise.then(function (db) {
          var tx = db.transaction('detail', 'readwrite');
          var store = tx.objectStore('detail');
          store.put(restaurant);
          return tx.complete;
        });
        _this3.details = Object.assign({}, _this3.details, _defineProperty({}, id, restaurant));
        return restaurant;
      }).then(function (restaurant) {
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      }).catch(function (error) {
        return callback(error, null);
      });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */

  }, {
    key: "fetchRestaurantByCuisine",
    value: function fetchRestaurantByCuisine(cuisine, callback) {
      // Fetch all restaurants  with proper error handling
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given cuisine type
          var results = restaurants.filter(function (r) {
            return r.cuisine_type == cuisine;
          });
          callback(null, results);
        }
      });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */

  }, {
    key: "fetchRestaurantByNeighborhood",
    value: function fetchRestaurantByNeighborhood(neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given neighborhood
          var results = restaurants.filter(function (r) {
            return r.neighborhood == neighborhood;
          });
          callback(null, results);
        }
      });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */

  }, {
    key: "fetchRestaurantByCuisineAndNeighborhood",
    value: function fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          var results = restaurants;
          if (cuisine != "all") {
            // filter by cuisine
            results = results.filter(function (r) {
              return r.cuisine_type == cuisine;
            });
          }
          if (neighborhood != "all") {
            // filter by neighborhood
            results = results.filter(function (r) {
              return r.neighborhood == neighborhood;
            });
          }
          callback(null, results);
        }
      });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */

  }, {
    key: "fetchNeighborhoods",
    value: function fetchNeighborhoods(callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Get all neighborhoods from all restaurants
          var neighborhoods = restaurants.map(function (v, i) {
            return restaurants[i].neighborhood;
          });
          // Remove duplicates from neighborhoods
          var uniqueNeighborhoods = neighborhoods.filter(function (v, i) {
            return neighborhoods.indexOf(v) == i;
          });

          DBPromise.then(function (db) {
            var tx = db.transaction("neighborhoods", "readwrite");
            var store = tx.objectStore("neighborhoods");

            uniqueNeighborhoods && uniqueNeighborhoods.forEach(function (d, i) {
              return store.put(d, i);
            });
          });

          callback(null, uniqueNeighborhoods);
        }
      });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */

  }, {
    key: "fetchCuisines",
    value: function fetchCuisines(callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Get all cuisines from all restaurants
          var cuisines = restaurants.map(function (v, i) {
            return restaurants[i].cuisine_type;
          });
          // Remove duplicates from cuisines
          var uniqueCuisines = cuisines.filter(function (v, i) {
            return cuisines.indexOf(v) == i;
          });

          DBPromise.then(function (db) {
            var tx = db.transaction("cuisines", "readwrite");
            var store = tx.objectStore("cuisines");

            uniqueCuisines && uniqueCuisines.forEach(function (d, i) {
              return store.put(d, i);
            });
          });
          callback(null, uniqueCuisines);
        }
      });
    }

    /**
     * Restaurant page URL.
     */

  }, {
    key: "urlForRestaurant",
    value: function urlForRestaurant(restaurant) {
      return "./restaurant.html?id=" + restaurant.id;
    }

    /**
     * Restaurant image URL.
     */

  }, {
    key: "imageUrlForRestaurant",
    value: function imageUrlForRestaurant(restaurant) {
      var _restaurant$photograp = restaurant.photograph.split("."),
          _restaurant$photograp2 = _slicedToArray(_restaurant$photograp, 2),
          name = _restaurant$photograp2[0],
          ext = _restaurant$photograp2[1];

      return "/img/" + name + "-320_small." + ext;
    }

    /**
     * Generate name of different size of images
     */

  }, {
    key: "imageSrcset",
    value: function imageSrcset(restaurant) {
      var _restaurant$photograp3 = restaurant.photograph.split("."),
          _restaurant$photograp4 = _slicedToArray(_restaurant$photograp3, 2),
          name = _restaurant$photograp4[0],
          ext = _restaurant$photograp4[1];

      return "/img/" + name + "-320_small." + ext + " 400w, /img/" + name + "-640_medium." + ext + " 640w, /img/" + name + "-800_large." + ext + " 800w ";
    }

    /**
     * Map marker for a restaurant.
     */

  }, {
    key: "mapMarkerForRestaurant",
    value: function mapMarkerForRestaurant(restaurant, map) {
      var marker = new google.maps.Marker({
        position: restaurant.latlng,
        title: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),
        map: map,
        animation: google.maps.Animation.DROP
      });
      return marker;
    }
  }, {
    key: "DATABASE_URL",
    get: function get() {
      var port = 1337; // Change this to your server port
      return "http://localhost:" + port + "/restaurants";
    }
  }]);

  return DBHelper;
}();