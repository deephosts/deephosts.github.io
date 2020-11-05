jQuery(document).ready(function ($) {    
	$('#dwDomainSearchForm').submit(function(event) {
		event.preventDefault();  
        event.stopImmediatePropagation();
		
        var domainSearchForm = $(this);

        var domainSearchResult = $("result");
		$.ajax({
            type: domainSearchForm.attr('method'),
            url: domainSearchForm.attr('action'),
            data: domainSearchForm.serialize(),
            beforeSend: function() {
                domainSearchForm.find('button[type=submit]').attr('disabled','disabled').find('.fa-circle-o-notch').removeClass('hidden').addClass('fa-spin');
            },
            complete: function() {
                domainSearchForm.find('button[type=submit]').removeAttr('disabled').find('.fa-circle-o-notch').addClass('hidden').removeClass('fa-spin');
            },
            success: function(data) {
                $('body').find('div[id^="whois-"]').remove();
                domainSearchResult.html(data);

                // MOVE MODALS TO BOTTOM OF PAGE
                domainSearchResult.find(".modal").each(function(){
                    $(this).appendTo("body");
                });
            }
    	})
    });
    
    // Add Swipe to Carousels
    $('#customerCarouselM,#customerCarouselT,#testimonialsCarouselM,#testimonialsCarouselT').each(function() {
        $(this).swipe({
            swipe: function(event, direction, distance, duration, fingerCount, fingerData) {    
                if (direction == 'left') {
                    $(this).carousel('next');
                }
                if (direction == 'right') {
                    $(this).carousel('prev');
                }
            },
            allowPageScroll:"auto"
        });
    });
    // End of Add Swipe to Carousels

    // Add click to show testimonials
    $('.reviewmore').click(function() {
        var card = $(this).parent().parent().parent();
        card.css("height","auto");
        $(this).hide();
        $(this).siblings("span").show();
    });
    // End of Add click to show testimonials

});
