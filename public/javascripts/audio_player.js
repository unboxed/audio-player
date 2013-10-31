var AudioPlayer = (function ($) {

  var context = new window.webkitAudioContext(),

  Model = (function () {

    var create = function (soundSource) {
      var soundSource = soundSource,
          playState   = 0,

      isPlaying = function () {
        if (playState === 0) {
          return false;
        } else if (playState === 1) {
          return true;
        }
      },

      play = function () {
        console.log('playing');
        soundSource.play();
        playState = 1;
      },

      pause = function () {
        console.log('pausing');
        soundSource.pause();
        playState = 0;
      },

      togglePlayState = function () {
        if (isPlaying()) {
          pause();
        } else {
          play();
        }
      },

      percentagePlayed = function () {
        return (soundSource.currentTime / soundSource.duration) * 100.0;
      };

      return {
        isPlaying: isPlaying,
        percentagePlayed: percentagePlayed,
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
          $waveformEl  = $('<div class="waveform"></div>'),
          $playheadEl  = $('<div class="playhead" style="width: 0%;"></div>'),

      updatePlayhead = function (percentage) {
        $playheadEl.css({ width: percentage + '%' });
      };

      $buttonEl.click(function () {
        $el.trigger('ubxd-player:toggle-play-state');
      });

      $waveformEl.append($playheadEl);
      $el.append([$buttonEl, $waveformEl]);

      return {
        updatePlayhead: updatePlayhead,
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
    function renderAnimationFrame () {
      view.updatePlayhead(model.percentagePlayed());
      requestAnimationFrame(renderAnimationFrame);
    }
    requestAnimationFrame(renderAnimationFrame);
  };

  return {
    create: create
  }

})(jQuery);
