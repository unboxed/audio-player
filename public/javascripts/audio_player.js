var AudioPlayer = (function ($) {

  var context = new window.webkitAudioContext(),

  Model = (function () {

    var create = function (soundSource) {
      var soundSource = soundSource,
          isPlaying   = false,

      play = function () {
        console.log('playing');
        soundSource.play();
        isPlaying = true;
      },

      pause = function () {
        console.log('pausing');
        soundSource.pause();
        isPlaying = false;
      },

      togglePlayState = function () {
        if (isPlaying === true) {
          pause();
        } else {
          play();
        }
      };

      return {
        isPlaying: isPlaying,
        play: play,
        pause: pause,
        togglePlayState: togglePlayState
      }

    }

    return {
      create: create
    }

  })(),

  View = (function ($) {

    var create = function () {

      var $el          = $('<div class="player"></player>'),
          $buttonEl    = $('<button><span class="play">Play</span></button>'),
          $waveformEl  = $('<div class="waveform"></div>');

      $buttonEl.click(function () {
        $el.trigger('ubxd-player:toggle-play-state');
      });

      $el.append([$buttonEl, $waveformEl]);

      return {
        el: $el
      }

    };

    return {
      create: create
    }

  })($),

  create = function (source) {
    var model = Model.create(source),
        view = View.create();

    view.el.on('ubxd-player:toggle-play-state', model.togglePlayState);

    $(source).after(view.el);
  };

  return {
    create: create
  }

})(jQuery);
