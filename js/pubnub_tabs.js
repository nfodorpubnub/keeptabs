const messagesTop = document.getElementById('messages-top');
const updateText = document.getElementById('update-text');
const sendButton = document.getElementById('publish-button');
sendButton.addEventListener('click', () => {submitUpdate(theEntry, updateText.value)});

const theChannel = 'the_guide';
const theEntry = 'Earth';
console.log("Calling new PubNub..." )
var pubnub;

console.log("Called new PubNub..." )
document.addEventListener("visibilitychange", function() {

  //If tab away we dispose the pubnub object
  if (document.hidden){
    console.log("Browser tab is hidden " )
    if (pubnub){
      pubnub.disconnect;
      console.log("PubNub dispose() called." )
    }

    //If tabbing in we create the pubnub object
  } else {
    console.log("Browser tab is visible " )
    pubnub = new PubNub({
      logVerbosity: true,
      heartbeatInterval:20,
      restore: false,
      publishKey: 'demo',
      subscribeKey: 'demo',
      uuid: "keeptabs"
    });

    pubnub.addListener({
      message: function(event) {
        displayMessage('[MESSAGE: received]',
          event.message.entry + ': ' + event.message.update);
      },
      presence: function(event) {
        displayMessage('[PRESENCE: ' + event.action + ']',
          'uuid: ' + event.uuid + ', channel: ' + event.channel);
      },
      status: function(event) {
        displayMessage('[STATUS: ' + event.category + ']',
          'connected to channels: ' + event.affectedChannels);

        if (event.category == 'PNConnectedCategory') {
          submitUpdate(theEntry, 'Harmless.');
        }
      }
    });

    pubnub.subscribe({
      channels: ['the_guide'],
      withPresence: true
    });
  }
});


submitUpdate = function(anEntry, anUpdate) {
  if (pubnub){
    pubnub.publish({
        channel : theChannel,
        message : {'entry' : anEntry, 'update' : anUpdate}
      },
      function(status, response) {
        if (status.error) {
          console.log(status)
        }
        else {
          displayMessage('[PUBLISH: sent]',
            'timetoken: ' + response.timetoken);
        }
      });
  }

};

displayMessage = function(messageType, aMessage) {
  let pmessage = document.createElement('p');
  let br = document.createElement('br');

  messagesTop.after(pmessage);
  pmessage.appendChild(document.createTextNode(messageType));
  pmessage.appendChild(br);
  pmessage.appendChild(document.createTextNode(aMessage));
}
