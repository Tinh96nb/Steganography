$('button.encode, button.decode').click(function (event) {
  event.preventDefault()
})

function previewDecodeImage () {
  var file = document.querySelector('input[name=decodeFile]').files[0]

  previewImage(file, '.decode canvas', function () {
    $('.decode').fadeIn()
  })
}

function previewEncodeImage () {
  var file = document.querySelector('input[name=baseFile]').files[0]

  $('.images .nulled').hide()
  $('.images .message').hide()

  previewImage(file, '.original canvas', function () {
    $('.images .original').fadeIn()
    $('.images').fadeIn()
  })
}

function previewImage (file, canvasSelector, callback) {
  var reader = new FileReader()
  var image = new Image()
  var $canvas = $(canvasSelector)
  var context = $canvas[0].getContext('2d')

  if (file) {
    reader.readAsDataURL(file)
  }

  reader.onloadend = function () {
    image.src = URL.createObjectURL(file)

    image.onload = function () {
      $canvas.prop({
        'width': image.width,
        'height': image.height
      })

      context.drawImage(image, 0, 0)

      callback()
    }
  }
}

function encodeMessage () {
  $('.error').hide()
  $('.binary').hide()

  var text = $('textarea.message').val()
  var xkey = parseFloat($('.x-input').val())
  var ukey = parseFloat($('.u-input').val())

  var $originalCanvas = $('.original canvas')
  var $nulledCanvas = $('.nulled canvas')
  var $messageCanvas = $('.message canvas')

  var originalContext = $originalCanvas[0].getContext('2d')
  var nulledContext = $nulledCanvas[0].getContext('2d')
  var messageContext = $messageCanvas[0].getContext('2d')

  var width = $originalCanvas[0].width
  var height = $originalCanvas[0].height

  // Check if the image is big enough to hide the message
  if ((text.length * 8) > (width * height * 3)) {
    $('.error')
      .text('Text too long for chosen image....')
      .fadeIn()

    return
  }

  $nulledCanvas.prop({
    'width': width,
    'height': height
  })

  $messageCanvas.prop({
    'width': width,
    'height': height
  })

  // Normalize the original image and draw it
  var original = originalContext.getImageData(0, 0, width, height)
  nulledContext.putImageData(original, 0, 0)

  // Convert the message to a binary string
  var binaryMessage = ''
  for (i = 0; i < text.length; i++) {
    var binaryChar = text[i].charCodeAt(0).toString(2)
    // Pad with 0 until the binaryChar has a lenght of 8 (1 Byte)
    while (binaryChar.length < 8) {
      binaryChar = '0' + binaryChar
    }
    binaryMessage += binaryChar
  }
  var lengmsgbit = binaryMessage.length.toString(2)
  while (lengmsgbit.length < 8) {
    lengmsgbit = '0' + lengmsgbit
  }
  binaryMessage = lengmsgbit + binaryMessage
  $('.binary textarea').text(binaryMessage)

  // Apply the binary string to the image and draw it
  var message = nulledContext.getImageData(0, 0, width, height)
  pixel = message.data

  var randomNum = randomNumber(xkey, ukey, binaryMessage.length)
  // random number to bit
  var randomBit = floatToBit(randomNum).join('')
  // console.log(randomBit)

  binaryMessage = XorFn(binaryMessage, randomBit)
  counter = 0
  // numLoop is couter item
  numLoop = (binaryMessage.length % 3) === 0 ? parseInt(binaryMessage.length / 3) : parseInt(binaryMessage.length / 3) + 1

  indexStart = 0
  for (var i = 0, n = pixel.length; i < n; i += 4) {
    for (var offset = 0; offset < 3; offset++) {
      if (counter < numLoop) {
        submsg = binaryMessage.substr(indexStart, 3)
        while (submsg.length < 3) {
          submsg += '0'
        }
        result = NLSB(pixel[i + offset], submsg).join('')
        pixel[i + offset] = parseInt(result, 2)
        // index number start string bit each LSB
        indexStart += 3
        // count item LSB
        counter++
      } else {
        break
      }
    }
  }
  messageContext.putImageData(message, 0, 0)

  $('.binary').fadeIn()
  $('.images .message').fadeIn()
};

