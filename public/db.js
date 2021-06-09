
    //   let db;


    //   const request = window.indexedDB.open("toDoList", 1);

    //   // Create schema
    //   request.onupgradeneeded = event => {
    //     const db = event.target.result;
        
    //     // Creates an object store with a listID keypath that can be used to query on.
    //     const toDoListStore = db.createObjectStore("toDoList", {keyPath: "listID"});
    //     // Creates a statusIndex that we can query on.
    //     toDoListStore.createIndex("statusIndex", "status"); 
    //   }

    //   // Opens a transaction, accesses the toDoList objectStore and statusIndex.
    //   request.onsuccess = () => {
    //     const db = request.result;
    //     const transaction = db.transaction(["toDoList"], "readwrite");
    //     const toDoListStore = transaction.objectStore("toDoList");
    //     const statusIndex = toDoListStore.index("statusIndex");
  
    //     // Adds data to our objectStore
    //     toDoListStore.add({ listID: "1", status: "complete" });
    //     toDoListStore.add({ listID: "2", status: "in-progress" });
    //     toDoListStore.add({ listID: "3", status: "complete" });
    //     toDoListStore.add({ listID: "4", status: "backlog" });
       
    //     // Return an item by keyPath
    //     const getRequest = toDoListStore.get("1");
    //     getRequest.onsuccess = () => {
    //       console.log(getRequest.result);
    //     };

    //     // Return an item by index
    //     const getRequestIdx = statusIndex.getAll("complete");
    //     getRequestIdx.onsuccess = () => {
    //       console.log(getRequestIdx.result); 
    //     }; 
    //   };


      let db;
// create a new db request for a "budget" database.
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
  // create object store called "pending" and set autoIncrement to true
  let db = event.target.result;
  db.createObjectStore('pending', { autoIncrement: true });
  store.clear();
};

request.onsuccess = function(event) {
  db = event.target.result;

  // check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log(`Whoops! ${event.target.errorCode}`);
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(['pending'], 'readwrite');

  // access your pending object store
  const store = transaction.objectStore('pending');

  // add record to your store with add method.
  store.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db
  const transaction = db.transaction(['pending'], 'readwrite');
  // access your pending object store
  const store = transaction.objectStore('pending');
  // get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(['pending'], 'readwrite');

          // access your pending object store
          const store = transaction.objectStore('pending');

          // clear all items in your store
          store.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);