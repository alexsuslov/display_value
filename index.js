// ## Widget Display value
// @author Alex Suslov <suslov@me.com>

'use strict';
define(['widgets'], function(d) {
  var debug = false;
  d.directive('displayValue', function($compile) {
    // Templates
    var Template = [
      '<svg width="{{width}}" height="{{height}}">',
      '<g height="100%" ng-repeat="number in numbers" ',
      'transform="translate({{ 70 * $index }}, 0) scale({{scale}})">',
      // 0
      '<path d="M 6.07 92.44 L 11.17 87.72 L 42.93 87.71 L 46.71 92.44 L 41.61 96.97 L 9.85 96.79 Z" fill="{{color[0]}}" />',
      // 1
      '<path d="M 54.64 50.28 L 58.41 54.82 L 54.06 86.01 L 48.77 90.54 L 44.99 86.20 L 49.33 54.82 Z" fill="{{color[1]}}" />',
      // 2
      '<path d="M 11.92 48.39 L 17.22 44.04 L 48.9 44.04 L 52.95 48.39 L 47.84 52.93 L 15.89 52.93 Z" fill="{{color[2]}}" />',
      // 3
      '<path d="M 10.227 50.28 L 14.00 54.82 L 9.660 86.0 L 4.36 90.54 L .5871 86.2 L 4.93 54.82 Z" fill="{{color[3]}}" />',
      // 4
      '<path d="M 60.79 6.427 L 64.5 10.964 L 60.22 42.15 L 54. 46.6 L 51.15 42.34 L 55.50 10.964 Z" fill="{{color[4]}}" />',
      // 5
      '<path d="M 18.35 4.53 L 23.4 0 L 55.21 0 L 58.99 4.53 L 53.89 9.2 L 22.32 9.2 Z" fill="{{color[5]}}" />',
      // 6
      '<path d="M 16.29 6.42 L 20.07 10.964 L 15.72 42.15 L 10.436 46.6 L 6.65 42.34 L 11.00 10.964 Z" fill="{{color[6]}}" />',
      // dot
      '<path d="M 61.01 84.97 L 61.01 84.97 C 64.3 84.97 67.01 87.66 67.01 90.97 L 67.01 90.97 C 67.01 94.28 64.3 96.97 61.01 96.97 L 61.01 96.97 C 57.69 96.97 55.01 94.28 55.01 90.97 L 55.01 90.97 C 55.01 87.66 57.69 84.97 61.01 84.97 Z" fill="{{color[7]}}" />',
      '</g>',
      '</svg>'
    ]
    /*
      5
    6   4
      2
    3   1
      0 7
    */
    // simbols
    var chars = {
        //9876543210   + dot
        0:0b01111011, '0.':0b11111011,
        1:0b00010010, '1.':0b10010010,
        2:0b00111101, '2.':0b10111101,
        3:0b00110111, '3.':0b10110111,
        //9876543210
        4:0b01010110, '4.':0b11010110,
        5:0b01100111, '5.':0b11100111,
        6:0b01101111, '6.':0b11101111,
        7:0b00110010, '7.':0b10110010,
        8:0b01111111, '8.':0b11111111,
        9:0b01110111, '9.':0b11110111,

        //  9876543210
        '-':0b00000100,
        ' ':0b00000000
    }
    // generator
    function digital( chr, on, off){
      var c = chars[chr];
      return [
        c & 0b00000001 ? on : off,
        c & 0b00000010 ? on : off,
        c & 0b00000100 ? on : off,
        c & 0b00001000 ? on : off,
        c & 0b00010000 ? on : off,
        c & 0b00100000 ? on : off,
        c & 0b01000000 ? on : off,
        c & 0b10000000 ? on : off
      ]
    }
    // add pointer to char
    // ["1",".", "3"] => ["1."+"3"]
    function pointer(arr){
      var idx =  arr.indexOf('.')
      if (idx === -1) return arr;
      else if(idx === 0) arr[0] = '0.';
      else if(arr[ idx - 1 ] === '-')
        arr[idx] = '0.';
      else {
        arr[idx - 1] = arr[idx - 1] + '.';
        arr.splice(idx, 1);
      }
      return arr;
    }
    // Group generator
    function render( led ){
      // set default on color
      var on = led.on || '#52FF00';
      // set default off color
      var off = led.off || '#414141';
      // spit and dot replace
      var arrNums = pointer( led.num.split('') );
      // set default height
      var h = led.height || 100;
      led.height = h;
      // scale rate
      var scale = led.height / 100;
      // set x
      var x = -70 * scale;
      // generate group
      return arrNums.map( function(n){
        // value place
        x = x + 70 * scale;
        return Tpl.g
          // for debug
          .replace('{{n}}', n)
          // put value to group
          .replace('{{content}}', digital( n, on, off))
          // move and scale
          .replace('{{transform}}',
            'translate(' + x + ', 0) scale('+ scale  + ')' );
      }).join('');
    }

    // ### controller
    function controller($scope) {
      // widget model
      var widget = $scope.ngModel;
      // updater function
      function updater(){
        // get status
        var status = widget.get('value').status;
        $scope.status = status != 0;
        // color index
        var idx = colors.indexOf( widget.get('color') );
        // set color
        // !important != 0
        $scope.color = ( status != 0 && idx !== -1 ?  colors[idx] : 'grey');
        // set description
        $scope.descr = widget.get('descr');
        $scope.$apply();
      }
      // on
      widget.on( 'change', updater);

      $scope.change = function(){
        var broker = widget.get('broker');
        if (debug) console.log('broker', broker);
        broker.pub( widget.get('topic') + '/control', ($scope.status? '1': "0"), 1);
      }

    }

    // ### link
    function link(scope, el, attr) {
      // widget model
      var widget = $scope.ngModel;
      var value;
      // get value
      if (widget.get('value'))
        var value = widget.get('value').status;
      else
        value = "0";

      scope.width = widget.get('width') || 0;
      scope.height = widget.get('height') || 100;
      // scale
      scope.scale = scope.height / 100;

      // widget model
      var widget = scope.ngModel;
      var h = model.height || 100;
      var l = pointer( value.split('') ).length;
      var width = 70 * h / 100 * pointer( value.split('')).length;




      // // get status
      // if (widget.get('value'))
      //   var status = widget.get('value').status;
      //   scope.status = status != 0;
      // // color index
      // var idx = colors.indexOf( widget.get('color') );
      // // set color
      // // !important != 0
      // scope.color = ( status != 0 && idx !== -1 ?  colors[idx] : 'grey');
      // // set description
      // scope.descr = widget.get('descr');
    }

    return {
      restrict: 'E',
      priority : 10,
      scope: {ngModel:"="},
      template: Template,
      // controller: controller,
      link: link
    }
  });
});
