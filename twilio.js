Router.route('/');
People = new Mongo.Collection('people');
Meteor.startup(function(){
  if(People.find().count() === 0){
    People.insert({name: "Alice", phone: 4433869479, acceptedOrder: 0, deniedOrder: 0});
    People.insert({name: "Bob", phone: 4433869479, acceptedOrder: 0, deniedOrder: 0});
  }
});

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
  twilio = Twilio("ACa546052edcae5ae41ba1e2931b4754f3", "39a1d4df7d98776ab7ee44d8239db778");

  Meteor.methods({
    makeCall: function(phone, name, order_1, order_2){
      console.log('phone: ' + phone + ' name: ' + name);
      var personToCall = People.findOne({name: name}).name;
      var url = 'http://habitatdev-53928.onmodulus.net/voice/' + personToCall;

      twilio.calls.create({
        to: phone, // Any number Twilio can call
        from: '+15705261709', // A number you bought from Twilio and can use for outbound communication
        url: url, // A URL that produces an XML document (TwiML) which contains instructions for the call
        statusCallback: "http://habitatdev-53928.onmodulus.net/voice_done/" + personToCall,
        statusCallbackMethod: "POST",
        statusCallbackEvent: ["completed"]
      }, function(err, responseData) {
          if(!err && !responseData.error_message){
            console.log('no error');
            return responseData;
          } else{
            return responseData;
          }
      });
    }
  });

  var xmlData;
  Router.route('/voice/:name', {
    where: 'server',
    action: function() {
      console.log('inside voice/ ' + this.params.name);

      var resp = new Twilio.TwimlResponse();

      var self = this;

      resp.say('Welcome to Acme Customer Service!')
          .gather({
              timeout:'10',
              finishOnKey:'*'
          }, function() {
              this.say('Hello ' + self.params.name)
                  .say('Press 1 for customer service')
                  .say('Press 2 for British customer service', { language:'en-gb' });
          });

      console.log(resp.toString());

      this.response.writeHead(200, {'Content-Type': 'text/xml'});
      this.response.end(resp.toString());
    }
  });
  Router.route('/voice_done/:name', {
    where: 'server',
    action: function() {
      console.log("call is completed, inside /voice_done/");
      console.log(this.request);

      if(this.request.body.Digits === 1){
        People.update({name: this.params.name}, {$inc: {acceptedOrder: 1}});
      }
      else if(this.request.body.Digits === 0){
        People.update({name: this.params.name}, {$inc: {deniedOrder: 1}});
      }

      this.response.writeHead(200);
      this.response.end();
      //get request.data and make change to order/db
    }
  });
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
