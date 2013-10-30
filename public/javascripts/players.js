document.addEventListener('DOMContentLoaded', function () {

  var players = $('.ubxd-player');

  for (var i=0; i < players.length; i++) {
    AudioPlayer.create(players[i]);
  }

});
