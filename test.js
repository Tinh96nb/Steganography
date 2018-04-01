function encode (chanel, NBitMessageHidden) {
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
function floatToBit (arr) {
  for (var i = 0; i < arr.length; i++) {
    var precision = arr[i].toString().split('.')[1].length
    arr[i] = parseInt(arr[i] * Math.pow(10, precision))
    arr[i] = arr[i] % 2
  }
  return arr
}
function XorFn (binaryMessage, randomBit) {
  var result = ''
  for (var i = 0; i < binaryMessage.length; i++) {
    if (binaryMessage[i] === randomBit[i]) {
      result += '0'
    } else result += '1'
  }
  return result
}
var pixel = [125, 122, 67, 34, 213, 23, 24, 200, 46, 57, 67, 23, 196, 167, 165, 237, 128, 78, 38, 185, 245, 134]
var binaryMessage = '011100000110100001100001011011010010000001110100011010010110111001101000'
var lengmsgbit = binaryMessage.length.toString(2)
while (lengmsgbit.length < 8) {
  lengmsgbit = '0' + lengmsgbit
}
binaryMessage = lengmsgbit + binaryMessage
// console.log(binaryMessage)

// create random number
var randomNum = randomNumber(0.675, 3.9762, binaryMessage.length)
// random number to bit
var randomBit = floatToBit(randomNum).join('')
// console.log(randomBit)

binaryMessage = XorFn(binaryMessage, randomBit)
// console.log(binaryMessage)

var numloop = (binaryMessage.length % 3) === 0 ? parseInt(binaryMessage.length / 3) : parseInt(binaryMessage.length / 3) + 1
var counter = 0
var u = 0
for (var i = 0, n = pixel.length; i < n; i += 4) {
  for (var offset = 0; offset < 3; offset++) {
    if (counter < numloop) {
      submsg = binaryMessage.substr(u, 3)
      while (submsg.length < 3) {
        submsg += '0'
      }
      result = encode(pixel[i + offset], submsg).join('')
      pixel[i + offset] = parseInt(result, 2)
      u += 3
      counter++
    } else {
      break
    }
  }
}

binaryMessage = ''
var couter = 0
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
// get number lengt on byte 0
var randomNum = randomNumber(0.675, 3.9762, 8)
var randomBit = floatToBit(randomNum).join('')
var num = parseInt(XorFn(binaryMessage.substr(0, 8), randomBit), 2)

// decrypt message
randomNum = randomNumber(0.675, 3.9762, num + 8)
randomBit = floatToBit(randomNum).join('')
binaryMessage = XorFn(binaryMessage.substr(0, num + 8), randomBit)
num = parseInt(binaryMessage.substr(0, 8), 2)
binaryMessage = binaryMessage.substr(8, num)

function binaryAgent (str) {
  // Splits into an array
  var re = /\s/
  var newArr = str.split(re)
  var answerArr = []

  // Decimal Conversion
  for (let i = 0; i < newArr.length; i++) {
    answerArr.push(String.fromCharCode(parseInt(newArr[i], 2)))
  }

  return answerArr.join('')
}
var output = ''
for (var i = 0; i < binaryMessage.length; i += 8) {
  submsg = binaryMessage.substr(i, 8)
  output += binaryAgent(submsg)
}
console.log(output.trim())
