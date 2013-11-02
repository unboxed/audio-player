var AudioPlayer = (function ($) {

  var context = new window.webkitAudioContext(),

  Model = (function () {

    var create = function (buffer) {
      var soundSource         = context.createBufferSource()
          soundSource.buffer  = buffer,
          playState           = 0,
          startOffset         = 0,
          startTime           = 0,

      isPlaying = function () {
        if (playState === 0) {
          return false;
        } else if (playState === 1) {
          return true;
        }
      },

      play = function () {
        console.log('playing');
        soundSource = context.createBufferSource();
        soundSource.buffer = buffer;
        soundSource.connect(context.destination);
        soundSource.start(0, startOffset % buffer.duration);
        playState = 1;
        startTime = context.currentTime;
      },

      pause = function () {
        console.log('pausing');
        soundSource.stop(0);
        playState = 0;
        startOffset += context.currentTime - startTime;
      },

      togglePlayState = function () {
        if (isPlaying()) {
          pause();
        } else {
          play();
        }
      },

      currentTime = function () {
        if (isPlaying()) {
          return (context.currentTime - startTime) + startOffset;
        }
      },

      percentagePlayed = function () {
        return (currentTime() / buffer.duration) * 100.0;
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

    var create = function (rootEl, buffer) {

      var $el             = $('<div class="player"></div>'),
          $buttonEl       = $('<button><span class="play">Play/Pause</span></button>'),
          $waveformEl     = $('<div class="waveform"></div>'),
          $waveformCanvas = $('<canvas width="200" height="80"></canvas>'),
          $playheadEl     = $('<div class="playhead" style="width: 0%;"></div>'),

      updatePlayhead = function (percentage) {
        $playheadEl.css({ width: percentage + '%' });
      },

      togglePlayingState = function () {
        $el.trigger('ubxd-player:toggle-play-state');
        var $icon = $buttonEl.find('span');
        $icon.toggleClass('pause');
        $icon.toggleClass('play');
      },

      drawWaveform = function () {
        var data    = buffer.getChannelData(0),
            width   = $waveformCanvas.width(),
            height  = $waveformCanvas.height(),
            amp     = height / 2,
            step    = Math.floor( data.length / width ),
            ctx     = $waveformCanvas[0].getContext('2d');

        ctx.fillStyle = 'white';

        for (var i=0; i < width; i++) {
          var min = 1.0;
          var max = -1.0;
          for (j=0; j<step; j++) {
              var datum = data[(i*step)+j];
              if (datum < min)
                  min = datum;
              if (datum > max)
                  max = datum;
          }

          ctx.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
        }
      },

      resizeCanvas = function () {
        $waveformCanvas.attr('width', $waveformEl.width());   //max width
        $waveformCanvas.attr('height', $waveformEl.height()); //max height
        drawWaveform();
      };

      $buttonEl.click(togglePlayingState);

      $waveformEl.append($waveformCanvas, $playheadEl);
      $el.append([$buttonEl, $waveformEl]);
      $(rootEl).append($el);

      $(window).resize(resizeCanvas);
      resizeCanvas();

      return {
        drawWaveform: drawWaveform,
        updatePlayhead: updatePlayhead,
        el: $el
      }

    };

    return {
      create: create
    }

  })($),

  Controller = (function () {

    var create = function (source, model, view) {
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

  })(),

  requestError = function () {
    console.log('An error occurred requesting the audio file. We are sorry but this broke stuff!');
  },

  requestAndDecodeSource = function (uri, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', uri, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
      context.decodeAudioData(request.response, callback, requestError);
    }
    request.send();
  },

  create = function (el) {
    requestAndDecodeSource(el.getAttribute('data-source'), function (buffer) {
      var model       = Model.create(buffer),
          view        = View.create(el, buffer),
          controller  = Controller.create(buffer, model, view);
    });
  };

  return {
    create: create
  }

})(jQuery);
