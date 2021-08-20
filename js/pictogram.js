// Draw pictogram function-----------------------------

var pictogramScroll = function () {
  // size variable
  var height = 500,
    width = 450;
  //Magrin: spaces saved in the svg for axes and titles
  var margin = {
    left: 0,
    bottom: 0,
    top: 0,
    right: 10,
  };

  var lastIndex = -1;
  var activeIndex = 0;

  var activateFunctions = [];

  var g = null;

  //padding for the grid
  var xPadding = 20;
  var yPadding = 20;

  //horizontal and vertical spacing between the icons
  var hBuffer = 15;
  var wBuffer = 15;

  //horizontal and vertical spacing between the icons for classified
  var clfHBuffer = 8;
  var clfWBuffer = 10;

  //specify the number of columns and rows for pictogram layout
  var numCols = 20;
  var clfNumCols = 12;

  //tooltip for each icon

  var icon_tip = d3
    .tip()
    .attr('class', 'icon-tip')
    .direction('e')
    .offset([-35, 0])
    .html(function (d) {
      if ((d.y == 1) & (d.yhat == 1)) {
        return (
          'Sepsis: yes' +
          '<br>' +
          'Prediction: yes' +
          '<br>' +
          'Model predicted probability of having sepsis: ' +
          d.predY.toFixed(3)
        );
      } else if ((d.y == 1) & (d.yhat === 0)) {
        return (
          'Sepsis: yes' +
          '<br>' +
          'Prediction: no' +
          '<br>' +
          'Model predicted probability of having sepsis: ' +
          d.predY.toFixed(3)
        );
      } else if ((d.y === 0) & (d.yhat === 0)) {
        return (
          'Sepsis: no' +
          '<br>' +
          'Prediction: no' +
          '<br>' +
          'Model predicted probability of having sepsis: ' +
          d.predY.toFixed(3)
        );
      } else {
        return (
          'Sepsis: no' +
          '<br>' +
          'Prediction: yes' +
          '<br>' +
          'Model predicted probability of having sepsis: ' +
          d.predY.toFixed(3)
        );
      }
    });

  // global variable for each categories data length;
  var dt_tp_length = 0;
  var dt_tn_length = 0;
  var dt_fp_length = 0;
  var dt_fn_length = 0;

  // chart function to return

  var chart = function (selection) {
    // Height/width of the drawing area for data symbols
    var innerHeight = height - margin.bottom - margin.top;
    var innerWidth = width - margin.left - margin.right;

    var clfboxheight = height / 2 - margin.bottom - margin.top;
    var clfboxwidth = width / 2 - margin.bottom - margin.top;

    // Loop through selections and data bound to each element
    selection.each(function (data) {
      var div = d3.select(this); // Container

      // Selection of SVG elements in DIV (making sure not to re-append svg)
      var svg = div.selectAll('svg').data([data]);

      // Append a 'g' element in which to place the rects, shifted down and right from the top left corner
      var gEnter = svg
        .enter()
        .append('svg')
        // .merge(svg)
        //.attr('height', height)
        // .attr('width', width)
        //.attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', [0, 0, width - 50, height - 50]);

      svg.exit().remove();

      // Append a G to hold rects
      gEnter
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('height', innerHeight)
        .attr('width', innerWidth)
        .attr('class', 'symbol-g');

      // Re-select G for symbols
      g = div.select('.symbol-g');

      g.append('defs')
        .append('g')
        .attr('id', 'iconCustom')
        .append('path')
        .attr('transform','scale(2)')
        .attr(
          'd',
          'M3.5,2H2.7C3,1.8,3.3,1.5,3.3,1.1c0-0.6-0.4-1-1-1c-0.6,0-1,0.4-1,1c0,0.4,0.2,0.7,0.6,0.9H1.1C0.7,2,0.4,2.3,0.4,2.6v1.9c0,0.3,0.3,0.6,0.6,0.6h0.2c0,0,0,0.1,0,0.1v1.9c0,0.3,0.2,0.6,0.3,0.6h1.3c0.2,0,0.3-0.3,0.3-0.6V5.3c0,0,0-0.1,0-0.1h0.2c0.3,0,0.6-0.3,0.6-0.6V2.6C4.1,2.3,3.8,2,3.5,2z'
        );

      var numRows = Math.ceil(data.length / numCols);

      //generate a d3 range for the total number of required elements
      var myIndex = d3.range(numCols * numRows);
      var truePosGrpIndx = 0;
      var falseNegGrpIndx = 0;
      var falsePosGrpIndx = 0;
      var trueNegGrpIndx = 0;

      console.log(myIndex);
      data = data.map(function (d, idx) {
        d.index = myIndex[idx];
        return d;
      });
      console.log(data);

      dt_tp_length = data.filter(function (d) {
        return (d.y == 1) & (d.yhat == 1);
      }).length;
      dt_tn_length = data.filter(function (d) {
        return (d.y === 0) & (d.yhat === 0);
      }).length;
      dt_fp_length = data.filter(function (d) {
        return (d.y === 0) & (d.yhat == 1);
      }).length;
      dt_fn_length = data.filter(function (d) {
        return (d.y == 1) & (d.yhat === 0);
      }).length;

      data = data.map(function (d, idx) {
        if ((d.y == 1) & (d.yhat == 1)) {
          d.groupIndx = truePosGrpIndx;
          truePosGrpIndx += 1;
        } else if ((d.y == 1) & (d.yhat === 0)) {
          d.groupIndx = falseNegGrpIndx;
          falseNegGrpIndx += 1;
        } else if ((d.y === 0) & (d.yhat == 1)) {
          d.groupIndx = falsePosGrpIndx;
          falsePosGrpIndx += 1;
        } else if ((d.y === 0) & (d.yhat === 0)) {
          d.groupIndx = trueNegGrpIndx;
          trueNegGrpIndx += 1;
        }
        return d;
      });

      //text element to display number of icons highlighted
      g.append('text')
        .attr('id', 'txtValue')
        .attr('class', 'predicted-txtValue')
        .attr('x', xPadding)
        .attr('y', yPadding)
        .attr('dy', -3)
        .text(data.length);

      g.append('text')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('height', clfboxheight)
        .attr('width', clfboxwidth)
        .attr('id', 'truePositiveClf');

      g.append('text')
        .attr(
          'transform',
          'translate(' + (width / 2 + margin.left) + ',' + margin.top + ')'
        )
        .attr('height', clfboxheight)
        .attr('width', clfboxwidth)
        .attr('id', 'falseNegativeClf');

      g.append('text')
        .attr(
          'transform',
          'translate(' + margin.left + ',' + (height / 4 + margin.top) + ')'
        )
        .attr('height', clfboxheight)
        .attr('width', clfboxwidth)
        .attr('id', 'falsePositiveClf');

      g.append('text')
        .attr(
          'transform',
          'translate(' +
            (width / 2 + margin.left) +
            ',' +
            (height / 4 + margin.top) +
            ')'
        )
        .attr('height', clfboxheight)
        .attr('width', clfboxwidth)
        .attr('id', 'trueNegativeClf');

      g.call(icon_tip);

      //create group element and create an svg <use> element for each icon
      g.append('g')
        .attr('id', 'pictoLayer')
        .selectAll('use')
        .data(data)
        .enter()
        .append('use')
        .attr('xlink:href', '#iconCustom')
        .attr('id', function (d) {
          return 'icon' + d.index;
        })
        .attr('x', function (d) {
          var remainder = d.index % numCols; //calculates the x position (column number) using modulus
          return xPadding + remainder * wBuffer; //apply the buffer and return value
        })
        .attr('y', function (d) {
          var whole = Math.floor(d.index / numCols); //calculates the y position (row number)
          return yPadding + whole * hBuffer; //apply the buffer and return the value
        })
        .on('mouseover', icon_tip.show)
        .on('mouseout', icon_tip.hide);
    });

    setupSections();
  }; // end of chart function to return

  var setupSections = function () {
    activateFunctions[0] = showInitial;
    activateFunctions[1] = showPrediction;
    activateFunctions[2] = showClassification;
  };

  function showInitial() {
    //change the class of person
    g.selectAll('use')
      .transition()
      //.delay(function (d, i) { return 3 * (i + 1);})
      .duration(0)
      .attr('class', function (d, i) {
        if (d.y == 1) {
          return 'positive';
        } else {
          return 'negative';
        }
      })
      .attr('id', function (d) {
          return 'icon' + d.index;
        })
        .attr('x', function (d) {
          var remainder = d.index % numCols; //calculates the x position (column number) using modulus
          return xPadding + remainder * wBuffer; //apply the buffer and return value
        })
        .attr('y', function (d) {
          var whole = Math.floor(d.index / numCols); //calculates the y position (row number)
          return yPadding + whole * hBuffer; //apply the buffer and return the value
        });

    icon_tip.html(function (d) {
      if (d.y == 1) {
        return 'Sepsis: yes';
      } else {
        return 'Sepsis: no';
      }
    });

    g.call(icon_tip);
    
    
    g.select('#truePositiveClf').transition().duration(0).attr('opacity', 0);
    g.select('#trueNegativeClf').transition().duration(0).attr('opacity', 0);
    g.select('#falseNegativeClf').transition().duration(0).attr('opacity', 0);
    g.select('#falsePositiveClf').transition().duration(0).attr('opacity', 0);
  }
  
  function showPrediction() {
  var truepos = 0,
      trueneg = 0,
      falsepos = 0,
      falseneg = 0;

   g.selectAll('use')
      .transition()
      .delay(function (d, i) { return 3 * (i + 1);})
      .duration(1500)
      .attr('x', function (d) {
        var remainder = d.index % numCols; //calculates the x position (column number) using modulus
        return xPadding + remainder * wBuffer; //apply the buffer and return value
      })
      .attr('y', function (d) {
        var whole = Math.floor(d.index / numCols); //calculates the y position (row number)
        return yPadding + whole * hBuffer; //apply the buffer and return the value 
        })
      .attr('class', function (d, i) {
        if ((d.y == 1) & (d.yhat == 1)) {
          truepos++;
          return 'true-positive';
        } else if ((d.y == 1) & (d.yhat === 0)) {
          falseneg++;
          return 'false-negative';
        } else if ((d.y === 0) & (d.yhat == 1)) {
          falsepos++;
          return 'false-positive';
        } else {
          trueneg++;
          return 'true-negative';
        }
      });

    icon_tip.html(function (d) {
      if ((d.y == 1) & (d.yhat == 1)) {
        return (
          'Sepsis: yes' +
          '<br>' +
          'Prediction: yes' +
          '<br>' +
          'Model predicted probability of having sepsis: ' +
          d.predY.toFixed(3)
        );
      } else if ((d.y == 1) & (d.yhat === 0)) {
        return (
          'Sepsis: yes' +
          '<br>' +
          'Prediction: no' +
          '<br>' +
          'Model predicted probability of having sepsis: ' +
          d.predY.toFixed(3)
        );
      } else if ((d.y === 0) & (d.yhat === 0)) {
        return (
          'Sepsis: no' +
          '<br>' +
          'Prediction: no' +
          '<br>' +
          'Model predicted probability of having sepsis: ' +
          d.predY.toFixed(3)
        );
      } else {
        return (
          'Sepsis: no' +
          '<br>' +
          'Prediction: yes' +
          '<br>' +
          'Model predicted probability of having sepsis: ' +
          d.predY.toFixed(3)
        );
      }
    });

    g.call(icon_tip);

    g.select('#txtValue').transition().duration(1500).attr('opacity', 1);

    g.select('#truePositiveClf').transition().duration(0).attr('opacity', 0);
    g.select('#trueNegativeClf').transition().duration(0).attr('opacity', 0);
    g.select('#falseNegativeClf').transition().duration(0).attr('opacity', 0);
    g.select('#falsePositiveClf').transition().duration(0).attr('opacity', 0);

    // Update numbers elsewhere on the page.
    d3.selectAll('.truepos').text(truepos);
    d3.selectAll('.trueneg').text(trueneg);
    d3.selectAll('.falsepos').text(falsepos);
    d3.selectAll('.falseneg').text(falseneg);
    d3.selectAll('.totalpos').text(falsepos + truepos);
    d3.selectAll('.totalneg').text(falseneg + trueneg);

    // Have to select this with jquery - d3 doesn't select invisible things.
    $('.falsetextsr').text(
      falsepos + ' false positives, ' + falseneg + ' false negatives'
    );
  }

  function showClassification() {
    g.select('#txtValue').transition().duration(0).attr('opacity', 0);
    g.select('#truePositiveClf')
      .attr('class', 'true-positive')
      .attr('x', xPadding)
      .attr('y', yPadding)
      .attr('dy', -3)
      .text('True Positive: ' + dt_tp_length)
      .transition()
      .duration(1500)
      .attr('opacity', 1);

    g.select('#trueNegativeClf')
      .attr('class', 'true-negative')
      .attr('x', xPadding)
      .attr('y', yPadding)
      .attr('dy', -3)
      .text('True Negative: ' + dt_tn_length)
      .transition()
      .duration(1500)
      .attr('opacity', 1);

    g.select('#falsePositiveClf')
      .attr('class', 'false-positive')
      .attr('x', xPadding)
      .attr('y', yPadding)
      .attr('dy', -3)
      .text('False Positive: ' + dt_fp_length)
      .transition()
      .duration(1500)
      .attr('opacity', 1);

    g.select('#falseNegativeClf')
      .attr('class', 'false-negative')
      .attr('x', xPadding)
      .attr('y', yPadding)
      .attr('dy', -3)
      .text('False Negative: ' + dt_fn_length)
      .transition()
      .duration(1500)
      .attr('opacity', 1);

    g.selectAll('use')
      .transition()
      .delay(function (d, i) { return 3 * (i + 1);})
      .duration(0)
      .attr('x', function (d) {
        var remainder = d.groupIndx % clfNumCols; //calculates the x position (column number) using modulus
        if ((d.y == 1) & (d.yhat == 1)) {
          return xPadding + remainder * clfWBuffer; //apply the buffer and return value
        } else if ((d.y == 1) & (d.yhat === 0)) {
          return width / 2 + xPadding + remainder * clfWBuffer;
        } else if ((d.y === 0) & (d.yhat == 1)) {
          return xPadding + remainder * clfWBuffer;
        } else if ((d.y === 0) & (d.yhat === 0)) {
          return width / 2 + xPadding + remainder * clfWBuffer;
        }
      })
      .attr('y', function (d) {
        var whole = Math.floor(d.groupIndx / clfNumCols); //calculates the y position (row number)
        if ((d.y == 1) & (d.yhat == 1)) {
          return yPadding + whole * clfHBuffer; //apply the buffer and return the value
        } else if ((d.y == 1) & (d.yhat === 0)) {
          return yPadding + whole * clfHBuffer;
        } else if ((d.y === 0) & (d.yhat == 1)) {
          return height / 4 + yPadding + whole * clfHBuffer;
        } else if ((d.y === 0) & (d.yhat === 0)) {
          return height / 4 + yPadding + whole * clfHBuffer;
        }
      });
  }

  /**
   * @param index - index of the activate section
   * */
  chart.activate = function (index) {
    activeIndex = index;
    var sign = activeIndex - lastIndex < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      console.log(i);
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /*
   *@param data - data for the plot of the chart
   */
  chart.updateData = function (data) {
    
    var numCols = 20;
    var numRows = Math.ceil(data.length / numCols);
    //generate a d3 range for the total number of required elements
    var myIndex = d3.range(numCols * numRows);

    //console.log(myIndex);
    data = data.map(function (d, idx) {
      d.index = myIndex[idx];
      return d;
    });
    var truePosGrpIndx = 0;
    var falseNegGrpIndx = 0;
    var falsePosGrpIndx = 0;
    var trueNegGrpIndx = 0;

    dt_tp_length = data.filter(function (d) {
      return (d.y == 1) & (d.yhat == 1);
    }).length;
    dt_tn_length = data.filter(function (d) {
      return (d.y === 0) & (d.yhat === 0);
    }).length;
    dt_fp_length = data.filter(function (d) {
      return (d.y === 0) & (d.yhat == 1);
    }).length;
    dt_fn_length = data.filter(function (d) {
      return (d.y == 1) & (d.yhat === 0);
    }).length;

    data = data.map(function (d, idx) {
      if ((d.y == 1) & (d.yhat == 1)) {
        d.groupIndx = truePosGrpIndx;
        truePosGrpIndx += 1;
      } else if ((d.y == 1) & (d.yhat === 0)) {
        d.groupIndx = falseNegGrpIndx;
        falseNegGrpIndx += 1;
      } else if ((d.y === 0) & (d.yhat == 1)) {
        d.groupIndx = falsePosGrpIndx;
        falsePosGrpIndx += 1;
      } else if ((d.y === 0) & (d.yhat === 0)) {
        d.groupIndx = trueNegGrpIndx;
        trueNegGrpIndx += 1;
      }
      return d;
    });

    var use = g.selectAll('use').data(data);

    use
      .enter()
      .append('use')
      .merge(use)
      .attr('xlink:href', '#iconCustom')
      .attr('id', function (d) {
        return 'icon' + d.index;
      })
      .attr('x', function (d) {
        var remainder = d.index % numCols; //calculates the x position (column number) using modulus
        return xPadding + remainder * wBuffer; //apply the buffer and return value
      })
      .attr('y', function (d) {
        var whole = Math.floor(d.index / numCols); //calculates the y position (row number)
        return yPadding + whole * hBuffer; //apply the buffer and return the value
      });

    use.exit().remove();
    activateFunctions[1]();
  };

  return chart; // this return is the main part of this closure that also bind other features/variables;
};
