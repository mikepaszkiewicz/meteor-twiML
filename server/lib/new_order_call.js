var xmlData;
Router.route('/voice/:name', {
  where: 'server',
  action: function() {
    //self only needed if using node chaining syntax
    var self = this;
    var xml = {};
    var xmlResponse = '';

    //create twiML response document.
    xml.head = "<?xml version='1.0' encoding='UTF-8'?>";
    xml.greet =  "<Response><Say>Yo " + this.params.name + ',' + "there's a new order on Habitat!</Say>";

    var routeOnFinish = baseTwilioURL + 'voice_done/' + this.params.name;
    //notice the extra single quotes, need them or else URL doesn't interpret correctly
    xml.gather = "<Gather action= '" + routeOnFinish + "' finishOnKey='*'>";

    xml.prompt =   "<Say>Press 1 to accept, or 0 to decline. Then, press star.</Say>";
    xml.end =    "</Gather></Response>";
    //end twilio response

    //loop through XMLObj and concatenate
    for (var key in xml) {
        xmlResponse += xml[key];
    }

    //
    this.response.writeHead(200, {'Content-Type': 'text/xml'});
    this.response.end(xmlResponse);
  }
});

Router.route('/voice_done/:name', {
  where: 'server',
  action: function() {
    //store what string of digits customer digits as number
    var digits = Number(this.request.body.Digits);
    var xml = "<?xml version='1.0' encoding='UTF-8'?><Response><Say>Thank you" + this.params.name + "</Say><Hangup/></Response>";

    //parse digit response and do stuff...
    if(digits === 1){
      console.log('updating to accepted');
      People.update({name: this.params.name}, {$inc: {acceptedOrder: 1}}, {multi: true});
    }
    else if(digits === 0){
      console.log('updating to denied');
      People.update({name: this.params.name}, {$inc: {deniedOrder: 1}}, {multi: true});
    }

    //Twilio always needs a response content-type
    this.response.writeHead(200, {'Content-Type': 'text/xml'});
    this.response.end(xml);
  }
});
