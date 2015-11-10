Router.route('/');
People = new Mongo.Collection('people');
if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      var phone,
          name;
      Session.set('counter', Session.get('counter') + 1);
      phone = Number($('#phone').val());
      name = $('#name').val();

      Meteor.call('makeCall', phone, name, function(err, res){
        if(!err){
          console.log(err + res);
          alert('message sent');
        } else {
          console.log(err + res);
        }
      });
    }
  });
}

if (Meteor.isServer) {
  if(People.find().count() === 0){
    People.insert({name: "Alice", phone: 4433869479, acceptedOrder: 0, deniedOrder: 0});
    People.insert({name: "Bob", phone: 4433869479, acceptedOrder: 0, deniedOrder: 0});
  }

  var xmlData;
  Router.route('/voice/:name', {
    where: 'server',
    action: function() {
      console.log(this.request);
      console.log(this.params.name);
      xmlData = "<?xml version='1.0' encoding='UTF-8'?><Response><Say voice='alice' loop='1'> Hello " + this.params.name + "A new order has been placed on Habitat. Check your text message for the order receipt. Thanks!</Say><Gather timeout='10' finishOnKey='*'><Say>Please press zero to accept the order, or one to accept. Then, press star. Thank you!</Say></Gather><Hangup/></Response>";

      this.response.writeHead(200, {'Content-Type': 'text/xml'});
      this.response.end(xmlData);
    }
  });
  Router.route('/voice_done/:name', {
    where: 'server',
    action: function() {
      console.log("call is completed, inside /voice_done/");
      console.log(this.request.digits);

      if(this.request.digits === 1){
        People.update({name: this.params.name}, {$set: {status: 7}});
      }
      else if(this.request.digits === 0){
        People.update({name: this.params.name}, {$set: {status: null}});
      }
      //call twiliiso results api with call SID - save to db/whatever

      // var Phaxio = require('phaxio'),
      // phaxio = new Phaxio('1947109b76a280171cec9e9b3b54dc11928275c9', 'ebd16964ee5ec7bd82551ece035f689d52877b47'),
      // callback = function(err,data){console.log(data);};
      //
      // phaxio.sendFax({
      //     to: '13165555555',
      //   string_data: 'Faxing from Node.js',
      //   string_data_type: 'text'
      // },callback);

      this.response.writeHead(200);
      this.response.end();
      //get request.data and make change to order/db
    }
  });

  Meteor.methods({
    makeCall: function(phone, name, order_1, order_2){
      twilio = Twilio("ACa546052edcae5ae41ba1e2931b4754f3", "39a1d4df7d98776ab7ee44d8239db778");
      var personToCall = People.findOne({name: name}).name;
      var url = 'http://habitatsite-53222.onmodulus.net/voice/' + personToCall;

      twilio.calls.create({
        to: phone, // Any number Twilio can call
        from: '+15705261709', // A number you bought from Twilio and can use for outbound communication
        url: url, // A URL that produces an XML document (TwiML) which contains instructions for the call
        statusCallback: "http://habitatsite-53222.onmodulus.net/voice_done/_id",
        statusCallbackMethod: "POST",
        statusCallbackEvent: ["completed"]
      }, function(err, responseData) {
          if(!err && !responseData.error_message){
            console.log(responseData); // outputs "+14506667788"
            return responseData;
          } else{
            console.log(responseData);
            return responseData;
          }
      });
    }
  });
}
