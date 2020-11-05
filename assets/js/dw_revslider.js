if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) 
          || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

jQuery.getRevsliderScripts = function(arr, path) {
    var _arr = jQuery.map(arr, function(scr) {
        return jQuery.getScript( (path||"") + scr );
    });

    _arr.push(jQuery.Deferred(function( deferred ){
        jQuery( deferred.resolve );
    }));

    return jQuery.when.apply(jQuery, _arr);
}

var Revslider = new function() {

	var t = this;
	var cssSelector = '.revslider';
	var apiUrl = 'index.php?c=embed';
    var loadedAssets = [];

	t.init = function() {
		if (jQuery('#revslider_script').length) {
			apiUrl = jQuery('#revslider_script').attr('src').replace('assets/js/revslider.js', '') + apiUrl;
		}

        if (typeof punchgs != 'undefined')
            loadedAssets.push('jquery.themepunch.tools.min.js');
        if (typeof jQuery().revolution != 'undefined')
            loadedAssets.push('jquery.themepunch.revolution.min.js');
        if (typeof document.styleSheets != "undefined") {
            for (var i = 0; i < document.styleSheets.length; i++) {
                if (document.styleSheets[i].href && document.styleSheets[i].href.indexOf('settings.css') != -1) {
                    loadedAssets.push('settings.css');
                    break;
                }
            }
        }
        
		initSliders();
	}

	var initSliders = function() {
		jQuery(cssSelector).each(function(key, item) {
			loadSlider(item, key);
		});
	}

	var loadSlider = function(placeholder, key, loaded) {
        var slider = jQuery(placeholder);
		
                            var content = '', 
			   revsliderScripts = [];
								
                            if (typeof revslider_json.assets != 'undefined') {								
                                for (var i = 0; i < revslider_json.assets.length; i++) {
                                    if (loadedAssets.indexOf(revslider_json.assets[i].file) == -1) {
										if ( revslider_json.assets[i].file.endsWith('.js') ) {
											revsliderScripts.push(revslider_json.assets[i].file);
										} else {
											loadedAssets.push(revslider_json.assets[i].file);
											content += revslider_json.assets[i].include;
										}
                                    }
                                }
                            }
							if (typeof revslider_json.slider != 'undefined') {
                                content += revslider_json.slider;
                            }
							
			jQuery.getRevsliderScripts(revsliderScripts).done(function() {
				slider.html(content);
			}).fail(function(error) {
				 console.log('Revslider scripts load error');
				 slider.remove();
			});
	}

}

jQuery(document).ready(Revslider.init);
