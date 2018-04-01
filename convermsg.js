function RandomNumber (x0, u, k) {
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
function FloatToBit (arr) {
  for (var i = 0; i < arr.length; i++) {
    var precision = arr[i].toString().split('.')[1].length
    arr[i] = parseInt(arr[i] * Math.pow(10, precision))
    arr[i] = arr[i] % 2
  }
  return arr
}

var abc = RandomNumber(0.675, 3.9762, 5)
arr = FloatToBit(abc)
console.log(arr)
