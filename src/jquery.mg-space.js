// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

        "use strict";

        // Create the defaults once
        var mgSpace = "mgSpace",
            defaults = {
                autoSelector: '.mg-space-init',
                breakpoints: [0, 568, 768], // MUST INCLUDE ZERO (0)
                columns: [1, 2, 3], // COLUMN ARRAY COUNT MUST MATCH BREAKPOINTS
                rowsWrapper: "mg-rows",
                row: "mg-row",
                trigger: "mg-trigger",
                targetsWrapper: "mg-targets",
                target: "mg-target"
            };

        // The actual plugin constructor
        function MGSpace ( element, options ) {
            this.element = element;
            this.settings = $.extend( {}, defaults, options );
            this._defaults = defaults;
            this._name = mgSpace;
            this.init();
        }

        // Avoid MGSpace.prototype conflicts
        $.extend(MGSpace.prototype, {
            init: function () {

                var mg = this,
                    mgs = this.settings,
                    cols = mg.flowColumns('.'+mgs.row);

                // SET CURRENT COLUMNS
                $('.'+mgs.rowsWrapper).attr('data-cols',cols);

                $(document).on('click', '.'+mgs.trigger, function (ev) {
                    ev.preventDefault();
                    ev.stopPropagation();

                    mg.toggleRow(this);
                });

                $(document).on('click', '.mg-close', function (ev) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    var targetItem = $(this).parent().attr('data-target');

                    mg.toggleRow('#'+targetItem+' .'+mgs.trigger);
                });

                // CHANGE COLUMNS ON RESIZE EVENT
                $(window).on('resize', function (argument) {
                    var cols = mg.flowColumns('.'+mgs.row);
                    if (cols != $('.'+mgs.rowsWrapper).attr('data-cols')) {
                        $('.'+mgs.rowsWrapper).attr('data-cols',cols);

                        // Close
                        $('.'+mgs.target+'-open').removeClass(mgs.target+'-open').removeAttr('style');
                        $('.'+mgs.row+'-open').removeClass(mgs.row+'-open');
                        $('.mg-space').remove();
                    }


                    if($('.'+mgs.target+'-open').length){
                        var targetItem = $('.'+mgs.target+'-open').attr('data-target');
                        $('.'+mgs.target+'-open').css('top',$('#'+targetItem).offset().top+$('#'+targetItem).height()+25);
                        $('.mg-space').css('height',$('.'+mgs.target+'-open').height()+120);
                        $('.mg-arrow').css({
                            left: $('#'+targetItem).offset().left + parseInt($('#'+targetItem).css('padding-left')) + $('#'+targetItem).width()/2 - parseInt($('#content > .container').css('margin-left')) - 10
                        });        
                    }
                });
            },

            toggleRow: function (element) {
                var mg = this,
                    mgs = this.settings,
                    rowItem = $(element).parent(),
                    itemCurrent = $(rowItem).attr('data-row');

                if ($(rowItem).hasClass(mgs.row+'-open')) {
                    $(rowItem).removeClass(mgs.row+'-open');
                    mg.closeTarget();
                    mg.closeSpace();

                } else if ($('.'+mgs.row+'-open[data-row="' + itemCurrent + '"]').length) {
                    $('.'+mgs.row+'-open').removeClass(mgs.row+'-open');
                    $(rowItem).addClass(mgs.row+'-open');
                    mg.closeTarget();

                    mg.resizeSpace(rowItem);                    
                    mg.openTarget(rowItem);

                    $('html, body').animate({
                        scrollTop: $(rowItem).offset().top
                    }, 400);                    

                } else if ($('.mg-space').is(':visible')) {
                    $('.'+mgs.row+'-open').removeClass(mgs.row+'-open');
                    $(rowItem).addClass(mgs.row+'-open');
                    mg.closeTarget();

                    $('.mg-space').slideToggle(400, function () {
                        $('.mg-space').remove();
                        
                        mg.openSpace(rowItem);
                        mg.openTarget(rowItem);

                        $('html, body').animate({
                            scrollTop: $(rowItem).offset().top
                        }, 400);                        
                    });

                } else {

                    $(rowItem).addClass(mgs.row+'-open');
                    mg.openSpace(rowItem);
                    mg.openTarget(rowItem);
                    $('html, body').animate({
                        scrollTop: $(rowItem).offset().top
                    }, 400);                                        

                };
            },
            openTarget: function (element) {
                var mgs = this.settings,
                    itemId = $(element).attr('id'),
                    itemOffset = $(element).offset(),
                    itemHeight = $(element).height(),
                    itemTarget = '[data-target="' + itemId + '"]';

                $(itemTarget).prepend('<a href="#" class="mg-close"></a>');

                $(itemTarget)
                    .removeAttr('style')
                    .addClass(mgs.target+'-open')
                    .css({
                        position: 'absolute',
                        top: itemOffset.top + itemHeight + 25,
                        zIndex: 2
                    })
                    .slideToggle();
            },            
            closeTarget: function () {
                var mgs = this.settings;

                $('.'+mgs.target+'-open').css('z-index',1);
                $('.mg-close').remove();
                $('.'+mgs.target+'-open').slideToggle(400, function () {
                    $(this).removeClass(mgs.target+'-open').removeAttr('style');
                });
            },

            openSpace: function (element) {
                var mgs = this.settings,
                    itemCurrent = $(element).attr('data-row'),
                    itemId = $(element).attr('id'),
                    itemOffset = $(element).offset(),
                    itemTarget = '[data-target="' + itemId + '"]',
                    targetHeight = null;

                $(itemTarget).css('position','fixed').show();
                targetHeight = $(itemTarget).height();

                $('.'+mgs.rowsWrapper).find('[data-row="' + itemCurrent + '"]').last().after('<div class="mg-space sm-12 lg-12" data-row="' + itemCurrent + '"><div class="mg-arrow"></div></div>');

                $('.mg-space[data-row="' + itemCurrent + '"]').css('height', targetHeight+120).slideToggle(400, function() {
                    $('.mg-arrow').css({
                        left: itemOffset.left + parseInt($(element).css('padding-left')) + $(element).width()/2 - parseInt($('#content > .container').css('margin-left')) - 10
                    });
                });                
            },
            closeSpace: function (element) {
                $('.mg-space').slideToggle(400, function () {
                    $('.mg-space').remove();            
                });
            },
            resizeSpace: function (element) {
                var itemId = $(element).attr('id'),
                    itemOffset = $(element).offset(),
                    itemTarget = '[data-target="' + itemId + '"]',
                    targetHeight = null;

                $(itemTarget).css('position','fixed').show();
                targetHeight = $(itemTarget).height();
                $('.mg-space').addClass('resized');
                $('.mg-space').animate({
                    height: targetHeight + 120
                }, 400, function () {
                    $('.mg-arrow').css({
                        left: itemOffset.left + parseInt($(element).css('padding-left')) + $(element).width()/2 - parseInt($('#content > .container').css('margin-left')) - 10
                    });
                });
            },

            flowColumns: function (cols) {
                var j = 0,
                    k = 1,
                    col = 1,
                    fired = false,
                    parent = null;
                
                if (this.getViewportWidth() > 768) {
                    col = 3;
                } else if(this.getViewportWidth() > 568) {
                    col = 2;
                } else {
                    col = 1;
                }

                $( cols ).each(function(idx) {
                    var new_parent = $(this).parent().index();
                    
                    if(parent==null) {
                        parent=$(this).parent().index();
                    }
                    
                    if(parent != new_parent){
                        j=0,
                        k=1,
                        parent=$(this).parent().index();
                    }        

                    $(this).attr('data-row', j);
                    if(k==col){
                        j++,
                        k=0;
                    }        
                    k++;        
                    
                });
                return col;
            },

            getViewportWidth: function () {
               var e = window, a = 'inner';
               if (!('innerWidth' in window )) {
                   a = 'client';
                   e = document.documentElement || document.body;
               }
               return e[ a+'Width' ];
            }
        });

        // A really lightweight plugin wrapper around the constructor,
        // preventing against multiple instantiations
        $.fn[ mgSpace ] = function ( options ) {
            return this.each(function() {
                if ( !$.data( this, "plugin_" + mgSpace ) ) {
                    $.data( this, "plugin_" + mgSpace, new MGSpace( this, options ) );
                }
            });
        };

        // automatically find and run mgSpace
        $(function() {
            $( defaults.autoSelector ).mgSpace();
        });

})( jQuery, window, document );