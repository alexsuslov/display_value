angular.module('widgets', [])

.directive 'displayValue', ($compile) ->
  # viewBox="0 0 114 170"
  Tpl =
    svg: '<svg width="{{width}}" height="{{height}}">{{content}}</svg>'
    g: '<g height="100%" n="{{n}}" transform="{{transform}}">{{content}}</g>'
    0: '<path d="M 6.0691563 92.438563 L 11.173126 87.712665 L 42.93116 87.712665 L 46.711878 92.438563 L 41.607908 96.975425 L 9.8498746 96.78639 Z" fill="{{color}}" />'
    1: '<path d="M 54.63138 50.283554 L 58.412097 54.820416 L 54.06427 86.01134 L 48.771266 90.548204 L 44.990548 86.20038 L 49.338374 54.820416 Z" fill="{{color}}" />'
    2: '<path d="M 11.92927 48.393195 L 17.222275 44.045369 L 48.98031 44.045369 L 52.950063 48.393195 L 47.846093 52.930057 L 15.899024 52.930057 Z" fill="{{color}}" />'
    3: '<path d="M 10.2279465 50.283554 L 14.008665 54.820416 L 9.6608387 86.01134 L 4.367833 90.548204 L .58711485 86.20038 L 4.934941 54.820416 Z" fill="{{color}}" />'
    4: '<path d="M 60.794913 6.4277286 L 64.57563 10.9645906 L 60.227806 42.155517 L 54.9348 46.69238 L 51.154082 42.344553 L 55.501908 10.9645906 Z" fill="{{color}}" />'
    5: '<path d="M 18.356491 4.536862 L 23.46046 0 L 55.218494 0 L 58.999212 4.536862 L 53.895243 9.26276 L 22.326245 9.26276 Z" fill="{{color}}" />'
    6: '<path d="M 16.297103 6.4277286 L 20.077821 10.9645906 L 15.729995 42.155517 L 10.4369895 46.69238 L 6.656271 42.344553 L 11.004097 10.9645906 Z" fill="{{color}}" />'
    7: '<path d="M 61.010922 84.975425 L 61.010922 84.975425 C 64.32463 84.975425 67.010922 87.661717 67.010922 90.975425 L 67.010922 90.975425 C 67.010922 94.289134 64.32463 96.975425 61.010922 96.975425 L 61.010922 96.975425 C 57.697214 96.975425 55.010922 94.289134 55.010922 90.975425 L 55.010922 90.975425 C 55.010922 87.661717 57.697214 84.975425 61.010922 84.975425 Z" fill="{{color}}" />'

  ###
    5
  6   4
    2
  3   1
    0 7
  ###

  digital = (chr, onColor, offColor) ->
    chars =
      0: 0b01111011
      '0.': 0b11111011
      1: 0b00010010
      '1.': 0b10010010
      2: 0b00111101
      '2.': 0b10111101
      3: 0b00110111
      '3.': 0b10110111
      4: 0b01010110
      '4.': 0b11010110
      5: 0b01100111
      '5.': 0b11100111
      6: 0b01101111
      '6.': 0b11101111
      7: 0b00110010
      '7.': 0b10110010
      8: 0b01111111
      '8.': 0b11111111
      9: 0b01110111
      '9.': 0b11110111
      '-': 0b00000100
      ' ': 0b00000000
    c = chars[chr]
    # var c = 0b11111111;
    [
      Tpl[0].replace('{{color}}', if c & 0b00000001 then onColor else offColor)
      Tpl[1].replace('{{color}}', if c & 0b00000010 then onColor else offColor)
      Tpl[2].replace('{{color}}', if c & 0b00000100 then onColor else offColor)
      Tpl[3].replace('{{color}}', if c & 0b00001000 then onColor else offColor)
      Tpl[4].replace('{{color}}', if c & 0b00010000 then onColor else offColor)
      Tpl[5].replace('{{color}}', if c & 0b00100000 then onColor else offColor)
      Tpl[6].replace('{{color}}', if c & 0b01000000 then onColor else offColor)
      Tpl[7].replace('{{color}}', if c & 0b10000000 then onColor else offColor)
    ].join ''

  pointer = (arr) ->
    idx = arr.indexOf('.')
    if idx == -1
      return arr
    else if idx == 0
      arr[0] = '0.'
    else if arr[idx - 1] == '-'
      arr[idx] = '0.'
    else
      arr[idx - 1] = arr[idx - 1] + '.'
      arr.splice idx, 1
    arr

  render = (cfg) ->
    x = -70 * cfg.scale
    cfg.arNumber.map((n) ->
      x = x + 70 * cfg.scale
      Tpl.g
        .replace('{{n}}', n)
        .replace('{{content}}', digital(n, cfg.color, cfg.inactive_color))
        .replace '{{transform}}', " translate(#{x},0) scale( #{cfg.scale} ) "
    ).join ''


  controller = ($scope, $element)->
    config = (cfg)->
      cfg.height ?= 100
      cfg.color ?='#52FF00'
      cfg.inactive_color ?= '#343434'
      # console.log 'cfg', cfg

      $scope.ngModel.on 'change', =>
        cfg.number = $scope.ngModel.get('value').status
        # console.log 'number', cfg.number
        cfg.arNumber = pointer ('' + cfg.number).split('')
        # console.log 'arNumber', cfg.arNumber
        cfg.scale = cfg.height / 100
        width = 70 * cfg.scale * cfg.arNumber.length
        $scope.config = cfg

        # console.log render(cfg)

        svg = Tpl.svg.replace('{{width}}', width)
            .replace('{{height}}', cfg.height)
            .replace('{{content}}', render(cfg))
        $element.html """
<div class="#{cfg.class1}" style="#{cfg.style1}">
  <div class="#{cfg.class2}" style="#{cfg.style2}" >
    #{cfg.descr}
  </div>
  <div class="#{cfg.class3}" style="#{cfg.style3}">
    #{svg}
  </div>
</div>"""

    $scope.$watch 'ngModel', =>
      config( $scope.ngModel.data() )


  {
    # replace: true
    restrict: 'E'
    priority: 10
    scope: ngModel: '='
    # link: link
    controller: controller
  }
