'use strict';

(function () {
    window.addEventListener('load', function () {
        if ('serviceWorker' in navigator) {
            // Register a service worker hosted at the root of the
            // site using the default scope.
            navigator.serviceWorker.register('/sw.js').then(function (registration) {
                console.log('Service worker registration succeeded:', registration);
            }).catch(function (error) {
                console.log('Service worker registration failed:', error);
            });
        } else {
            console.log('Service workers are not supported.');
        }
    });
})();

var restaurant = void 0; // eslint-disable-line no-unused-vars
var map = void 0; // eslint-disable-line no-unused-vars

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = function () {
    fetchRestaurantFromURL(function (error, restaurant) {
        if (error) {
            // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById("map"), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });
};

/**
 * Get current restaurant from page URL.
 */
var fetchRestaurantFromURL = function fetchRestaurantFromURL(callback) {
    if (self.restaurant) {
        // restaurant already fetched!
        callback(null, self.restaurant);
        return;
    }
    var id = getParameterByName("id");
    if (!id) {
        // no id found in URL
        var error = "No restaurant id in URL";
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, function (error, restaurant) {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant);
        });
    }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
var fillRestaurantHTML = function fillRestaurantHTML() {
    var restaurant = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurant;

    var name = document.getElementById("restaurant-name");
    name.innerHTML = restaurant.name;
    name.setAttribute('tabindex', '0');
    name.setAttribute('aria-label', 'restaurant ' + restaurant.name);

    var address = document.getElementById("restaurant-address");
    address.innerHTML = restaurant.address;

    var image = document.getElementById("restaurant-img");
    image.className = "restaurant-img";
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.alt = 'Restaurant ' + restaurant.name;
    image.srcset = DBHelper.imageSrcset(restaurant);
    image.sizes = "(max-width: 640px) 100vw, 50vw";

    var cuisine = document.getElementById("restaurant-cuisine");
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
var fillRestaurantHoursHTML = function fillRestaurantHoursHTML() {
    var operatingHours = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurant.operating_hours;

    var hours = document.getElementById("restaurant-hours");
    for (var key in operatingHours) {
        var row = document.createElement("tr");

        var day = document.createElement("td");
        day.innerHTML = key;
        row.appendChild(day);

        var time = document.createElement("td");
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
var fillReviewsHTML = function fillReviewsHTML() {
    var reviews = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurant.reviews;

    var container = document.getElementById("reviews-container");
    var title = document.createElement("h3");
    title.innerHTML = "Reviews";
    container.appendChild(title);

    if (!reviews) {
        var noReviews = document.createElement("p");
        noReviews.innerHTML = "No reviews yet!";
        container.appendChild(noReviews);
        return;
    }
    var ul = document.getElementById("reviews-list");
    reviews.forEach(function (review) {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
var createReviewHTML = function createReviewHTML(review) {
    var li = document.createElement("li");

    var wrapper = document.createElement("article");
    wrapper.className = "review-wrapper";

    var name = document.createElement("h4");
    name.className = "review-name";
    name.innerHTML = review.name;
    wrapper.appendChild(name);

    var rating = document.createElement("p");
    rating.innerHTML = '' + review.rating;
    rating.className = "review-rating";
    wrapper.appendChild(rating);

    li.append(wrapper);

    var date = document.createElement("p");
    date.innerHTML = review.date;
    date.className = "review-date";
    li.appendChild(date);

    var comments = document.createElement("p");
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
var fillBreadcrumb = function fillBreadcrumb() {
    var restaurant = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurant;

    var breadcrumb = document.querySelector("#breadcrumb");
    var li = document.createElement("li");
    var link = document.createElement('a');
    link.href = DBHelper.urlForRestaurant(restaurant);
    link.innerHTML = restaurant.name;
    link.setAttribute('aria-current', 'page');
    li.append(link);
    breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
var getParameterByName = function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DBPromise = void 0;

(function () {
    var dbPromise = idb.open('restuarant_app_db', 4, function (db) {
        switch (db.oldVersion) {
            case 0:
                {
                    var keyvalStore = db.createObjectStore('keyval');
                    keyvalStore.put("value is value", "key");
                }

            // name is the primary key
            case 1:
                {
                    db.createObjectStore('people', { keyPath: 'name' });
                }

            // create index 'favoriteAnimal'
            case 2:
                {
                    var peopleStore = db.transaction.objectStore('people');
                    peopleStore.createIndex('animal', 'favoriteAnimal'); // named index as 'animal'
                }

            case 3:
                {
                    var _peopleStore = db.transaction.objectStore('people');
                    _peopleStore.createIndex('age', 'age');
                }

        }
    });

    dbPromise.then(function (db) {
        var tx = db.transaction('people', 'readwrite');
        var peopleStore = tx.objectStore('people');
        peopleStore.put({
            name: 'Sam Munoz',
            age: 25,
            favoriteAnimal: 'dog'
        });

        peopleStore.put({
            name: 'Wam ok',
            age: 34,
            favoriteAnimal: 'cat'
        });

        peopleStore.put({
            name: 'Kim Bad',
            age: 35,
            favoriteAnimal: 'dog'
        });

        peopleStore.put({
            name: 'Jam Good',
            age: 21,
            favoriteAnimal: 'dog'
        });

        return tx.complete;
    });

    dbPromise.then(function (db) {
        var tx = db.transaction('people');
        var peopleStore = tx.objectStore('people');
        var animalIndex = peopleStore.index('animal');

        return animalIndex.getAll('dog');
        // return animalIndex.getAll();
        // return peopleStore.getAll();
    });

    dbPromise.then(function (db) {
        var tx = db.transaction('people');
        var peopleStore = tx.objectStore('people');
        var ageIndex = peopleStore.index('age');

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
        var tx = db.transaction('keyval');
        var keyvalStore = tx.objectStore('keyval');
        return keyvalStore.get('key');
    });

    dbPromise.then(function (db) {
        var tx = db.transaction('keyval', 'readwrite');
        var keyvalStore = tx.objectStore('keyval');
        keyvalStore.put('barValue', 'fooKey');
        return tx.complete;
    });

    DBPromise = openIDB();

    function openIDB() {
        return idb.open('restaurant-app', 2, function (db) {
            switch (db.oldVersion) {
                case 0:
                    {
                        // Create table 'restaurants', primary key is id
                        var store = db.createObjectStore('restaurants', {
                            keyPath: 'id'
                        });
                        // if index is needed, put down below
                        store.createIndex('by-name', 'name');
                    }

                case 1:
                    {
                        db.createObjectStore('cuisines');
                        db.createObjectStore('neighborhoods');
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
        photograph: r.photograph ? r.photograph + '.jpg' : r.id + '.jpg'
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
    }

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */


    _createClass(DBHelper, null, [{
        key: 'setLocalData',
        value: function setLocalData(restaurants) {
            this.restaurants = restaurants;
        }
    }, {
        key: 'fetchRestaurantsFromCache',
        value: function fetchRestaurantsFromCache(callback) {
            var _this = this;

            return DBPromise.then(function (db) {
                // only fetch from db once
                if (!db || _this.restaurants && _this.restaurants.length) {
                    return;
                }

                var tx = db.transaction('restaurants');
                var store = tx.objectStore('restaurants').index('by-name');
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
        key: 'fetchRestaurants',
        value: function fetchRestaurants(callback) {

            if (this.restaurants && this.restaurants.length) {
                return this.restaurants;
            }

            fetch(DBHelper.DATABASE_URL).then(function (res) {
                return res.json();
            }).then(formatRestaurantsData).then(function (data) {
                DBPromise.then(function (db) {
                    var tx = db.transaction('restaurants', 'readwrite');
                    var store = tx.objectStore('restaurants');
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

        /**
         * Fetch a restaurant by its ID.
         */

    }, {
        key: 'fetchRestaurantById',
        value: function fetchRestaurantById(id, callback) {

            fetch(DBHelper.DATABASE_URL + '/' + id).then(function (res) {
                return res.json();
            }).then(formatSingleRestaurantData).then(function (restaurant) {
                if (restaurant) {
                    // Got the restaurant
                    callback(null, restaurant);
                } else {
                    // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }).catch(function (error) {
                return callback(error, null);
            });
        }

        /**
         * Fetch restaurants by a cuisine type with proper error handling.
         */

    }, {
        key: 'fetchRestaurantByCuisine',
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
        key: 'fetchRestaurantByNeighborhood',
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
        key: 'fetchRestaurantByCuisineAndNeighborhood',
        value: function fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
            // Fetch all restaurants
            DBHelper.fetchRestaurants(function (error, restaurants) {
                if (error) {
                    callback(error, null);
                } else {
                    var results = restaurants;
                    if (cuisine != 'all') {
                        // filter by cuisine
                        results = results.filter(function (r) {
                            return r.cuisine_type == cuisine;
                        });
                    }
                    if (neighborhood != 'all') {
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
        key: 'fetchNeighborhoods',
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
                        var tx = db.transaction('neighborhoods', 'readwrite');
                        var store = tx.objectStore('neighborhoods');

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
        key: 'fetchCuisines',
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
                        var tx = db.transaction('cuisines', 'readwrite');
                        var store = tx.objectStore('cuisines');

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
        key: 'urlForRestaurant',
        value: function urlForRestaurant(restaurant) {
            return './restaurant.html?id=' + restaurant.id;
        }

        /**
         * Restaurant image URL.
         */

    }, {
        key: 'imageUrlForRestaurant',
        value: function imageUrlForRestaurant(restaurant) {
            var _restaurant$photograp = restaurant.photograph.split('.'),
                _restaurant$photograp2 = _slicedToArray(_restaurant$photograp, 2),
                name = _restaurant$photograp2[0],
                ext = _restaurant$photograp2[1];

            return '/img/' + name + '-320_small.' + ext;
        }

        /**
         * Generate name of different size of images
         */

    }, {
        key: 'imageSrcset',
        value: function imageSrcset(restaurant) {
            var _restaurant$photograp3 = restaurant.photograph.split('.'),
                _restaurant$photograp4 = _slicedToArray(_restaurant$photograp3, 2),
                name = _restaurant$photograp4[0],
                ext = _restaurant$photograp4[1];

            return '/img/' + name + '-320_small.' + ext + ' 400w, /img/' + name + '-640_medium.' + ext + ' 640w, /img/' + name + '-800_large.' + ext + ' 800w ';
        }

        /**
         * Map marker for a restaurant.
         */

    }, {
        key: 'mapMarkerForRestaurant',
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
        key: 'DATABASE_URL',
        get: function get() {
            var port = 1337; // Change this to your server port
            return 'http://localhost:' + port + '/restaurants';
        }
    }]);

    return DBHelper;
}();