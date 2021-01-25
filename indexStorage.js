//=====================================
// IndexedDB wrapper class
// Coded by Hajime Oh-yake
// 2021.01.24 ver0.0.1
//=====================================
var indexStorage;

indexStorage = class indexStorage {
  constructor(param) {
    // define IndexdDB name
    if ((param != null)) {
      this.node_env = param.NODE_ENV || "";
    } else {
      this.node_env = "";
    }
    // Database version
    this.version = 1;
    // IndexedDB object initialize
    this.__indexDBObj = void 0;
    this.__IDBTransactionObj = void 0;
    this.__IDBKeyRangeObj = void 0;
    this.__database = void 0;
    if (window.indexedDB) {
      this.__indexDBObj = window.indexedDB;
      this.__IDBTransactionObj = window.IDBTransaction;
      this.__IDBKeyRangeObj = window.IDBKeyRange;
    } else {
      return;
    }
    // Define database name
    // Initialize failure
    if (this.node_env === "develop") { // developer environment
      this.__dbname = "__indexstorage_db_develop__"; // Production environment
    } else {
      this.__dbname = "__indexstorage_db_production__";
    }
  }

  //===========================================================================
  // Private method
  //===========================================================================

    //=====================================
  // Database initialize
  //=====================================
  __connectDB() {
    return new Promise((resolve, reject) => {
      var reqObj;
      // DB接続
      reqObj = this.__indexDBObj.open(this.__dbname, this.version);
      // Update database version
      reqObj.onupgradeneeded = (event) => {
        var db, keylist, objstore;
        db = event.target.result;
        objstore = db.createObjectStore("indexStorage", {
          keyPath: 'key'
        });
        objstore.createIndex("primary_key", "key", {
          unique: true,
          multiEntry: false
        });
        objstore = db.createObjectStore("preference", {
          keyPath: 'key'
        });
        objstore.createIndex("primary_key", "key", {
          unique: true,
          multiEntry: false
        });
        keylist = [];
        return objstore.put({
          key: "keylist",
          val: keylist
        });
      };
      reqObj.onsuccess = (event) => {
        this.__database = event.target.result;
        return resolve(true);
      };
      return reqObj.onerror = (event) => {
        return reject(false);
      };
    });
  }

  //=====================================
  // Add new kye to keylist
  //=====================================
  __addKeylist(key) {
    return new Promise(async(resolve, reject) => {
      var keylist;
      keylist = (await this.getItem("keylist", "preference"));
      if (keylist.indexOf(key) < 0) {
        keylist.push(key);
        await this.setItem("keylist", keylist, "preference");
      }
      return resolve(keylist);
    });
  }

  //=====================================
  // Remove key from keylist
  //=====================================
  __removeKeylist(key) {
    return new Promise(async(resolve, reject) => {
      var index, keylist;
      keylist = (await this.getItem("keylist", "preference"));
      index = keylist.indexOf(key);
      if (index >= 0) {
        keylist.splice(index, 1);
        await this.setItem("keylist", keylist, "preference");
      }
      return resolve(keylist);
    });
  }

  //===========================================================================
  // Global methoc
  //===========================================================================

    //=====================================
  // Return number of values
  //=====================================
  length() {
    return new Promise(async(resolve, reject) => {
      var objectStore, request, transaction;
      try {
        await this.__connectDB();
        transaction = this.__database.transaction(["indexStorage"], "readonly");
        objectStore = transaction.objectStore("indexStorage");
        request = objectStore.count();
        request.onerror = (event) => {
          this.__database.close();
          return reject(void 0);
        };
        return request.onsuccess = (event) => {
          var len;
          len = request.result;
          return resolve(len);
        };
      } catch (error) {}
    });
  }

  //=====================================
  // Return key at index
  //=====================================
  key(index) {
    return new Promise(async(resolve, reject) => {
      var e, key, keylist;
      try {
        keylist = (await this.getItem("keylist", "preference"));
        key = keylist[parseInt(index)];
        return resolve(key);
      } catch (error) {
        e = error;
        return reject(void 0);
      }
    });
  }

  //=====================================
  // Return value for key
  //=====================================
  getItem(key, storename = "indexStorage") {
    return new Promise(async(resolve, reject) => {
      var objectStore, request, transaction;
      await this.__connectDB();
      transaction = this.__database.transaction([storename], "readonly");
      objectStore = transaction.objectStore(storename);
      request = objectStore.get(key);
      request.onerror = (event) => {
        this.__database.close();
        return reject(void 0);
      };
      return request.onsuccess = (event) => {
        var val;
        val = void 0;
        if ((request.result != null) && request.result["key"] === key) {
          val = request.result.val;
        }
        this.__database.close();
        return resolve(val);
      };
    });
  }

  //=====================================
  // Set value into objectstore
  //=====================================
  setItem(key, val, storename = "indexStorage") {
    return new Promise(async(resolve, reject) => {
      var objectStore, transaction;
      await this.__connectDB();
      transaction = this.__database.transaction([storename], "readwrite");
      objectStore = transaction.objectStore(storename);
      objectStore.put({
        key: key,
        val: val
      });
      if (storename === "indexStorage") {
        await this.__addKeylist(key);
      }
      transaction.onerror = (event) => {
        this.__database.close();
        return reject(false);
      };
      return transaction.oncomplete = (event) => {
        this.__database.close();
        return resolve(true);
      };
    });
  }

  //=====================================
  // Remove key from objectstore
  //=====================================
  removeItem(key, storename = "indexStorage") {
    return new Promise(async(resolve, reject) => {
      var objectStore, request, transaction;
      await this.__connectDB();
      transaction = this.__database.transaction([storename], "readwrite");
      objectStore = transaction.objectStore(storename);
      request = objectStore.delete(key);
      await this.__removeKeylist(key);
      request.onerror = (event) => {
        this.__database.close();
        return reject(false);
      };
      return request.onsuccess = (event) => {
        this.__database.close();
        return resolve(true);
      };
    });
  }

  //=====================================
  // Delete database
  //=====================================
  clear() {
    return new Promise((resolve, reject) => {
      try {
        this.__indexDBObj.deleteDatabase(this.__dbname);
        this.__database = void 0;
        return resolve(true);
      } catch (error) {
        return reject(false);
      }
    });
  }

};
