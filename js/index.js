var myDataRef = firebase.database();
var latestSnapshot = null;
var count = 0;
var mentor = {};
var mentee = {};

function grabSnapShot() {  
  myDataRef.ref().once('value').then(function(snapshot) {
    latestSnapshot = snapshot.val();
  });
}

$('.button').click(function() {
  var name = $('.' + this.id + '-text').val();
  $('.' + this.id + '-text').val('');
  testUser(this.id, name);
});

function testUser(id, name) {
  console.log(id + name);
  var points = findPoints(name);
  if (points > 200 && id == 'mentor') {
    sendToFirebase(id, name, points);
  } else if (id == 'mentee') {
    sendToFirebase(id, name, points);
  } else {
    alert("Sorry, you don't have the points to be a mentor yet, keep working!");
  }
}

function sendToFirebase(id, name, points) {
  var arr = {};
  arr[name] = points;
  myDataRef.ref(id + '/').push(arr);
  findBuddy(id, name, points);
}

function findBuddy(id, name, points) {
  if (id == 'mentee') {
    var neededPoints = roundUp(points, 0.01);
    findMentor(name, neededPoints)
  }
}

function findPoints(user) {
  var smallerText = '';
  $.ajax({
    async: false,
    url: "https://www.freecodecamp.com/" + user,
    dataType: 'text',
    success: function(data) {
      var elements = $("<h1>").html(data);
      var bigText = elements['0'].textContent;
      var startSpot = bigText.indexOf('[ ') + 2;
      var endSpot = bigText.indexOf(' ]', startSpot);
      smallerText = parseInt(bigText.substring(startSpot, endSpot));
    }
  });
  return smallerText;
}

function roundUp(num, precision) {
  return Math.ceil(num * precision) / precision
}

function findMentor(name, neededPoints) {
  grabSnapShot();
  myDataRef.ref('mentor' + '/').once('value').then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var placeHolder = childSnapshot.val()
      for (keys in placeHolder) {
        var mentorPoints = placeHolder[keys];
        if (mentorPoints > neededPoints) {
          foundMentor(name, childSnapshot.val(), neededPoints)
        }
      }
    });
  });
}

function foundMentor(mentee, mentor, goal) {
  var mentorName = Object.keys(mentor)[0];
  alert(mentee + "! We found you a mentor! Their name is " + mentorName + ". and they are gonna help you till you have " + goal + " brownie points. Best place to find them is on gitter, start a one on one chat with them and go from there.");
}