(function() {

  this.Growl = (function() {

    function Growl() {}

    Growl.info = function(options) {
      options['class_name'] = "info";
      options.title = "<i class='icon-info-sign'></i> " + options.title;
      return $.gritter.add(options);
    };

    Growl.warn = function(options) {
      options['class_name'] = "warn";
      options.title = "<i class='icon-warning-sign'></i> " + options.title;
      return $.gritter.add(options);
    };

    Growl.error = function(options) {
      options['class_name'] = "error";
      options.title = "<i class='icon-exclamation-sign'></i> " + options.title;
      return $.gritter.add(options);
    };

    Growl.success = function(options) {
      options['class_name'] = "success";
      options.title = "<i class='icon-ok-sign'></i> " + options.title;
      return $.gritter.add(options);
    };

    return Growl;

  })();

  $(function() {
    $.extend($.gritter.options, {
      position: 'top-right'
    });
    $(".growl-info").click(function(e) {
      e.preventDefault();
      return Growl.info({
        title: 'This is a notice!',
        text: 'This will fade out after a certain amount of time.'
      });
    });
    $(".growl-warn").click(function(e) {
      e.preventDefault();
      return Growl.warn({
        title: 'This is a warning!',
        text: 'This will fade out after a certain amount of time.'
      });
    });
    $(".growl-error").click(function(e) {
      e.preventDefault();
      return Growl.error({
        title: 'This is an error!',
        text: 'This will fade out after a certain amount of time.'
      });
    });
    return $(".growl-success").click(function(e) {
      e.preventDefault();
      return Growl.success({
        title: 'This is a success message!',
        text: 'This will fade out after a certain amount of time.'
      });
    });
  });

}).call(this);
