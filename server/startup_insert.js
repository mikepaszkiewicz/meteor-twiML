Meteor.startup(function(){
  // People.remove({name: {$in: ['Alice', 'Bob', 'dingus']}}, {multi: true})
    People.remove({});
    Businesses.remove({});

    Businesses.insert({
    "_id" : "qHJ3mBopXZ5vJi7fq",
    "name" : "A",
    "phone" : 4433869479.0000000000000000,
    "acceptedOrder" : 0,
    "deniedOrder" : 0
  });



    People.insert({
    "_id" : "LzpYkKbrvnjDLmjzH",
    "name" : "Alice",
    "phone" : "4433869479",
    "acceptedOrder" : 0,
    "deniedOrder" : 0,
    "roles" : [
        "vendor"
    ],
    "bizId" : "qHJ3mBopXZ5vJi7fq"
    });
});
