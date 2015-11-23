twilio = Twilio("ACa546052edcae5ae41ba1e2931b4754f3", "39a1d4df7d98776ab7ee44d8239db778");

Router.route('/sms/', {
  where: 'server',
  action: function() {
    console.log('sms route');
    var textResponse = this.request.query.Body;
    //remove +1 from beginning of sender's phone in request
    var userPhone = this.request.query.From.substr(2);
    var userObj = People.findOne({phone: userPhone});

//NON-USERS
    if(!userObj){
      xml = '<Response><Sms>Your campus favorites, delivered. Visit tryhabitat.com to learn more</Sms></Response>';
      this.response.writeHead(200, {'Content-Type': 'text/xml'});
      return this.response.end(xml);
    }

//VENDORS
    else if (_.contains(userObj.roles, 'vendor')){
      var bizObj = Businesses.findOne({_id: userObj.bizId});
      console.log('handling vendor response');
      var acceptedResponses = ["1", "0", "open", "Open", "close", "Close", "helpme", "Helpme"];

      /////
      //text method response is invalid
      if(!_.contains(acceptedResponses, textResponse)){
        xml = '<Response><Sms>Sorry, ' + bizObj.name +  '! This response is invalid. Respond helpme to get deets...</Sms></Response>';
        this.response.writeHead(200, {'Content-Type': 'text/xml'});
        return this.response.end(xml);
      }

      /////
      //i have no fucking idea whats going on for some reason
      else if(textResponse == 'helpme') {
        // var resp = new Twilio.TwimlResponse();
        // resp.sms("Text 0 to decline\nText 1 to accept \nText 'open' or 'close' to start and stop receiving orders\nCall support at: 4433869479 ");
        xml = "<Response><Sms>Text 0 to decline\nText 1 to accept \nText 'open' or 'close' to start and stop receiving orders\nCall support at: 4433869479 </Sms></Response>";
        this.response.writeHead(200, {'Content-Type': 'text/xml'});
        return this.response.end(xml);
      }

      /////
      //order declined, set txStatus declined, check for any other orders pending for this biz.
      //If another order is pending, send text and repeat until all vendor pending with this bizId are accounted for
      else if (textResponse == '0'){
          xml = "<Response><Sms>Order declined, if you are too busy, text back 'close' to stop receiving orders</Sms></Response>";
          this.response.writeHead(200, {'Content-Type': 'text/xml'});
          return this.response.end(xml);
      }

      /////
      //order accepted, set status to 7 and run the 'accept for vendor' click event methods to ping runner
      else if (textResponse == '1') {
          xml = "<Response><Sms>'Order accepted, thanks!'</Sms></Response>";
          this.response.writeHead(200, {'Content-Type': 'text/xml'});
          return this.response.end(xml);
      }
//END VENDOR

//REGISTERED USERS
    } else {
      //Check if they have any active orders, send relevant info about tx
      var usersActiveOrders = transactions.findOne({buyerId: userObj._id, status: {$in: [0, 1, 7]}}, {$orderby: {timeRequested: -1}});
      if(usersActiveOrders) {
        xml = "<Response><Sms>Yo " + userObj.profile.fn + ". Here is your current transaction information</Sms></Response>";
        this.response.writeHead(200, {'Content-Type': 'text/xml'});
        return this.response.end(xml);
      } else {
        xml = "<Response><Sms>Yo " + userObj.profile.fn + ". Got nothin for you...</Sms></Response>";
        this.response.writeHead(200, {'Content-Type': 'text/xml'});
        return this.response.end(xml);
      }

    }
  }
});
