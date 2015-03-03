

angular.module('negawattClientApp')
  .config(function ($provide) {
    $provide.decorator('$state', function($delegate) {

      Object.defineProperty($delegate.prototype, 'transitionTo', {
        transitionTo: function transitionTo(to, toParams, options) {
          toParams = toParams || {};
          options = extend({
            location: true, inherit: false, relative: null, notify: true, reload: false, $retry: false
          }, options || {});

          var from = $state.$current, fromParams = $state.params, fromPath = from.path;
          var evt, toState = findState(to, options.relative);

          if (!isDefined(toState)) {
            var redirect = { to: to, toParams: toParams, options: options };
            var redirectResult = handleRedirect(redirect, from.self, fromParams, options);

            if (redirectResult) {
              return redirectResult;
            }

            // Always retry once if the $stateNotFound was not prevented
            // (handles either redirect changed or state lazy-definition)
            to = redirect.to;
            toParams = redirect.toParams;
            options = redirect.options;
            toState = findState(to, options.relative);

            if (!isDefined(toState)) {
              if (!options.relative) throw new Error("No such state '" + to + "'");
              throw new Error("Could not resolve '" + to + "' from state '" + options.relative + "'");
            }
          }
          if (toState[abstractKey]) throw new Error("Cannot transition to abstract state '" + to + "'");
          if (options.inherit) toParams = inheritParams($stateParams, toParams || {}, $state.$current, toState);
          if (!toState.params.$$validates(toParams)) return TransitionFailed;

          toParams = toState.params.$$values(toParams);
          to = toState;

          var toPath = to.path;

          // Starting from the root of the path, keep all levels that haven't changed
          var keep = 0, state = toPath[keep], locals = root.locals, toLocals = [];

          if (!options.reload) {
            while (state && state === fromPath[keep] && state.ownParams.$$equals(toParams, fromParams)) {
              locals = toLocals[keep] = state.locals;
              keep++;
              state = toPath[keep];
            }
          }

          // If we're going to the same state and all locals are kept, we've got nothing to do.
          // But clear 'transition', as we still want to cancel any other pending transitions.
          // TODO: We may not want to bump 'transition' if we're called from a location change
          // that we've initiated ourselves, because we might accidentally abort a legitimate
          // transition initiated from code?
          if (shouldTriggerReload(to, from, locals, options)) {
            // if (to.self.reloadOnSearch !== false) $urlRouter.update();
            $urlRouter.update(true);
            $state.transition = null;
            return $q.when($state.current);
          }

          // Filter parameters before we pass them to event handlers etc.
          toParams = filterByKeys(to.params.$$keys(), toParams || {});

          // Broadcast start event and cancel the transition if requested
          if (options.notify) {
            /**
             * @ngdoc event
             * @name ui.router.state.$state#$stateChangeStart
             * @eventOf ui.router.state.$state
             * @eventType broadcast on root scope
             * @description
             * Fired when the state transition **begins**. You can use `event.preventDefault()`
             * to prevent the transition from happening and then the transition promise will be
             * rejected with a `'transition prevented'` value.
             *
             * @param {Object} event Event object.
             * @param {State} toState The state being transitioned to.
             * @param {Object} toParams The params supplied to the `toState`.
             * @param {State} fromState The current state, pre-transition.
             * @param {Object} fromParams The params supplied to the `fromState`.
             *
             * @example
             *
             * <pre>
             * $rootScope.$on('$stateChangeStart',
             * function(event, toState, toParams, fromState, fromParams){
         *     event.preventDefault();
         *     // transitionTo() promise will be rejected with
         *     // a 'transition prevented' error
         * })
             * </pre>
             */
            if ($rootScope.$broadcast('$stateChangeStart', to.self, toParams, from.self, fromParams).defaultPrevented) {
              $urlRouter.update();
              return TransitionPrevented;
            }
          }

          // Resolve locals for the remaining states, but don't update any global state just
          // yet -- if anything fails to resolve the current state needs to remain untouched.
          // We also set up an inheritance chain for the locals here. This allows the view directive
          // to quickly look up the correct definition for each view in the current state. Even
          // though we create the locals object itself outside resolveState(), it is initially
          // empty and gets filled asynchronously. We need to keep track of the promise for the
          // (fully resolved) current locals, and pass this down the chain.
          var resolved = $q.when(locals);

          for (var l = keep; l < toPath.length; l++, state = toPath[l]) {
            locals = toLocals[l] = inherit(locals);
            resolved = resolveState(state, toParams, state === to, resolved, locals, options);
          }

          // Once everything is resolved, we are ready to perform the actual transition
          // and return a promise for the new state. We also keep track of what the
          // current promise is, so that we can detect overlapping transitions and
          // keep only the outcome of the last transition.
          var transition = $state.transition = resolved.then(function () {
            var l, entering, exiting;

            if ($state.transition !== transition) return TransitionSuperseded;

            // Exit 'from' states not kept
            for (l = fromPath.length - 1; l >= keep; l--) {
              exiting = fromPath[l];
              if (exiting.self.onExit) {
                $injector.invoke(exiting.self.onExit, exiting.self, exiting.locals.globals);
              }
              exiting.locals = null;
            }

            // Enter 'to' states not kept
            for (l = keep; l < toPath.length; l++) {
              entering = toPath[l];
              entering.locals = toLocals[l];
              if (entering.self.onEnter) {
                $injector.invoke(entering.self.onEnter, entering.self, entering.locals.globals);
              }
            }

            // Run it again, to catch any transitions in callbacks
            if ($state.transition !== transition) return TransitionSuperseded;

            // Update globals in $state
            $state.$current = to;
            $state.current = to.self;
            $state.params = toParams;
            copy($state.params, $stateParams);
            $state.transition = null;

            if (options.location && to.navigable) {
              $urlRouter.push(to.navigable.url, to.navigable.locals.globals.$stateParams, {
                $$avoidResync: true, replace: options.location === 'replace'
              });
            }

            if (options.notify) {
              /**
               * @ngdoc event
               * @name ui.router.state.$state#$stateChangeSuccess
               * @eventOf ui.router.state.$state
               * @eventType broadcast on root scope
               * @description
               * Fired once the state transition is **complete**.
               *
               * @param {Object} event Event object.
               * @param {State} toState The state being transitioned to.
               * @param {Object} toParams The params supplied to the `toState`.
               * @param {State} fromState The current state, pre-transition.
               * @param {Object} fromParams The params supplied to the `fromState`.
               */
              $rootScope.$broadcast('$stateChangeSuccess', to.self, toParams, from.self, fromParams);
            }
            $urlRouter.update(true);

            return $state.current;
          }, function (error) {
            if ($state.transition !== transition) return TransitionSuperseded;

            $state.transition = null;
            /**
             * @ngdoc event
             * @name ui.router.state.$state#$stateChangeError
             * @eventOf ui.router.state.$state
             * @eventType broadcast on root scope
             * @description
             * Fired when an **error occurs** during transition. It's important to note that if you
             * have any errors in your resolve functions (javascript errors, non-existent services, etc)
             * they will not throw traditionally. You must listen for this $stateChangeError event to
             * catch **ALL** errors.
             *
             * @param {Object} event Event object.
             * @param {State} toState The state being transitioned to.
             * @param {Object} toParams The params supplied to the `toState`.
             * @param {State} fromState The current state, pre-transition.
             * @param {Object} fromParams The params supplied to the `fromState`.
             * @param {Error} error The resolve error object.
             */
            evt = $rootScope.$broadcast('$stateChangeError', to.self, toParams, from.self, fromParams, error);

            if (!evt.defaultPrevented) {
              $urlRouter.update();
            }

            return $q.reject(error);
          });

          return transition;
        };
      });



      return $delegate;
    });
  });
