import { CallClient, CallAgent, GroupCallLocator, VideoStreamRenderer, LocalVideoStream, PhoneNumberIdentifier } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

let call;
let callAgent;
let deviceManager;
let localVideoStream;
let rendererLocal;
let rendererRemote;

const apiBaseUrl = "http://127.0.0.1:5156"

const startButton = document.getElementById("start-button");
const phoneButton = document.getElementById("phone-button");
const newgroupidButton = document.getElementById("newgroupid-button");

async function initUser() {
  
  // Get a user token from the API back-end
  const response = await fetch(apiBaseUrl + "/users/token");
  var json = await response.json();
  document.getElementById("token-input").value = json.accessToken.token;
}

// Init the user
initUser();

async function startCall() {

  const token = document.getElementById("token-input").value;     // "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEwMyIsIng1dCI6Ikc5WVVVTFMwdlpLQTJUNjFGM1dzYWdCdmFMbyIsInR5cCI6IkpXVCJ9.eyJza3lwZWlkIjoiYWNzOjFmMmE5MWM2LWRlNzItNDBmOS1iMzBjLWEzYTczMGFlZDYyYl8wMDAwMDAwZS02MDQzLWQyYmEtOTliZi1hNDNhMGQwMDhiMzAiLCJzY3AiOjE3OTIsImNzaSI6IjE2Mzk2MTAxOTkiLCJleHAiOjE2Mzk2OTY1OTksImFjc1Njb3BlIjoidm9pcCIsInJlc291cmNlSWQiOiIxZjJhOTFjNi1kZTcyLTQwZjktYjMwYy1hM2E3MzBhZWQ2MmIiLCJpYXQiOjE2Mzk2MTAxOTl9.qKFthbJqBmU4A4wKyOdiXDNYQtB0JnXfeJRbhHpdawpMVbjXuKRgquzecEXPHCWUuSRgLHKAUjZDInDwOFalw1IIoWkfEau_uQoexAN2o1XUhA0NpWxFlzVmyoJZqor1Y4G5NLw1V0QyLIfjBOZ21nAKVVcYiScZbBWJRAL_SETZ3AW4-7HZgPmw080BY5TT-aRssGv6MtFpGub-dzcPPRIkShBzXxzjFKRTcBj_MvUSTmkb1SxB7yd8NXUnUj7kCqx2NXp9plz1HvmxA-t7c7zHFUwdn5aI6P7IXQgiewcsbaRd2RKYbd_hNMNBcmeBUBmZ2L9OOJLvNYJ_wktWVg";
  const groupId = document.getElementById("groupId-input").value; // "f82c95e0-1bf2-49cf-a579-355337b1a25d";

  // console.log("Token: " + token);
  // console.log("Group ID: " + groupId);

  const callLocator = { groupId: groupId };

  const callClient = new CallClient();
  const tokenCredential = new AzureCommunicationTokenCredential(token);
  callAgent = await callClient.createCallAgent(tokenCredential, { displayName: 'Deaf User' });

  deviceManager = await callClient.getDeviceManager();

  const videoDevices = await deviceManager.getCameras();
  const videoDeviceInfo = videoDevices[0];
  localVideoStream = new LocalVideoStream(videoDeviceInfo);

  call = callAgent.join(callLocator, {videoOptions: {localVideoStreams:[localVideoStream]}});
  console.log(call);
  
  // placeCallOptions = {videoOptions: {localVideoStreams:[localVideoStream]}};

  localVideoView();

  // Inspect the call's current remote participants and subscribe to them.
  call.remoteParticipants.forEach(remoteParticipant => {
    subscribeToParticipantVideoStreams(remoteParticipant);
  });

  call.on('remoteParticipantsUpdated', e => {

    console.log("remoteParticipantsUpdated");

    // Subscribe to new remote participants that are added to the call.
    e.added.forEach(remoteParticipant => {
      subscribeToParticipantVideoStreams(remoteParticipant);
    });

    // Unsubscribe from participants that are removed from the call
    e.removed.forEach(remoteParticipant => {
        console.log('Remote participant removed from the call.');
    })
  });
}

async function addTargetPhone() {

  var targetParticipant = { phoneNumber: "+13038888500" };
  var xxx = call.addParticipant(targetParticipant, { alternateCallerId: {phoneNumber: '+17207986084'}});
  console.log(xxx);
}

startButton.addEventListener("click", async () => startCall());

newgroupidButton.addEventListener("click", async () => {
  
  // Get a user token from the API back-end
  const response = await fetch(apiBaseUrl + "/meeting/id");
  var json = await response.json();
  document.getElementById("groupId-input").value = json.id;
});

phoneButton.addEventListener("click", async () => addTargetPhone());

async function localVideoView() {
  rendererLocal = new VideoStreamRenderer(localVideoStream);
  const view = await rendererLocal.createView();
  document.getElementById("myVideo").appendChild(view.target);
}

function subscribeToParticipantVideoStreams(remoteParticipant) {

  console.log("subscribeToParticipantVideoStreams");

  remoteParticipant.on('videoStreamsUpdated', e => {
    e.added.forEach(v => {
      handleVideoStream(v);
    })
  });

  remoteParticipant.videoStreams.forEach(v => {
    handleVideoStream(v);
  });
}

function handleVideoStream(remoteVideoStream) {

  // console.log("handleVideoStream");
  console.log(remoteVideoStream);

  remoteVideoStream.on('isAvailableChanged', async () => {

    if (remoteVideoStream.isAvailable) {
        remoteVideoView(remoteVideoStream);
    } else {
        rendererRemote.dispose();
    }
  });

  if (remoteVideoStream.isAvailable) {
    remoteVideoView(remoteVideoStream);
  }
}

async function remoteVideoView(remoteVideoStream) {

  console.log("remoteVideoView");

  rendererRemote = new VideoStreamRenderer(remoteVideoStream);
  const view = await rendererRemote.createView();

  document.getElementById("remoteVideo").appendChild(view.target);
}