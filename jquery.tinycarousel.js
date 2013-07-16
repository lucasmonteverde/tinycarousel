/*!
 * Tiny Carousel 1.9.1
 * http://www.baijs.nl/tinycarousel
 *
 * Copyright 2010, Maarten Baijs
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Modified: Lucas Monteverde - 10/06/12
 * Depends on library: jQuery
 */
 
(function($){
	$.tiny = $.tiny || { };
	
	$.tiny.carousel = {
		options: {	
			autoStart: false,
			start: 1, // where should the carousel start?
			display: 1, // how many blocks do you want to move at 1 time?
			axis: 'x', // vertical or horizontal scroller? ( x || y ).
			controls: true, // show left and right navigation buttons.
			pager: false, // is there a page number navigation present?
			interval: false, // move to another block on intervals.
			intervaltime: 3000, // interval time in milliseconds.
			rewind: false, // If interval is true and rewind is true it will play in reverse if the last slide is reached.
			animation: true, // false is instant, true is animate.
			duration: 1000, // how fast must the animation move in ms?
			callback: null // function that executes after every move.
		}
	};
	
	$.fn.tinycarousel = function(options) {
		var options = $.extend({}, $.tiny.carousel.options, options);
		this.each(function(){ $(this).data('tcl', new Carousel($(this), options)); });
		return this;
	};
	$.fn.tinycarousel_start = function(){ $(this).data('tcl').start(); };
	$.fn.tinycarousel_stop = function(){ $(this).data('tcl').stop(); };
	$.fn.tinycarousel_move = function(iNum, incremental){ $(this).data('tcl').move(iNum,!incremental); };
	$.fn.tinycarousel_reload = function(){ $(this).data('tcl').reload(); };
	$.fn.tinycarousel_prepend = function(){ $(this).data('tcl').prepend(); } 
	
	function Carousel(root, options){
		var oSelf = this;
		var oViewport = $('.viewport:first', root);
		var oContent = $('.overview:first', root);
		var oPages = oContent.children();
		var oBtnNext = $('.next:first', root);
		var oBtnPrev = $('.prev:first', root);
		var oPager = $('.pager:first', root);
		var iPageSize, iSteps, iCurrent, oTimer, bPause = false, bForward = true, bAxis = options.axis === 'x';
		
		function initialize(){
			iPageSize = bAxis ? $(oPages[0]).outerWidth(true) : $(oPages[0]).outerHeight(true);
			var iLeftover = Math.ceil(((bAxis ? oViewport.outerWidth() : oViewport.outerHeight()) / (iPageSize * options.display)) -1);
			iSteps = Math.max(1, Math.ceil(oPages.length / options.display) - iLeftover);
			iCurrent = Math.min(iSteps, Math.max(1, options.start)) -2;
			oContent.css(bAxis ? 'width' : 'height', (iPageSize * oPages.length));
			if(options.autoStart){
				oSelf.move(1)
			}else{
				iCurrent++;
				setButtons();
			}
			setEvents();
			return oSelf;
		};
		
		function setEvents(){
			if(options.controls && oBtnPrev.length > 0 && oBtnNext.length > 0){
				oBtnPrev.click(function(){oSelf.move(-1); return false;});
				oBtnNext.click(function(){oSelf.move( 1); return false;});
			}
			if(options.interval){ root.hover(oSelf.stop,oSelf.start); }
			if(options.pager && oPager.length > 0){ $('a',oPager).click(setPager); }
		};
		
		function setButtons(){
			if(options.controls){
				oBtnPrev.toggleClass('disable', !(iCurrent > 0));
				oBtnNext.toggleClass('disable', !(iCurrent +1 < iSteps));
			}
			if(options.pager){
				var oNumbers = $('.pagenum', oPager);
				oNumbers.removeClass('active');
				$(oNumbers[iCurrent]).addClass('active');
			}
			
		};
		
		function setPager(oEvent){
			if($(this).hasClass('pagenum')){ oSelf.move(parseInt(this.rel), true); }
			return false;
		};
		
		function setTimer(){
			if(options.interval && !bPause){
				clearTimeout(oTimer);
				oTimer = setTimeout(function(){
					iCurrent = iCurrent +1 == iSteps ? -1 : iCurrent;
					bForward = iCurrent +1 == iSteps ? false : iCurrent == 0 ? true : bForward;
					oSelf.move(bForward ? 1 : -1);
				}, options.intervaltime);
			}
		};
		
		this.stop = function(){ clearTimeout(oTimer); bPause = true; };
		this.start = function(){ bPause = false; setTimer(); };
		this.move = function(iDirection, bPublic){
			var ic = iCurrent;
			ic = bPublic ? iDirection : ic += iDirection;
			if(ic > -1 && ic < iSteps){
				iCurrent = ic;
				var oPosition = {};
				oPosition[bAxis ? 'left' : 'top'] = -(iCurrent * (iPageSize * options.display));	
				oContent.animate(oPosition,{
					queue: false,
					duration: options.animation ? options.duration : 0,
					complete: function(){
						if(typeof options.callback == 'function')
						options.callback.call(this, oPages[iCurrent], iCurrent, oPages.length, iDirection);
					}
				});
				setButtons();
				setTimer();
			}
		};
		
		this.reload = function(){
			oPages = oContent.children();
			iLeftover = Math.ceil(((bAxis ? oViewport.outerWidth() : oViewport.outerHeight()) / (iPageSize * options.display)) -1);
			iSteps = Math.max(1, Math.ceil(oPages.length / options.display) - iLeftover);
			oContent.css(bAxis ? 'width' : 'height', (iPageSize * oPages.length));
			setButtons();
		};
		
		this.prepend = function(){
			oContent.css({left:- iPageSize});
			iCurrent++;
		};
		
		return initialize();
	};
})(jQuery);