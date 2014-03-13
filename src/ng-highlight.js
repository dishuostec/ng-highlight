angular.module('ng-highlight', []).directive('ngHighlight', function()
{
  var search = function(node, re, nodeName, className)
  {
    if (node.nodeType === 3) {
      var match = node.data.match(re);
      if (match) {
        var wrapper = document.createElement(nodeName || 'span');
        wrapper.className = className || 'wrapper';
        var wordNode = node.splitText(match.index);
        wordNode.splitText(match[0].length);
        var wordClone = wordNode.cloneNode(true);
        wrapper.appendChild(wordClone);
        wordNode.parentNode.replaceChild(wrapper, wordNode);
        found ++;
        return 1; //skip added node in parent
      }
    } else if ((node.nodeType === 1 && node.childNodes) &&
    ! /(script|style)/i.test(node.tagName) &&
    ! (node.tagName === nodeName.toUpperCase() && node.className === className)) {
      for (var i = 0; i < node.childNodes.length; i ++) {
        i += search(node.childNodes[i], re, nodeName, className);
      }
    }

    return 0;
  };
  var highlight = function(word, element, option)
  {
    found = 0;

    if (word === undefined || word.length === 0) {
      return;
    }

    word = word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    var flag = option.caseSensitive ? '' : 'i';
    var pattern = '(' + word + ')';
    if (option.wholeWord) {
      pattern = '\\b' + pattern + '\\b';
    }

    var regexp = new RegExp(pattern, flag);

    search(element, regexp, option.element, option.className);
  };
  var unhightlight = function(iElement, option)
  {
    angular.forEach(iElement.find(option.element), function(element)
    {
      if (element.className !== option.className) {
        return;
      }
      var parent = element.parentNode;
      parent.replaceChild(element.firstChild, element);
      parent.normalize();
    });
  };
  var found = 0;

  return {
    replace : false,
    restrict: 'A',
    scope   : {
      keyword : '&ngHighlight',
      callback: '=hlCallback'
    },
    link    : function(scope, iElement, iAttr)
    {
      var option = {
        className    : 'highlight',
        element      : 'span',
        caseSensitive: false,
        wholeWord    : false
      };

      if (iAttr.hlClass !== undefined) {
        option.className = iAttr.hlClass;
      }
      if (iAttr.hlElement !== undefined) {
        option.element = iAttr.hlElement;
      }
      if (iAttr.hlCaseSensitive !== undefined) {
        option.caseSensitive = iAttr.hlCaseSensitive === 'false' ? false
        : ! ! iAttr.hlCaseSensitive;
      }
      if (iAttr.hlMatchWholeWord !== undefined) {
        option.wholeWord = iAttr.hlMatchWholeWord === 'false' ? false
        : ! ! iAttr.hlMatchWholeWord;
      }

      scope.$watch(scope.keyword, function(newKeyword, prevKeyword)
      {
        if (newKeyword === undefined) {
          return;
        }

        unhightlight(iElement, option);
        highlight(newKeyword, iElement[0], option);
        if (scope.callback !== undefined) {
          scope.callback(found);
        }
      });
    }
  };
});