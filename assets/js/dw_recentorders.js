jQuery(document).ready(function ($) {
  var currentTime = new Date();
  var hours = currentTime.getHours();
  
  if(hours < 9 || hours > 22) {
    return;
  }
  
  // var i = 0;
  
  // setInterval(function(){

  //   i++;
  //   console.log(i);

  // }, 1000);

  var currentDisplay = 0;
  var maxDisplay = recentOrders.length;
  var interval = 10000;

  // showRecentOrder(currentDisplay);


  var loopOrder = 0;
  setTimeout(function(){
    loopOrder = setInterval(function() {

      // console.log('test');
      
      if(currentDisplay >= maxDisplay) {
        currentDisplay = 0;
      }

      showRecentOrder(currentDisplay);
      currentDisplay++;
    },interval);
  }, 2000);


  function formatTimeDiff(diff) {
    var months = Math.floor(diff / 1000 / 60 / 60 / 24 / 30);
    var days = months === 0 ? Math.floor(diff / 1000 / 60 / 60 / 24) : Math.floor(diff / 1000 / 60 / 60 / 24) - (months*30);
    var hrs = days === 0 ? Math.floor(diff / 1000 / 60 / 60) : Math.floor(diff / 1000 / 60 / 60) - (days*24);
    var mins = hrs === 0 ? Math.floor(diff / 1000 / 60) : Math.floor(diff / 1000 / 60) - (hrs*60);
    var secs = mins === 0 ? Math.floor(diff / 1000) : Math.floor(diff / 1000) - (mins*60);
    
    if(months > 0) {
      return months+" months ago";
    } else if(days > 0) {
      return days+" days ago";
    } else if(hrs > 0) {
      return hrs+" hours ago";
    } else if(mins > 0) {
      return mins+" minutes ago";
    } else if(secs > 0) {
      return secs+" seconds ago";
    } else {
      return "a moment ago";
    }
  }

  // console.log(recentOrders);
  
  function showRecentOrder(ordernum) {
    var firstline = recentOrders[ordernum].firstline;
    var secondline = recentOrders[ordernum].secondline;
    
    var ordertime = new Date(recentOrders[ordernum].thirdline*1000);
    var currentTime = Date.now();
    var diff = currentTime - ordertime;
    var formattedDiff = formatTimeDiff(diff);

    var orderNotificationElement = '<div id="dwRecentOrders" class="recent-orders recent-orders--slide-in">'+
                                      '<div class="recent-orders__profile-icon">'+
                                      '</div>'+
                                      '<div class="recent-orders__details">'+
                                        '<p class="recent-orders__firstline">'+firstline+'</p>'+
                                        '<p class="recent-orders__secondline">'+secondline+'</p>'+
                                        '<p class="recent-orders__thirdline">'+formattedDiff+'</p>'+
                                      '</div>'+
                                        '<div class="recent-orders__actions">'+
                                          '<i id="muteRecentOrder" class="fa fa-times"></i>'+
                                        '</div>'+
                                    '</div>';
    
    if($("#dwRecentOrders")) {
      dismissRecentOrder();
      setTimeout(function() {
        $("#dwRecentOrders").detach();
        appendOrder(orderNotificationElement);
      },3000)
    } else {
      appendOrder(orderNotificationElement);
    }

  }
  
  function dismissRecentOrder() {
    $("#dwRecentOrders").removeClass("recent-orders--slide-in").addClass("recent-orders--slide-out");
  }

  function appendOrder(element) {
    $("body").append(element);
    $("#muteRecentOrder").click(function(){
      clearInterval(loopOrder);
      dismissRecentOrder();
    });
  }
});

