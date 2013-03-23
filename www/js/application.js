/* ---------------------------------- */

/*
 * Grand Rapids Art Museum
 * The Jansma Collection
 * 2013-03-10
 * Created by Conduit Studio (conduitstudio.com)
 * Written for the Grand Rapids Art Museum (artmuseumgr.com)
 * Written by Aaron Vanderzwan
 *
 * application.js
 * Version 1.5
 *
 */
 
 
/* ---------------------------------- */

/*
 *  TABLE OF CONTENTS
 *  
 *  @Initialize
 *  @Auto Instantiate
 *  ---------------
 *  @CenterVertical
 *  @SlideInfo
 *  @Major Scroll Functionality
 *
 */



/* ---------------------------------- */

/* Initialize */

jQuery(function ($) {
	$.HTML = $('html');
	$.Body = $('body');
	$.Window = $(window);
	$.Document = $(document);
	
	// Load independent
	// Globals are used throught all sections (can be called within auto instantiated controllers)
	$.Globals = {
		getScroll: function(){},
		login: function(){
			$('body').removeClass('home').addClass('manage');
			$('#login').removeClass('ui-page-active');
			
			// Add Artists to list
			$.ajax({
		        url: 'http://audtonic.com/api/get-artists/',
		        type: 'post',
		        dataType: 'json',
		        data: {'user_access_key': $.Audtonic.user_access_key },
		        success: function(data) {
					if(data.artists){
						var new_string = '',
							checked = "";
						$.each(data, function() {
							$.each(this, function(k, v) {
								checked = v.checked ? 'checked="checked"' : '';
								new_string += '<div class="artist" data-artist="' + v.data_artist + '"><input type="checkbox" name="artist_' + v.artist_id + '" data-artist_id="' + v.artist_id + '" data-controller="Subscribe" id="artist_' + v.artist_id + '" ' + checked + '> <label for="artist_' + v.artist_id + '">' + v.name + '</label> <a href="http://musicbrainz.org/artist/' + v.mbid + '/" style="font-size:11px;font-style:italic;" target="_blank">more info</a></div>';
							});
						});
						$('#artists').html( new_string );
					}else if( data.failed ){
						$('.error').html(data.failed);
					}
		        },
		        error: function (xhr, ajaxOptions, thrownError) {
		            $('.error').html(xhr.responseText); // <- same here, your own div, p, span, whatever you wish to use
		        }
		    });
			
			$('#manage').addClass('ui-page-active');
		}
	};
	
	$('html').removeClass('no-js');
	
	$('[data-controller]').Instantiate();
	
	// LocalStorage DB
	$.Audtonic = {
		db: window.openDatabase("audtonic_db", "1.0", "Audtonic DB", 200000),
		user_access_key: ''
	};
	
	// Get User Access Key
	
	function set_user_access_key( tx ){
	    tx.executeSql('SELECT * FROM USER', [], function(tx, results){
			if(results.rows.length > 0){
				var item = results.rows.item(0); // We only need the first one = 0
				$.Audtonic.user_access_key = item.user_access_key;
				$.Globals.login();
			}
		});
	}
    $.Audtonic.db.transaction( set_user_access_key, errorCB, successCB  );

	function errorCB( err ){	
	    console.log("Error processing SQL1: "+err.code);
	}
	function successCB(tx){
		console.log('successCB1');
	}
	
	$('.focusmagic').focusMagic();
});



/* ---------------------------------- */

/* Auto Instantiate 
	NOTE: This function loads a 'plugin' for each data-controller */

(function($) {
	'use strict';
	$.fn.Instantiate = function(settings) {
		var config = {};
		if (settings) {$.extend(config, settings);}
		this.each(function() { 
			var $self = $(this),
				$controller = $self.data('controller');
			
			if ($self[$controller]){ $self[$controller](); }
		});
	};
})(jQuery);



/* ---------------------------------- */

/* APILogin */

(function($) {
	'use strict';
	$.fn.APILogin = function(settings) {
		var config = {};
		if (settings) {$.extend(config, settings);}
		
		this.each(function() { 
			var $self = $(this);
			
			$('#wp-submit').click(function(e){
			    e.preventDefault();
			    $.ajax({
			        url: 'http://audtonic.com/api/login/',
			        type: 'post',
			        dataType: 'json',
			        data: $self.serialize(),
			        success: function(data) {
						console.log(data)
						if(data.success){
							$.Audtonic.user_access_key = data.success;
						    $.Audtonic.db.transaction( set_access_key, errorCB, successCB );
						
							$.Globals.login();
						}else if( data.failed ){
							$('.error').html(data.failed);
						}
			        },
			        error: function (xhr, ajaxOptions, thrownError) {
			            $('.error').html(xhr.responseText); // <- same here, your own div, p, span, whatever you wish to use
			        }
			    });
			    return false;
			});
			
		});
		
		
		function set_access_key(tx){
	        tx.executeSql('DROP TABLE IF EXISTS USER'); 
		    tx.executeSql('CREATE TABLE IF NOT EXISTS USER (id INTEGER PRIMARY KEY, user_access_key)');
		    tx.executeSql('INSERT INTO USER (user_access_key) VALUES ("' + $.Audtonic.user_access_key + '")', [], populateSuccessCB, errorCB);
		}
		function populateSuccessCB(tx, results) {
			console.log('Key Added to Audtonic DB = ' + $.Audtonic.user_access_key);
		}
		
		function errorCB( err ){
			    console.log("Error processing SQL: "+err.code);
		}
		function successCB(tx){
			console.log('successCB');
			// console.log(tx);
		}
		
	};
})(jQuery);