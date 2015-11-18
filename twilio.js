Router.route('/');
Businesses = new Mongo.Collection('businesses');
People = new Mongo.Collection('people');
baseTwilioURL = 'http://398e8362.ngrok.com/';
phone = '';
name = '';
// 'http://habitatdev-53928.onmodulus.net'

if (Meteor.isClient) {
  Template.text.helpers({
    business: function(){
      return Businesses.find().fetch();
    }
  });
  Template.callRunnerToAccept.helpers({
    people: function(){
      return People.find().fetch();
    }
  });


  Template.callRunnerToAccept.events({
    'click #callRunner': function () {

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

  Template.text.events({
    'click #textBiz': function () {
      phone = Number($('#biz-phone').val());
      name = $('#biz-name').val();

      //we'll pass the receipt fullOrderText up as well
      Meteor.call('sendVendorText', phone, name, function(err, res){
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



//NODE CHAINING SYNTAX
// var resp = new Twilio.TwimlResponse();
// console.log(resp);
// resp.say('Welcome to Acme Customer Service!')
//     .gather({
//         timeout:'10',
//         finishOnKey:'*'
//     }, function() {
//         this.say('Hello ' + self.params.name)
//             .say('Press 1 for customer service')
//             .say('Press 2 for British customer service', { language:'en-gb' });
//     });
//
// resp.hangup();

//console.log(resp.toString());

//PHAXIO SNIPPET
// var phaxio = new Phaxio('1947109b76a280171cec9e9b3b54dc11928275c9', 'ebd16964ee5ec7bd82551ece035f689d52877b47'),
// callback = function(err,data){console.log(data);};
//
// phaxio.sendFax({
//     to: '13165555555',
//   string_data: 'Faxing from Node.js',
//   string_data_type: 'text'
// },callback);
