/*!
 * image-uploader - jQuery image upload plugin
 * v0.3.4
 * https://github.com/jgallen23/image-uploader/
 * copyright Greg Allen 2013
 * MIT License
*/
/*!
 * framejax - jQuery plugin to submit multipart forms through an iframe
 * v0.2.2
 * https://github.com/jgallen23/framejax/
 * copyright Greg Allen 2013
 * MIT License
*/
(function($) {
  var lastId = 0;
  var createiFrame = function(id) {
    return $('<iframe name="'+id+'" />')
      .attr({
        id: id,
        name: id,
        width: 0,
        height: 0
      })
      .css('display', 'none')
      .appendTo('body');
  };

  $.fn.framejax = function(opts) {
    return this.each(function() {
      var el = $(this);
      if (el[0].tagName != 'FORM')
        throw new Error('all selectors must be form tags');

      var submit = function() {
        var id = '__framejax__' + lastId++;
        var iframe = createiFrame(id);

        iframe.on('load', function() {
          var results = $(this).contents().find('body').html();
          el.trigger('complete', results);
          //cleanup
          iframe.remove();
        });

        el.attr('target', id);
      };

      el.on('submit', submit);
      el.on('framejaxSubmit', submit);
    });
  };
})(window.jQuery);

(function($) {

  $.fn.imageUploader = function(opts) {

    opts = $.extend({}, $.fn.imageUploader.defaults, opts);

    return this.each(function() {
      var el = $(this);

      var showProgress = function() {
        el.html(opts.progressTemplate);
      };

      var showComplete = function(data) {
        var img = (opts.processData) ? opts.processData(data) : data;
        if (!img) {
          return;
        }
        el
          .html(opts.completeTemplate)
          .find('img')
            .attr('src', img);
      };

      el.css('cursor', 'pointer');

      var form = $('<form/>')
        .attr({
          action: opts.action,
          method: opts.method,
          enctype: 'multipart/form-data'
        })
        .appendTo('body');

      var input = $('<input/>')
        .attr({
          name: opts.postKey,
          type: 'file'
        })
        .css({
          opacity: '0',
          cursor: 'pointer',
          position: 'absolute',
          zIndex: opts.zIndex
        })
        .on('change', function(e) {
          var filename = e.target.value;
          var ext = filename.split('.').pop().toLowerCase();  
          if ($.inArray(ext, opts.allow) == -1) {
            alert('Please select a photo with a ' + opts.allow.join(', ') + ' extension');
            return;
          }

          el.trigger('fileSelect');
          showProgress();
          form.submit();
        })
        .appendTo(form);

      form
        .framejax()
        .on('complete', function(e, results) {
          showComplete(results);
          el.trigger('complete', results);
        });

      el.on('mousemove', function(e) {
        var h = input.height();
        var w = input.width();
        if (typeof e.pageY == 'undefined' && typeof e.clientX == 'number' && document.documentElement) {
          e.pageX = e.clientX + document.documentElement.scrollLeft;
          e.pageY = e.clientY + document.documentElement.scrollTop;
        }
        input.css({
          top: e.pageY - (h / 2),
          left: e.pageX - (w - 30)
        });
      });
    });

  };

  $.fn.imageUploader.defaults = {
    action: window.location.href,
    method: 'POST',
    postKey: 'image',
    progressTemplate: '<div class="progress">Uploading...</div>',
    completeTemplate: '<img/>',
    allow: ['jpg', 'png', 'bmp', 'gif', 'jpeg'],
    processData: null,
    zIndex: 2
  };

})(window.jQuery);