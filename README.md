# indexStorage
IndexedDBをlocalStorageのように使うためのライブラリです。  
IndexedDBは完全に非同期で動作するため、全てのメソッドがPromiseを返します。  
なので同期処理が必要な場合はawait呼び出しを使用してください。  
インスタンスを生成する時に、パラメータとして  

> {NODE_ENV: "develop"}  

を渡すと、パラメータを渡さなかった場合とは別のデータベースを使用する事が出来ます。  

*This is a library for using IndexedDB like localStorage.*  
*Since IndexedDB works completely asynchronously, all methods return Promise.*  
*So, if you need synchronous processing, please use await calls.*  
*When creating an instance, the parameter is*  

> *{NODE_ENV: "develop"}*  

*you can use a different database than if you had not passed the parameter.*  

**例 example**
```JavaScript
idx = new indexStorage({NODE_ENV: "develop"});
await idx.setItem("foo", "bar");
ret = await idx.getItem("foo");
console.log(ret); <--- print "bar"
```

----

## 使い方 Usage
リポジトリをクローンし、中の「indexStorage.min.js」もしくは「indexStorage.js」を読み込むと使えます。  
*You can use it by cloning the repository and loading "indexStorage.min.js" or "indexStorage.js" inside.*  

### ファイル読み込み include file
`<script type="text/javascript" src="indexStorage.min.js"></script>`

----

## メソッド Method
下記のメソッドを定義してあります。  
*The following methods have been defined.*  

- length
- key
- setItem
- getItem
- removeItem
- clear

----

### length
登録されているKeyの総数を返します。  
*Returns the total number of keys that have been registered.*  

**例 example**
```JavaScript
idx = new indexStorage();
len = await idx.length();  
console.log(len);
```

----

### key
指定した番号のKeyを返します。  
Keyは追加された順を記憶しており、その番号を指定してKeyを取り出せます。  
Keyを削除した場合は順番は詰められます。  
指定した番号のKeyが無かった場合は **undefined** が返ります。  

*Returns a Key with a specified number.*  
*Keys are stored in the order in which they were added, and you can retrieve a Key by specifying its number.*  
*If a Key is deleted, the order will be packed.*  
*If there is no key with the specified number, **undefined** will be returned.*  

例 example
```JavaScript
idx = new indexStorage();
key = await idx.key(0);  
console.log(key);
```

----

### setItem
指定したKeyに、指定した値を保存します。  
成功した場合は **true** が、失敗した場合は **false** が返ります。  

*Saves the specified value in the specified Key.*  
*It will return **true** on success, **false** on failure.*  

例 example
```JavaScript
idx = new indexStorage();
ret = await idx.setItem("foo", "bar");  
if (ret) {
  console.log("done");
} else {
  console.log("failure");
}
```

----

### getItem
指定したKeyの値が返ります。  
エラーが起きた場合や、存在しないキーを指定場合は **undefined** が返ります。  

*Returns the value of the specified Key.*  
*If an error occurs, or if a non-existent key is specified, **undefined** will be returned.*  

例 example
```JavaScript
idx = new indexStorage();
ret = await idx.getItem("foo");  
console.log(ret);
```

----

### removeItem
指定したKeyを削除します。  
成功した場合は **true** が、失敗した場合は **false** が返ります。  

*Deletes the specified Key.*
*It will return **true** on success, **false** on failure.*  

例 example
```JavaScript
idx = new indexStorage();
ret = await idx.removeItem("foo");  
if (ret) {
  console.log("done");
} else {
  console.log("failure");
}
```

----

### clear
実行したアプリケーションで使用していた、indexStorage用のデータベースを削除します。  
独自に作成したIndexedDBのデータベースは削除されません。  
成功した場合は **true** が、失敗した場合は **false** が返ります。  
次にいづれかのメソッドを呼び出した時に、データベースとデータストアは作成されます。  

*Deletes the database for indexStorage that was used by the executed application.*  
*Databases that were not created by indexStorade will not be deleted.*  
*It will return **true** on success, **false** on failure.*  
*The database and data store will be created the next time one of the methods is called.*  

例 example
```JavaScript
idx = new indexStorage();
ret = await idx.clear()  
if (ret) {
  console.log("done");
} else {
  console.log("failure");
}
```
