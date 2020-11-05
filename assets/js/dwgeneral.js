jQuery(document).ready(function ($) {
    /*=============================================
    =            Navbar Hover Behavior            =
    =============================================*/

    $('.m-dwNavbar__primaryNavbar .dropdown, .m-dwNavbar__secondaryNavbar .dropdown').hover(function() {
          $(this).find('.dropdown-menu.auto').stop(true, true).show();
        }, function() {
          $(this).find('.dropdown-menu.auto').stop(true, true).hide();
     });

    // Auto toggle account dropdown on mobile
    $('#primary-nav').on('shown.bs.collapse', function(e) {
        $('li.dropdown a.dropdown-toggle').dropdown('toggle', 'open');
    });

    // Search toogle
    $('#Secondary_Navbar-SiteSearch, .navbar-header').on('shown.bs.dropdown', function (e) {
        var originalValue = $('.form-control.a-dwSiteSearch__inputSearchKeyword').val();
        $('.form-control.a-dwSiteSearch__inputSearchKeyword').val('');
        $('.form-control.a-dwSiteSearch__inputSearchKeyword').blur().focus().val(originalValue);
        $('.a-dwSiteSearch__searchToggle.-desktop').toggleClass("-close");

        $('.form-control.a-dwSiteSearch__inputSearchKeyword').on('keyup', function(e){
                if (e.keyCode == 27) { // escape key maps to keycode `27`
                        $('.a-dwSiteSearch__searchToggle.-desktop').dropdown('toggle');
                }
        });

    }).on('hidden.bs.dropdown', function (e) {
        $('.a-dwSiteSearch__searchToggle.-desktop').toggleClass("-close");
        $('.form-control.a-dwSiteSearch__inputSearchKeyword').unbind('keyup');
    });

    $(window).on("touchstart", function() {
        $('.m-dwNavbar__primaryNavbar .dropdown').unbind("mouseenter mouseleave");
        $('.m-dwNavbar__secondaryNavbar .dropdown').unbind("mouseenter mouseleave");

    });
    /*=====  End of Navbar Hover Behavior  ======*/

    /*==============================================
    =            Navbar close on mobile            =
    ==============================================*/
    $('body').bind('click', function(e) {
        if($(e.target).closest('.navbar').length == 0) {
            // click happened outside of .navbar, so hide
            var opened = $('.navbar-collapse').hasClass('collapse in');
            if ( opened === true ) {
                $('.navbar-collapse').collapse('hide');
            }
        }
    });
    /*=====  End of Navbar close on mobile  ======*/

    // Tooltip
    $('[data-toggle="tooltip"]').tooltip();

    // Footer Toggle on Mobile
    $('.a-dwFooter__linkCategory').click(function() {
        $(this).next().toggleClass('-show');
        $(this).children().toggleClass('-rotate');
    });

    // Lazy Load YouTube Video
    var youtube = $( ".video-wrapper" );

    for (var i = 0; i < youtube.length; i++) {

      if (!youtube[i].dataset.thumbquality) {
         youtube[i].dataset.thumbquality = 'maxresdefault';
      }

      var source = "https://img.youtube.com/vi/"+ youtube[i].dataset.thumbnail +"/"+youtube[i].dataset.thumbquality+".jpg";

      var image = new Image();
      image.src = source;
      image.loading = 'lazy';
      image.addEventListener( "load", function() {
        youtube[ i ].appendChild( image );
      }( i ) );

      youtube[i].addEventListener( "click", function() {

        var iframe = document.createElement( "iframe" );

        iframe.setAttribute( "frameborder", "0" );
        iframe.setAttribute( "allowfullscreen", "" );

        if($(this).hasClass('video-wrapper--playlist')){
            iframe.setAttribute( "src", "https://www.youtube.com/embed/videoseries?list="+ this.dataset.playlist +"&rel=0&autoplay=1" );
        } else {
            iframe.setAttribute( "src", "https://www.youtube.com/embed/"+ this.dataset.embed +"?rel=0&showinfo=0&autoplay=1" );
        }


        this.innerHTML = "";
        this.appendChild( iframe );
      } );
    };
    // End of Lazy Load YouTube Video


    // DMCABadgeHelper.min.js
    var e = "dmca-badge";
    var t = "refurl";
    if (!document.getElementsByClassName) {
        document.getElementsByClassName = function (e) {
            var t = document.getElementsByTagName("a"), n = [], r = 0, i;
            while (i = t[r++]) {
                i.className == e ? n[n.length] = i : null
            }
            return n
        }
    }
    var n = document.getElementsByClassName(e);
    if (n[0].getAttribute("href").indexOf("refurl") < 0) {
        for (var r = 0; r < n.length; r++) {
            var i = n[r];
            i.href = i.href + (i.href.indexOf("?") === -1 ? "?" : "&") + t + "=" + document.location
        }
    }

    // Dismiss Announcement
    $('#btnDismissAnnouncement').click(function() {
        $('.dwAnnouncementBar').remove();
    });

});

// Close Domain Search Result
function closeDomainSearchResult() {
    $('result').empty();
}
// End of Close Domain Search Result
