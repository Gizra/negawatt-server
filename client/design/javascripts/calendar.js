(function() {

  $(function() {
    var d, date, m, y;
    new CalendarEvents($('#external-events'));
    date = new Date();
    d = date.getDate();
    m = date.getMonth();
    y = date.getFullYear();
    return $("#calendar").fullCalendar({
      header: {
        left: "prev,next",
        center: "title",
        right: "month,agendaWeek,agendaDay"
      },
      editable: true,
      droppable: true,
      drop: function(date, allDay) {
        var copiedEventObject, originalEventObject;
        originalEventObject = $(this).data('eventObject');
        copiedEventObject = $.extend({}, originalEventObject);
        copiedEventObject.start = date;
        copiedEventObject.allDay = allDay;
        $("#calendar").fullCalendar('renderEvent', copiedEventObject, true);
        if ($("#drop-remove").is(":checked")) {
          return $(this).remove();
        }
      },
      events: [
        {
          title: "All Day Event",
          start: new Date(y, m, 1)
        }, {
          title: "Long Event",
          start: new Date(y, m, d - 5),
          end: new Date(y, m, d - 2)
        }, {
          id: 999,
          title: "Repeating Event",
          start: new Date(y, m, d - 3, 16, 0),
          allDay: false
        }, {
          id: 999,
          title: "Repeating Event",
          start: new Date(y, m, d + 4, 16, 0),
          allDay: false
        }, {
          title: "Meeting",
          start: new Date(y, m, d, 10, 30),
          allDay: false
        }, {
          title: "Lunch",
          start: new Date(y, m, d, 12, 0),
          end: new Date(y, m, d, 14, 0),
          allDay: false
        }, {
          title: "Birthday Party",
          start: new Date(y, m, d + 1, 19, 0),
          end: new Date(y, m, d + 1, 22, 30),
          allDay: false
        }, {
          title: "Click for Google",
          start: new Date(y, m, 28),
          end: new Date(y, m, 29),
          url: "http://google.com/"
        }
      ]
    });
  });

}).call(this);
