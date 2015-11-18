twilio = Twilio("ACa546052edcae5ae41ba1e2931b4754f3", "39a1d4df7d98776ab7ee44d8239db778");

Meteor.methods({
  makeCall: function(phone, name, order_1, order_2){
    console.log('phone: ' + phone + ' name: ' + name);
    var personToCall = People.findOne({name: name}).name;
    var url = baseTwilioURL + 'voice/' + personToCall;

    twilio.calls.create({
      to: phone,
      from: '+15705261709',
      url: url //url that serves twiML doc
    }, function(err, responseData) {
        if(!err && !responseData.error_message){
          console.log('no error');
          return responseData;
        } else{
          return responseData;
        }
    });
  },

  sendVendorText: function(phone, name){
    var bizToText = Businesses.findOne({name: name}).name;
    var url = baseTwilioURL + 'sms/' + bizToText;

    twilio.messages.create({
      to: Number(phone), // Any number Twilio can deliver to
      from: 5705261709, // A number you bought from Twilio and can use for outbound communication
      body: "This is the full order text" // body of the SMS message
      },
      function(err, responseData) {
        var textObj = responseData;
        if (!err) {
          console.log(responseData);
          console.log(responseData.body);
        }
        else{
          console.log("twilio error" + err);
          console.log("twilio error" + err.message);
        }
      }
    );
  }
});
