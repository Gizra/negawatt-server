'use strict';

angular.module('angular-nw-weather', [])
  .constant('openweatherEndpoint', 'http://api.openweathermap.org/data/2.5/weather')
  .directive('nwWeatherTemperature', function () {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/directives/nw-weather/default.html',
      controller: function(nwWeather, nwWeatherIcons) {
        var weather = this;

        // Request the weather data.
        nwWeather.get(this.account).then(function(response) {
          weather.data = response;
          console.log(response.icon, nwWeatherIcons[response.icon]);
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
  .service('nwWeather', function ($q, $http, $timeout, $state, $rootScope, openweatherEndpoint) {
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
        units: 'metric'
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
        icon: weatherData.weather[0].icon,
        description: weatherData.weather[0].description
      }
    }

    $rootScope.$on('nwClearCache', function() {
      cache = {};
    });

  })
  .factory('nwWeatherIcons', function() {
    return {
      '000': 'wi-day-cloudy-gusts',
      '001': 'wi-day-cloudy-windy',
      '002': 'wi-day-cloudy',
      '003': 'wi-day-fog',
      '004': 'wi-day-hail',
      '005': 'wi-day-lightning',
      '006': 'wi-day-rain-mix',
      '007': 'wi-day-rain-wind',
      '008': 'wi-day-rain',
      '009': 'wi-day-showers',
      '00a': 'wi-day-snow',
      '00b': 'wi-day-sprinkle',
      '00c': 'wi-day-sunny-overcast',
      '00d': 'wi-day-sunny',
      '00e': 'wi-day-storm-showers',
      '010': 'wi-day-thunderstorm',
      '011': 'wi-cloudy-gusts',
      '012': 'wi-cloudy-windy',
      '013': 'wi-cloudy',
      '014': 'wi-fog',
      '015': 'wi-hail',
      '016': 'wi-lightning',
      '017': 'wi-rain-mix',
      '018': 'wi-rain-wind',
      '019': 'wi-rain',
      '01a': 'wi-showers',
      '01b': 'wi-snow',
      '01c': 'wi-sprinkle',
      '01d': 'wi-storm-showers',
      '01e': 'wi-thunderstorm',
      '021': 'wi-windy',
      '022': 'wi-night-alt-cloudy-gusts',
      '023': 'wi-night-alt-cloudy-windy',
      '024': 'wi-night-alt-hail',
      '025': 'wi-night-alt-lightning',
      '026': 'wi-night-alt-rain-mix',
      '027': 'wi-night-alt-rain-wind',
      '028': 'wi-night-alt-rain',
      '029': 'wi-night-alt-showers',
      '02a': 'wi-night-alt-snow',
      '02b': 'wi-night-alt-sprinkle',
      '02c': 'wi-night-alt-storm-showers',
      '02d': 'wi-night-alt-thunderstorm',
      '02e': 'wi-night-clear',
      '02f': 'wi-night-cloudy-gusts',
      '030': 'wi-night-cloudy-windy',
      '031': 'wi-night-cloudy',
      '032': 'wi-night-hail',
      '033': 'wi-night-lightning',
      '034': 'wi-night-rain-mix',
      '035': 'wi-night-rain-wind',
      '036': 'wi-night-rain',
      '037': 'wi-night-showers',
      '038': 'wi-night-snow',
      '039': 'wi-night-sprinkle',
      '03a': 'wi-night-storm-showers',
      '03b': 'wi-night-thunderstorm',
      '03c': 'wi-celsius',
      '03d': 'wi-cloud-down',
      '03e': 'wi-cloud-refresh',
      '040': 'wi-cloud-up',
      '041': 'wi-cloud',
      '042': 'wi-degrees',
      '043': 'wi-down-left',
      '044': 'wi-down',
      '045': 'wi-fahrenheit',
      '046': 'wi-horizon-alt',
      '047': 'wi-horizon',
      '048': 'wi-left',
      '04a': 'wi-night-fog',
      '04b': 'wi-refresh-alt',
      '04c': 'wi-refresh',
      '04d': 'wi-right',
      '04e': 'wi-sprinkles',
      '050': 'wi-strong-wind',
      '051': 'wi-sunrise',
      '052': 'wi-sunset',
      '053': 'wi-thermometer-exterior',
      '054': 'wi-thermometer-internal',
      '055': 'wi-thermometer',
      '056': 'wi-tornado',
      '057': 'wi-up-right',
      '058': 'wi-up',
      '059': 'wi-wind-west',
      '05a': 'wi-wind-south-west',
      '05b': 'wi-wind-south-east',
      '05c': 'wi-wind-south',
      '05d': 'wi-wind-north-west',
      '05e': 'wi-wind-north-east',
      '060': 'wi-wind-north',
      '061': 'wi-wind-east',
      '062': 'wi-smoke',
      '063': 'wi-dust',
      '064': 'wi-snow-wind',
      '065': 'wi-day-snow-wind',
      '066': 'wi-night-snow-wind',
      '067': 'wi-night-alt-snow-wind',
      '068': 'wi-day-sleet-storm',
      '069': 'wi-night-sleet-storm',
      '06a': 'wi-night-alt-sleet-storm',
      '06b': 'wi-day-snow-thunderstorm',
      '06c': 'wi-night-snow-thunderstorm',
      '06d': 'wi-night-alt-snow-thunderstorm',
      '06e': 'wi-solar-eclipse',
      '070': 'wi-lunar-eclipse',
      '071': 'wi-meteor',
      '072': 'wi-hot',
      '073': 'wi-hurricane',
      '074': 'wi-smog',
      '075': 'wi-alien',
      '076': 'wi-snowflake-cold',
      '077': 'wi-stars',
      '083': 'wi-night-partly-cloudy',
      '084': 'wi-umbrella',
      '085': 'wi-day-windy',
      '086': 'wi-night-alt-cloudy',
      '087': 'wi-up-left',
      '088': 'wi-down-right',
      '089': 'wi-time-12',
      '08a': 'wi-time-1',
      '08b': 'wi-time-2',
      '08c': 'wi-time-3',
      '08d': 'wi-time-4',
      '08e': 'wi-time-5',
      '08f': 'wi-time-6',
      '090': 'wi-time-7',
      '091': 'wi-time-8',
      '092': 'wi-time-9',
      '093': 'wi-time-10',
      '094': 'wi-time-11',
      '0b2': 'wi-day-sleet',
      '0b3': 'wi-night-sleet',
      '0b4': 'wi-night-alt-sleet',
      '0b5': 'wi-sleet',
      '0b6': 'wi-day-haze',
      '0b7': 'wi-beafort-0',
      '0b8': 'wi-beafort-1',
      '0b9': 'wi-beafort-2',
      '0ba': 'wi-beafort-3',
      '0bb': 'wi-beafort-4',
      '0bc': 'wi-beafort-5',
      '0bd': 'wi-beafort-6',
      '0be': 'wi-beafort-7',
      '0bf': 'wi-beafort-8',
      '0c0': 'wi-beafort-9',
      '0c1': 'wi-beafort-10',
      '0c2': 'wi-beafort-11',
      '0c3': 'wi-beafort-12',
      '0b1': 'wi-wind-default',
      '095': 'wi-moon-new',
      '096': 'wi-moon-waxing-cresent-1',
      '097': 'wi-moon-waxing-cresent-2',
      '098': 'wi-moon-waxing-cresent-3',
      '099': 'wi-moon-waxing-cresent-4',
      '09a': 'wi-moon-waxing-cresent-5',
      '09b': 'wi-moon-waxing-cresent-6',
      '09c': 'wi-moon-first-quarter',
      '09d': 'wi-moon-waxing-gibbous-1',
      '09e': 'wi-moon-waxing-gibbous-2',
      '09f': 'wi-moon-waxing-gibbous-3',
      '0a0': 'wi-moon-waxing-gibbous-4',
      '0a1': 'wi-moon-waxing-gibbous-5',
      '0a2': 'wi-moon-waxing-gibbous-6',
      '0a3': 'wi-moon-full',
      '0a4': 'wi-moon-waning-gibbous-1',
      '0a5': 'wi-moon-waning-gibbous-2',
      '0a6': 'wi-moon-waning-gibbous-3',
      '0a7': 'wi-moon-waning-gibbous-4',
      '0a8': 'wi-moon-waning-gibbous-5',
      '0a9': 'wi-moon-waning-gibbous-6',
      '0aa': 'wi-moon-3rd-quarter',
      '0ab': 'wi-moon-waning-crescent-1',
      '0ac': 'wi-moon-waning-crescent-2',
      '0ad': 'wi-moon-waning-crescent-3',
      '0ae': 'wi-moon-waning-crescent-4',
      '0af': 'wi-moon-waning-crescent-5',
      '0b0': 'wi-moon-waning-crescent-6'
    }
  });
