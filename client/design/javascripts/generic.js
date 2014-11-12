(function() {

  this.Theme = (function() {

    function Theme() {}

    Theme.colors = {
      darkGreen: "#779148",
      red: "#C75D5D",
      green: "#96c877",
      blue: "#6e97aa",
      orange: "#ff9f01",
      gray: "#6B787F",
      lightBlue: "#D4E5DE"
    };

    return Theme;

  })();

  $(function() {
    var gauges;
    $('.icheck').iCheck({
      checkboxClass: 'icheckbox_flat-aero',
      radioClass: 'iradio_flat-aero'
    });
    $.uniform.defaults.fileButtonHtml = '+';
    $.uniform.defaults.selectAutoWidth = false;
    $(".sparkline").each(function() {
      var barSpacing, barWidth, color, height;
      color = $(this).attr("data-color") || "red";
      height = "18px";
      if ($(this).hasClass("big")) {
        barWidth = "5px";
        barSpacing = "2px";
        height = "30px";
      }
      return $(this).sparkline("html", {
        type: "bar",
        barColor: Theme.colors[color],
        height: height,
        barWidth: barWidth,
        barSpacing: barSpacing,
        zeroAxis: false
      });
    });
    $('.tip, [rel=tooltip]').tooltip({
      gravity: 'n',
      fade: true,
      html: true
    });
    $("[data-percent]").each(function() {
      return $(this).css({
        width: "" + ($(this).attr("data-percent")) + "%"
      });
    });
    $('.datepicker').datepicker({
      todayBtn: true
    });
    $('.tags').tagsInput({
      width: '100%'
    });
    $("form.validatable").validationEngine({
      promptPosition: "topLeft"
    });
    $(".chzn-select").select2();
    $('.textarea-html5').wysihtml5({
      "font-styles": true,
      "emphasis": true,
      "lists": true,
      "html": false,
      "link": true,
      "image": true,
      "color": false,
      stylesheets: false
    });
    $.extend($.fn.dataTableExt.oStdClasses, {
      "sWrapper": "dataTables_wrapper form-inline"
    });
    $(".dTable").dataTable({
      bJQueryUI: false,
      bAutoWidth: false,
      sPaginationType: "full_numbers",
      sDom: "<\"table-header\"fl>t<\"table-footer\"ip>"
    });
    $(".dTable-small").dataTable({
      iDisplayLength: 5,
      bJQueryUI: false,
      bAutoWidth: false,
      sPaginationType: "full_numbers",
      sDom: "<\"table-header\"fl>t<\"table-footer\"ip>"
    });
    $("select.uniform, input:file, .dataTables_length select").uniform();
    $(".core-animate-bars .box-toolbar a").click(function(e) {
      e.preventDefault();
      return $(this).closest(".core-animate-bars").find(".progress .tip").each(function() {
        var percent, randomNumber;
        randomNumber = Math.floor(Math.random() * 80) + 20;
        percent = "" + randomNumber + "%";
        return $(this).attr("title", percent).attr("data-percent", randomNumber).attr("data-original-title", percent).css({
          width: percent
        });
      });
    });
    $(".normal-slider").slider();
    $(".ranged-slider-ui.normal").slider({
      range: true,
      min: 0,
      max: 300,
      values: [40, 250]
    });
    $(".ranged-slider-ui.only-min").slider({
      range: "min",
      min: 0,
      max: 300,
      value: 40
    });
    $(".ranged-slider-ui.only-max").slider({
      range: "max",
      min: 0,
      max: 300,
      value: 240
    });
    $(".ranged-slider-ui.step").slider({
      range: "min",
      min: 20,
      max: 120,
      value: 40,
      step: 20,
      slide: function(event, ui) {
        return $(".upload-max-size").html("" + ui.value + " MB");
      }
    });
    $(".ranged-slider-ui.vertical-bars span").each(function() {
      var val;
      val = parseInt($(this).text(), 10);
      return $(this).empty().slider({
        value: val,
        range: "min",
        animate: true,
        orientation: "vertical"
      });
    });
    $(".iButton-icons").iButton({
      labelOn: "<i class='icon-ok'></i>",
      labelOff: "<i class='icon-remove'></i>",
      handleWidth: 30
    });
    $(".iButton-enabled").iButton({
      labelOn: "ENABLED",
      labelOff: "DISABLED",
      handleWidth: 30
    });
    $(".iButton").iButton();
    $(".iButton-icons-tab").each(function() {
      if ($(this).is(":visible")) {
        return $(this).iButton({
          labelOn: "<i class='icon-ok'></i>",
          labelOff: "<i class='icon-remove'></i>",
          handleWidth: 30
        });
      }
    });
    $('[data-toggle="tab"]').on('shown', function(e) {
      var id;
      id = $(e.target).attr("href");
      return $(id).find(".iButton-icons-tab").iButton({
        labelOn: "<i class='icon-ok'></i>",
        labelOff: "<i class='icon-remove'></i>",
        handleWidth: 30
      });
    });
    $('#thumbs a').touchTouch();
    $(".toggle-primary-sidebar").click(function(e) {
      return $.sparkline_display_visible();
    });
    $("#switch-sidebar").click(function() {
      return $('body').toggleClass('dropdown-sidebar');
    });
    $(".closable-chat-box textarea").click(function() {
      $(this).closest(".closable-chat-box").addClass("open");
      return $(this).wysihtml5({
        "font-styles": true,
        "emphasis": true,
        "lists": true,
        "html": false,
        "link": true,
        "image": true,
        "color": false,
        stylesheets: false
      });
    });
    gauges = [];
    $(".justgage").each(function() {
      var gaugeWidthScale, refreshAnimationType, showMinMax;
      showMinMax = $(this).attr("data-labels") || true;
      gaugeWidthScale = $(this).attr("data-gauge-width-scale") || 1;
      refreshAnimationType = $(this).attr("data-animation-type") || "linear";
      return gauges.push(new JustGage({
        id: $(this).attr("id"),
        min: 0,
        max: 100,
        title: $(this).attr("data-title"),
        value: getRandomInt(1, 80),
        label: "",
        levelColorsGradient: false,
        showMinMax: showMinMax,
        gaugeWidthScale: gaugeWidthScale,
        startAnimationTime: 1000,
        startAnimationType: ">",
        refreshAnimationTime: 1000,
        refreshAnimationType: refreshAnimationType,
        levelColors: [Theme.colors.green, Theme.colors.orange, Theme.colors.red]
      }));
    });
    setInterval(function() {
      return $(gauges).each(function() {
        return this.refresh(getRandomInt(0, 80));
      });
    }, 2500);
    $(".easy-pie-chart").each(function() {
      var el;
      el = $(this);
      return $(this).easyPieChart({
        lineWidth: 10,
        size: 150,
        lineCap: "square",
        barColor: Theme.colors[el.data("color")] || Theme.colors.red,
        scaleColor: Theme.colors.gray,
        animate: 1000
      });
    });
    $(".easy-pie-chart-small").each(function() {
      var el;
      el = $(this);
      return $(this).easyPieChart({
        lineWidth: 4,
        size: 40,
        lineCap: "square",
        barColor: Theme.colors[el.attr("data-color")] || Theme.colors.red,
        animate: 1000
      });
    });
    $(".easy-pie-chart-percent").easyPieChart({
      animate: 1000,
      trackColor: "#444",
      scaleColor: "#444",
      lineCap: 'square',
      lineWidth: 15,
      size: 150,
      barColor: function(percent) {
        return "rgb(" + Math.round(200 * percent / 100) + ", " + Math.round(200 * (1 - percent / 100)) + ", 0)";
      }
    });
    return setInterval(function() {
      return $(".easy-pie-chart, .easy-pie-chart-percent").each(function() {
        var val;
        val = getRandomInt(0, 80);
        $(this).data("easyPieChart").update(val);
        return $(this).find("span").text("" + val + "%");
      });
    }, 2500);
  });

}).call(this);
