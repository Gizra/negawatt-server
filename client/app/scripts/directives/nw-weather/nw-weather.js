'use strict';

angular.module('angular-nw-weather', ['config'])
  .constant('openweatherEndpoint', 'http://api.openweathermap.org/data/2.5/weather')
  .directive('nwWeatherTemperature', function () {
    return {
      restrict: 'EA',
      template: '<div> {{ctrlWeather.data.temperature | number:0 }}&deg; <i class="wi {{ctrlWeather.data.iconClass}}"></i></div>',
      controller: function(nwWeather, nwWeatherIcons) {
        var weather = this;

        // Request the weather data.
        nwWeather.get(this.account).then(function(response) {
          weather.data = response;
          weather.data.iconClass = nwWeatherIcons[response.icon];
        });
      },
      controllerAs: 'ctrlWeather',
      bindToController: true,
      // Isolate scope.
      scope: {
        account: '='
      }
    };
  })
  .service('nwWeather', function ($q, $http, $timeout, $state, $rootScope, Config, openweatherEndpoint, nwWeatherIcons) {
    var self = this;

    // A private cache key.
    var cache = {};

    // Promise in progress of Weather.
    var getWeather;

    // Update event broadcast name.
    var broadcastUpdateEventName = 'nwWeatherChanged';

    /**
     * Return the promise with the category list, from cache or the server.
     *
     * @param accountId - int
     *  The account ID.
     * @param categoryId - int
     *  The category ID.
     *
     * @returns {Promise}
     */
    this.get = function(account) {
      getWeather = $q.when(getWeather || angular.copy(cache.data) || getWeatherFromServer(account));

      // Clear the promise cached, after resolve or reject the promise. Permit access to the cache data, when
      // the promise excecution is done (finally).
      getWeather.finally(function getWeatherFinally() {
        getWeather = undefined;
      });

      return getWeather;
    };

    /**
     * Return Weather array from the server.
     *
     * @returns {$q.promise}
     */
    function getWeatherFromServer(account) {
      var deferred = $q.defer();
      var url = openweatherEndpoint;
      var params = {
        lat: account.center.lat,
        lon: account.center.lng,
        units: 'metric',
        APPID: Config.openweather.apikey || ''
      };
      $http({
        method: 'GET',
        url: url,
        params: params,
        withoutToken: true,
        cache: true
      }).success(function(data) {
        // Prepare the Weather object.
        var weatherData = prepareWeather(data);
        setCache(weatherData);
        deferred.resolve(weatherData);
      });

      return deferred.promise;
    }

    /**
     * Save Weather in cache, and broadcast en event to inform that the Weather data changed.
     *
     * @param data
     *    Collection resulted from the request.
     */
    function setCache(data) {
      // Cache Weather data.
      cache = {
        data: data,
        timestamp: new Date()
      };
      // Clear cache in 10 minute.
      $timeout(function() {
        cache.data = undefined;
      }, 600000);
      $rootScope.$broadcast(broadcastUpdateEventName);
    }

    /**
     * Prepare Weather object with order by list, tree and collection indexed by id.
     *
     * Return the Weather object into a promises.
     *
     * @param getWeather - {$q.promise)
     *  Promise of list of Weather, comming from cache or the server.
     * @param accountId - int
     *  The account ID.
     *
     */
    function prepareWeather(weatherData) {

      return {
        temperature: weatherData.main.temp,
        icon: (angular.isDefined(nwWeatherIcons[weatherData.weather[0].icon])) ? weatherData.weather[0].icon : weatherData.weather[0].id,
        description: weatherData.weather[0].description
      }
    }

    $rootScope.$on('nwClearCache', function() {
      cache = {};
    });

  })
  .factory('nwWeatherIcons', function() {
    // * All the codes by are based in the openweather API
    //  http://openweathermap.org/wiki/API/Weather_Condition_Codes
    // * Icon based:
    //  in http://erikflowers.github.io/weather-icons/cheatsheet/index.html
    return {
      '200': 'wi-storm-showers ',
      '201': 'wi-storm-showers ',
      '202': 'wi-storm-showers ',
      '210': 'wi-thunderstorm ',
      '211': 'wi-thunderstorm ',
      '212': 'wi-thunderstorm ',
      '221': 'wi-lightning',
      '230': 'wi-storm-showers',
      '231': 'wi-storm-showers',
      '232': 'wi-storm-showers',
      '300': 'wi-sprinkle',
      '301': 'wi-sprinkle',
      '302': 'wi-rain-mix',
      '310': 'wi-rain-mix',
      '311': 'wi-rain',
      '312': 'wi-rain',
      '321': 'wi-rain-wind',
      '500': 'wi-sprinkle',
      '501': 'wi-showers',
      '502': 'wi-rain-mix',
      '503': 'wi-rain',
      '504': 'wi-rain-wind',
      '511': 'wi-snow',
      '520': 'wi-rain-mix',
      '521': 'wi-rain',
      '522': 'wi-rain-wind',
      '600': 'wi-snow',
      '601': 'wi-snow',
      '602': 'wi-snow',
      '611': 'wi-hail',
      '621': 'wi-snow',
      '701': 'wi-fog',
      '711': 'wi-fog',
      '721': 'wi-fog',
      '731': 'wi-fog',
      '741': 'wi-fog',
      '01d': 'wi-day-sunny',
      '01n': 'wi-night-clear',
      '02d': 'wi-day-cloudy',
      '02n': 'wi-night-cloudy',
      '03d': 'wi-cloudy',
      '04d': 'wi-cloudy',
      '900': 'wi-tornado',
      '901': 'wi-thunderstorm',
      '902': 'wi-lightning',
      '903': 'wi-thermometer-exterior',
      '904': 'wi-thermometer',
      '905': 'wi-strong-wind',
      '906': 'wi-hail'
    };
  });
