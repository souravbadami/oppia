// Copyright 2019 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Service for creating modals associated to the improvements tab.
 */

require(
  'pages/exploration-editor-page/feedback-tab/services/thread-data.service.ts');
require(
  'pages/exploration-editor-page/feedback-tab/services/' +
  'thread-status-display.service.ts');
require(
  'pages/exploration-editor-page/suggestion-modal-for-editor-view/' +
  'suggestion-modal-for-exploration-editor.service.ts');
require('domain/utilities/UrlInterpolationService.ts');

angular.module('oppia').factory('ImprovementModalService', [
  '$uibModal', 'AlertsService', 'ChangeListService', 'DateTimeFormatService',
  'EditabilityService', 'ExplorationStatesService',
  'SuggestionModalForExplorationEditorService', 'ThreadDataService',
  'ThreadStatusDisplayService', 'UrlInterpolationService', 'UserService',
  function(
      $uibModal, AlertsService, ChangeListService, DateTimeFormatService,
      EditabilityService, ExplorationStatesService,
      SuggestionModalForExplorationEditorService, ThreadDataService,
      ThreadStatusDisplayService, UrlInterpolationService, UserService) {
    return {
      openFeedbackThread: function(thread) {
        return $uibModal.open({
          templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
            '/pages/exploration-editor-page/improvements-tab/templates/' +
            'feedback-thread-modal.template.html'),
          resolve: {
            isUserLoggedIn: function() {
              return UserService.getUserInfoAsync().then(function(userInfo) {
                return userInfo.isLoggedIn();
              });
            },
          },
          controller: [
            '$scope', '$uibModalInstance', 'isUserLoggedIn',
            function($scope, $uibModalInstance, isUserLoggedIn) {
              $scope.activeThread = thread;
              $scope.isUserLoggedIn = isUserLoggedIn;
              $scope.STATUS_CHOICES = ThreadStatusDisplayService.STATUS_CHOICES;
              $scope.getLabelClass = ThreadStatusDisplayService.getLabelClass;
              $scope.getHumanReadableStatus = (
                ThreadStatusDisplayService.getHumanReadableStatus);
              $scope.getLocaleAbbreviatedDatetimeString = (
                DateTimeFormatService.getLocaleAbbreviatedDatetimeString);
              $scope.EditabilityService = EditabilityService;

              // Initial load of the thread list on page load.
              $scope.tmpMessage = {
                status: $scope.activeThread.status,
                text: '',
              };

              $scope.getTitle = function() {
                return $scope.activeThread.subject;
              };

              // TODO(Allan): Implement ability to edit suggestions before
              // applying.
              $scope.addNewMessage = function(threadId, tmpText, tmpStatus) {
                if (threadId === null) {
                  AlertsService.addWarning(
                    'Cannot add message to thread with ID: null.');
                  return;
                }
                if (!tmpStatus) {
                  AlertsService.addWarning(
                    'Invalid message status: ' + tmpStatus);
                  return;
                }
                $scope.messageSendingInProgress = true;
                ThreadDataService.addNewMessage(
                  threadId, tmpText, tmpStatus, function() {
                    $scope.tmpMessage.status = $scope.activeThread.status;
                    $scope.messageSendingInProgress = false;
                  }, function() {
                    $scope.messageSendingInProgress = false;
                  });
              };
              $scope.close = function() {
                $uibModalInstance.close();
              };
            },
          ],
          backdrop: 'static',
          size: 'lg',
        });
      },

      openSuggestionThread: function(thread) {
        var openSuggestionReviewer = this.openSuggestionReviewer;
        return $uibModal.open({
          templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
            '/pages/exploration-editor-page/improvements-tab/templates/' +
            'suggestion-thread-modal.template.html'),
          resolve: {
            isUserLoggedIn: function() {
              return UserService.getUserInfoAsync().then(function(userInfo) {
                return userInfo.isLoggedIn();
              });
            },
          },
          controller: [
            '$scope', '$uibModalInstance', 'isUserLoggedIn',
            function($scope, $uibModalInstance, isUserLoggedIn) {
              $scope.activeThread = thread;
              $scope.isUserLoggedIn = isUserLoggedIn;
              $scope.STATUS_CHOICES = ThreadStatusDisplayService.STATUS_CHOICES;
              $scope.getLabelClass = ThreadStatusDisplayService.getLabelClass;
              $scope.getHumanReadableStatus = (
                ThreadStatusDisplayService.getHumanReadableStatus);
              $scope.getLocaleAbbreviatedDatetimeString = (
                DateTimeFormatService.getLocaleAbbreviatedDatetimeString);
              $scope.EditabilityService = EditabilityService;
              $scope.openSuggestionReviewer = openSuggestionReviewer;

              // Initial load of the thread list on page load.
              $scope.tmpMessage = {
                status: $scope.activeThread.status,
                text: '',
              };

              $scope.getTitle = function() {
                return (
                  'Suggestion for the card "' +
                  $scope.activeThread.suggestion.stateName + '"');
              };

              // TODO(Allan): Implement ability to edit suggestions before
              // applying.
              $scope.addNewMessage = function(threadId, tmpText, tmpStatus) {
                if (threadId === null) {
                  AlertsService.addWarning(
                    'Cannot add message to thread with ID: null.');
                  return;
                }
                if (!tmpStatus) {
                  AlertsService.addWarning(
                    'Invalid message status: ' + tmpStatus);
                  return;
                }
                $scope.messageSendingInProgress = true;
                ThreadDataService.addNewMessage(
                  threadId, tmpText, tmpStatus, function() {
                    $scope.tmpMessage.status = $scope.activeThread.status;
                    $scope.messageSendingInProgress = false;
                  }, function() {
                    $scope.messageSendingInProgress = false;
                  });
              };
              $scope.close = function() {
                $uibModalInstance.close();
              };
            },
          ],
          backdrop: 'static',
          size: 'lg',
        });
      },

      openSuggestionReviewer: function(suggestionThread) {
        return SuggestionModalForExplorationEditorService.showSuggestionModal(
          suggestionThread.suggestion.suggestionType, {
            activeThread: suggestionThread,
            hasUnsavedChanges: function() {
              return ChangeListService.getChangeList().length > 0;
            },
            isSuggestionHandled: function() {
              return suggestionThread.isSuggestionHandled();
            },
            isSuggestionValid: function() {
              return ExplorationStatesService.hasState(
                suggestionThread.getSuggestionStateName());
            },
          }
        );
      },
    };
  },
]);
