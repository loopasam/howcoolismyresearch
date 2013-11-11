//Main JS script
$( document ).ready(function() {
  var url = decodeURIComponent(window.location.href);
  var isolator = /.*#(.*)/g;
  var query = isolator.exec(url);
  
  //Static variables - cache the annual results except for current date
  var startDate = 1983;
  var endDate = 2012;
  //Unsing 2012/01/01:2012/12/31[edat]
  var resultsPerYear = [306753, 315631, 332480, 346571, 364372, 382777, 399406, 406558, 408300, 413521, 421368, 432516, 443747, 454010, 394509, 432994, 453211, 496577, 538100, 602452, 607635, 628148, 687925, 707719, 743940, 786787, 796784, 831585, 885056, 917644];
  
  //Checks if a trail exists
  if(query != null){
    var queryText = query[1];

    if(queryText != ""){
    $("#form").attr("action", "/#" + encodeURIComponent(queryText));
    $("#query").val(queryText);
    $("#loader").show();
    //Trigger the search
    var defers = [], defer;
    
    //Call for each date - handled as promises, namely wait for the queue of queries to be done
    //before callback
    for (var date = startDate; date <= endDate; date++) {
    var query = queryText + " " + date + "/01/01:" + date + "/12/31[edat]";

      defer = $.ajax({
        type: "GET",
        async: true,
        url: "http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
        data: { db: "pubmed", term: query},
        error: function (err) {
          //Show error message
          $("#loader").hide();
          $("#error").show();
        }
      });
      
      defers.push(defer);
    }

      //Handles the defered array
      $.when.apply(window, defers).done(function(){
        var counter = 0;
        var date = startDate;
        var labels = [];
        var data = [];
   
        $.each(defers, function(index, request) {
          var number = $(request.responseXML).find('eSearchResult > Count').text();
          labels.push(date);
          var dateNumber = resultsPerYear.shift();
          var standardisedValue = (parseInt(number)/dateNumber)*10000;
          data.push(standardisedValue);
          date += 1;
        });

        plot(labels, data);
        verdict(data);
      });
    }
  }
});

//Calculate coolness over 10 years
function verdict(data){
  var now = data[data.length-1];
  var then = data[data.length-11];
  var cool = "Sorry, it's uncool.";
  var twitterMessage = "My research is #uncool! So-called evidences: ";
  if(then-now < 0){
    cool = "Yeah, it's cool.";
    twitterMessage = "My research is #cool! Evidences: ";
  }
  updateTwitterValues(window.location.href, twitterMessage);
  $("#verdict > span").text(cool);
  $("#verdict").fadeIn(5000);
  $("#twitter-share-section").fadeIn(5000);
}

//Plot the canvas chart
function plot(labels, data){

  var lineChartDefinition = {
    labels : labels,
    datasets : [{
      fillColor : "rgba(230,126,34,0.5)",
      strokeColor : "rgba(230,126,34,1)",
      pointColor : "rgba(230,126,34,1)",
      pointStrokeColor : "#fff",
      data : data
      }],
  }
  
  var options = {
    animationSteps : 300
  }
  
  var width = $("body").width();
  $("#canvas").attr("width", width).show();
  $("#title-chart").fadeIn(5000);
  $("#loader").hide();
  var myLine = new Chart(document.getElementById("canvas").getContext("2d")).Line(lineChartDefinition, options);

}

//Update the twitter button and render it
function updateTwitterValues(share_url, twitterMessage) {
  $("#twitter-share-section").html('&nbsp;'); 
  $("#twitter-share-section").html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + share_url +'" data-size="large" data-text="' + twitterMessage + '" data-count="none">Tweet</a>');
  twttr.widgets.load();
}

