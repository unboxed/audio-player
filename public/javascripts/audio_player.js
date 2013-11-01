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
          $waveformCanvas = $('<canvas width="100%" height="100%">Just in case</canvas>'),
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
            step    = Math.floor( data.length / width ),
            ctx     = $waveformCanvas[0].getContext('2d');

        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.moveTo(0, 50);

        function stepAverage (stepArray) {
          var totalValueForStep = 0;
          for (var i=0; i<stepArray.length; i++) {
            totalValueForStep += stepArray[i];
          }
          return totalValueForStep / step;
        }
        for (var i=0; i < width; i++) {
          var firstSampleIndex = i * step,
              finalSampleIndex = firstSampleIndex + step,                   // This is the sample after the finalSampleIndex
              stepArray        = data.subarray(i * step, finalSampleIndex); // slice is non inclusive for the latter vlue - wtfjs.com

            var x = (i / width) * 100,
                y = (stepAverage(stepArray) * 3000) + 50;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      $buttonEl.click(togglePlayingState);

      $waveformEl.append($waveformCanvas, $playheadEl);
      $el.append([$buttonEl, $waveformEl]);
      $(rootEl).after($el);
      drawWaveform()

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
