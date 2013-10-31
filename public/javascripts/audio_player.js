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

    var create = function (source) {

      var $el          = $('<div class="player"></div>'),
          $buttonEl    = $('<button><span class="play">Play</span></button>'),
          $waveformEl  = $('<div class="waveform"></div>'),
          $playheadEl  = $('<div class="playhead" style="width: 0%;"></div>'),

      updatePlayhead = function (percentage) {
        $playheadEl.css({ width: percentage + '%' });
      },

      togglePlayingState = function () {
        $el.trigger('ubxd-player:toggle-play-state');
        var $icon = $buttonEl.find('span');
        $icon.toggleClass('pause');
        $icon.toggleClass('play');
      };

      $buttonEl.click(togglePlayingState);

      $waveformEl.append($playheadEl);
      $el.append([$buttonEl, $waveformEl]);
      $(source).after($el);

      return {
        updatePlayhead: updatePlayhead,
        el: $el
      }

    };

    return {
      create: create
    }

  })($),

  create = function (el) {
    var source = el.getElementsByTagName('audio')[0],
        model = Model.create(source),
        view = View.create(source);

    function renderAnimationFrame () {
      view.updatePlayhead(model.percentagePlayed());
      requestAnimationFrame(renderAnimationFrame);
    }

    window.onloadedmetadata = (function () {
      view.el.on('ubxd-player:toggle-play-state', model.togglePlayState);
      requestAnimationFrame(renderAnimationFrame);
    })();
  };

  return {
    create: create
  }

})(jQuery);
