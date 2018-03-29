let DBPromise;

(() => {
  const dbPromise = idb.open("restuarant_app_db", 4, function(db) {
    switch (db.oldVersion) {
      case 0: {
        const keyvalStore = db.createObjectStore("keyval");
        keyvalStore.put("value is value", "key");
      }

      // name is the primary key
      case 1: { // eslint-disable-line
        db.createObjectStore("people", { keyPath: "name" });
      }

      // create index 'favoriteAnimal'
      case 2: { // eslint-disable-line
        const peopleStore = db.transaction.objectStore("people");
        peopleStore.createIndex("animal", "favoriteAnimal"); // named index as 'animal'
      }

      case 3: { // eslint-disable-line
        const peopleStore = db.transaction.objectStore("people");
        peopleStore.createIndex("age", "age");
      }
    }
  });

  dbPromise.then(db => {
    const tx = db.transaction("people", "readwrite");
    const peopleStore = tx.objectStore("people");
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

  dbPromise.then(db => {
    const tx = db.transaction("people");
    const peopleStore = tx.objectStore("people");
    const animalIndex = peopleStore.index("animal");

    return animalIndex.getAll("dog");
    // return animalIndex.getAll();
    // return peopleStore.getAll();
  });

  dbPromise
    .then(db => {
      const tx = db.transaction("people");
      const peopleStore = tx.objectStore("people");
      const ageIndex = peopleStore.index("age");

      return ageIndex.openCursor();
    })
    .then(cursor => {
      if (!cursor) return;
      // Skip first two
      return cursor.advance(2);
    })
    .then(function logPerson(cursor) {
      if (!cursor) return;
      // loop each one get value out ot it
      // console.log("Cursor at: ", cursor.value.name);
      // continue looping
      return cursor.continue().then(logPerson);
    });

  dbPromise.then(db => {
    const tx = db.transaction("keyval");
    const keyvalStore = tx.objectStore("keyval");
    return keyvalStore.get("key");
  });

  dbPromise.then(db => {
    const tx = db.transaction("keyval", "readwrite");
    const keyvalStore = tx.objectStore("keyval");
    keyvalStore.put("barValue", "fooKey");
    return tx.complete;
  });

  DBPromise = openIDB();

  function openIDB() {
    return idb.open("restaurant-app", 3, db => {
      switch (db.oldVersion) {
        case 0: {
          // Create table 'restaurants', primary key is id
          const store = db.createObjectStore("restaurants", {
            keyPath: "id"
          });
          // if index is needed, put down below
          store.createIndex("by-name", "name");
        }

        case 1: { // eslint-disable-line
          db.createObjectStore("cuisines");
          db.createObjectStore("neighborhoods");
        }

        case 2: { // eslint-disable-line
          db.createObjectStore("detail", {keyPath: "id"});
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
    photograph: r.photograph ? `${r.photograph}.jpg` : `${r.id}.jpg`
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
class DBHelper {   // eslint-disable-line no-unused-vars

  constructor() {
    this.restaurants = [];
    this.details = {};
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static setLocalData(restaurants) {
    this.restaurants = restaurants;
  }

  static fetchRestaurantsFromCache(callback) {
    return DBPromise.then(db => {
      // only fetch from db once
      if (!db || (this.restaurants && this.restaurants.length)) {
        return;
      }

      const tx = db.transaction("restaurants");
      const store = tx.objectStore("restaurants").index("by-name");
      return store
        .getAll()
        .then(data => callback(null, data))
        .catch(err => callback(err, null));
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    if (this.restaurants && this.restaurants.length) {
      return this.restaurants;
    }

    fetch(DBHelper.DATABASE_URL)
      .then(res => res.json())
      .then(formatRestaurantsData)
      .then(data => {
        DBPromise.then(db => {
          const tx = db.transaction("restaurants", "readwrite");
          const store = tx.objectStore("restaurants");
          data && data.forEach(d => store.put(d));
          return tx.complete;
        });
        return data;
      })
      .then(restaurants => callback(null, restaurants))
      .then(restaurants => DBHelper.setLocalData(restaurants))
      .catch(error => callback(error, null));
  }

  static fetchRestaurantByIdFromCache(id, callback) {
    return DBPromise.then(db => {
      // only fetch from db once
      if (!db || (this.details && this.details[id])) {
        return;
      }

      const tx = db.transaction("detail");
      const store = tx.objectStore("detail");
      return store.get(Number(id))
        .then(data =>  {
          console.log("data", data);
          callback(null, data);
        })
        .catch(err => callback(err, null));
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    fetch(`${DBHelper.DATABASE_URL}/${id}`)
      .then(res => res.json())
      .then(formatSingleRestaurantData)
      .then((restaurant) => {
        DBPromise.then((db) => {
          const tx = db.transaction('detail', 'readwrite');
          const store = tx.objectStore('detail');
          store.put(restaurant);
          return tx.complete;
        });
        this.details = Object.assign({}, this.details, { [id]: restaurant });
        return restaurant;
      })
      .then(restaurant => {
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      })
      .catch(error => callback(error, null));
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );

        DBPromise.then(db => {
          const tx = db.transaction("neighborhoods", "readwrite");
          const store = tx.objectStore("neighborhoods");

          uniqueNeighborhoods &&
            uniqueNeighborhoods.forEach((d, i) => store.put(d, i));
        });

        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );

        DBPromise.then(db => {
          const tx = db.transaction("cuisines", "readwrite");
          const store = tx.objectStore("cuisines");

          uniqueCuisines && uniqueCuisines.forEach((d, i) => store.put(d, i));
        });
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    const [name, ext] = restaurant.photograph.split(".");
    return `/img/${name}-320_small.${ext}`;
  }

  /**
   * Generate name of different size of images
   */
  static imageSrcset(restaurant) {
    const [name, ext] = restaurant.photograph.split(".");
    return `/img/${name}-320_small.${ext} 400w, /img/${name}-640_medium.${ext} 640w, /img/${name}-800_large.${ext} 800w `;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}
