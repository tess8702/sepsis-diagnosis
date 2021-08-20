$(function () {
  // utility functions----------------------------------------

  // utitlity function:data generation-----------------------------
  function generateData(N, dprate) {
    var data = [];
    //var cutoff = Math.random()*(upper-lower)+lower;
    for (var i = 0; i < N; i++) {
      var X1, X2, X3, Y;

      if (i < N * dprate) {
        X1 = Math.random() * 0.9;
        X2 = Math.random() * 0.9;
        X3 = 1 - Math.random() * 0.5;
        Y = 1;
      } else if (i >= N * dprate) {
        X1 = 1 - Math.random() * 0.9;
        X2 = 1 - Math.random() * 0.9;
        X3 = Math.random() * 0.5;
        Y = 0;
      }

      data.push({ x1: X1, x2: X2, x3: X3, y: Y });
    }
    var sumY = d3.sum(data, function (d) {
      return d.y;
    });
    return data;
  }

  // utitlity function:fit the model-------------------------------
  function model(data, epochs, alpha, split) {
    var sumY = d3.sum(data, function (d) {
      return d.y;
    });
    // console.log(sumY);

    errors = [];
    A = 0.0;
    B = 0.0;
    C = 0.0;
    D = 0.0;

    var predYs = [];
    var yhats = [];
    var ys = [];
    var xs = [];

    var count = 0;
    for (var i = 0; i < epochs; i++) {
      var error;
      var predY;
      var yhat;
      var y;
      var x;
      var splitX;
      var color;
      predYs = [];
      yhats = [];
      ys = [];
      dtviz = [];

      tempA = A;
      tempB = B;
      tempC = C;
      tempD = D;
      accuracy = 0;
      cost = 0;

      data.forEach((d) => {
        var func;
        func = tempA * d.x1 + tempB * d.x2 + tempC * d.x3 + tempD;
        x = func;
        predY = 1 / (1 + Math.exp(-func));
        yhat = predY > split ? 1 : 0;
        splitX = Math.log(split / (1 - split));
        error = predY - d.y;
        y = d.y;
        color = Math.abs(d.y - yhat);

        A += (-alpha * error * d.x1) / sample;
        B += (-alpha * error * d.x2) / sample;
        C += (-alpha * error * d.x3) / sample;
        D += (-alpha * error * 1.0) / sample;
        cost +=
          -(d.y * Math.log(predY) + (1 - d.y) * Math.log(1 - predY)) / sample;
        accuracy += Math.abs(d.y - yhat) / sample;

        // save the data-----------------------------------
        // predYs.push(predY);
        // yhats.push(yhat);
        // ys.push(d.y);
        // xs.push(x);

        dtviz.push({
          predY: predY,
          yhat: yhat,
          y: y,
          x: x,
          split: split,
          splitX: splitX,
          color: color,
          category: color == 1 ? 'False' : 'True',
          sepsis: y == 1 ? 'Sepsis' : 'Non-Sepsis',
          postive: yhat == 1 ? 'Positive' : 'Negative',
        });
      });

      accuracy = 1 - accuracy;
      //console.log("cost:", cost, A, B, C, D);
    }

    // show the accuracy--------------------------------------------

    output_accuracy.innerHTML = Math.round(accuracy * 100) + '%';

    // check and validate the saved data for visulization-----------

    var sumY2 = d3.sum(dtviz, function (d) {
      return d.y;
    });
  }

  //------------------------------------------------------------------

  // set the seed-----------------------------------------

  Math.seedrandom('decision-split');

  // set the global variable-----------------------------------------

  // real sick rate and sample size;
  var dprate = 0.2;
  var sample = 500;

  // other global variables
  // var MaxDelay = 3000;
  // var DURATION = 2500;
  var accuracy;
  var dtviz = [];
  var epochs = 500;
  var alpha = 0.2;

  var output_accuracy = document.getElementById('accuracy');

  var plot = pictogramScroll();

  // Get value from slider when it changes ---------------------------------

  $('#threshold-slider').on('input change', function () {
    $('.threshold-value').text('Threshold: ' + $(this).val() + '%');
    split = $(this).val() / 100;
    model(data, epochs, alpha, split);
    plot.updateData(dtviz);
  });

  // Generating data and fitting the model--------------------------------------------------------
  // should be placed after the size variable--------------------------------------
  var data = generateData(sample, dprate);
  var split = $('#threshold-slider').val()/100;
  model(data, epochs, alpha, split);
  display(dtviz);

  
  function display(data) {
    d3.select('#vis').datum(data).call(plot);

    // setup scroll functionality
    var scroll = scroller().container(d3.select('#graphic'));

    // pass in .step selection as the steps
    scroll(d3.selectAll('.step'));

    // setup event handling
    scroll.on('active', function (index) {
      // highlight current step text
      d3.selectAll('.step').style('opacity', function (d, i) {
        return i === index ? 1 : 0.1;
      });

      // activate current section
      plot.activate(index);
    });
  }
  
  
});
