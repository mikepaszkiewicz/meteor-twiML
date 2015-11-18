Router.route('/sms/', {
  where: 'server',
  action: function() {
    var textResponse = this.request.query.Body;
    //remove +1 from beginning of sender's phone in request
    var userPhone = this.request.query.From.substr(2);
    var userObj = People.findOne({phone: userPhone});

    //if it's a vendor, grab company info
    if(_.contains(userObj.roles, 'vendor')){
      var bizObj = Businesses.findOne({_id: userObj.bizId});
      handleVendorResponse(userObj, bizObj, textResponse, function(err, res){
        if(err){
          console.log(err);
        }
      });
    }


    var xml = '<Response><Sms>Thank you for submitting your question!</Sms></Response>';
    this.response.writeHead(200, {'Content-Type': 'text/xml'});
    this.response.end(xml);
  }
});

function handleVendorResponse(userObj, bizObj, textResponse){
  console.log('handling vendor response');
  var acceptedResponses = ["1", "0", "open", "close", "help"];
  if(!_.contains(acceptedResponses, textResponse)){
    return false;
  }
}