function decodeMessage () {
  var $originalCanvas = $('.decode canvas')

  var xkey = parseFloat($('.x-output').val())
  var ukey = parseFloat($('.u-output').val())

  var originalContext = $originalCanvas[0].getContext('2d')

  var original = originalContext.getImageData(0, 0, $originalCanvas.width(), $originalCanvas.height())
  var binaryMessage = ''
  var couter = 0
  var pixel = original.data
  for (var i = 0, n = pixel.length; i < n; i += 4) {
    for (var offset = 0; offset < 3; offset++) {
      if (pixel[i + offset]) {
        var value = pixel[i + offset]
        value = value.toString(2)
        while (value.length < 8) {
          value = '0' + value
        }
        binaryMessage += value.substr(5, 3)
        couter++
      } else {
        break
      }
    }
  }
  // get number length on byte 0
  var randomNum = randomNumber(xkey, ukey, 8)
  var randomBit = floatToBit(randomNum).join('')
  var num = parseInt(XorFn(binaryMessage.substr(0, 8), randomBit), 2)

// decrypt message
  randomNum = randomNumber(xkey, ukey, num + 8)
  randomBit = floatToBit(randomNum).join('')
  binaryMessage = XorFn(binaryMessage.substr(0, num + 8), randomBit)
  num = parseInt(binaryMessage.substr(0, 8), 2)
  binaryMessage = binaryMessage.substr(8, num)

  var output = ''
  for (var i = 0; i < binaryMessage.length; i += 8) {
    submsg = binaryMessage.substr(i, 8)
    output += binaryAgent(submsg)
  }

  $('.binary-decode textarea').text(output.trim())
  $('.binary-decode').fadeIn()
};

// xu ly cac truong hop cua nlsb
function NLSB (chanel, NBitMessageHidden) {
  var C = chanel
  var Cbit = C.toString(2)
  while (Cbit.length < 8) {
    Cbit = '0' + Cbit
  }
  var Mbit = NBitMessageHidden
  // thay gia tri 3 bit thap nhat
  var Rbit = Cbit.slice(0, 5)
  Rbit += Mbit
  var R = parseInt(Rbit, 2)

  // tinh gia tri bit sau khi thay doi neu |R - C|> 4
  var Sbit = Rbit.split('')
  var sub = parseInt(R) - parseInt(C)
  if (sub > 0) {
    if (sub > 4) {
      if (Sbit[0] === '0' && Sbit[1] === '0' && Sbit[2] === '0' && Sbit[3] === '0' && Sbit[4] === '0') return Sbit
      for (var i = 4; i >= 0; i--) {
        // neu tat ca con lai la 0 thi k lam gi
        if (Sbit[i] === '1') {
          Sbit[i] = '0'
          break
        } else {
          Sbit[i] = '1'
          continue
        }
      }
      return Sbit
    }
    return Sbit
  } else {
    sub = -sub
    if (sub > 4) {
      // neu tat ca con lai la 1 thi k lam gi
      if (Sbit[0] === '1' && Sbit[1] === '1' && Sbit[2] === '1' && Sbit[3] === '1' && Sbit[4] === '1') return Sbit
      for (var i = 4; i >= 0; i--) {
        if (Sbit[i] === '0') {
          Sbit[i] = '1'
          break
        } else {
          Sbit[i] = '0'
          continue
        }
      }
      return Sbit
    }
    return Sbit
  }
}
// string to binary
function binaryAgent (str) {
  var re = /\s/
  var newArr = str.split(re)
  var answerArr = []
  for (let i = 0; i < newArr.length; i++) {
    answerArr.push(String.fromCharCode(parseInt(newArr[i], 2)))
  }
  return answerArr.join('')
}
// function create random number
function randomNumber (x0, u, k) {
  var results = []
  for (var i = 0; i < k; i++) {
    if (i > 0) {
      kq = u * results[i - 1] * (1 - results[i - 1])
      results.push(kq)
    } else {
      results.push(x0)
    }
  }
  return results
}
// convert number type float to bit
function floatToBit (arr) {
  for (var i = 0; i < arr.length; i++) {
    var precision = arr[i].toString().split('.')[1].length
    arr[i] = parseInt(arr[i] * Math.pow(10, precision))
    arr[i] = arr[i] % 2
  }
  return arr
}
// Xor function
function XorFn (binaryMessage, randomBit) {
  var result = ''
  for (var i = 0; i < binaryMessage.length; i++) {
    if (binaryMessage[i] === randomBit[i]) {
      result += '0'
    } else result += '1'
  }
  return result
}
