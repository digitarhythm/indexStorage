#=====================================
# IndexedDB wrapper class
# Coded by Hajime Oh-yake
# 2021.01.24 ver0.0.1
#=====================================
class indexStorage
  constructor:(param) ->
    # define IndexdDB name
    if (param?)
      @node_env = param.NODE_ENV || ""
    else
      @node_env = ""

    # Database version
    @version = 1

    # IndexedDB object initialize
    @__indexDBObj = undefined
    @__IDBTransactionObj = undefined
    @__IDBKeyRangeObj =  undefined
    @__database = undefined
    if (window.indexedDB)
      @__indexDBObj = window.indexedDB
      @__IDBTransactionObj = window.IDBTransaction
      @__IDBKeyRangeObj =  window.IDBKeyRange
    else
      # Initialize failure
      return

    # Define database name
    if (@node_env == "develop") # developer environment
      @__dbname = "__indexstorage_db_develop__"
    else # Production environment
      @__dbname = "__indexstorage_db_production__"

  #===========================================================================
  # Private method
  #===========================================================================

  #=====================================
  # Database initialize
  #=====================================
  __connectDB: ->
    return new Promise (resolve, reject) =>
      # DB接続
      reqObj = @__indexDBObj.open(@__dbname, @version)

      # Update database version
      reqObj.onupgradeneeded = (event) =>
        db = event.target.result
        objstore = db.createObjectStore("indexStorage", {keyPath : 'key'})
        objstore.createIndex "primary_key", "key",
          unique:true
          multiEntry:false

        objstore = db.createObjectStore("preference", {keyPath : 'key'})
        objstore.createIndex "primary_key", "key",
          unique:true
          multiEntry:false
        keylist = []
        objstore.put({key: "keylist", val: keylist})

      reqObj.onsuccess = (event) =>
        @__database = event.target.result
        resolve(true)

      reqObj.onerror = (event) =>
        reject(false)

  #=====================================
  # Add new kye to keylist
  #=====================================
  __addKeylist:(key) ->
    return new Promise (resolve, reject) =>
      keylist = await @getItem("keylist", "preference") || []
      if (keylist.indexOf(key) < 0)
        keylist.push(key)
        @setItem("keylist", keylist, "preference").then =>
          resolve(keylist)
      else
        resolve(keylist)

  #=====================================
  # Remove key from keylist
  #=====================================
  __removeKeylist:(key) ->
    return new Promise (resolve, reject) =>
      keylist = await @getItem("keylist", "preference") || []
      index = keylist.indexOf(key)
      if (index >= 0)
        keylist.splice(index, 1)
        await @setItem("keylist", keylist, "preference")
      resolve(keylist)

  #===========================================================================
  # Global methoc
  #===========================================================================

  #=====================================
  # Return number of values
  #=====================================
  length: ->
    return new Promise (resolve, reject) =>
      try
        await @__connectDB()
        transaction = @__database.transaction(["indexStorage"], "readonly")
        objectStore = transaction.objectStore("indexStorage")
        request = objectStore.count()

        request.onerror = (event) =>
          @__database.close()
          reject(undefined)

        request.onsuccess = (event) =>
          len = request.result
          resolve(len)

  #=====================================
  # Return key at index
  #=====================================
  key:(index) ->
    return new Promise (resolve, reject) =>
      try
        keylist = await @getItem("keylist", "preference") || []
        key = keylist[parseInt(index)]
        resolve(key)
      catch e
        reject(undefined)

  #=====================================
  # Return value for key
  #=====================================
  getItem:(key, storename="indexStorage") ->
    return new Promise (resolve, reject) =>
      await @__connectDB()
      transaction = @__database.transaction([storename], "readonly")
      objectStore = transaction.objectStore(storename)
      request = objectStore.get(key)

      request.onerror = (event) =>
        @__database.close()
        reject(undefined)

      request.onsuccess = (event) =>
        val = undefined
        if (request.result? && request.result["key"] == key)
          val = request.result.val
        @__database.close()
        resolve(val)

  #=====================================
  # Set value into objectstore
  #=====================================
  setItem:(key, val, storename="indexStorage") ->
    return new Promise (resolve, reject) =>
      await @__connectDB()
      transaction = @__database.transaction([storename], "readwrite")
      objectStore = transaction.objectStore(storename)
      objectStore.put({key: key, val: val})

      transaction.onerror = (event) =>
        @__database.close()
        reject(false)

      transaction.oncomplete = (event) =>
        if (storename == "indexStorage")
          ret = await @__addKeylist(key)
        @__database.close()
        resolve(true)

  #=====================================
  # Remove key from objectstore
  #=====================================
  removeItem:(key, storename="indexStorage") ->
    return new Promise (resolve, reject) =>
      await @__connectDB()
      transaction = @__database.transaction([storename], "readwrite")
      objectStore = transaction.objectStore(storename)
      request = objectStore.delete(key)

      request.onerror = (event) =>
        @__database.close()
        reject(false)

      request.onsuccess = (event) =>
        await @__removeKeylist(key)
        @__database.close()
        resolve(true)

  #=====================================
  # clear all data
  #=====================================
  clear: ->
    return new Promise (resolve, reject) =>
      ret  = await @__clearObjectStore("indexStorage")
      ret |= await @__clearObjectStore("preference")
      resolve(ret)

  #=====================================
  # database delete
  #=====================================
  delete:(database=@__dbname) ->
    @__indexDBObj.deleteDatabase(database)

  #=====================================
  # clear all data in object store
  #=====================================
  __clearObjectStore:(storename="indexStorage") ->
    return new Promise (resolve, reject) =>
      await @__connectDB()
      transaction = @__database.transaction([storename], "readwrite")
      objectStore = transaction.objectStore(storename)
      request = objectStore.clear()

      request.onerror = (event) =>
        @__database.close()
        reject(false)

      request.onsuccess = (event) =>
        @__database.close()
        resolve(true)

