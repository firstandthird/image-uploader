(function($) {

  $.declare('fileUploader', {
    defaults: {
      action: window.location.href,
      method: 'POST',
      postKey: 'image',
      progressTemplate: '<div class="progress">Uploading...</div>',
      completeTemplateImage: '<img/>',
      completeTemplateOther: '<p>The file has been uploaded &#x2714;</p>',
      images: ['jpg', 'png', 'bmp', 'gif', 'jpeg'],
      allow: [],
      processData: null,
      zIndex: 2,
      dropZone: 'this',
      updateProgress: function(event) {}
    },

    init: function() {
      this.supportsFileApi = (typeof window.FileReader !== 'undefined');

      this.el.css('cursor', 'pointer');

      this.setupFramejax();

      if (this.supportsFileApi) {
        this.setupFileApi();
      }
    },

    setupFramejax: function() {
      var self = this;

      var form = $('<form/>')
        .attr({
          action: this.action,
          method: this.method,
          enctype: 'multipart/form-data'
        })
        .appendTo('body');

      var input = $('<input/>')
        .attr({
          name: this.postKey,
          type: 'file'
        })
        .css({
          opacity: '0',
          cursor: 'pointer',
          position: 'absolute',
          zIndex: this.zIndex
        })
        .on('change', function(e) {
          var filename = e.target.value;

          if (!this.checkType(filename)) {
            alert('Please select a file with a ' + self.allow.join(', ') + ' extension');
            return;
          }

          self.el.trigger('fileSelect');
          self.showProgress();
          form.submit();
        })
        .appendTo(form);

      this.el.on('mousemove', function(e) {
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

      form
        .framejax()
        .on('complete', function(e, results) {
          self.showComplete(results);
          self.el.trigger('complete', results);
        });
    },

    checkType: function(file) {
      return !this.allow.length || $.inArray(this.getExtension(file), this.allow) !== -1;
    },

    setupFileApi: function() {
      var self = this;

      if (self.dropZone === 'this') {
        self.dropZone = self.el;
      } else {
        self.dropZone = $(self.dropZone);
      }

      self.dropZone.bind('dragenter, dragover', function(event){
        event.stopPropagation();
        event.preventDefault();
        event.originalEvent.dataTransfer.dropEffect = 'copy';
        self.emit('over');
      });

      self.dropZone.bind('dragleave', function() {
        self.emit('out');
      });

      self.dropZone.bind('drop', function(event) {
        event.stopPropagation();
        event.preventDefault();

        var file = event.originalEvent.dataTransfer.files[0];

        if (!self.checkType(file.name)) {
          //Probably some messaging here about filetype
          return;
        }

        self.upload(file);
      });
    },

    showProgress: function() {
      this.el.html(this.progressTemplate);
    },

    getExtension: function(file) {
      return file.split('.').pop().toLowerCase();
    },

    showComplete: function(data) {
      var extension = this.getExtension(data);
      var file = (this.processData) ? this.processData(data) : data;
      var isImage = $.inArray(extension, this.images) > -1;

      if (file) {
        if (isImage) {
          this.el
            .html(this.completeTemplateImage)
            .find('img')
            .attr('src', file);
        }
        else {
          this.el.html(this.completeTemplateOther);
        }
      }
    },

    upload: function(file) {
      var formData = new FormData();
      var self = this;
      var xhr = new XMLHttpRequest();

      formData.append('image', file);

      self.showProgress();

      xhr.open('POST', self.action, true);
      xhr.upload.onprogress = self.updateProgress;
      xhr.onload = function(event) {
        self.showComplete(this.responseText, this, event);
        self.el.trigger('complete', this.responseText);
      };

      xhr.send(formData);
    }
  });
})(window.jQuery);